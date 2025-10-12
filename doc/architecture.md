# アーキテクチャ設計書

## システム構成

本システムは、Next.jsをベースとしたフルスタックWebアプリケーションとして構築します。

```
┌─────────────────────────────────────────────────┐
│           クライアント（Browser）                │
└─────────────────┬───────────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────────┐
│              Next.js Application                 │
│  ┌───────────────────────────────────────────┐  │
│  │     Frontend (React Components)           │  │
│  │  - Pages / App Router                     │  │
│  │  - UI Components                          │  │
│  │  - State Management                       │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │     Backend (API Routes / Server Actions) │  │
│  │  - API Endpoints                          │  │
│  │  - Business Logic                         │  │
│  │  - Authentication / Authorization         │  │
│  └───────────────┬───────────────────────────┘  │
└──────────────────┼───────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────┐
│              MySQL Database                      │
│  - Users / Organizations                         │
│  - Projects / Tasks                              │
│  - Comments / Attachments                        │
└──────────────────────────────────────────────────┘
```

## 技術スタック

### フロントエンド
- **言語**: TypeScript
- **フレームワーク**: Next.js 14+ (App Router)
- **UIライブラリ**: React 18+
- **スタイリング**: Tailwind CSS / CSS Modules
- **状態管理**: React Context API / Zustand（必要に応じて）
- **フォームバリデーション**: React Hook Form + Zod
- **UIコンポーネント**: shadcn/ui または Radix UI

### バックエンド
- **ランタイム**: Node.js
- **フレームワーク**: Next.js API Routes / Server Actions
- **ORM**: Prisma
- **認証**: NextAuth.js (Auth.js)
- **バリデーション**: Zod

### データベース
- **RDBMS**: MySQL 8.0+
- **マイグレーション管理**: Prisma Migrate
- **接続プール**: Prisma Connection Pooling

### インフラ（想定）
- **ホスティング**: Vercel / AWS / GCP
- **データベースホスティング**: PlanetScale / AWS RDS / GCP Cloud SQL
- **ファイルストレージ**: AWS S3 / GCP Cloud Storage（添付ファイル用）
- **CDN**: Vercel Edge Network / CloudFront

### 開発ツール
- **パッケージマネージャー**: npm / pnpm
- **Linter**: ESLint
- **フォーマッター**: Prettier
- **テストフレームワーク**: Jest / Vitest + React Testing Library
- **E2Eテスト**: Playwright
- **型チェック**: TypeScript strict mode

## アーキテクチャの特徴

### 1. フルスタックフレームワーク
Next.jsを採用することで、フロントエンドとバックエンドを統合的に開発できます。
- Server ComponentsとClient Componentsの適切な使い分け
- API RoutesまたはServer Actionsによるバックエンドロジックの実装
- SSR（Server-Side Rendering）とCSR（Client-Side Rendering）の最適な組み合わせ

### 2. 型安全性
TypeScript + Prisma + Zodにより、エンドツーエンドの型安全性を確保します。
- データベーススキーマからTypeScript型を自動生成
- APIリクエスト/レスポンスの型検証
- フロントエンドからバックエンドまで一貫した型定義

### 3. パフォーマンス最適化
- Server Componentsによる初期ロード時間の短縮
- 動的インポートによるコード分割
- 画像最適化（Next.js Image コンポーネント）
- データベースクエリの最適化（Prismaによる効率的なクエリ生成）

### 4. セキュリティ
- NextAuth.jsによる堅牢な認証システム
- CSRF保護（Next.js組み込み）
- SQL インジェクション対策（Prisma ORM）
- XSS対策（Reactの自動エスケープ）

## ディレクトリ構造（想定）

```
task-management-system/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 認証関連ページ
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # ダッシュボード
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   └── settings/
│   │   ├── api/               # API Routes
│   │   │   ├── auth/
│   │   │   ├── projects/
│   │   │   └── tasks/
│   │   └── layout.tsx
│   ├── components/            # React コンポーネント
│   │   ├── ui/               # 汎用UIコンポーネント
│   │   ├── features/         # 機能別コンポーネント
│   │   │   ├── auth/
│   │   │   ├── projects/
│   │   │   └── tasks/
│   │   └── layouts/          # レイアウトコンポーネント
│   ├── lib/                   # ユーティリティ・ヘルパー
│   │   ├── prisma.ts         # Prisma Client
│   │   ├── auth.ts           # NextAuth設定
│   │   └── utils.ts          # 汎用ユーティリティ
│   ├── types/                 # 型定義
│   ├── hooks/                 # カスタムフック
│   ├── services/              # ビジネスロジック
│   │   ├── user.service.ts
│   │   ├── project.service.ts
│   │   └── task.service.ts
│   └── validators/            # Zodバリデーションスキーマ
├── prisma/
│   ├── schema.prisma         # Prismaスキーマ
│   └── migrations/           # マイグレーションファイル
├── public/                    # 静的ファイル
├── tests/                     # テストファイル
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## レイヤー構造

### プレゼンテーション層（Presentation Layer）
- **役割**: ユーザーインターフェースの表示とユーザー入力の受付
- **実装**: React Components, Pages
- **責務**:
  - UIの描画
  - ユーザーイベントのハンドリング
  - 状態管理（ローカルステート）

### アプリケーション層（Application Layer）
- **役割**: ビジネスロジックの実行とデータの調整
- **実装**: API Routes, Server Actions, Services
- **責務**:
  - リクエストの受付とレスポンス
  - ビジネスルールの適用
  - トランザクション制御
  - 権限チェック

### データアクセス層（Data Access Layer）
- **役割**: データベースとのやり取り
- **実装**: Prisma Client, Repository Pattern（必要に応じて）
- **責務**:
  - CRUD操作
  - クエリの最適化
  - データの永続化

## セキュリティアーキテクチャ

### 認証フロー
```
1. ユーザーログイン
   ↓
2. NextAuth.js による認証
   ↓
3. JWT/Session トークン発行
   ↓
4. クライアントにトークン返却
   ↓
5. 以降のリクエストでトークンを検証
```

### 認可（Authorization）
- **組織レベル**: OrganizationMemberテーブルでロールチェック
- **プロジェクトレベル**: ProjectMemberテーブルでロールチェック
- **リソースレベル**: 所有者・担当者チェック

### データ保護
- パスワード: bcrypt/argon2でハッシュ化
- 環境変数: `.env`ファイルで機密情報を管理
- API通信: HTTPS強制
- CORS設定: 許可されたオリジンのみアクセス可能

## スケーラビリティ戦略

### 水平スケーリング
- Vercel/AWS等でオートスケーリング
- ステートレス設計（セッションはDB/Redis）
- CDNによる静的コンテンツ配信

### データベース最適化
- 適切なインデックス設計
- クエリの最適化（N+1問題対策）
- コネクションプーリング
- 読み取りレプリカの活用（将来的に）

### キャッシング戦略
- Next.jsのキャッシング機能活用
- Redis導入検討（セッション・頻繁にアクセスされるデータ）
- CDNエッジキャッシング

---

**関連ドキュメント**
- [データベース設計書](./database-design.md)
- [API設計書](./api-design.md)（未作成）
