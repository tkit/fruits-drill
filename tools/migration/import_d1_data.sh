#!/usr/bin/env bash
set -euo pipefail

# Import schema + data SQL into Cloudflare D1.
# Optional env:
#   D1_DATABASE=fruits-drill
#   SCHEMA_SQL=docs/migrations/001_create_d1_schema.sql
#   DATA_SQL=tools/migration/export/002_import_data.sql
#   D1_EXECUTE_FLAGS=--remote

D1_DATABASE="${D1_DATABASE:-fruits-drill}"
SCHEMA_SQL="${SCHEMA_SQL:-docs/migrations/001_create_d1_schema.sql}"
DATA_SQL="${DATA_SQL:-tools/migration/export/002_import_data.sql}"
D1_EXECUTE_FLAGS="${D1_EXECUTE_FLAGS:---remote}"

[[ -f "$SCHEMA_SQL" ]] || { echo "Missing schema SQL: $SCHEMA_SQL"; exit 1; }
[[ -f "$DATA_SQL" ]] || { echo "Missing data SQL: $DATA_SQL"; exit 1; }

TMP_DATA_SQL="$(mktemp)"
cleanup() {
  rm -f "$TMP_DATA_SQL"
}
trap cleanup EXIT

# D1 remote import rejects explicit transaction statements in SQL files.
# Strip transaction/pragma lines so the same generated SQL can be imported safely.
sed -E '/^(BEGIN TRANSACTION;|COMMIT;|PRAGMA foreign_keys = (ON|OFF);)$/d' "$DATA_SQL" > "$TMP_DATA_SQL"

echo "[RUN] Apply schema: $SCHEMA_SQL"
npx wrangler d1 execute "$D1_DATABASE" $D1_EXECUTE_FLAGS --file "$SCHEMA_SQL"

echo "[RUN] Import data: $DATA_SQL (normalized for D1 remote execution)"
npx wrangler d1 execute "$D1_DATABASE" $D1_EXECUTE_FLAGS --file "$TMP_DATA_SQL"

echo "[DONE] D1 import completed for database: $D1_DATABASE"
