# 🍎 ふるーつドリル (Fruits Drill)

小学生向けの問題集（ドリル）を無料配布するWebサイト「ふるーつドリル」のモノレポです。
保護者をターゲットに、フルーツのような「彩り」と「実り」をテーマにした親しみやすいデザインを目指しています。

## 🚀 Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React
- **Backend / DB**: Cloudflare D1 (SQLite), R2
- **Deployment**: Cloudflare Workers (OpenNext)
- **Observability**: Grafana Faro, Cloudflare Source Maps
- **Tooling**: Go (CLI for content management)

## 📁 Project Structure

- `src/`: Next.js Web Application
- `tools/`: Management CLI Tool (Go)
- `docs/`: Specifications and documentation

## 🛠️ Getting Started

### 1. Prerequisites

- Node.js 24+
- Go 1.25+
- ImageMagick (for CLI thumbnail generation)

### 2. Environment Setup

**Web App (`.env.local`)**

```bash
NEXT_PUBLIC_BASE_URL=https://fruits-drill.stdy.workers.dev
ADMIN_API_TOKEN=<local-dev-admin-token>

# Optional: Grafana Faro (browser)
NEXT_PUBLIC_FARO_URL=https://<your-faro-collector>.grafana.net/collect/<token>
NEXT_PUBLIC_FARO_APP_NAME=fruits-drill
NEXT_PUBLIC_FARO_APP_VERSION=local-dev
NEXT_PUBLIC_FARO_APP_ENV=development
# Set to true if you want errors/measurements only
# NEXT_PUBLIC_FARO_DISABLE_TRACING=true
```

**CLI Tool (`tools/.env`)**

```bash
ADMIN_API_BASE_URL=https://fruits-drill.stdy.workers.dev
ADMIN_API_TOKEN=<admin-api-token>
```

### 3. Run Development Server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

If you want to load deploy-only values from a file, you can prepare `.env.prod` and use the dedicated scripts below.

### 3.5 Preview / Deploy on Cloudflare Workers

This project can be previewed and deployed on Cloudflare Workers using OpenNext.

```bash
# 1) (First time only) Login to Cloudflare
npx wrangler login

# 2) Generate Worker env type definitions (optional but recommended)
npm run cf-typegen

# 3) Preview on local Workers runtime
npm run preview

# 4) Deploy to your *.workers.dev subdomain
#    (reads build-time vars from .env.prod)
npm run deploy
```

### 3.5.1 Grafana Faro Reintroduction Notes

This app can send browser-side telemetry to Grafana Faro again after the Cloudflare migration.

- Runtime collection is enabled only when `NEXT_PUBLIC_FARO_URL` is set.
- Tracing is enabled by default and can be disabled with `NEXT_PUBLIC_FARO_DISABLE_TRACING=true`.
- Worker-side stack traces are handled separately by Cloudflare with `upload_source_maps = true` in `wrangler.toml`.

For browser-side de-minified stack traces in Grafana Frontend Observability, set these build-time environment variables before `npm run deploy` or `npm run build`:

```bash
FARO_SOURCEMAP_ENDPOINT=https://<your-faro-collector>.grafana.net/faro/api/v1
FARO_SOURCEMAP_APP_ID=<frontend-observability-app-id>
FARO_SOURCEMAP_STACK_ID=<grafana-stack-id>
FARO_SOURCEMAP_API_KEY=<grafana-access-policy-token>

# Optional
FARO_SOURCEMAP_BUNDLE_ID=<release-or-commit-sha>
FARO_SOURCEMAP_VERBOSE=true
```

Notes:

- `FARO_SOURCEMAP_API_KEY` is a build secret. Do not expose it as a public runtime variable.
- The Grafana token needs `sourcemaps:read`, `sourcemaps:write`, and `sourcemaps:delete`.
- The webpack upload plugin runs only for production client builds, so local development is unaffected unless you explicitly configure it.
- `npm run deploy` loads `.env.prod` via `dotenv-cli`, which is useful for keeping build-time Faro values out of your interactive shell history while keeping the production entrypoint to a single command.

### 3.6 D1 Schema Initialization

Set your actual D1 database ID in `wrangler.toml`, then apply schema:

```bash
npx wrangler d1 execute fruits-drill --remote --file docs/migrations/001_create_d1_schema.sql
```

### 3.7 R2 Bucket Setup

Create the R2 bucket used for drill files and set the real bucket names in `wrangler.toml`.

```bash
npx wrangler r2 bucket create fruits-drill
npx wrangler r2 bucket create fruits-drill-preview
```

The app supports two storage representations in D1:

- Full URL (legacy data互換)
- R2 key format (`r2://pdf/<sha256>.pdf`, `r2://thumbnail/<sha256>.png`)

When a value is stored as an R2 key, it is served via:

- `/api/files/<object-key>`

### 3.8 Admin API Token

Set the admin API token in Cloudflare as a Worker secret.

```bash
npx wrangler secret put ADMIN_API_TOKEN
```

### 3.9 Admin API Endpoints

- `POST /api/admin/drills/register`
- `POST /api/admin/drills/delete`
- `POST /api/revalidate`

Authentication:

- `Authorization: Bearer <ADMIN_API_TOKEN>`
- `x-admin-token: <ADMIN_API_TOKEN>`

### 3.10 Image Optimization on Cloudflare

`next/image` uses a custom loader and serves original image URLs directly.

- This avoids `/_next/image` and `/cdn-cgi/image` incompatibilities on `workers.dev`.
- If you move to an environment that supports Cloudflare image transformations, revisit this loader.

### 4. Manage Content (CLI)

See [tools/README.md](tools/README.md) for details on how to register drill PDFs.

```bash
make go-build
./bin/fruits-cli register ./sample/drill.pdf
```
