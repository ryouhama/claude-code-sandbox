# テスト戦略書

## 概要

本ドキュメントでは、タスク管理システムのテスト戦略、テスト方針、テストケース設計について詳述します。

### テスト方針

- **品質保証**: 高品質なソフトウェアの提供
- **早期発見**: バグの早期発見・修正
- **リグレッション防止**: 既存機能の破壊を防ぐ
- **自動化**: CI/CDパイプラインでの自動テスト実行
- **継続的改善**: テストカバレッジの継続的向上

### テストピラミッド

```
        ┌─────────────┐
        │   E2E Test  │  少数（重要フロー）
        │   (10%)     │
        ├─────────────┤
        │ Integration │  中程度（API、DB連携）
        │   (30%)     │
        ├─────────────┤
        │  Unit Test  │  多数（ビジネスロジック）
        │   (60%)     │
        └─────────────┘
```

---

## テストカバレッジ目標

| 領域 | 目標カバレッジ |
|------|---------------|
| ビジネスロジック | 90%以上 |
| API Routes | 80%以上 |
| UIコンポーネント | 70%以上 |
| ユーティリティ関数 | 95%以上 |
| 全体 | 80%以上 |

---

## ユニットテスト

### 対象
- ビジネスロジック関数
- ユーティリティ関数
- Reactコンポーネント（ロジック部分）
- バリデーションスキーマ
- カスタムフック

### テストフレームワーク
- **Jest**: テストランナー
- **React Testing Library**: Reactコンポーネントテスト
- **@testing-library/jest-dom**: DOM assertion

### テストファイル配置
```
src/
├── lib/
│   ├── utils.ts
│   └── utils.test.ts
├── services/
│   ├── task.service.ts
│   └── task.service.test.ts
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   └── button.test.tsx
└── hooks/
    ├── use-tasks.ts
    └── use-tasks.test.ts
```

### ユニットテスト例

#### ユーティリティ関数のテスト

```typescript
// lib/utils.test.ts
import { formatDate, isValidEmail } from './utils'

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2025-01-15')
    expect(formatDate(date)).toBe('2025-01-15')
  })

  it('should handle invalid date', () => {
    expect(formatDate(null)).toBe('-')
  })
})

describe('isValidEmail', () => {
  it('should return true for valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
  })

  it('should return false for invalid email', () => {
    expect(isValidEmail('invalid-email')).toBe(false)
  })
})
```

#### Reactコンポーネントのテスト

```typescript
// components/ui/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByText('Click me')).toBeDisabled()
  })

  it('should show loading state', () => {
    render(<Button loading>Click me</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })
})
```

#### カスタムフックのテスト

```typescript
// hooks/use-tasks.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useTasks } from './use-tasks'

// SWRのモック
jest.mock('swr', () => ({
  default: jest.fn(),
}))

describe('useTasks', () => {
  it('should return tasks data', async () => {
    const mockData = {
      data: {
        items: [
          { id: '1', title: 'Task 1' },
          { id: '2', title: 'Task 2' },
        ],
      },
    }

    require('swr').default.mockReturnValue({
      data: mockData,
      error: null,
    })

    const { result } = renderHook(() => useTasks('project-1'))

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(2)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should handle error state', async () => {
    require('swr').default.mockReturnValue({
      data: null,
      error: new Error('Failed to fetch'),
    })

    const { result } = renderHook(() => useTasks('project-1'))

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
```

#### サービス層のテスト

```typescript
// services/task.service.test.ts
import { createTask, updateTaskStatus } from './task.service'
import { prisma } from '@/lib/prisma'

// Prismaのモック
jest.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))

describe('TaskService', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const mockTask = {
        id: '1',
        title: 'New Task',
        status: 'TODO',
        project_id: 'project-1',
      }

      ;(prisma.task.create as jest.Mock).mockResolvedValue(mockTask)

      const result = await createTask({
        title: 'New Task',
        project_id: 'project-1',
        reporter_id: 'user-1',
      })

      expect(result).toEqual(mockTask)
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'New Task',
          project_id: 'project-1',
        }),
      })
    })

    it('should throw error if title is missing', async () => {
      await expect(
        createTask({ title: '', project_id: 'project-1', reporter_id: 'user-1' })
      ).rejects.toThrow()
    })
  })

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      const mockTask = { id: '1', status: 'IN_PROGRESS' }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue({ id: '1', status: 'TODO' })
      ;(prisma.task.update as jest.Mock).mockResolvedValue(mockTask)

      const result = await updateTaskStatus('1', 'IN_PROGRESS')

      expect(result.status).toBe('IN_PROGRESS')
    })
  })
})
```

---

## 統合テスト

### 対象
- API Routesとデータベースの連携
- 複数のサービス層の連携
- 認証・認可フロー
- 外部サービス連携（S3など）

### テストフレームワーク
- **Jest**: テストランナー
- **Supertest**: HTTPリクエストテスト
- **テスト用DB**: Docker上のMySQLまたはSQLite

### 統合テスト例

#### API Routeのテスト

```typescript
// tests/integration/api/tasks.test.ts
import { createMocks } from 'node-mocks-http'
import { POST, GET } from '@/app/api/projects/[projectId]/tasks/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

jest.mock('next-auth')

describe('Tasks API', () => {
  let userId: string
  let projectId: string

  beforeAll(async () => {
    // テストデータ作成
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    })
    userId = user.id

    const project = await prisma.project.create({
      data: {
        name: 'Test Project',
        key: 'TEST',
        owner_id: userId,
      },
    })
    projectId = project.id

    await prisma.projectMember.create({
      data: {
        project_id: projectId,
        user_id: userId,
        role: 'ADMIN',
      },
    })
  })

  afterAll(async () => {
    await prisma.task.deleteMany()
    await prisma.projectMember.deleteMany()
    await prisma.project.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('POST /api/projects/:projectId/tasks', () => {
    it('should create a task', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: { id: userId },
      })

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          title: 'New Task',
          status: 'TODO',
          priority: 'MEDIUM',
        },
      })

      await POST(req, { params: { projectId } })

      expect(res._getStatusCode()).toBe(201)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(true)
      expect(data.data.title).toBe('New Task')
    })

    it('should return 401 if not authenticated', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const { req, res } = createMocks({
        method: 'POST',
        body: { title: 'New Task' },
      })

      await POST(req, { params: { projectId } })

      expect(res._getStatusCode()).toBe(401)
    })

    it('should return 403 if user is not project member', async () => {
      const otherUser = await prisma.user.create({
        data: { email: 'other@example.com', name: 'Other User' },
      })

      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: { id: otherUser.id },
      })

      const { req, res } = createMocks({
        method: 'POST',
        body: { title: 'New Task' },
      })

      await POST(req, { params: { projectId } })

      expect(res._getStatusCode()).toBe(403)
    })
  })

  describe('GET /api/projects/:projectId/tasks', () => {
    it('should return tasks list', async () => {
      // タスク作成
      await prisma.task.createMany({
        data: [
          {
            title: 'Task 1',
            status: 'TODO',
            priority: 'HIGH',
            project_id: projectId,
            reporter_id: userId,
          },
          {
            title: 'Task 2',
            status: 'IN_PROGRESS',
            priority: 'MEDIUM',
            project_id: projectId,
            reporter_id: userId,
          },
        ],
      })

      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: { id: userId },
      })

      const { req, res } = createMocks({
        method: 'GET',
      })

      await GET(req, { params: { projectId } })

      expect(res._getStatusCode()).toBe(200)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(true)
      expect(data.data.items).toHaveLength(2)
    })
  })
})
```

#### 認証フローのテスト

```typescript
// tests/integration/auth.test.ts
describe('Authentication Flow', () => {
  it('should register and login user', async () => {
    // 1. ユーザー登録
    const registerRes = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@example.com',
        name: 'New User',
        password: 'SecurePass123!',
      }),
    })
    expect(registerRes.status).toBe(201)

    // 2. ログイン
    const loginRes = await fetch('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
      }),
    })
    expect(loginRes.status).toBe(200)

    // 3. 認証済みエンドポイントにアクセス
    const meRes = await fetch('/api/users/me', {
      headers: {
        Cookie: loginRes.headers.get('set-cookie'),
      },
    })
    expect(meRes.status).toBe(200)
    const userData = await meRes.json()
    expect(userData.data.email).toBe('newuser@example.com')
  })
})
```

---

## E2Eテスト

### 対象
- 重要なユーザーフロー
- クリティカルな機能
- クロスブラウザ動作確認

### テストフレームワーク
- **Playwright**: E2Eテストフレームワーク
- **対応ブラウザ**: Chrome, Firefox, Safari

### E2Eテスト例

#### ユーザー登録〜タスク作成フロー

```typescript
// tests/e2e/task-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Task Management Flow', () => {
  test('should complete full task management flow', async ({ page }) => {
    // 1. ユーザー登録
    await page.goto('/register')
    await page.fill('input[name="email"]', 'testuser@example.com')
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    // ダッシュボードにリダイレクト
    await expect(page).toHaveURL('/dashboard')

    // 2. プロジェクト作成
    await page.click('text=新規プロジェクト')
    await page.fill('input[name="name"]', 'Test Project')
    await page.fill('input[name="key"]', 'TEST')
    await page.click('button:has-text("作成")')

    // プロジェクト詳細ページに遷移
    await expect(page).toHaveURL(/\/projects\/.*/)
    await expect(page.locator('h1')).toContainText('Test Project')

    // 3. タスク作成
    await page.click('text=タスクを作成')
    await page.fill('input[name="title"]', 'First Task')
    await page.fill('textarea[name="description"]', 'This is a test task')
    await page.selectOption('select[name="priority"]', 'HIGH')
    await page.click('button:has-text("作成")')

    // タスクが表示される
    await expect(page.locator('text=First Task')).toBeVisible()

    // 4. タスクステータス更新
    await page.click('text=First Task')
    await page.selectOption('select[name="status"]', 'IN_PROGRESS')

    // ステータスが更新される
    await expect(page.locator('[data-status="IN_PROGRESS"]')).toBeVisible()

    // 5. コメント追加
    await page.fill('textarea[name="comment"]', 'Working on this task')
    await page.click('button:has-text("コメント")')

    await expect(page.locator('text=Working on this task')).toBeVisible()

    // 6. タスク完了
    await page.selectOption('select[name="status"]', 'DONE')
    await expect(page.locator('[data-status="DONE"]')).toBeVisible()
  })

  test('should handle validation errors', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'testuser@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.goto('/projects/new')

    // タイトルなしで作成しようとする
    await page.click('button:has-text("作成")')

    // エラーメッセージが表示される
    await expect(page.locator('text=必須項目です')).toBeVisible()
  })
})
```

#### レスポンシブデザインのテスト

```typescript
// tests/e2e/responsive.spec.ts
import { test, expect, devices } from '@playwright/test'

test.describe('Responsive Design', () => {
  test('should work on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    })
    const page = await context.newPage()

    await page.goto('/dashboard')

    // モバイルメニューが表示される
    await expect(page.locator('[aria-label="メニュー"]')).toBeVisible()

    // メニューを開く
    await page.click('[aria-label="メニュー"]')
    await expect(page.locator('nav')).toBeVisible()
  })

  test('should work on tablet', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad Pro'],
    })
    const page = await context.newPage()

    await page.goto('/dashboard')

    // タブレットレイアウトが適用される
    await expect(page.locator('.sidebar')).toBeVisible()
  })
})
```

---

## パフォーマンステスト

### 対象
- ページロード時間
- APIレスポンス時間
- 大量データの表示

### テストツール
- **Lighthouse CI**: パフォーマンススコア測定
- **k6**: 負荷テスト

### Lighthouse CI設定

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/projects',
      ],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

### 負荷テスト

```javascript
// tests/performance/load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // 20ユーザーまで増加
    { duration: '1m', target: 50 },   // 50ユーザーまで増加
    { duration: '30s', target: 0 },   // 0まで減少
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95%のリクエストが500ms以下
    http_req_failed: ['rate<0.01'],    // エラー率1%以下
  },
}

export default function () {
  // ログイン
  const loginRes = http.post('http://localhost:3000/api/auth/signin', {
    email: 'test@example.com',
    password: 'password123',
  })

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  })

  // タスク一覧取得
  const tasksRes = http.get('http://localhost:3000/api/tasks', {
    cookies: loginRes.cookies,
  })

  check(tasksRes, {
    'tasks loaded': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  })

  sleep(1)
}
```

---

## アクセシビリティテスト

### テストツール
- **axe-core**: アクセシビリティルール検証
- **jest-axe**: Jestとの統合

### アクセシビリティテスト例

```typescript
// tests/accessibility/pages.test.ts
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import DashboardPage from '@/app/dashboard/page'

expect.extend(toHaveNoViolations)

describe('Accessibility', () => {
  it('Dashboard should have no accessibility violations', async () => {
    const { container } = render(<DashboardPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Task form should be keyboard accessible', async () => {
    const { container } = render(<CreateTaskForm />)

    // キーボードナビゲーション
    const firstInput = container.querySelector('input')
    firstInput?.focus()
    expect(document.activeElement).toBe(firstInput)
  })
})
```

---

## CI/CDパイプライン統合

### GitHub Actions設定

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3

  integration-test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: test
        ports:
          - 3306:3306
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run build
      - run: npm run test:e2e

  performance-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm start &
      - run: npx lhci autorun
```

---

## テスト実行コマンド

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern='\\.test\\.(ts|tsx)$'",
    "test:integration": "jest --testPathPattern='tests/integration'",
    "test:e2e": "playwright test",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:performance": "k6 run tests/performance/load-test.js"
  }
}
```

---

## テストデータ管理

### Fixtureの使用

```typescript
// tests/fixtures/users.ts
export const testUsers = {
  admin: {
    email: 'admin@example.com',
    name: 'Admin User',
    password: 'AdminPass123!',
  },
  member: {
    email: 'member@example.com',
    name: 'Member User',
    password: 'MemberPass123!',
  },
}

export const testProjects = {
  project1: {
    name: 'Test Project 1',
    key: 'TEST1',
  },
}
```

### ファクトリーパターン

```typescript
// tests/factories/task.factory.ts
import { faker } from '@faker-js/faker'

export function createTaskData(overrides = {}) {
  return {
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    status: 'TODO',
    priority: 'MEDIUM',
    ...overrides,
  }
}
```

---

## テストベストプラクティス

### DOs
- ✅ テストは独立させる（他のテストに依存しない）
- ✅ テストは決定的にする（同じ結果を返す）
- ✅ わかりやすいテスト名を付ける
- ✅ AAA（Arrange, Act, Assert）パターンを使う
- ✅ エッジケースをテストする
- ✅ モックは最小限にする

### DON'Ts
- ❌ 実装の詳細をテストしない
- ❌ 複数のことを1つのテストでテストしない
- ❌ テストをスキップしない
- ❌ 過度にモックしない
- ❌ フレイキーテスト（不安定なテスト）を放置しない

---

**関連ドキュメント**
- [API設計書](./api-design.md)
- [アーキテクチャ設計書](./architecture.md)
- [フロントエンド設計書](./frontend-design.md)
