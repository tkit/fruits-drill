# プロジェクト概要

小学生向けの学習ドリルを無料配布するWebサイト「ふるーつドリル」。
保護者をメインターゲットとし、子供の学習習慣づくりを「フルーツの実り（成長）」というメタファーで視覚的にサポートする。

# 技術スタック

## Web Frontend

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui (Base Color: Slate, Rose, Amber)
  - **デザインコンセプト**: 「Fruit Garden」 - 柔らかく、上品で、親しみやすい。
  - **ターゲット**: **保護者**。子供っぽすぎず、機能的なデザイン。
  - **フルーツの役割**:
    - **機能的**: 教科ごとの色分けアイコン（国語=赤/りんご, 算数=オレンジ/みかん等）。
    - **情緒的**: 「種まき→実り」という成長のメタファー。
- **Library**: Lucide React (Icons), Supabase Client

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
