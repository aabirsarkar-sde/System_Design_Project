# Campus Service Management System

Full-stack campus operations platform with a Prisma/PostgreSQL backend API and a Next.js frontend dashboard.

## Overview

The system supports resident and admin workflows for service requests, facilities visibility, and operations analytics.

- Backend exposes typed REST endpoints with secure configuration validation.
- Prisma persists users, service requests, facilities, bookings, and notifications in PostgreSQL.
- Frontend consumes backend endpoints for all dashboard pages and authenticates through a session-backed login flow.
- Request creation is validated server-side and proxied through a Next.js API route.

## Tech Stack

- Backend: Node.js, TypeScript, Express, Helmet, CORS, dotenv, Prisma, PostgreSQL
- Frontend: Next.js App Router, TypeScript, React
- Persistence: Neon/PostgreSQL via Prisma
- Database schema: `prisma/schema.prisma`

## Environment Variables

Create backend env file from `.env.example`:

```bash
cp .env.example .env
```

Required backend variables:

- `NODE_ENV`
- `PORT`
- `FRONTEND_ORIGIN`
- `DATABASE_URL`

Optional backend variables:

- `STUDENTS_CSV_PATH`

These are validated at startup. Missing required values fail fast.

## Database Setup

Generate the Prisma client, push the schema, and seed the production-shaped data:

```bash
npm install
npm run db:push
npm run db:seed
```

Or run everything together:

```bash
npm run db:setup
```

The seed script imports students from `STUDENTS_CSV_PATH` and creates:

- one user per enrollment number
- bcrypt-hashed passwords based on the first 4 characters of the enrollment number
- one seeded admin account
- facilities, service requests, bookings, and notifications for dashboard coverage

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
- `POST /api/auth/login`
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
