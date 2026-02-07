# Pet Hotel（ペット保育園・ホテル・トリミング）

大切なペットに、最高のケアと安心を提供するペット総合施設の予約管理システムです。

## プロジェクト概要

- **フレームワーク**: Next.js 15
- **ORM**: Prisma
- **データベース**: PostgreSQL
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS

## 🚀 初期セットアップ

GitHubリポジトリをクローン（またはpull）した後、以下の手順を実行してください:

```bash
npm install
npx prisma client
npx prisma migrate dev
npx prisma db seed
npm run dev
```

**詳細な説明は [SETUP_GUIDE.md](SETUP_GUIDE.md) を参照してください。**

---

## 開発サーバーの起動

```bash
npm run dev
```

- ブラウザで [http://localhost:3000](http://localhost:3000) を開きます
- ファイル変更時に自動的にホットリロードされます

---

## 主な機能

- 📅 **予約管理**: 保育園、ホテル、トリミングの予約
- 📱 **マイページ**: ユーザーの予約履歴確認
- 👨‍💼 **管理画面**: 管理者による予約管理
- 📧 **メール通知**: 予約確認メールの送信

---

## ディレクトリ構成

```
src/
├── app/              # ページコンポーネント
│   ├── api/          # APIルート
│   ├── admin/        # 管理画面
│   ├── reserve/      # 予約ページ
│   └── page.tsx      # トップページ
├── components/       # 再利用可能なコンポーネント
└── lib/              # ユーティリティ関数
    └── validations/  # バリデーション

prisma/
├── schema.prisma     # データベーススキーマ
└── seed.ts           # シードデータ
```

---

## よく使うコマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーの起動 |
| `npm run build` | 本番ビルド |
| `npm run lint` | ESLintチェック |
| `npm test` | テスト実行 |
| `npx prisma studio` | Prisma Studio起動（GUI DB管理） |
| `npx prisma db seed` | シードデータの投入 |
| `npx prisma migrate dev` | マイグレーション実行 |

---

## トラブルシューティング

問題が発生した場合は、[SETUP_GUIDE.md](SETUP_GUIDE.md) の「トラブルシューティング」セクションを確認してください。

---

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
