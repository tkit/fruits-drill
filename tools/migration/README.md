# Supabase -> Cloudflare Migration Scripts

Issue #8 (`既存データ移行`) で使う実行スクリプトです。  
ダウンタイム許容前提で、以下の順序で移行します。

## 前提

- `npx wrangler login` 済み
- `wrangler.toml` に実際の D1/R2 を設定済み
- `jq`, `curl` が利用可能
- Supabase 側の `service_role` キーを取得済み

## 1. Supabase からデータエクスポート

```bash
export SUPABASE_URL="https://<project>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
export EXPORT_DIR="tools/migration/export"

./tools/migration/export_supabase_data.sh
```

出力:

- `tools/migration/export/drills.json`
- `tools/migration/export/tags.json`
- `tools/migration/export/drill_tags.json`

## 2. D1 インポート用 SQL 生成

```bash
export SUPABASE_BUCKET_NAME="drills"
./tools/migration/build_d1_import_sql.sh
```

出力:

- `tools/migration/export/002_import_data.sql`

`https://.../storage/v1/object/public/<bucket>/...` は `r2://...` 形式に変換されます。

## 3. Supabase Storage -> R2 へオブジェクト移行

```bash
export R2_BUCKET="fruits-drill"
./tools/migration/migrate_storage_to_r2.sh
```

## 4. D1 へスキーマ + データ投入

```bash
export D1_DATABASE="fruits-drill"
./tools/migration/import_d1_data.sh
```

`--remote` 以外を使いたい場合:

```bash
export D1_EXECUTE_FLAGS="--local"
./tools/migration/import_d1_data.sh
```

## 5. 移行検証（件数 / 旧URL残存 / R2存在）

```bash
export R2_BUCKET="fruits-drill"
./tools/migration/verify_migration.sh
```

確認内容:

- `drills/tags/drill_tags` の件数一致
- D1に旧 `http(s)` URL が残っていないこと
- JSONから導いた全オブジェクトがR2に存在すること

## 注意

- `import_d1_data.sh` は `DELETE` を含むSQLを実行するため、対象DBを必ず確認してください。
- この手順はダウンタイム許容の一括切替向けです。
