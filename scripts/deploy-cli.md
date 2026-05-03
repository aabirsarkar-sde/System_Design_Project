# CLI deploy (Render + Vercel)

## Prereqs

- Git repo pushed to GitHub/GitLab/Bitbucket (both platforms deploy from Git by default).
- **Neon** (or other) Postgres — copy `DATABASE_URL`.

## 1) Render (API)

### Option A — Blueprint (uses `render.yaml`)

1. Install CLI: https://render.com/docs/cli (`brew install render` or install script).
2. `render login`
3. In Render Dashboard: **New → Blueprint** → connect repo → apply `render.yaml`.
4. In the **campus-service-api** service **Environment**, set:
   - `DATABASE_URL` — your Postgres URL
   - `FRONTEND_ORIGIN` — e.g. `https://your-app.vercel.app` (set after step 2, then redeploy)

### Option B — Manual Web Service

- **Root directory:** repo root (`.`)
- **Build:** `npm ci && npm run build`
- **Start:** `npm start`
- **Health check path:** `/api/health`
- **Env:** `NODE_ENV=production`, `DATABASE_URL`, `FRONTEND_ORIGIN` (and rely on Render’s `PORT`).

### Validate blueprint locally

```bash
render blueprints validate render.yaml
```

## 2) Vercel (Next.js)

1. Install: `npm i -g vercel` or use `npx vercel`.
2. **Important:** In Vercel project settings, set **Root Directory** to `frontend` (this repo is a monorepo).
3. From repo root:

   ```bash
   cd frontend && npx vercel link
   npx vercel --prod
   ```

4. In Vercel → Project → **Environment Variables** (Production):

   | Name | Example |
   |------|---------|
   | `SITE_BASE_URL` | `https://your-project.vercel.app` |
   | `BACKEND_API_BASE_URL` | `https://campus-service-api.onrender.com` |
   | `SESSION_SECRET` | output of `openssl rand -base64 32` |

5. Update Render’s `FRONTEND_ORIGIN` to match `SITE_BASE_URL` origin exactly, then **Manual Deploy** the API again.

## One-shot scripts (from repo root)

```bash
npm run deploy:vercel   # requires Vercel login + linked project
```

Render deploys are usually triggered by **git push** after the service is connected; use `render deploys create <SERVICE_ID>` if you use the CLI with a service ID.
