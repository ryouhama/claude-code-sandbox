# フロントエンド設計書

## 概要

Next.js 14+ (App Router)を使用したモダンなフロントエンド設計。

### フロントエンド設計原則

- **コンポーネント指向**: 再利用可能なコンポーネント設計
- **型安全**: TypeScriptによる厳格な型定義
- **レスポンシブデザイン**: モバイルファーストのUI
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **パフォーマンス**: Core Web Vitals最適化
- **ユーザビリティ**: 直感的で使いやすいUI/UX

---

## ディレクトリ構造

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # 認証グループ
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/             # ダッシュボードグループ
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── organizations/
│   │   │   ├── page.tsx
│   │   │   ├── [orgId]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── members/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── [projectId]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── tasks/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── board/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── tasks/
│   │   │   ├── page.tsx
│   │   │   └── [taskId]/
│   │   │       └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/                     # API Routes
│   ├── layout.tsx               # ルートレイアウト
│   └── page.tsx                 # トップページ
├── components/
│   ├── ui/                      # 汎用UIコンポーネント
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── features/                # 機能別コンポーネント
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── auth-provider.tsx
│   │   ├── organizations/
│   │   │   ├── organization-list.tsx
│   │   │   ├── organization-card.tsx
│   │   │   ├── create-organization-dialog.tsx
│   │   │   ├── member-list.tsx
│   │   │   └── invite-member-dialog.tsx
│   │   ├── projects/
│   │   │   ├── project-list.tsx
│   │   │   ├── project-card.tsx
│   │   │   ├── create-project-dialog.tsx
│   │   │   └── project-header.tsx
│   │   ├── tasks/
│   │   │   ├── task-list.tsx
│   │   │   ├── task-card.tsx
│   │   │   ├── task-detail.tsx
│   │   │   ├── create-task-dialog.tsx
│   │   │   ├── task-status-badge.tsx
│   │   │   ├── task-priority-badge.tsx
│   │   │   └── task-board.tsx
│   │   └── comments/
│   │       ├── comment-list.tsx
│   │       ├── comment-item.tsx
│   │       └── comment-form.tsx
│   └── layouts/
│       ├── dashboard-layout.tsx
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── footer.tsx
├── hooks/                       # カスタムフック
│   ├── use-user.ts
│   ├── use-organizations.ts
│   ├── use-projects.ts
│   ├── use-tasks.ts
│   ├── use-comments.ts
│   └── use-toast.ts
├── lib/
│   ├── utils.ts                 # ユーティリティ関数
│   └── api-client.ts            # APIクライアント
├── types/
│   ├── user.ts
│   ├── organization.ts
│   ├── project.ts
│   └── task.ts
└── styles/
    └── globals.css
```

---

## ページ一覧

### 認証ページ

#### /login
ログインページ

**主要コンポーネント:**
- `LoginForm`: メール・パスワード入力フォーム
- GoogleやGitHub等のソーシャルログインボタン

**機能:**
- メール/パスワードログイン
- ソーシャルログイン（NextAuth.js）
- パスワードリセットリンク

#### /register
ユーザー登録ページ

**主要コンポーネント:**
- `RegisterForm`: 名前、メール、パスワード入力フォーム

**機能:**
- 新規ユーザー登録
- メールバリデーション
- パスワード強度チェック

---

### ダッシュボードページ

#### /dashboard
ダッシュボードトップページ

**主要コンポーネント:**
- `RecentTasks`: 最近のタスク一覧
- `MyTasks`: 自分にアサインされたタスク
- `ActivityFeed`: アクティビティフィード
- `QuickStats`: 統計情報（完了タスク数など）

**機能:**
- 概要の表示
- 最近のアクティビティ
- クイックアクセス

---

### 組織ページ

#### /organizations
組織一覧ページ

**主要コンポーネント:**
- `OrganizationList`: 所属組織のリスト
- `CreateOrganizationDialog`: 組織作成ダイアログ

**機能:**
- 所属組織の表示
- 組織作成
- 組織への移動

#### /organizations/[orgId]
組織詳細ページ

**主要コンポーネント:**
- `OrganizationHeader`: 組織名・情報
- `OrganizationStats`: 統計情報
- `ProjectList`: プロジェクト一覧
- `MemberList`: メンバー一覧

**機能:**
- 組織情報の表示
- プロジェクト一覧
- メンバー一覧

#### /organizations/[orgId]/members
組織メンバー管理ページ

**主要コンポーネント:**
- `MemberList`: メンバー一覧テーブル
- `InviteMemberDialog`: メンバー招待ダイアログ
- `MemberRoleDropdown`: ロール変更ドロップダウン

**機能:**
- メンバー一覧表示
- メンバー招待
- ロール変更
- メンバー削除

---

### プロジェクトページ

#### /projects
プロジェクト一覧ページ

**主要コンポーネント:**
- `ProjectList`: プロジェクトカード一覧
- `CreateProjectDialog`: プロジェクト作成ダイアログ
- `ProjectFilter`: フィルター（組織、ステータス）

**機能:**
- プロジェクト一覧表示
- プロジェクト作成
- フィルタリング・検索

#### /projects/[projectId]
プロジェクト詳細ページ

**主要コンポーネント:**
- `ProjectHeader`: プロジェクト名・キー
- `TaskList`: タスク一覧
- `CreateTaskDialog`: タスク作成ダイアログ
- `ProjectTabs`: タブナビゲーション（タスク、ボード、設定）

**機能:**
- プロジェクト情報表示
- タスク一覧（リスト形式）
- タスク作成
- フィルタリング・ソート

#### /projects/[projectId]/board
カンバンボードページ

**主要コンポーネント:**
- `TaskBoard`: ドラッグ&ドロップ対応カンバンボード
- `TaskCard`: タスクカード（ドラッグ可能）
- `BoardColumn`: ステータス列（TODO, IN_PROGRESS, IN_REVIEW, DONE）

**機能:**
- カンバンボード表示
- ドラッグ&ドロップでステータス変更
- タスククイック編集

#### /projects/[projectId]/settings
プロジェクト設定ページ

**主要コンポーネント:**
- `ProjectSettingsForm`: プロジェクト情報編集フォーム
- `ProjectMemberList`: メンバー管理
- `DangerZone`: 削除エリア

**機能:**
- プロジェクト情報編集
- メンバー管理
- プロジェクト削除

---

### タスクページ

#### /tasks
タスク一覧ページ（全プロジェクト）

**主要コンポーネント:**
- `TaskList`: タスク一覧テーブル
- `TaskFilter`: フィルター（ステータス、優先度、担当者）
- `TaskSort`: ソート（作成日、期限日）

**機能:**
- 全プロジェクトのタスク表示
- 高度なフィルタリング
- ソート機能

#### /tasks/[taskId]
タスク詳細ページ

**主要コンポーネント:**
- `TaskDetail`: タスク詳細情報
- `TaskEditForm`: タスク編集フォーム（インライン編集）
- `CommentList`: コメント一覧
- `CommentForm`: コメント投稿フォーム
- `AttachmentList`: 添付ファイル一覧
- `AttachmentUpload`: ファイルアップロード

**機能:**
- タスク詳細表示
- タスク編集（タイトル、説明、ステータス、優先度、担当者、期限）
- コメント投稿・表示
- ファイル添付・表示

---

### 設定ページ

#### /settings
ユーザー設定ページ

**主要コンポーネント:**
- `ProfileForm`: プロフィール編集フォーム
- `AvatarUpload`: プロフィール画像アップロード
- `PasswordChangeForm`: パスワード変更フォーム

**機能:**
- プロフィール編集
- パスワード変更
- アカウント削除

---

## コンポーネント設計

### UIコンポーネント（shadcn/ui ベース）

#### Button
汎用ボタンコンポーネント

**Props:**
```typescript
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}
```

#### Input
汎用入力フィールド

**Props:**
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}
```

#### Card
カードコンテナ

**Props:**
```typescript
interface CardProps {
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}
```

---

### 機能別コンポーネント

#### TaskCard
タスクカードコンポーネント

**Props:**
```typescript
interface TaskCardProps {
  task: {
    id: string
    title: string
    status: TaskStatus
    priority: TaskPriority
    assignee?: User
    due_date?: string
  }
  onClick?: () => void
  draggable?: boolean
}
```

**表示内容:**
- タスクタイトル
- ステータスバッジ
- 優先度バッジ
- 担当者アバター
- 期限日（期限が近い場合は強調表示）

#### TaskBoard
カンバンボードコンポーネント

**Props:**
```typescript
interface TaskBoardProps {
  tasks: Task[]
  onTaskMove: (taskId: string, newStatus: TaskStatus) => Promise<void>
  onTaskClick: (taskId: string) => void
}
```

**機能:**
- ドラッグ&ドロップでタスク移動
- ステータス列ごとにタスクを表示
- 楽観的UI更新

#### CommentList
コメントリストコンポーネント

**Props:**
```typescript
interface CommentListProps {
  taskId: string
  comments: Comment[]
  onCommentAdd: (content: string) => Promise<void>
  onCommentEdit: (commentId: string, content: string) => Promise<void>
  onCommentDelete: (commentId: string) => Promise<void>
}
```

---

## 状態管理

### ローカルステート
- React Hooks (useState, useReducer)による管理
- フォーム状態: React Hook Form

### サーバーステート
- SWR または TanStack Query によるデータフェッチ
- 楽観的UI更新
- キャッシング戦略

**例（SWR）:**
```typescript
// hooks/use-tasks.ts
export function useTasks(projectId: string) {
  const { data, error, mutate } = useSWR(
    `/api/projects/${projectId}/tasks`,
    fetcher
  )

  return {
    tasks: data?.data?.items ?? [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}
```

### グローバルステート（必要に応じて）
- Zustand によるシンプルなステート管理
- テーマ（ダーク/ライト）
- サイドバー開閉状態

---

## スタイリング

### Tailwind CSS
ユーティリティファーストのCSS

**例:**
```tsx
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click me
</button>
```

### CSS Modules（必要に応じて）
コンポーネント固有のスタイル

### Design Tokens
```typescript
// styles/tokens.ts
export const colors = {
  primary: '#3B82F6',
  secondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
}

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
}
```

---

## レスポンシブデザイン

### ブレークポイント
```
sm: 640px   (モバイル横向き)
md: 768px   (タブレット)
lg: 1024px  (ラップトップ)
xl: 1280px  (デスクトップ)
2xl: 1536px (大画面）
```

### モバイルファースト
```tsx
<div className="flex flex-col md:flex-row lg:gap-4">
  {/* モバイル: 縦並び、タブレット以上: 横並び */}
</div>
```

---

## アクセシビリティ

### 主要な対応
- **キーボードナビゲーション**: すべての操作をキーボードで実行可能
- **スクリーンリーダー対応**: 適切なARIA属性
- **カラーコントラスト**: WCAG AA基準（4.5:1以上）
- **フォーカス管理**: 視覚的なフォーカスインジケータ

**例:**
```tsx
<button
  aria-label="タスクを作成"
  aria-describedby="create-task-description"
>
  <PlusIcon />
</button>
```

---

## パフォーマンス最適化

### コード分割
```typescript
// 動的インポート
const TaskBoard = dynamic(() => import('@/components/features/tasks/task-board'), {
  loading: () => <Skeleton />,
  ssr: false,
})
```

### 画像最適化
```tsx
import Image from 'next/image'

<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={48}
  height={48}
  priority
/>
```

### メモ化
```typescript
const MemoizedTaskCard = memo(TaskCard, (prev, next) => {
  return prev.task.id === next.task.id &&
         prev.task.updated_at === next.task.updated_at
})
```

---

## フォームバリデーション

### React Hook Form + Zod
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1, '必須項目です').max(255),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  due_date: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

export function CreateTaskForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  })

  const onSubmit = async (data: TaskFormData) => {
    // API呼び出し
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      {/* ... */}
    </form>
  )
}
```

---

## 国際化（i18n）

将来的な多言語対応を考慮した設計

```typescript
// lib/i18n.ts
export const translations = {
  ja: {
    'task.create': 'タスクを作成',
    'task.edit': 'タスクを編集',
  },
  en: {
    'task.create': 'Create Task',
    'task.edit': 'Edit Task',
  },
}
```

---

**関連ドキュメント**
- [API設計書](./api-design.md)
- [アーキテクチャ設計書](./architecture.md)
- [データベース設計書](./database-design.md)
