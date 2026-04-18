# 🍎 ふるーつドリル (Fruits Drill)

小学生向けの問題集（ドリル）を無料配布するWebサイト「ふるーつドリル」のモノレポです。
保護者をターゲットに、フルーツのような「彩り」と「実り」をテーマにした親しみやすいデザインを目指しています。

## 🚀 Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React
- **Backend / DB**: Supabase (PostgreSQL, Storage)
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
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

**CLI Tool (`tools/.env`)**

```bash
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_BUCKET_NAME=drills
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

### 4. Manage Content (CLI)

See [tools/README.md](tools/README.md) for details on how to register drill PDFs.

```bash
make go-build
./bin/fruits-cli register ./sample/drill.pdf
```
