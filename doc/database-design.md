# データベース設計書

## ER図

```
┌─────────────────┐         ┌──────────────────┐
│  User           │         │  Organization    │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │         │ id (PK)          │
│ email           │         │ name             │
│ name            │◄────┐   │ slug             │
│ password_hash   │     │   │ owner_id (FK)    │
│ avatar_url      │     │   │ created_at       │
│ created_at      │     │   │ updated_at       │
│ updated_at      │     │   └──────────────────┘
└─────────────────┘     │            │
         │              │            │
         │              │            │ 1:N
         │              │            ▼
         │              │   ┌──────────────────────┐
         │              └───┤ OrganizationMember   │
         │ 1:N              ├──────────────────────┤
         │                  │ id (PK)              │
         ▼                  │ organization_id (FK) │
┌─────────────────┐         │ user_id (FK)         │
│  Project        │         │ role (ENUM)          │
├─────────────────┤         │ joined_at            │
│ id (PK)         │         └──────────────────────┘
│ name            │
│ key             │         ┌──────────────────────┐
│ description     │         │ ProjectMember        │
│ owner_id (FK)   │────┐    ├──────────────────────┤
│ org_id (FK)     │    │    │ id (PK)              │
│ created_at      │    └───►│ project_id (FK)      │
│ updated_at      │         │ user_id (FK)         │
└─────────────────┘         │ role (ENUM)          │
         │                  │ joined_at            │
         │ 1:N              └──────────────────────┘
         ▼
┌─────────────────┐
│  Task           │         ┌──────────────────────┐
├─────────────────┤         │ Comment              │
│ id (PK)         │         ├──────────────────────┤
│ title           │◄────┐   │ id (PK)              │
│ description     │     │   │ task_id (FK)         │
│ status (ENUM)   │     └───│ user_id (FK)         │
│ priority (ENUM) │         │ content              │
│ project_id (FK) │         │ created_at           │
│ assignee_id(FK) │         │ updated_at           │
│ reporter_id(FK) │         └──────────────────────┘
│ due_date        │
│ created_at      │         ┌──────────────────────┐
│ updated_at      │◄────────┤ Attachment           │
└─────────────────┘         ├──────────────────────┤
                            │ id (PK)              │
                            │ task_id (FK)         │
                            │ user_id (FK)         │
                            │ file_name            │
                            │ file_url             │
                            │ file_size            │
                            │ mime_type            │
                            │ uploaded_at          │
                            └──────────────────────┘
```

## データモデル詳細

### 1. User（ユーザー）
ユーザーアカウント情報を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | VARCHAR(36) | PK, UUID | ユーザーID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | メールアドレス |
| name | VARCHAR(100) | NOT NULL | ユーザー名 |
| password_hash | VARCHAR(255) | NOT NULL | ハッシュ化されたパスワード |
| avatar_url | TEXT | NULL | プロフィール画像URL |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

**インデックス:**
- `idx_user_email` ON email
- `idx_user_created_at` ON created_at

---

### 2. Organization（組織）
組織情報を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | VARCHAR(36) | PK, UUID | 組織ID |
| name | VARCHAR(100) | NOT NULL | 組織名 |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL用スラッグ |
| owner_id | VARCHAR(36) | FK → User.id, NOT NULL | オーナーユーザーID |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

**インデックス:**
- `idx_org_slug` ON slug
- `idx_org_owner_id` ON owner_id

---

### 3. OrganizationMember（組織メンバー）
組織とユーザーの中間テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | VARCHAR(36) | PK, UUID | メンバーシップID |
| organization_id | VARCHAR(36) | FK → Organization.id, NOT NULL | 組織ID |
| user_id | VARCHAR(36) | FK → User.id, NOT NULL | ユーザーID |
| role | ENUM | NOT NULL | 役割（OWNER, ADMIN, MEMBER） |
| joined_at | TIMESTAMP | NOT NULL | 参加日時 |

**制約:**
- UNIQUE(organization_id, user_id) - 同じ組織に重複参加不可

**インデックス:**
- `idx_org_member_org_id` ON organization_id
- `idx_org_member_user_id` ON user_id

---

### 4. Project（プロジェクト）
プロジェクト情報を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | VARCHAR(36) | PK, UUID | プロジェクトID |
| name | VARCHAR(100) | NOT NULL | プロジェクト名 |
| key | VARCHAR(10) | NOT NULL | プロジェクトキー（例: PROJ） |
| description | TEXT | NULL | プロジェクト説明 |
| owner_id | VARCHAR(36) | FK → User.id, NOT NULL | オーナーユーザーID |
| organization_id | VARCHAR(36) | FK → Organization.id, NULL | 組織ID（個人プロジェクトの場合はNULL） |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

**制約:**
- UNIQUE(organization_id, key) - 組織内でキーは一意
- UNIQUE(owner_id, key) WHERE organization_id IS NULL - 個人プロジェクトでもキーは一意

**インデックス:**
- `idx_project_org_id` ON organization_id
- `idx_project_owner_id` ON owner_id
- `idx_project_key` ON key

---

### 5. ProjectMember（プロジェクトメンバー）
プロジェクトとユーザーの中間テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | VARCHAR(36) | PK, UUID | メンバーシップID |
| project_id | VARCHAR(36) | FK → Project.id, NOT NULL | プロジェクトID |
| user_id | VARCHAR(36) | FK → User.id, NOT NULL | ユーザーID |
| role | ENUM | NOT NULL | 役割（ADMIN, DEVELOPER, VIEWER） |
| joined_at | TIMESTAMP | NOT NULL | 参加日時 |

**制約:**
- UNIQUE(project_id, user_id) - 同じプロジェクトに重複参加不可

**インデックス:**
- `idx_project_member_project_id` ON project_id
- `idx_project_member_user_id` ON user_id

---

### 6. Task（タスク）
タスク情報を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | VARCHAR(36) | PK, UUID | タスクID |
| title | VARCHAR(255) | NOT NULL | タスクタイトル |
| description | TEXT | NULL | タスク詳細説明 |
| status | ENUM | NOT NULL | ステータス（TODO, IN_PROGRESS, IN_REVIEW, DONE） |
| priority | ENUM | NOT NULL | 優先度（LOW, MEDIUM, HIGH, URGENT） |
| project_id | VARCHAR(36) | FK → Project.id, NOT NULL | プロジェクトID |
| assignee_id | VARCHAR(36) | FK → User.id, NULL | 担当者ID |
| reporter_id | VARCHAR(36) | FK → User.id, NOT NULL | 報告者ID |
| due_date | DATE | NULL | 期限日 |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

**インデックス:**
- `idx_task_project_id` ON project_id
- `idx_task_assignee_id` ON assignee_id
- `idx_task_reporter_id` ON reporter_id
- `idx_task_status` ON status
- `idx_task_due_date` ON due_date

---

### 7. Comment（コメント）
タスクへのコメントを管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | VARCHAR(36) | PK, UUID | コメントID |
| task_id | VARCHAR(36) | FK → Task.id, NOT NULL | タスクID |
| user_id | VARCHAR(36) | FK → User.id, NOT NULL | コメント投稿者ID |
| content | TEXT | NOT NULL | コメント内容 |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

**インデックス:**
- `idx_comment_task_id` ON task_id
- `idx_comment_user_id` ON user_id
- `idx_comment_created_at` ON created_at

---

### 8. Attachment（添付ファイル）
タスクへの添付ファイルを管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | VARCHAR(36) | PK, UUID | 添付ファイルID |
| task_id | VARCHAR(36) | FK → Task.id, NOT NULL | タスクID |
| user_id | VARCHAR(36) | FK → User.id, NOT NULL | アップロード者ID |
| file_name | VARCHAR(255) | NOT NULL | ファイル名 |
| file_url | TEXT | NOT NULL | ファイルURL（S3等） |
| file_size | BIGINT | NOT NULL | ファイルサイズ（bytes） |
| mime_type | VARCHAR(100) | NOT NULL | MIMEタイプ |
| uploaded_at | TIMESTAMP | NOT NULL | アップロード日時 |

**インデックス:**
- `idx_attachment_task_id` ON task_id
- `idx_attachment_user_id` ON user_id

---

## ENUM型定義

### OrganizationRole
```sql
ENUM('OWNER', 'ADMIN', 'MEMBER')
```
- **OWNER**: 組織オーナー（最高権限）
- **ADMIN**: 管理者（メンバー管理可能）
- **MEMBER**: 一般メンバー

### ProjectRole
```sql
ENUM('ADMIN', 'DEVELOPER', 'VIEWER')
```
- **ADMIN**: プロジェクト管理者
- **DEVELOPER**: 開発者（タスク作成・編集可能）
- **VIEWER**: 閲覧者（読み取り専用）

### TaskStatus
```sql
ENUM('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE')
```
- **TODO**: 未着手
- **IN_PROGRESS**: 作業中
- **IN_REVIEW**: レビュー中
- **DONE**: 完了

### TaskPriority
```sql
ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT')
```
- **LOW**: 低優先度
- **MEDIUM**: 中優先度
- **HIGH**: 高優先度
- **URGENT**: 緊急

---

## データフロー

### 1. ユーザー登録フロー
```
User入力 → バリデーション → パスワードハッシュ化 → User テーブル挿入
```

### 2. 組織作成フロー
```
User入力 → Organization テーブル挿入 → OrganizationMember テーブル挿入（OWNER role）
```

### 3. プロジェクト作成フロー
```
User入力 → 権限チェック → Project テーブル挿入 → ProjectMember テーブル挿入（ADMIN role）
```

### 4. タスク作成フロー
```
User入力 → 権限チェック → Task テーブル挿入 → 担当者への通知
```

### 5. コメント投稿フロー
```
User入力 → 権限チェック → Comment テーブル挿入 → 関係者への通知
```

### 6. ファイル添付フロー
```
User入力 → ファイルアップロード（S3等） → Attachment テーブル挿入
```

---

## データ整合性ルール

### カスケード削除
- Organization削除 → OrganizationMember, Project（organization_id）を削除
- Project削除 → ProjectMember, Task を削除
- Task削除 → Comment, Attachment を削除
- User削除 → 関連データの処理方針を決定（削除 or 匿名化）

### 制約
- Taskのassignee_idは、そのTaskが属するProjectのメンバーである必要がある
- OrganizationのProject作成は、OrganizationMemberである必要がある
- ProjectMemberは、Organizationが紐づく場合、そのOrganizationMemberである必要がある

---

## パフォーマンス最適化

### インデックス戦略
- 検索頻度の高いカラムにインデックスを設定
- 外部キーには必ずインデックスを設定
- 複合インデックスの検討（例: organization_id + created_at）

### クエリ最適化
- N+1問題の回避（Prismaの`include`や`select`を活用）
- 必要なカラムのみ取得（SELECT *を避ける）
- ページネーション実装（大量データの取得を避ける）

### データベース設定
- コネクションプーリングの設定
- クエリキャッシュの活用
- スロークエリログの監視

---

**関連ドキュメント**
- [アーキテクチャ設計書](./architecture.md)
- [Prismaスキーマ実装](./prisma-schema.md)（未作成）
