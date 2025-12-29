# 🍎 ふるーつドリル (Fruits Drill) 開発指示書

## 1. プロジェクト概要

小学生向けの問題集（ドリル）を無料配布するWebサイト**「ふるーつドリル」**を構築する。
メインターゲットは**保護者**。
フルーツのような「彩り」と「実り（成長）」をテーマに、親しみやすく元気が出るデザインを目指す。
**コンテンツ配信の運用負荷を下げるため、専用のCLIツール（Go言語）も開発する。**

## 2. 技術スタック

* **Frontend**: Next.js (App Router), TypeScript
* **Styling**: Tailwind CSS, shadcn/ui (Base Color: Slate)
* **Icons**: **Lucide React**
* **Database / CMS / Storage**: **Supabase** (PostgreSQL / Storage)
* **Deployment**: Vercel
* **Admin Tool**: **Go (Golang)**

## 3. ディレクトリ構成 (Feature-based)

`src/` ディレクトリを採用し、機能ごとに凝集度を高める構成とする。

* `src/features/drills`: ドリル関連のドメインロジック・コンポーネント (api, components, types)
* `src/components/ui`: shadcn/ui コンポーネント
* `src/components/layout`: Header (ロゴ表示), Footer など
* `src/lib/supabase.ts`: Supabaseクライアント初期化
* `tools/`: 管理用CLIツールのソースコード

## 4. データ設計 (Supabase Database Schema)

以下のテーブル構造でデータを管理する。

### `drills` テーブル
| カラム名 | 型 | 制約 | 備考 |
| --- | --- | --- | --- |
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `title` | text | NOT NULL | |
| `description` | text | | |
| `pdf_url` | text | NOT NULL | Supabase Storageの公開URL |
| `thumbnail_url` | text | NOT NULL | Supabase Storageの公開URL |
| `created_at` | timestamp | | |

### `tags` テーブル
| カラム名 | 型 | 制約 | 備考 |
| --- | --- | --- | --- |
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `name` | text | NOT NULL, UNIQUE | タグ名 (小1, 算数など) |

### `drill_tags` テーブル (中間テーブル)
| カラム名 | 型 | 制約 | 備考 |
| --- | --- | --- | --- |
| `drill_id` | uuid | FK(`drills.id`), PK複合 | |
| `tag_id` | uuid | FK(`tags.id`), PK複合 | |

## 5. 実装詳細要件

### 5.1. デザイン・テーマ (フルーツテーマ)

* **サイト名**: ヘッダー左上に「🍎 ふるーつドリル」と表示する。
* アイコンには `Lucide React` の `Apple` コンポーネントを使用する。
* 「ふるーつ」はひらがな、「ドリル」はカタカナ表記。

* **フォント**: `next/font/google` で **`Zen Maru Gothic`** (Weight: 500, 700) を導入し、全域に適用する。
* **カラーパレット**:
* **Primary**: `#e11d48` (Rose-600)
* **Background**: `shadcn`の標準(Slate系)を利用し、必要に応じて `#fffbeb` (Amber-50) 等のアクセント背景を取り入れる。
* **Accent**: `#f59e0b` (Amber-500)
* **Radius**: `0.75rem` (フルーツの丸みを意識)。

### 5.2. ナビゲーションとルーティング

* **一覧画面 (`/`)**:
* ドリルをカード形式でグリッド表示する。
* **タグフィルタリングUI**: DBから取得したドリルデータを元に動的にフィルタリングまたはタグ一覧を表示する。

* **詳細モーダル (Intercepting Routes)**:
* `(.)drills/[id]` を利用してモーダル表示する。

* **詳細ページ (`/drills/[id]`)**:
* 直リンクやリロード時は、通常の詳細ページを表示する。

### 5.3. 詳細画面（モーダル/ページ共通）

* **PDF表示**: `iframe`埋め込みは行わず、サムネイル画像とダウンロードボタンを配置する。
* **ダウンロードボタン**: `<a href={pdfUrl} target="_blank" rel="noopener noreferrer">` とする。

### 5.4. 管理用CLIツール (Go)

* **言語**: Go (Golang)
* **保存場所**: プロジェクトルート直下の `tools/` ディレクトリに作成。
* **目的**: PDFファイルを所定のフォルダに入れるだけで、アップロードから記事登録までを自動化する。
* **機能要件**:
1. **ファイル走査**: 実行ディレクトリ（または引数で指定したパス）にある `.pdf` ファイルを対象とする。
2. **サムネイル生成**:
* PDFの1ページ目を画像（JPG/PNG）として抽出・保存する。
* 外部コマンド (`imagemagick`) を使用する。
3. **Supabase Storage アップロード**:
* PDFファイルと生成したサムネイル画像を `drills` バケットにアップロードする。
* ファイル名由来のトラブルを避けるため、パスにはUUIDを使用する (`pdf/<uuid>.pdf`, `thumbnail/<uuid>.png`)。
4. **Supabase Database 登録**:
* アップロード済みファイルのURLを使用し、`drills`, `tags`, `drill_tags` テーブルにデータを登録する。
* **タグの自動登録**: 指定されたタグが存在しない場合は自動的に作成 (`Upsert`) する機能を持つ。
5. **設定とオプション**:
* **Configファイル**: `-c config.yaml` で設定ファイルを読み込み可能とする。
* **Tags**: `-tags "tag1,tag2"` オプションでタグを指定可能とする。
* **Description**: `-desc "text"` オプションで説明文を指定可能とする。
* **Help**: `-help` または `--help` で使い方を表示する。

## 6. 環境変数 (.env.local / tools/.env)

* フロントエンド用 (.env.local):
* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`

* CLIツール用 (tools/.env):
* `SUPABASE_URL`
* `SUPABASE_SERVICE_ROLE_KEY` (安全な場所でのみ使用)
* `SUPABASE_BUCKET_NAME` (例: `drills`)

