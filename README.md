# 🍎 ふるーつドリル (Fruits Drill)

小学生向けの問題集（ドリル）を無料配布するWebサイト「ふるーつドリル」のモノレポです。
保護者をターゲットに、フルーツのような「彩り」と「実り」をテーマにした親しみやすいデザインを目指しています。

## 🚀 Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React
- **Backend / DB**: Cloudflare D1 (SQLite), R2 (planned migration target)
- **Deployment**: Cloudflare Workers (OpenNext)
- **Tooling**: Go (CLI for content management)

## 📁 Project Structure

- `src/`: Next.js Web Application
- `tools/`: Management CLI Tool (Go)
- `docs/`: Specifications and documentation

## 🛠️ Getting Started

### 1. Prerequisites

- Node.js 18+
- Go 1.25+
- ImageMagick (for CLI thumbnail generation)
- Supabase Project

### 2. Environment Setup

**Web App (`.env.local`)**

```bash
NEXT_PUBLIC_BASE_URL=https://fruits-drill.stdy.workers.dev
REVALIDATE_TOKEN=<your-random-token>
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
npm run deploy
```

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

- Full URL (e.g. legacy Supabase URL)
- R2 key format (`r2://pdf/<sha256>.pdf`, `r2://thumbnail/<sha256>.png`)

When a value is stored as an R2 key, it is served via:

- `/api/files/<object-key>`

### 3.8 Admin API Token

Set the admin API token in Cloudflare as a Worker secret.

```bash
npx wrangler secret put ADMIN_API_TOKEN
```

`REVALIDATE_TOKEN` is still supported as a fallback for backward compatibility.

### 3.9 Admin API Endpoints

- `POST /api/admin/drills/register`
- `POST /api/admin/drills/delete`
- `POST /api/revalidate`

Authentication:

- `Authorization: Bearer <ADMIN_API_TOKEN>`
- (compat) query `?secret=<token>` is accepted on `GET /api/revalidate`

### 4. Manage Content (CLI)

See [tools/README.md](tools/README.md) for details on how to register drill PDFs.

```bash
make go-build
./bin/fruits-cli register ./sample/drill.pdf
```

### 5. One-time Data Migration (Supabase -> D1/R2)

See [tools/migration/README.md](tools/migration/README.md) for full migration steps and verification scripts.
