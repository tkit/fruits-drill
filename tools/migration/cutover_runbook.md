# Cloudflare Cutover Runbook (#9)

Supabase/Vercel から Cloudflare Workers + D1 + R2 へ本番切替する際の実行手順です。  
この手順は「ダウンタイム許容」を前提にしています。

## 0. 切替の完了条件

- 本番URL（`workers.dev`）でトップ/詳細/検索/タグが動作する
- 管理API `register/delete/revalidate` が成功する
- 主要データ件数一致（`drills/tags/drill_tags`）
- 旧基盤（Supabase/Vercel）の更新を停止した状態で運用できる

## 1. 事前準備（前日まで）

1. Cloudflare設定を最終確認
   - `wrangler.toml` の `d1_databases.database_id` が本番ID
   - `r2_buckets.bucket_name` が本番バケット
   - `ADMIN_API_TOKEN` を secret 設定済み
2. 本番ビルド・テスト確認
   - `npm run format:check`
   - `npm run lint`
   - `npm test`
   - `cd tools && go test ./...`
3. 本番デプロイ
   - `npm run deploy`
4. CLI接続先を Cloudflare 側へ統一
   - `ADMIN_API_BASE_URL=https://<worker>.<account-subdomain>.workers.dev`
   - `ADMIN_API_TOKEN=<token>`
5. ダウンタイム時間を決定
   - 例: JST 22:00-23:00

## 2. 切替開始（メンテ時間）

1. コンテンツ更新停止（人手運用停止）
   - CLI `register/delete` 実行を止める
2. Supabase最終エクスポート
   - `./tools/migration/export_supabase_data.sh`
3. D1投入SQL再生成
   - `./tools/migration/build_d1_import_sql.sh`
4. R2へファイル移行
   - `./tools/migration/migrate_storage_to_r2.sh`
5. D1へ投入
   - `./tools/migration/import_d1_data.sh`
6. 移行検証
   - `./tools/migration/verify_migration.sh`

## 3. 切替後スモークテスト

1. 画面
   - `/` が表示できる
   - 検索・タグ絞り込みが動く
   - `/drills/[id]` 直アクセスで表示できる
2. ファイル
   - PDFリンクが開ける
   - サムネイルが表示できる
3. 管理API
   - `register` で1件追加できる
   - `delete` で削除できる
   - `revalidate` が成功する

問題なければ切替完了。

## 4. 旧基盤停止

1. Vercelプロジェクトを停止（または削除）
2. Supabaseの運用キーを無効化
3. Supabaseプロジェクトを停止（必要なら一定期間 read-only で保持）
4. `fruits-drill.com` は不要なら更新停止（失効方針を確定）

## 5. ロールバック方針（簡易）

- ダウンタイム許容のため、原則は「復旧して再実行」。
- 重大障害時のみ、Vercel/Supabaseを一時再開して旧環境へ戻す。
- 戻す場合も更新凍結を維持し、差分データ発生を防ぐ。
