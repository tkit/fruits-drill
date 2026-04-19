#!/usr/bin/env bash
set -euo pipefail

# Copy drill assets from Supabase Storage public URLs to R2.
# Required env:
#   SUPABASE_BUCKET_NAME=drills
#   R2_BUCKET=fruits-drill
# Optional env:
#   EXPORT_DIR=tools/migration/export
#   TMP_DIR=tools/migration/tmp
#   R2_FLAGS=--remote

: "${SUPABASE_BUCKET_NAME:?SUPABASE_BUCKET_NAME is required}"
: "${R2_BUCKET:?R2_BUCKET is required}"

EXPORT_DIR="${EXPORT_DIR:-tools/migration/export}"
TMP_DIR="${TMP_DIR:-tools/migration/tmp}"
R2_FLAGS="${R2_FLAGS:---remote}"
DRILLS_JSON="$EXPORT_DIR/drills.json"

[[ -f "$DRILLS_JSON" ]] || { echo "Missing file: $DRILLS_JSON"; exit 1; }

mkdir -p "$TMP_DIR"

entries=()
while IFS= read -r line; do
  entries+=("$line")
done < <(
  jq -r --arg bucket "$SUPABASE_BUCKET_NAME" '
    .[] | [.pdf_url, .thumbnail_url] | .[] |
    select(type == "string") |
    capture("^(?<url>https?://[^ ]+/storage/v1/object/public/" + $bucket + "/(?<key>.+))$") |
    (.url + "\t" + .key)
  ' "$DRILLS_JSON" | sort -u
)

if [[ "${#entries[@]}" -eq 0 ]]; then
  echo "No Supabase storage URLs found in drills.json"
  exit 0
fi

echo "Found ${#entries[@]} object(s) to migrate"

for line in "${entries[@]}"; do
  url="${line%%$'\t'*}"
  key="${line#*$'\t'}"

  local_file="$TMP_DIR/${key//\//__}"
  mkdir -p "$(dirname "$local_file")"

  echo "[DOWNLOAD] $url"
  curl -fsSL "$url" -o "$local_file"

  echo "[UPLOAD] r2://${R2_BUCKET}/${key}"
  npx wrangler r2 object put "${R2_BUCKET}/${key}" --file "$local_file" $R2_FLAGS >/dev/null

done

echo "[DONE] Storage migration to R2 complete"
