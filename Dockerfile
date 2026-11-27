# syntax=docker/dockerfile:1

# ========================================
# Etapa 1: Base con Corepack y usuario
# ========================================
FROM node:22-alpine3.20 AS base

ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    NEXT_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN corepack enable && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /code

# ========================================
# Etapa 2: Dependencias (con caché BuildKit)
# ========================================
FROM base AS deps

# Herramientas de compilación necesarias solo para módulos nativos (ej. lightningcss)
RUN apk add --no-cache libc6-compat

COPY --chown=nextjs:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ========================================
# Etapa 3: Desarrollo (para docker compose watch)
# ========================================
FROM deps AS development

# Bake the source into the dev image so `docker compose up` works standalone;
# `docker compose watch` still syncs host changes on top of this.
COPY --chown=nextjs:nodejs . .

RUN mkdir -p /code/.next && chown -R nextjs:nodejs /code
USER nextjs

EXPOSE 3000
CMD ["pnpm", "run", "dev"]

# ========================================
# Etapa 4: Construcción (Build)
# ========================================
FROM deps AS build

COPY --chown=nextjs:nodejs . .

# Variables públicas necesarias en tiempo de compilación (puedes pasarlas via --build-arg)
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_CLOUDINARY_URL
ARG NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
ARG NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_2

RUN pnpm run build

# ========================================
# Etapa 5: Producción (Imagen mínima Standalone)
# ========================================
FROM node:22-alpine3.20 AS production

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /code

# Copiar únicamente el bundle standalone generado por Next.js
COPY --from=build --chown=nextjs:nodejs /code/public ./public
COPY --from=build --chown=nextjs:nodejs /code/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /code/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
