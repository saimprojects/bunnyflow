# BunnyFlow — Deployment Guide

## Structure
- **Frontend** → `artifacts/flow-platform/` → Deploy on **Vercel**
- **Backend** → `artifacts/api-server/` → Deploy on **Railway**
- **Shared libs** → `lib/` (api-client-react, db, api-zod)

---

## Step 1 — Deploy Backend on Railway

### Railway Setup
1. Create a new project on [railway.app](https://railway.app)
2. "Deploy from GitHub repo" → connect this repo
3. Set **Root Directory**: `/` (monorepo root)
4. Add a **PostgreSQL** service in Railway (auto-generates `DATABASE_URL`)

### Railway Environment Variables
Set these in Railway → Service → Variables:
```
PORT=8080
DATABASE_URL=<auto-provided by Railway PostgreSQL>
SESSION_SECRET=your-super-secret-32-char-minimum-key
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Railway Build & Start Commands
- **Build**: `pnpm install && pnpm --filter @workspace/api-server run build`
- **Start**: `pnpm --filter @workspace/api-server run start`

### Run DB Migration (once after first deploy)
In Railway → Service → Shell:
```bash
pnpm --filter @workspace/db run push
```

---

## Step 2 — Deploy Frontend on Vercel

### Vercel Setup
1. Create a new project on [vercel.com](https://vercel.com)
2. Import this GitHub repo
3. Set **Framework Preset**: Other
4. Set **Root Directory**: `/` (keep as monorepo root)
5. Set **Build Command**: `pnpm install && pnpm --filter @workspace/flow-platform run build`
6. Set **Output Directory**: `artifacts/flow-platform/dist/public`

### Vercel Environment Variables
```
VITE_API_URL=https://your-backend.railway.app
BASE_PATH=/
NODE_ENV=production
```

---

## Step 3 — Update CORS on Railway

After Vercel gives you a URL (e.g. `https://bunnyflow.vercel.app`), go back to Railway and update:
```
ALLOWED_ORIGINS=https://bunnyflow.vercel.app
```

---

## Admin Panel
- URL: `https://your-frontend.vercel.app/admin`
- Default credentials: `admin@bunnyflow.app` / `admin123`
- **IMPORTANT**: Change admin password after first login

## Extension
- Users download from: `https://your-frontend.vercel.app/extension`
- Server URL to enter in extension popup: `https://your-backend.railway.app`

---

## Environment Variables Summary

| Variable | Service | Description |
|----------|---------|-------------|
| `PORT` | Railway | HTTP port (Railway auto-assigns) |
| `DATABASE_URL` | Railway | PostgreSQL connection string |
| `SESSION_SECRET` | Railway | JWT signing secret (min 32 chars) |
| `NODE_ENV` | Railway | Set to `production` |
| `ALLOWED_ORIGINS` | Railway | Your Vercel frontend URL |
| `VITE_API_URL` | Vercel | Your Railway backend URL |
| `BASE_PATH` | Vercel | Set to `/` |
