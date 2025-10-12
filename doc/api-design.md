# API設計書

## 概要

本アプリケーションは、Next.js API RoutesまたはServer Actionsを使用してRESTful APIを提供します。

### API設計原則

- **RESTful**: リソース指向の設計
- **型安全**: Zodによるバリデーション
- **統一的なレスポンス形式**: 成功・エラーレスポンスの標準化
- **適切なHTTPステータスコード**: セマンティックなステータスコード使用
- **ページネーション**: 大量データの効率的な取得
- **認証・認可**: すべてのエンドポイントで適切な権限チェック

---

## 共通仕様

### ベースURL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### 認証

すべての認証が必要なエンドポイントは、NextAuth.jsセッションを使用します。

**ヘッダー:**
```
Cookie: next-auth.session-token=<token>
```

### レスポンス形式

#### 成功レスポンス
```json
{
  "success": true,
  "data": { ... }
}
```

#### エラーレスポンス
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

### HTTPステータスコード

| コード | 意味 | 使用例 |
|-------|------|--------|
| 200 | OK | リクエスト成功 |
| 201 | Created | リソース作成成功 |
| 204 | No Content | 削除成功 |
| 400 | Bad Request | バリデーションエラー |
| 401 | Unauthorized | 認証エラー |
| 403 | Forbidden | 権限不足 |
| 404 | Not Found | リソースが存在しない |
| 409 | Conflict | リソースの競合 |
| 500 | Internal Server Error | サーバーエラー |

### ページネーション

リスト取得APIは以下のクエリパラメータをサポート：

```
?page=1&limit=20&sort=created_at&order=desc
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## エンドポイント一覧

### 認証 (Auth)

#### POST /api/auth/register
ユーザー登録

**リクエスト:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123!"
}
```

**レスポンス (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2025-01-01T00:00:00Z"
    }
  }
}
```

---

### ユーザー (Users)

#### GET /api/users/me
現在のユーザー情報取得

**認証**: 必須

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://...",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### PATCH /api/users/me
現在のユーザー情報更新

**認証**: 必須

**リクエスト:**
```json
{
  "name": "John Updated",
  "avatar_url": "https://..."
}
```

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Updated",
    "avatar_url": "https://...",
    "updated_at": "2025-01-02T00:00:00Z"
  }
}
```

---

### 組織 (Organizations)

#### GET /api/organizations
所属組織一覧取得

**認証**: 必須

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "organizations": [
      {
        "id": "uuid",
        "name": "Acme Corp",
        "slug": "acme-corp",
        "role": "ADMIN",
        "member_count": 15,
        "created_at": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### POST /api/organizations
組織作成

**認証**: 必須

**リクエスト:**
```json
{
  "name": "Acme Corp",
  "slug": "acme-corp"
}
```

**レスポンス (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "owner_id": "uuid",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### GET /api/organizations/:orgId
組織詳細取得

**認証**: 必須
**権限**: 組織メンバー

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "owner_id": "uuid",
    "member_count": 15,
    "project_count": 5,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### PATCH /api/organizations/:orgId
組織情報更新

**認証**: 必須
**権限**: OWNER, ADMIN

**リクエスト:**
```json
{
  "name": "Acme Corporation"
}
```

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Acme Corporation",
    "slug": "acme-corp",
    "updated_at": "2025-01-02T00:00:00Z"
  }
}
```

#### DELETE /api/organizations/:orgId
組織削除

**認証**: 必須
**権限**: OWNER

**レスポンス (204):**
```
No Content
```

---

### 組織メンバー (Organization Members)

#### GET /api/organizations/:orgId/members
組織メンバー一覧取得

**認証**: 必須
**権限**: 組織メンバー

**クエリパラメータ:**
- `page`: ページ番号（デフォルト: 1）
- `limit`: 1ページあたりの件数（デフォルト: 20）

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar_url": "https://..."
        },
        "role": "ADMIN",
        "joined_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

#### POST /api/organizations/:orgId/members
メンバー招待

**認証**: 必須
**権限**: OWNER, ADMIN

**リクエスト:**
```json
{
  "email": "newmember@example.com",
  "role": "MEMBER"
}
```

**レスポンス (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "organization_id": "uuid",
    "role": "MEMBER",
    "joined_at": "2025-01-01T00:00:00Z"
  }
}
```

#### PATCH /api/organizations/:orgId/members/:memberId
メンバーロール更新

**認証**: 必須
**権限**: OWNER, ADMIN

**リクエスト:**
```json
{
  "role": "ADMIN"
}
```

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "role": "ADMIN",
    "updated_at": "2025-01-02T00:00:00Z"
  }
}
```

#### DELETE /api/organizations/:orgId/members/:memberId
メンバー削除

**認証**: 必須
**権限**: OWNER, ADMIN

**レスポンス (204):**
```
No Content
```

---

### プロジェクト (Projects)

#### GET /api/projects
プロジェクト一覧取得

**認証**: 必須

**クエリパラメータ:**
- `organization_id`: 組織IDでフィルタ（オプション）
- `page`: ページ番号
- `limit`: 1ページあたりの件数

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Project Alpha",
        "key": "ALPHA",
        "description": "Project description",
        "organization": {
          "id": "uuid",
          "name": "Acme Corp"
        },
        "task_count": 25,
        "member_count": 5,
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

#### POST /api/projects
プロジェクト作成

**認証**: 必須

**リクエスト:**
```json
{
  "name": "Project Alpha",
  "key": "ALPHA",
  "description": "Project description",
  "organization_id": "uuid"
}
```

**レスポンス (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Project Alpha",
    "key": "ALPHA",
    "description": "Project description",
    "owner_id": "uuid",
    "organization_id": "uuid",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### GET /api/projects/:projectId
プロジェクト詳細取得

**認証**: 必須
**権限**: プロジェクトメンバー

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Project Alpha",
    "key": "ALPHA",
    "description": "Project description",
    "owner": {
      "id": "uuid",
      "name": "John Doe"
    },
    "organization": {
      "id": "uuid",
      "name": "Acme Corp"
    },
    "task_count": 25,
    "member_count": 5,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-02T00:00:00Z"
  }
}
```

#### PATCH /api/projects/:projectId
プロジェクト更新

**認証**: 必須
**権限**: ADMIN

**リクエスト:**
```json
{
  "name": "Project Alpha Updated",
  "description": "Updated description"
}
```

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Project Alpha Updated",
    "key": "ALPHA",
    "description": "Updated description",
    "updated_at": "2025-01-02T00:00:00Z"
  }
}
```

#### DELETE /api/projects/:projectId
プロジェクト削除

**認証**: 必須
**権限**: ADMIN

**レスポンス (204):**
```
No Content
```

---

### プロジェクトメンバー (Project Members)

#### GET /api/projects/:projectId/members
プロジェクトメンバー一覧取得

**認証**: 必須
**権限**: プロジェクトメンバー

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar_url": "https://..."
        },
        "role": "DEVELOPER",
        "joined_at": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### POST /api/projects/:projectId/members
メンバー追加

**認証**: 必須
**権限**: ADMIN

**リクエスト:**
```json
{
  "user_id": "uuid",
  "role": "DEVELOPER"
}
```

**レスポンス (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "project_id": "uuid",
    "user_id": "uuid",
    "role": "DEVELOPER",
    "joined_at": "2025-01-01T00:00:00Z"
  }
}
```

---

### タスク (Tasks)

#### GET /api/projects/:projectId/tasks
タスク一覧取得

**認証**: 必須
**権限**: プロジェクトメンバー

**クエリパラメータ:**
- `status`: ステータスでフィルタ（TODO, IN_PROGRESS, IN_REVIEW, DONE）
- `priority`: 優先度でフィルタ（LOW, MEDIUM, HIGH, URGENT）
- `assignee_id`: 担当者IDでフィルタ
- `page`: ページ番号
- `limit`: 1ページあたりの件数

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Implement login feature",
        "description": "Task description",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "assignee": {
          "id": "uuid",
          "name": "John Doe",
          "avatar_url": "https://..."
        },
        "reporter": {
          "id": "uuid",
          "name": "Jane Smith"
        },
        "due_date": "2025-01-15",
        "comment_count": 3,
        "attachment_count": 2,
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-02T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

#### POST /api/projects/:projectId/tasks
タスク作成

**認証**: 必須
**権限**: ADMIN, DEVELOPER

**リクエスト:**
```json
{
  "title": "Implement login feature",
  "description": "Detailed description",
  "status": "TODO",
  "priority": "HIGH",
  "assignee_id": "uuid",
  "due_date": "2025-01-15"
}
```

**レスポンス (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Implement login feature",
    "description": "Detailed description",
    "status": "TODO",
    "priority": "HIGH",
    "project_id": "uuid",
    "assignee_id": "uuid",
    "reporter_id": "uuid",
    "due_date": "2025-01-15",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### GET /api/tasks/:taskId
タスク詳細取得

**認証**: 必須
**権限**: プロジェクトメンバー

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Implement login feature",
    "description": "Detailed description",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "project": {
      "id": "uuid",
      "name": "Project Alpha",
      "key": "ALPHA"
    },
    "assignee": {
      "id": "uuid",
      "name": "John Doe",
      "avatar_url": "https://..."
    },
    "reporter": {
      "id": "uuid",
      "name": "Jane Smith"
    },
    "due_date": "2025-01-15",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-02T00:00:00Z"
  }
}
```

#### PATCH /api/tasks/:taskId
タスク更新

**認証**: 必須
**権限**: ADMIN, DEVELOPER, または担当者

**リクエスト:**
```json
{
  "title": "Updated title",
  "status": "IN_REVIEW",
  "priority": "URGENT",
  "assignee_id": "uuid",
  "due_date": "2025-01-20"
}
```

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated title",
    "status": "IN_REVIEW",
    "priority": "URGENT",
    "updated_at": "2025-01-02T00:00:00Z"
  }
}
```

#### DELETE /api/tasks/:taskId
タスク削除

**認証**: 必須
**権限**: ADMIN, または作成者

**レスポンス (204):**
```
No Content
```

---

### コメント (Comments)

#### GET /api/tasks/:taskId/comments
コメント一覧取得

**認証**: 必須
**権限**: プロジェクトメンバー

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "content": "This is a comment",
        "user": {
          "id": "uuid",
          "name": "John Doe",
          "avatar_url": "https://..."
        },
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### POST /api/tasks/:taskId/comments
コメント作成

**認証**: 必須
**権限**: プロジェクトメンバー

**リクエスト:**
```json
{
  "content": "This is a comment"
}
```

**レスポンス (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "task_id": "uuid",
    "user_id": "uuid",
    "content": "This is a comment",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### PATCH /api/comments/:commentId
コメント更新

**認証**: 必須
**権限**: コメント作成者

**リクエスト:**
```json
{
  "content": "Updated comment"
}
```

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "Updated comment",
    "updated_at": "2025-01-02T00:00:00Z"
  }
}
```

#### DELETE /api/comments/:commentId
コメント削除

**認証**: 必須
**権限**: コメント作成者、またはプロジェクトADMIN

**レスポンス (204):**
```
No Content
```

---

### 添付ファイル (Attachments)

#### GET /api/tasks/:taskId/attachments
添付ファイル一覧取得

**認証**: 必須
**権限**: プロジェクトメンバー

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "file_name": "screenshot.png",
        "file_url": "https://...",
        "file_size": 102400,
        "mime_type": "image/png",
        "user": {
          "id": "uuid",
          "name": "John Doe"
        },
        "uploaded_at": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### POST /api/tasks/:taskId/attachments
ファイルアップロード

**認証**: 必須
**権限**: プロジェクトメンバー

**リクエスト:**
```
Content-Type: multipart/form-data

file: [binary data]
```

**レスポンス (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "task_id": "uuid",
    "file_name": "screenshot.png",
    "file_url": "https://...",
    "file_size": 102400,
    "mime_type": "image/png",
    "uploaded_at": "2025-01-01T00:00:00Z"
  }
}
```

#### DELETE /api/attachments/:attachmentId
添付ファイル削除

**認証**: 必須
**権限**: アップロード者、またはプロジェクトADMIN

**レスポンス (204):**
```
No Content
```

---

## エラーコード一覧

| コード | 説明 |
|-------|------|
| `VALIDATION_ERROR` | バリデーションエラー |
| `AUTHENTICATION_REQUIRED` | 認証が必要 |
| `INVALID_CREDENTIALS` | 認証情報が無効 |
| `PERMISSION_DENIED` | 権限不足 |
| `RESOURCE_NOT_FOUND` | リソースが見つからない |
| `RESOURCE_ALREADY_EXISTS` | リソースが既に存在 |
| `DUPLICATE_KEY` | キーの重複 |
| `INVALID_OPERATION` | 無効な操作 |
| `INTERNAL_SERVER_ERROR` | サーバーエラー |

---

## レート制限

APIリクエストには以下のレート制限があります：

- **認証済みユーザー**: 1000リクエスト/時間
- **未認証**: 100リクエスト/時間

レート制限に達した場合、`429 Too Many Requests`が返されます。

---

**関連ドキュメント**
- [データベース設計書](./database-design.md)
- [アーキテクチャ設計書](./architecture.md)
- [セキュリティ設計書](./security-design.md)
