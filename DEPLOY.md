# Production deployment

This document describes how the **Next.js** app, **Express** API, and **PostgreSQL** fit together, and how to run them in production.

## Architecture (end-to-end)

```
  Browser ──HTTPS (same origin)──► Next.js (pages + /api/* routes)
                                      │
                                      │ server-side fetch(BACKEND_API_BASE_URL)
                                      ▼
                                    Express API ──► PostgreSQL (Prisma)
```

1. **Browser → Next.js** only. All UI and same-origin `fetch("/api/...")` (e.g. login) hit the Next host.
2. **Next.js server → Express** for data: `getBackendApiBaseUrl()` + path (RSC, route handlers). The browser does not call Express directly; that avoids CORS for normal app traffic. You must still set **`FRONTEND_ORIGIN`** on the API to the public Next URL for CORS and for consistency.
3. **Express → PostgreSQL** via Prisma using **`DATABASE_URL`**.

## Auth flow (sign-in)

1. User posts credentials to **Next** `POST /api/auth/login`.
2. Next proxies to **Express** `POST /api/auth/login` with JSON body.
3. Express validates with **bcrypt** against `users.password_hash`.
4. On success, Next sets **`campus_session`**: base64 user JSON + **HMAC-SHA256** with **`SESSION_SECRET`** (httpOnly, `secure` in production, `SameSite=Lax`).
5. Protected RSC use **`getSession()`** / **`requireSession()`**; server fetches to the API include `userId` where the backend enforces access (e.g. admin).

## Admin (sole user)

- Enrollment **`2401010085`**, role **`ADMIN`**, password from seed (`1234` in dev seed).  
- **GET `/api/dashboard/admin?userId=...`** and **PATCH `/api/requests/:id/status?userId=...`** return **403** unless that user is the sole admin.  
- Re-seed or migrate the DB if the admin row is missing in production.

## Environment variables

| Where        | Variable                 | Purpose |
|-------------|--------------------------|---------|
| API         | `NODE_ENV`               | `production` |
| API         | `PORT`                   | Listen port (e.g. `4000`) |
| API         | `FRONTEND_ORIGIN`        | Public origin of the Next app (no trailing slash) — CORS |
| API         | `DATABASE_URL`         | Prisma connection string |
| Next        | `NODE_ENV`               | `production` |
| Next        | `SITE_BASE_URL`          | Public URL of the Next app (metadata, links) |
| Next        | `BACKEND_API_BASE_URL`   | Full base URL of the API for **server-side** fetches only |
| Next        | `SESSION_SECRET`       | HMAC key for `campus_session` (long, random) |

**Local dev fallbacks** in `frontend/src/lib/env.ts` only apply when `NODE_ENV !== "production"`. In production, all of the Next variables are **required**.

## Option A: Docker Compose (monorepo root)

1. Copy [`.env.production.example`](.env.production.example) to **`.env`** in the repo root and fill in real values (including **`SITE_BASE_URL`**, **`SESSION_SECRET`**, **`FRONTEND_ORIGIN`**, **`DATABASE_URL`**, **`NODE_ENV=production`**, **`PORT=4000`**). Docker Compose reads this file for variable substitution and passes it to both services.
2. Build and start:

   ```bash
   npm run docker:compose
   ```

3. **API** listens on `4000`, **web** on `8000` (put HTTPS / TLS in front with nginx, Caddy, or a cloud LB).

Inside Compose, Next uses **`BACKEND_API_BASE_URL=http://api:4000`** for server-side fetches. **`FRONTEND_ORIGIN`** on the API must match the **origin** of **`SITE_BASE_URL`** (what users type in the browser).

## Option B: Split hosting (e.g. Vercel + API host)

- Deploy **Next** to Vercel (or similar): set `SITE_BASE_URL`, `BACKEND_API_BASE_URL` (public API URL), `SESSION_SECRET`.
- Run **Express** on a VM, Fly.io, Railway, etc.: set `FRONTEND_ORIGIN` to your Vercel domain, `DATABASE_URL`, `PORT`, `NODE_ENV=production`.
- Run **`npx prisma migrate deploy`** or **`prisma db push`** against production DB from CI or a one-off job (not on every request).

## Database

- **Neon** / managed Postgres: use the provided connection string; often `?sslmode=require`.
- After first deploy: `npm run db:push` (schema) and optional `npm run db:seed` (dev/test data only — **do not** run seed on production with real user data without review).

## Health checks

- **API:** `GET /api/health` — use for load balancer / orchestrator probes.
- **Next:** `GET /health` (plain `ok`) in the frontend app.

## Checklist before go-live

- [ ] `FRONTEND_ORIGIN` === origin of `SITE_BASE_URL` (scheme, host, port).
- [ ] `SESSION_SECRET` set and **never** committed.
- [ ] `DATABASE_URL` points to production DB; Prisma schema applied.
- [ ] TLS termination in front of Next and API (HTTPS).
- [ ] Sole admin user exists in DB with correct `enrollmentNumber` and `ADMIN` role.

## Build verification (local)

```bash
npm run build
cd frontend && npm run build
```

Both must pass before you tag a release.
