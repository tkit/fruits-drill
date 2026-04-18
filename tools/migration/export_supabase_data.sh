#!/usr/bin/env bash
set -euo pipefail

# Export drills/tags/drill_tags from Supabase REST API into JSON files.
# Required env:
#   SUPABASE_URL=https://<project>.supabase.co
#   SUPABASE_SERVICE_ROLE_KEY=...
# Optional env:
#   EXPORT_DIR=tools/migration/export
#   PAGE_SIZE=1000

: "${SUPABASE_URL:?SUPABASE_URL is required}"
: "${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY is required}"

EXPORT_DIR="${EXPORT_DIR:-tools/migration/export}"
PAGE_SIZE="${PAGE_SIZE:-1000}"

mkdir -p "$EXPORT_DIR"

fetch_table() {
  local table="$1"
  local out="$EXPORT_DIR/${table}.json"
  local offset=0
  local tmp
  tmp=$(mktemp)
  echo '[]' > "$tmp"

  while true; do
    local end=$((offset + PAGE_SIZE - 1))
    local page
    page=$(curl -fsS \
      -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
      -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
      -H "Range-Unit: items" \
      -H "Range: ${offset}-${end}" \
      "${SUPABASE_URL}/rest/v1/${table}?select=*")

    local len
    len=$(jq 'length' <<<"$page")

    jq -s '.[0] + .[1]' "$tmp" <(echo "$page") > "${tmp}.new"
    mv "${tmp}.new" "$tmp"

    if [[ "$len" -lt "$PAGE_SIZE" ]]; then
      break
    fi

    offset=$((offset + PAGE_SIZE))
  done

  mv "$tmp" "$out"
  echo "[OK] Exported ${table} -> ${out} (count=$(jq 'length' "$out"))"
}

fetch_table "drills"
fetch_table "tags"
fetch_table "drill_tags"

echo "[DONE] Supabase export complete: ${EXPORT_DIR}"
