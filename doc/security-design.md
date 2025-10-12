# セキュリティ設計書

## 概要

本ドキュメントでは、タスク管理システムのセキュリティ要件、脅威分析、対策について詳述します。

### セキュリティ方針

- **多層防御**: 複数のセキュリティレイヤーによる保護
- **最小権限の原則**: 必要最小限の権限のみ付与
- **データ保護**: 個人情報・機密情報の適切な保護
- **監査**: セキュリティイベントのログ記録
- **継続的改善**: 定期的なセキュリティレビューと更新

---

## 認証（Authentication）

### 認証方式

#### 1. メール/パスワード認証
NextAuth.jsの`Credentials Provider`を使用

**フロー:**
```
1. ユーザーがメール・パスワードを入力
2. サーバーでパスワードハッシュを検証
3. 認証成功時、セッショントークン発行
4. クライアントにセッションCookie設定
```

**パスワード要件:**
- 最小8文字
- 大文字・小文字・数字を含む
- 特殊文字を推奨

**パスワードハッシュ化:**
```typescript
import bcrypt from 'bcryptjs'

// パスワードハッシュ化（登録時）
const saltRounds = 12
const hashedPassword = await bcrypt.hash(password, saltRounds)

// パスワード検証（ログイン時）
const isValid = await bcrypt.compare(password, hashedPassword)
```

#### 2. ソーシャル認証（OAuth）
NextAuth.jsの`OAuth Providers`を使用

**対応プロバイダー:**
- Google
- GitHub
- Microsoft（将来的）

**フロー:**
```
1. ユーザーがプロバイダーのログインボタンをクリック
2. プロバイダーの認証ページにリダイレクト
3. ユーザーが承認
4. コールバックURLに認証コードが返却
5. トークン交換
6. ユーザー情報取得・DB保存
7. セッション作成
```

### セッション管理

#### セッション戦略
NextAuth.jsの`jwt`戦略を使用

**セッション設定:**
```typescript
// lib/auth.ts
export const authOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
}
```

#### JWTペイロード
```typescript
interface JWTPayload {
  sub: string           // ユーザーID
  email: string
  name: string
  iat: number          // 発行日時
  exp: number          // 有効期限
}
```

#### セッション更新
- アクティブなユーザーは自動的にセッション更新
- 30日間アクティビティがない場合は再ログイン必須

### パスワードリセット

**フロー:**
```
1. ユーザーがメールアドレスを入力
2. パスワードリセットトークン生成（有効期限: 1時間）
3. トークンをDBに保存
4. リセットリンクをメール送信
5. ユーザーがリンクをクリック
6. トークン検証
7. 新しいパスワードを設定
8. トークンを無効化
```

**トークン生成:**
```typescript
import crypto from 'crypto'

const resetToken = crypto.randomBytes(32).toString('hex')
const resetTokenHash = crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex')

// DBに保存
await prisma.passwordResetToken.create({
  data: {
    userId,
    token: resetTokenHash,
    expiresAt: new Date(Date.now() + 3600000), // 1時間
  },
})
```

---

## 認可（Authorization）

### 権限モデル

#### 組織レベル権限
| ロール | 権限 |
|-------|------|
| OWNER | すべての操作（削除含む） |
| ADMIN | メンバー管理、プロジェクト管理 |
| MEMBER | プロジェクト閲覧、タスク操作 |

#### プロジェクトレベル権限
| ロール | 権限 |
|-------|------|
| ADMIN | すべての操作（削除含む） |
| DEVELOPER | タスク作成・編集・削除 |
| VIEWER | 閲覧のみ |

### 権限チェック実装

#### ミドルウェアによる権限チェック
```typescript
// lib/auth-middleware.ts
export async function requireAuth(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new UnauthorizedError('認証が必要です')
  }
  return session.user
}

export async function requireOrganizationRole(
  userId: string,
  organizationId: string,
  requiredRoles: OrganizationRole[]
) {
  const member = await prisma.organizationMember.findUnique({
    where: {
      organization_id_user_id: {
        organization_id: organizationId,
        user_id: userId,
      },
    },
  })

  if (!member || !requiredRoles.includes(member.role)) {
    throw new ForbiddenError('権限がありません')
  }

  return member
}
```

#### API Routeでの使用例
```typescript
// app/api/organizations/[orgId]/route.ts
export async function DELETE(
  req: Request,
  { params }: { params: { orgId: string } }
) {
  const user = await requireAuth(req)
  await requireOrganizationRole(user.id, params.orgId, ['OWNER'])

  // 削除処理
  await prisma.organization.delete({
    where: { id: params.orgId },
  })

  return new Response(null, { status: 204 })
}
```

### リソースベース権限チェック

**タスクの編集権限例:**
```typescript
export async function canEditTask(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        include: {
          members: {
            where: { user_id: userId },
          },
        },
      },
    },
  })

  if (!task) return false

  const projectMember = task.project.members[0]
  if (!projectMember) return false

  // ADMIN, DEVELOPERは編集可能
  // または、タスクの担当者・報告者も編集可能
  return (
    ['ADMIN', 'DEVELOPER'].includes(projectMember.role) ||
    task.assignee_id === userId ||
    task.reporter_id === userId
  )
}
```

---

## データ保護

### 機密情報の管理

#### 環境変数
機密情報は環境変数で管理し、コードにハードコードしない

```bash
# .env
DATABASE_URL="mysql://..."
NEXTAUTH_SECRET="random-secret-string"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
```

#### シークレットローテーション
定期的にシークレットを更新する
- `NEXTAUTH_SECRET`: 6ヶ月ごと
- APIキー: 3ヶ月ごと

### データ暗号化

#### 転送時の暗号化
- すべての通信にHTTPS使用（TLS 1.2以上）
- HTTP Strict Transport Security (HSTS)有効化

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },
}
```

#### 保存時の暗号化
- パスワード: bcrypt/argon2でハッシュ化
- データベース: AWS RDSの暗号化機能を使用
- ファイルストレージ: S3のサーバーサイド暗号化（SSE）

### 個人情報保護

#### GDPR対応
- データポータビリティ（エクスポート機能）
- 削除権（アカウント削除機能）
- アクセス権（データ閲覧機能）

#### データ保持期間
- アクティブユーザー: 無期限
- 削除されたアカウント: 30日後に完全削除
- ログデータ: 90日間保持

---

## 入力バリデーション

### フロントエンドバリデーション
Zodスキーマによるバリデーション

```typescript
import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1, '必須項目です').max(255, '255文字以内'),
  description: z.string().max(5000, '5000文字以内').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  assignee_id: z.string().uuid().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})
```

### バックエンドバリデーション
**必ずサーバーサイドでも検証**

```typescript
// app/api/tasks/route.ts
export async function POST(req: Request) {
  const body = await req.json()

  // バリデーション
  const validated = createTaskSchema.parse(body)

  // DB操作
  const task = await prisma.task.create({
    data: validated,
  })

  return Response.json({ success: true, data: task })
}
```

### SQLインジェクション対策
Prisma ORMを使用することで、自動的にSQLインジェクションを防止

```typescript
// 安全（Prismaが自動的にエスケープ）
const user = await prisma.user.findUnique({
  where: { email: userInput },
})

// 危険（使用しない）
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userInput}
`
```

### XSS対策
Reactの自動エスケープにより基本的に保護されるが、`dangerouslySetInnerHTML`は避ける

```tsx
// 安全
<div>{userInput}</div>

// 危険（使用しない）
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// どうしても使う場合はサニタイズ
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

---

## CSRF対策

Next.jsのAPI Routesは自動的にCSRF保護を提供

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}
```

---

## CORS設定

適切なCORS設定でクロスオリジンリクエストを制限

```typescript
// middleware.ts
export function middleware(req: Request) {
  const origin = req.headers.get('origin')
  const allowedOrigins = [
    'https://yourdomain.com',
    process.env.NODE_ENV === 'development' && 'http://localhost:3000',
  ].filter(Boolean)

  if (origin && !allowedOrigins.includes(origin)) {
    return new Response('CORS not allowed', { status: 403 })
  }

  return NextResponse.next()
}
```

---

## レート制限

DoS攻撃対策としてレート制限を実装

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache'

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage >= limit

        return isRateLimited ? reject() : resolve()
      }),
  }
}

// 使用例
const limiter = rateLimit({
  interval: 60 * 1000, // 1分
  uniqueTokenPerInterval: 500,
})

export async function POST(req: Request) {
  try {
    await limiter.check(10, req.ip) // 1分間に10リクエストまで
  } catch {
    return new Response('Rate limit exceeded', { status: 429 })
  }

  // 処理続行
}
```

---

## ファイルアップロードセキュリティ

### ファイルタイプ検証

```typescript
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function validateFile(file: File) {
  // MIMEタイプチェック
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('許可されていないファイルタイプです')
  }

  // ファイルサイズチェック
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('ファイルサイズが大きすぎます')
  }

  // ファイル名のサニタイズ
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')

  return { sanitizedName, type: file.type, size: file.size }
}
```

### S3アップロード設定

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({ region: 'ap-northeast-1' })

export async function uploadToS3(file: Buffer, key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    // パブリックアクセスを禁止
    ACL: 'private',
    // サーバーサイド暗号化
    ServerSideEncryption: 'AES256',
  })

  await s3Client.send(command)
}
```

---

## 監査ログ

### ログ対象イベント
- ユーザーログイン/ログアウト
- 権限変更
- 重要なリソースの作成・更新・削除
- セキュリティエラー（認証失敗、権限不足）

### ログフォーマット

```typescript
interface AuditLog {
  id: string
  timestamp: Date
  user_id: string | null
  action: string
  resource_type: string
  resource_id: string | null
  ip_address: string
  user_agent: string
  status: 'success' | 'failure'
  details?: Record<string, any>
}
```

### ログ実装例

```typescript
// lib/audit-log.ts
export async function logAuditEvent(event: Omit<AuditLog, 'id' | 'timestamp'>) {
  await prisma.auditLog.create({
    data: {
      ...event,
      timestamp: new Date(),
    },
  })
}

// 使用例
await logAuditEvent({
  user_id: session.user.id,
  action: 'project.delete',
  resource_type: 'project',
  resource_id: projectId,
  ip_address: req.ip,
  user_agent: req.headers.get('user-agent'),
  status: 'success',
})
```

---

## セキュリティヘッダー

### 推奨ヘッダー設定

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // XSS対策
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // クリックジャッキング対策
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // MIME スニッフィング対策
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // リファラー制御
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // HTTPS強制
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https:",
            ].join('; '),
          },
        ],
      },
    ]
  },
}
```

---

## 脆弱性スキャン

### 定期的なスキャン
- **依存関係スキャン**: `npm audit` / `pnpm audit`
- **コードスキャン**: ESLintセキュリティプラグイン
- **コンテナスキャン**: Docker image scan

### CI/CDパイプラインに組み込み

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      - name: Run ESLint security scan
        run: npm run lint:security
```

---

## インシデント対応

### インシデント検知
- 異常なログイン試行
- 大量のAPI呼び出し
- 権限エラーの多発

### 対応フロー
```
1. インシデント検知
2. 影響範囲の特定
3. 緊急対応（アカウント停止、サービス一時停止）
4. 原因調査
5. 修正・パッチ適用
6. 再発防止策の実施
7. 事後報告書作成
```

---

## セキュリティチェックリスト

開発・デプロイ前のチェックリスト

- [ ] 環境変数が適切に設定されている
- [ ] パスワードがハッシュ化されている
- [ ] すべてのAPIエンドポイントに認証チェックがある
- [ ] 権限チェックが実装されている
- [ ] 入力バリデーションが実装されている
- [ ] SQLインジェクション対策済み
- [ ] XSS対策済み
- [ ] CSRF対策済み
- [ ] セキュリティヘッダーが設定されている
- [ ] HTTPS強制
- [ ] レート制限が実装されている
- [ ] ファイルアップロードが適切に検証されている
- [ ] 監査ログが実装されている
- [ ] 依存関係の脆弱性スキャン済み

---

**関連ドキュメント**
- [API設計書](./api-design.md)
- [アーキテクチャ設計書](./architecture.md)
- [データベース設計書](./database-design.md)
