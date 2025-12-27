# Markdown Editor

リアルタイムプレビュー機能を備えたMarkdownエディタです。

## 機能

- **分割表示エディタ**: 左側でMarkdownを編集、右側でリアルタイムプレビュー
- **シンタックスハイライト**: コードブロックのシンタックスハイライト対応
- **ファイル管理**: 複数ドキュメントの作成・編集・削除
- **データ同期**: LocalStorage + サーバー（SQLite）への自動保存
- **エクスポート**: HTML/PDF形式でのエクスポート

## 技術スタック

### Backend
- Python 3.12+
- FastAPI
- SQLAlchemy + SQLite
- WeasyPrint（PDFエクスポート、オプション）

### Frontend
- React 19 + TypeScript
- Vite 7
- CodeMirror 6（エディタ）
- react-markdown + remark-gfm（プレビュー）
- Tailwind CSS 4
- Zustand（状態管理）

## ディレクトリ構成

```
.
├── backend/
│   └── app/
│       ├── main.py           # FastAPIエントリーポイント
│       ├── database.py       # DB接続設定
│       ├── models.py         # SQLAlchemyモデル
│       ├── schemas.py        # Pydanticスキーマ
│       ├── routers/
│       │   └── documents.py  # ドキュメントCRUD API
│       └── services/
│           └── export.py     # エクスポート機能
├── frontend/
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── components/       # Reactコンポーネント
│       ├── stores/           # Zustand store
│       ├── api/              # APIクライアント
│       ├── hooks/            # カスタムフック
│       └── types/            # 型定義
├── package.json              # Node.js依存関係（Volta管理）
├── pyproject.toml            # Python依存関係（uv管理）
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## セットアップ

### 前提条件

- [Volta](https://volta.sh/)（Node.jsバージョン管理）
- [uv](https://docs.astral.sh/uv/)（Pythonパッケージ管理）

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd claude-code-sandbox

# 全依存関係のインストール
make install

# PDFエクスポート機能を使用する場合（オプション）
uv sync --extra pdf
```

## 開発

```bash
# フロントエンド・バックエンド両方を起動
make dev

# フロントエンドのみ起動
make frontend.dev

# バックエンドのみ起動
make backend.dev
```

ブラウザで http://localhost:5173 にアクセスしてください。
開発サーバーは `/api` へのリクエストを自動的にバックエンド（port 8000）にプロキシします。

## Makeコマンド一覧

### 共通コマンド

| コマンド | 説明 |
|---------|------|
| `make install` | 全依存関係をインストール |
| `make dev` | フロントエンド・バックエンド両方を起動 |
| `make build` | プロダクションビルド |
| `make lint` | 全リンター実行 |
| `make format` | コードフォーマット |
| `make typecheck` | 型チェック実行 |
| `make test` | テスト実行 |
| `make check` | lint, typecheck, test を一括実行 |
| `make clean` | ビルド成果物を削除 |
| `make ci` | CIパイプライン実行 |

### フロントエンドコマンド (`make frontend.xxx`)

| コマンド | 説明 |
|---------|------|
| `make frontend.install` | フロントエンド依存関係をインストール |
| `make frontend.dev` | Vite開発サーバー起動 |
| `make frontend.build` | プロダクションビルド |
| `make frontend.lint` | ESLint実行 |
| `make frontend.typecheck` | TypeScript型チェック |
| `make frontend.preview` | ビルド結果のプレビュー |
| `make frontend.clean` | ビルド成果物を削除 |

### バックエンドコマンド (`make backend.xxx`)

| コマンド | 説明 |
|---------|------|
| `make backend.install` | バックエンド依存関係をインストール |
| `make backend.dev` | FastAPI開発サーバー起動 |
| `make backend.lint` | Ruffリンター実行 |
| `make backend.format` | Ruffフォーマット実行 |
| `make backend.typecheck` | mypy型チェック |
| `make backend.test` | pytest実行 |
| `make backend.test.cov` | カバレッジ付きテスト |
| `make backend.clean` | Python成果物を削除 |

### データベースコマンド (`make db.xxx`)

| コマンド | 説明 |
|---------|------|
| `make db.reset` | データベースをリセット |

## API エンドポイント

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/documents` | ドキュメント一覧取得 |
| GET | `/api/documents/{id}` | ドキュメント取得 |
| POST | `/api/documents` | ドキュメント作成 |
| PUT | `/api/documents/{id}` | ドキュメント更新 |
| DELETE | `/api/documents/{id}` | ドキュメント削除 |
| GET | `/api/documents/{id}/export?format=html` | HTMLエクスポート |
| GET | `/api/documents/{id}/export?format=pdf` | PDFエクスポート |
