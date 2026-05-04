# API (Express + Prisma) — production image
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
# prisma/ must exist before `npm ci` — postinstall runs `prisma generate`.
COPY prisma ./prisma
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 4000
USER node
CMD ["node", "dist/server.js"]
