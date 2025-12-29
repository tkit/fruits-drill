# プロジェクト概要
果物の名前を覚える子供向けWebアプリ「Fruits Drill」。
Web版と、データ管理用のGo製CLIツールの2つのコンポーネントで構成されている。

# 技術スタック

## Web Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS / CSS Modules
  - ユーザー体験: 「楽しい」「カラフル」「動的」なデザイン。
  - ターゲット: 子供向けなので、わかりやすく、親しみやすいUI。
  - コンポーネント: 再利用性を意識しつつ、デザインの統一感を保つ。

## Backend / Data
- **Database**: Supabase (PostgreSQL)
  - 以前の MicroCMS/Cloudflare R2 から移行済み。
  - 果物のデータ、画像URLなどを管理。

## CLI Tools (管理用)
- **Language**: Go
- **Location**: `tools/` ディレクトリ配下
- **Purpose**:
  - 管理者がローカルからデータを効率的に Supabase へ登録・更新するために使用。
  - `csv` や画像ファイルを読み込んで一括処理を行う機能など。

# 構成ルール
- **ドキュメント**: 仕様は `docs/spec.md` を正(SSOT)とする。変更時はここも更新する。
- **ディレクトリ構造**:
  - `src/`: Next.js アプリケーションコード
  - `tools/`: Go CLI ツールコード
  - `.agent/`: AI エージェント設定 (`context.md`, `permissions.yaml` 等)
- **画像パス**: Next.js の `public` フォルダや Supabase Storage の URL 形式に注意する。

# 開発ワークフロー
- **Web**: `npm run dev` でローカルサーバー起動。
- **CLI**: `go run tools/cmd/main.go` などの形式、または `Makefile` 経由で実行。
