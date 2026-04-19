#!/usr/bin/env bash
set -euo pipefail

# Build D1 import SQL from exported Supabase JSON.
# Required env:
#   SUPABASE_BUCKET_NAME=drills
# Optional env:
#   EXPORT_DIR=tools/migration/export
#   OUT_SQL=tools/migration/export/002_import_data.sql

: "${SUPABASE_BUCKET_NAME:?SUPABASE_BUCKET_NAME is required}"

EXPORT_DIR="${EXPORT_DIR:-tools/migration/export}"
OUT_SQL="${OUT_SQL:-${EXPORT_DIR}/002_import_data.sql}"

DRILLS_JSON="$EXPORT_DIR/drills.json"
TAGS_JSON="$EXPORT_DIR/tags.json"
DRILL_TAGS_JSON="$EXPORT_DIR/drill_tags.json"

for f in "$DRILLS_JSON" "$TAGS_JSON" "$DRILL_TAGS_JSON"; do
  [[ -f "$f" ]] || { echo "Missing file: $f"; exit 1; }
done

mkdir -p "$(dirname "$OUT_SQL")"

cat > "$OUT_SQL" <<'SQL'
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;
DELETE FROM drill_tags;
DELETE FROM tags;
DELETE FROM drills;
SQL

jq -r --arg bucket "$SUPABASE_BUCKET_NAME" '
  def sq: tostring | gsub("\u0000"; "") | gsub("\r"; " ") | gsub("\n"; " ") | gsub("\u0027"; "\u0027\u0027");
  def q: if . == null then "NULL" else "\u0027" + (sq) + "\u0027" end;
  def map_url:
    if . == null then null
    elif (startswith("http://") or startswith("https://"))
      then sub("^https?://[^/]+/storage/v1/object/public/" + $bucket + "/"; "r2://")
    else . end;

  sort_by(.id)[] |
  "INSERT INTO drills (id, title, description, pdf_url, thumbnail_url, created_at, updated_at) VALUES (" +
  (.id|q) + ", " +
  (.title|q) + ", " +
  (.description|q) + ", " +
  ((.pdf_url|map_url)|q) + ", " +
  ((.thumbnail_url|map_url)|q) + ", " +
  (.created_at|q) + ", " +
  (.updated_at|q) +
  ");"
' "$DRILLS_JSON" >> "$OUT_SQL"

jq -r '
  def sq: tostring | gsub("\u0000"; "") | gsub("\r"; " ") | gsub("\n"; " ") | gsub("\u0027"; "\u0027\u0027");
  def q: if . == null then "NULL" else "\u0027" + (sq) + "\u0027" end;
  sort_by(.id)[] |
  "INSERT INTO tags (id, name, created_at) VALUES (" +
  (.id|q) + ", " +
  (.name|q) + ", " +
  (.created_at|q) +
  ");"
' "$TAGS_JSON" >> "$OUT_SQL"

jq -r '
  def sq: tostring | gsub("\u0000"; "") | gsub("\r"; " ") | gsub("\n"; " ") | gsub("\u0027"; "\u0027\u0027");
  def q: if . == null then "NULL" else "\u0027" + (sq) + "\u0027" end;
  sort_by(.drill_id, .tag_id)[] |
  "INSERT INTO drill_tags (drill_id, tag_id) VALUES (" +
  (.drill_id|q) + ", " +
  (.tag_id|q) +
  ");"
' "$DRILL_TAGS_JSON" >> "$OUT_SQL"

cat >> "$OUT_SQL" <<'SQL'
COMMIT;
PRAGMA foreign_keys = ON;
SQL

echo "[DONE] Generated D1 import SQL: $OUT_SQL"
