# Next.js 15 アプリケーションのコンテナ化と AWS ECS デプロイガイド

このドキュメントでは、本プロジェクトを Podman を使用してコンテナ化し、AWS ECS (Fargate) 上に構築するための手順を説明します。

## 1. アプリケーションの設定変更

Next.js を Docker 向けに最適化するため、Standalone Mode を有効にします。

### `next.config.ts` の修正
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // スタンドアロン出力を有効化（イメージサイズを大幅に削減）
  output: 'standalone',
  // 必要に応じて他の設定を追加
};

export default nextConfig;
```

## 2. Dockerfile の作成

プロジェクトのルートディレクトリに以下の内容で `Dockerfile` を作成します。マルチステージビルドを採用し、実行用イメージを軽量化しています。

```dockerfile
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

```

## 3. .dockerignore の作成

ビルドに不要なファイルを除外します。

```text
node_modules
.next
.git
.env*.local
README.md
Dockerfile
.dockerignore
```

## 4. Podman によるビルドとローカル確認

RHEL 上で以下のコマンドを実行します。

### イメージのビルド
```bash
podman build -t pet-hotel-app .
```

### ローカルでの動作確認
```bash
podman run -d \
  --name pet-hotel-web \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@db-host:5432/pet_hotel" \
  -e SES_SMTP_HOST="..." \
  -e SES_SMTP_USER="..." \
  -e SES_SMTP_PASS="..." \
  -e SES_FROM_EMAIL="..." \
  -e APP_URL="http://[YOUR_IP_OR_DOMAIN]:3000" \
  pet-hotel-app
```

## 5. AWS ECS (Fargate) へのデプロイ手順

### ECR へのプッシュ
1. ECR リポジトリを作成します。
2. ログインしてプッシュします。
```bash
aws ecr get-login-password --region <REGION> | podman login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com

podman tag pet-hotel-app:latest <AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/pet-hotel-app:latest
podman push <AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/pet-hotel-app:latest
```

### ECS 設定のポイント
- **環境変数の管理**: `DATABASE_URL` や `SES_*` の秘匿情報は、AWS Secrets Manager または Parameter Store を使用してタスク定義に注入してください。

#### Secrets Manager / Parameter Store からの注入手順

1. **IAM 実行ロールの権限追加**:
   ECS タスク実行ロール（通常は `ecsTaskExecutionRole`）に以下の権限を付与するインラインポリシーをアタッチします。
   - Secrets Manager 利用時: `secretsmanager:GetSecretValue`
   - Parameter Store 利用時: `ssm:GetParameters`

2. **タスク定義 (JSON) への記述**:
   コンテナ定義内の `secrets` セクションに記述します。これにより、起動時に AWS が安全に値を環境変数として注入します。

```json
{
  "containerDefinitions": [
    {
      "name": "pet-hotel-app",
      "image": "<AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/pet-hotel-app:latest",
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:<REGION>:<ACCOUNT_ID>:secret:YourSecretID"
        },
        {
          "name": "SES_SMTP_PASS",
          "valueFrom": "arn:aws:ssm:<REGION>:<ACCOUNT_ID>:parameter/your/parameter/path"
        }
      ]
    }
  ]
}
```

3. **特定のキーのみを抽出する場合 (Secrets Manager)**:
   シークレットが JSON 形式の場合、ARN の末尾に `:キー名::` を追加することで特定の値を抽出できます。
   - 例: `arn:aws:secretsmanager:...:secret:MySecret:db_pass::`

- **セキュリティグループ**: ECS タスクから PostgreSQL (RDS 等) へのポート 5432 の通信を許可してください。
- **DB スキーマの更新**: デプロイ時に `npx prisma db push` を実行するステップを CI/CD パイプラインに含めることを推奨します。
