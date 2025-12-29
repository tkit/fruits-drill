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
* **CMS**: MicroCMS (Headless CMS) - コンテンツ・タグ管理
* **Storage**: **Cloudflare R2** - PDFファイル配信 (AWS S3互換)
* **Deployment**: Vercel
* **Admin Tool**: **Go (Golang)**

## 3. ディレクトリ構成 (Feature-based)

`src/` ディレクトリを採用し、機能ごとに凝集度を高める構成とする。

* `src/features/drills`: ドリル関連のドメインロジック・コンポーネント (api, components, types)
* `src/components/ui`: shadcn/ui コンポーネント
* `src/components/layout`: Header (ロゴ表示), Footer など
* `src/lib/microcms.ts`: MicroCMSクライアント初期化
* `tools/`: 管理用CLIツールのソースコード

## 4. データ設計 (MicroCMS Schema)

MicroCMSにて、エンドポイント名 `drills` で以下のAPIが定義されている前提とする。
**※ フロントエンドの型定義およびGoツールの構造体は、このスキーマに従うこと。**

| フィールドID | 必須 | MicroCMS上の型 | 役割 |
| --- | --- | --- | --- |
| `title` | 必須 | テキスト | 問題集のタイトル |
| `thumbnail` | 必須 | 画像 | 一覧表示用 (※CLIが自動登録) |
| `pdf` | 必須 | **テキスト** | **PDFファイルの公開URL文字列** (※CLIが自動登録) |
| `tags` | 任意 | セレクト(複数) | `国語`, `算数`, `低学年`, `高学年` 等 |
| `description` | 任意 | テキストエリア | 補足説明 |

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
* **タグフィルタリングUI**: APIから取得した `tags` を集計し、動的にボタンを生成する。


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
3. **Cloudflare R2 (S3) アップロード**:
* PDFファイルをR2バケットにアップロードし、公開URLを取得する。
4. **MicroCMS 登録**:
* サムネイル画像を Management API (Media) にアップロードする。
* PDFの公開URLとサムネイル画像URLを使って、記事データを作成・登録する。
* 記事のステータスは「下書き (DRAFT)」とし、標準出力に **Content ID** を表示する。
5. **設定とオプション**:
* **Configファイル**: `-c config.yaml` で設定ファイルを読み込み可能とする。
* **Publish**: `-publish <CONTENT_ID>` オプションで、特定の下書き記事を公開(Publish)可能とする。
* **Tags**: `-tags "tag1,tag2"` オプションでタグを指定可能とする。
* **Description**: `-desc "text"` オプションで説明文を指定可能とする。
* **Help**: `-help` または `--help` で使い方を表示する。



## 6. 環境変数 (.env.local / .env.tools)

* フロントエンド用:
* `MICROCMS_SERVICE_DOMAIN`
* `MICROCMS_API_KEY`


* CLIツール用:
* `R2_ACCOUNT_ID`
* `R2_ACCESS_KEY_ID`
* `R2_SECRET_ACCESS_KEY`
* `R2_BUCKET_NAME`
* `R2_PUBLIC_DOMAIN` (公開用ドメイン)
* `MICROCMS_MANAGEMENT_API_KEY` (※書き込み権限のあるキー)
