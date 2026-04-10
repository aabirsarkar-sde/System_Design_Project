# Campus Service Management System

Full-stack campus operations platform with a TypeScript backend API and a Next.js frontend dashboard.

## Overview

The system supports resident and admin workflows for service requests, facilities visibility, and operations analytics.

- Backend exposes typed REST endpoints with secure configuration validation.
- Frontend consumes backend endpoints for all dashboard pages.
- Request creation is validated server-side and proxied through a Next.js API route.

## Tech Stack

- Backend: Node.js, TypeScript, Express, Helmet, CORS, dotenv
- Frontend: Next.js App Router, TypeScript, React
- Persistence (current stage): In-memory repositories with seeded bootstrap data
- Database schema: `db/schema.sql`

## Environment Variables

Create backend env file from `.env.example`:

```bash
cp .env.example .env
```

Required backend variables:

- `NODE_ENV`
- `PORT`
- `FRONTEND_ORIGIN`

These are validated at startup. Missing values fail fast.

## Run Backend

From project root:

```bash
npm install
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

Backend default local URL (from example env): `http://localhost:4000`

## API Endpoints

- `GET /api/health`
- `GET /api/header/me?userId=...`
- `GET /api/dashboard/resident?userId=...`
- `GET /api/dashboard/admin`
- `GET /api/analytics`
- `GET /api/facilities`
- `GET /api/requests/board?userId=...`
- `GET /api/ticket/form-config`
- `POST /api/requests`

## Frontend

See [frontend/README.md](frontend/README.md) for frontend environment and run instructions.
