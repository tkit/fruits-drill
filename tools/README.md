# Fruits Drill Management CLI Tool

## 概要

PDFドリルファイルをアップロードし、サムネイル生成とSupabaseへのデータ登録（DB登録 + Storageアップロード）を自動化するCLIツールです。

## 前提条件

- **Go 1.25+**
- **ImageMagick** (インストール済みでパスが通っていること)
  - Mac: `brew install imagemagick ghostscript` (※PDF処理にGhostscriptが必須です)
  - Windows: `magick` コマンドが使える状態

## 使い方

### ビルド

Makefileがルートにあるため、ルートディレクトリから以下を実行するのが簡単です。

```bash
make go-build
```

または `tools` ディレクトリ内で:

```bash
cd tools
go build -o ../bin/fruits-cli main.go
```

### 設定

設定は **環境変数 (.env / .env.tools)** または **Configファイル (YAML)** で指定可能です。

**環境変数 (.env):**
`tools/.env` ファイルを作成して以下の内容を記述します。

```bash
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_BUCKET_NAME=drills # Optional (default behavior might vary if not set, but good to include)
```

**必須項目:**

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Configファイル (config.yaml):**
実行時に `-c config.yaml` で指定可能です。

```yaml
supabase_url: "https://<your-project-id>.supabase.co"
supabase_service_role_key: "<your-service-role-key>"
supabase_bucket_name: "drills"
```

**必須項目:**

- `supabase_url`
- `supabase_service_role_key`

### コマンド

#### 1. ヘルプの表示

```bash
./bin/fruits-cli --help
```

#### 2. ドリルの一括登録

指定したPDFファイルをスキャンし、サムネイル生成・アップロード・DB登録を一括で行います。
コマンドは `register` またはエイリアス `draft` を使用します（現在の実装では登録＝即座にDB挿入されます）。

```bash
# 基本的な使い方
./bin/fruits-cli register ./sample/drill.pdf

# メタデータ指定
./bin/fruits-cli register -tags "算数,小4" -desc "4年生向けドリル" ./sample/*.pdf
```

- `-tags`: カンマ区切りでタグを指定します。存在しないタグは自動的に作成されます。
- `-desc`: 説明文を指定します。

**実行結果:**
成功すると、以下のように **Content ID (UUID)** が表示されます。

```text
[SUCCESS] Drill registered. ID: 40ad54b0-d013-4ad0-8dc8-f1f62999e5b3
```

#### 3. ドリルの削除

指定したタイトルのドリルを削除します。関連するPDF/サムネイルファイルと、そのドリルでしか使われていないタグも自動的に削除されます。

```bash
# 対話的に削除 (確認メッセージが表示されます)
./bin/fruits-cli delete "ドリルのタイトル"

# 強制削除 (確認なし)
./bin/fruits-cli delete "ドリルのタイトル" -f
```

- `-f` / `--force`: 確認メッセージを表示せずに削除を実行します。
