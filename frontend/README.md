# Frontend

Next.js frontend for campus operations dashboards and request workflows.

## Environment Setup

Create frontend env file from `.env.example`:

```bash
cp .env.example .env.local
```

Required variables:

- `BACKEND_API_BASE_URL` (example: `http://localhost:4000`)
- `SITE_BASE_URL` (example: `http://localhost:8000`)
- `SESSION_SECRET` for production session signing

`BACKEND_API_BASE_URL` and `SITE_BASE_URL` are required in production and validated at runtime for server-side fetches and metadata generation. In local development they fall back to `http://localhost:4000` and `http://localhost:8000`.

## Run

From `frontend/`:

```bash
npm install
npm run dev
```

Open `http://localhost:8000`.

The default dev command uses **webpack** (`next dev --webpack`) because Turbopack can show a blank page in some setups. To try Turbopack instead: `pnpm run dev:turbo`.

Quick check: `http://localhost:8000/health` should return plain text `ok`. If that works but pages are blank, open the browser devtools **Console** for errors.

If the page is blank, check the dev terminal for a warning that Next.js picked the wrong **workspace root** (often caused by a stray `package-lock.json` in a parent folder, e.g. your home directory). This project pins `turbopack.root` in `next.config.ts` to avoid that; removing the extra lockfile also helps.

## Authentication

- Students sign in with their enrollment number.
- Seeded student passwords are the first 4 characters of the enrollment number.
- The frontend stores a signed `campus_session` cookie after proxying credentials to the backend login endpoint.
- Production deployments should always set a strong `SESSION_SECRET`.

## Build and Lint

```bash
npm run lint
npm run build
```

## Backend-Driven Pages

- `/login` sign-in page
- `/` resident dashboard
- `/admin` admin operations dashboard
- `/analytics` analytics view
- `/facilities` facilities status view
- `/requests` request board
- `/ticket/new` create request form

## SEO

The app includes:

- Route-level metadata
- Global Open Graph/Twitter metadata
- `robots.txt` route via `src/app/robots.ts`
- `sitemap.xml` route via `src/app/sitemap.ts`
