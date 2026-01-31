# --- Base Stage ---
FROM node:22-slim AS base
WORKDIR /app

# --- Dependencies Stage ---
FROM base AS deps
# Prismaのためにopensslが必要
RUN apt-get update && apt-get install -y openssl
COPY package.json package-lock.json ./
# ビルドには devDependencies が必要なので、ここでは NODE_ENV=production を指定せずにインストールします
RUN npm ci

# --- Build Stage ---
FROM base AS builder
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma Clientの生成
RUN npx prisma generate

# Next.js のビルド
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Runner Stage ---
FROM base AS runner
# 実行環境のみ本番モードに設定
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# セキュリティのため非ルートユーザーを作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# ビルド成果物のコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# standaloneモードでは server.js を起動する
CMD ["node", "server.js"]
