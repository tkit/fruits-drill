# Fruits Drill Management CLI Tool

## 概要
PDFドリルファイルをアップロードし、サムネイル生成とCMS登録を自動化するCLIツールです。
Version 2.0 では設定ファイル読み込みやPublish機能が追加されました。

## 前提条件
* **Go 1.22+**
* **ImageMagick** (インストール済みでパスが通っていること)
    * Mac: `brew install imagemagick ghostscript` (※PDF処理にGhostscriptが必須です)
    * Windows: `magick` コマンドが使える状態

## 使い方

### ビルド
```bash
cd tools
go build -o fruits-cli
```

### 設定
設定は **環境変数** または **Configファイル (YAML)** で指定可能です。

**環境変数 (.env.tools):**
```bash
R2_ACCOUNT_ID=...
MICROCMS_MANAGEMENT_API_KEY=...
# (他、--help で確認可能)
```

**Configファイル (config.yaml):**
```yaml
r2_account_id: "..."
r2_access_key_id: "..."
r2_secret_access_key: "..."
r2_bucket_name: "..."
r2_public_domain: "..." # Optional
microcms_service_domain: "..."
microcms_management_api_key: "..."
```

### コマンド

#### 1. ヘルプの表示
```bash
./fruits-cli --help
```

#### 2. ドリルの一括登録 (下書き登録)
指定したPDFファイルをアップロード・下書き登録を行います。
サブコマンド `register` またはエイリアス `draft` を使用します。

```bash
# ファイル指定 (registerコマンド)
./fruits-cli register -c config.yaml drill1.pdf drill2.pdf

# ワイルドカード指定 (draftエイリアスを使用)
./fruits-cli draft -c config.yaml ./pdfs/*.pdf

# メタデータ指定
./fruits-cli draft -c config.yaml -tags "算数,小4" -desc "4年生ドリル" ./pdfs/*.pdf
```
* `-tags`: カンマ区切りでタグを指定します。
* `-desc`: 説明文を指定します。

**実行結果:**
成功すると、以下のように **Content ID** が表示されます。
```text
[SUCCESS] Draft created. Content ID: 12345xxxxx
To publish this item, run: ./fruits-cli publish 12345xxxxx
```

#### 3. 記事の公開 (Publish)
登録済みのコンテンツIDを指定して、記事を公開状態にします。
```bash
./fruits-cli publish <CONTENT_ID> -c config.yaml
```
