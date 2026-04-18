#!/usr/bin/env bash
set -euo pipefail

# Verify migrated data consistency between exported JSON and Cloudflare D1/R2.
# Required env:
#   R2_BUCKET=fruits-drill
# Optional env:
#   D1_DATABASE=fruits-drill
#   EXPORT_DIR=tools/migration/export
#   D1_EXECUTE_FLAGS=--remote

: "${R2_BUCKET:?R2_BUCKET is required}"

D1_DATABASE="${D1_DATABASE:-fruits-drill}"
EXPORT_DIR="${EXPORT_DIR:-tools/migration/export}"
D1_EXECUTE_FLAGS="${D1_EXECUTE_FLAGS:---remote}"

DRILLS_JSON="$EXPORT_DIR/drills.json"
TAGS_JSON="$EXPORT_DIR/tags.json"
DRILL_TAGS_JSON="$EXPORT_DIR/drill_tags.json"

for f in "$DRILLS_JSON" "$TAGS_JSON" "$DRILL_TAGS_JSON"; do
  [[ -f "$f" ]] || { echo "Missing file: $f"; exit 1; }
done

d1_count() {
  local table="$1"
  npx wrangler d1 execute "$D1_DATABASE" $D1_EXECUTE_FLAGS --json --command "SELECT COUNT(*) AS count FROM ${table};" \
    | jq -r '.[0].results[0].count'
}

expect_drills=$(jq 'length' "$DRILLS_JSON")
expect_tags=$(jq 'length' "$TAGS_JSON")
expect_drill_tags=$(jq 'length' "$DRILL_TAGS_JSON")

actual_drills=$(d1_count "drills")
actual_tags=$(d1_count "tags")
actual_drill_tags=$(d1_count "drill_tags")

echo "[CHECK] D1 row counts"
echo "  drills:     expected=${expect_drills} actual=${actual_drills}"
echo "  tags:       expected=${expect_tags} actual=${actual_tags}"
echo "  drill_tags: expected=${expect_drill_tags} actual=${actual_drill_tags}"

if [[ "$expect_drills" != "$actual_drills" || "$expect_tags" != "$actual_tags" || "$expect_drill_tags" != "$actual_drill_tags" ]]; then
  echo "[NG] D1 row count mismatch detected"
  exit 1
fi

echo "[CHECK] Remaining legacy URL references in D1"
legacy_count=$(npx wrangler d1 execute "$D1_DATABASE" $D1_EXECUTE_FLAGS --json \
  --command "SELECT COUNT(*) AS count FROM drills WHERE pdf_url LIKE 'http%' OR thumbnail_url LIKE 'http%';" \
  | jq -r '.[0].results[0].count')
echo "  legacy_url_rows=${legacy_count}"
if [[ "$legacy_count" != "0" ]]; then
  echo "[NG] Legacy HTTP URLs remain in D1 drills table"
  exit 1
fi

echo "[CHECK] R2 objects existence"
mapfile -t keys < <(
  jq -r '
    .[] | [.pdf_url, .thumbnail_url] | .[] |
    select(type == "string") |
    select(startswith("http://") or startswith("https://") or startswith("r2://")) |
    if startswith("r2://") then sub("^r2://"; "")
    else capture("^https?://[^ ]+/storage/v1/object/public/[^/]+/(?<key>.+)$").key
    end
  ' "$DRILLS_JSON" | sort -u
)

if [[ "${#keys[@]}" -eq 0 ]]; then
  echo "  No file key found in drills.json (skip R2 existence check)"
  echo "[DONE] Migration verification completed"
  exit 0
fi

missing=0
for key in "${keys[@]}"; do
  if ! npx wrangler r2 object head "${R2_BUCKET}/${key}" >/dev/null 2>&1; then
    echo "  [MISSING] r2://${R2_BUCKET}/${key}"
    missing=$((missing + 1))
  fi
done

if [[ "$missing" -gt 0 ]]; then
  echo "[NG] Missing R2 objects: ${missing}"
  exit 1
fi

echo "  R2 objects checked: ${#keys[@]}"
echo "[DONE] Migration verification completed"
