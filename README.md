# 🍎 ふるーつドリル (Fruits Drill)

小学生向けの問題集（ドリル）を無料配布するWebサイト「ふるーつドリル」のモノレポです。
保護者をターゲットに、フルーツのような「彩り」と「実り」をテーマにした親しみやすいデザインを目指しています。

## 🚀 Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React
- **Backend / DB**: Supabase (PostgreSQL, Storage)
- **Observability**: Grafana Faro Web SDK
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

# Observability (Grafana Faro)
NEXT_PUBLIC_FARO_URL=https://<collector-url>
NEXT_PUBLIC_FARO_APP_NAME=fruits-drill
NEXT_PUBLIC_FARO_APP_VERSION=1.0.0
NEXT_PUBLIC_FARO_APP_ENV=development

# Source Map Upload (Optional, for Build)
FARO_SOURCEMAP_ENDPOINT=https://faro-api-prod-ap-northeast-0.grafana.net/faro/api/v1
FARO_STACK_ID=<stack-id>
FARO_APP_ID=<app-id>
GRAFANA_API_KEY=<service-account-token>
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

### 4. Manage Content (CLI)

See [tools/README.md](tools/README.md) for details on how to register drill PDFs.

```bash
make go-build
./bin/fruits-cli register ./sample/drill.pdf
```
