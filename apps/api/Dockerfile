# ─────────────────────────────────────────────────────────────
# Stage 1 — deps
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/package.json

RUN yarn install --frozen-lockfile

# ─────────────────────────────────────────────────────────────
# Stage 2 — builder
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY package.json yarn.lock ./
COPY apps/api ./apps/api

RUN yarn workspace @almoxpert/api build

# ─────────────────────────────────────────────────────────────
# Stage 3 — runner
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder --chown=appuser:appgroup /app/node_modules    ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/apps/api/dist   ./dist

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

CMD ["node", "dist/main"]
