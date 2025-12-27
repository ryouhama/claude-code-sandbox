# Backend - FastAPI

Markdown EditorのバックエンドAPIサーバー

## 技術スタック

- **フレームワーク**: FastAPI
- **データベース**: SQLite + SQLAlchemy 2.0
- **バリデーション**: Pydantic v2
- **Python**: 3.12以上

## ディレクトリ構成

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPIアプリケーション初期化、CORS設定
│   ├── models.py        # SQLAlchemyモデル定義
│   ├── schemas.py       # Pydanticスキーマ定義
│   ├── database.py      # DB接続設定、セッション管理
│   ├── routers/
│   │   └── documents.py # ドキュメントCRUD API
│   └── services/
│       └── export.py    # HTML/PDFエクスポート機能
└── tests/               # テストディレクトリ
```

## パッケージ管理

**uv** を使用してパッケージを管理しています。

### 依存関係のインストール

```bash
# 開発用依存関係を含めてインストール
make backend.install

# または直接uvを使用
uv pip install -e ".[dev]"
```

### パッケージの追加

```bash
# 本番依存関係の追加
uv pip install <package-name>

# pyproject.tomlに追記することを忘れずに
```

### 依存関係の種類

| 種類 | 説明 | インストール方法 |
|------|------|------------------|
| dependencies | 本番環境で必要 | `uv pip install -e .` |
| dev | 開発時のみ必要 | `uv pip install -e ".[dev]"` |
| pdf | PDFエクスポート機能 | `uv pip install -e ".[pdf]"` |

## 開発コマンド

```bash
# 開発サーバー起動 (ホットリロード有効)
make backend.dev

# リンター実行
make backend.lint

# フォーマット実行
make backend.format

# 型チェック
make backend.typecheck

# テスト実行
make backend.test

# カバレッジ付きテスト
make backend.test.cov
```

## API エンドポイント

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/` | ヘルスチェック |
| GET | `/api/documents` | ドキュメント一覧取得 |
| GET | `/api/documents/{id}` | ドキュメント取得 |
| POST | `/api/documents` | ドキュメント作成 |
| PUT | `/api/documents/{id}` | ドキュメント更新 |
| DELETE | `/api/documents/{id}` | ドキュメント削除 |
| GET | `/api/documents/{id}/export?format=html\|pdf` | エクスポート |

開発サーバー起動後、以下でAPIドキュメントを確認できます:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## コード品質

### Ruff (リンター・フォーマッター)

```bash
# チェックのみ
make backend.lint

# 自動修正 + フォーマット
make backend.format
```

**設定** (`pyproject.toml`):
- 行長: 100文字
- 有効ルール: E, W, F, I, N, UP, B, C4, SIM, RUF

### mypy (型チェック)

```bash
make backend.typecheck
```

**設定**: strictモード有効

## データベース

- **ファイル**: `markdown_editor.db` (プロジェクトルート)
- **テーブル**: `documents`

```sql
CREATE TABLE documents (
    id VARCHAR(36) PRIMARY KEY,  -- UUID
    title VARCHAR(255),
    content TEXT,
    created_at DATETIME,
    updated_at DATETIME
);
```

### データベースリセット

```bash
make db.reset
```

## アーキテクチャ

```
リクエスト
    ↓
main.py (FastAPIアプリ)
    ↓
routers/ (エンドポイント定義)
    ↓
services/ (ビジネスロジック)
    ↓
models.py + database.py (データアクセス)
    ↓
SQLite
```

### レイヤーの責務

| レイヤー | ファイル | 責務 |
|---------|---------|------|
| エントリポイント | `main.py` | アプリ初期化、ミドルウェア設定 |
| API | `routers/*.py` | HTTPリクエスト処理、レスポンス生成 |
| スキーマ | `schemas.py` | 入出力バリデーション |
| サービス | `services/*.py` | ビジネスロジック |
| モデル | `models.py` | データベーススキーマ定義 |
| DB | `database.py` | 接続管理、セッション提供 |

## 新機能追加のガイドライン

1. **モデル追加**: `models.py` に SQLAlchemy モデルを定義
2. **スキーマ追加**: `schemas.py` に Pydantic スキーマを定義
3. **ルーター追加**: `routers/` に新しいルーターファイルを作成
4. **ルーター登録**: `main.py` でルーターをインクルード
5. **テスト追加**: `tests/` にテストファイルを作成

### コーディング規約

- 型アノテーションを必ず記述する
- docstringを日本語で記述する
- FastAPIの依存性注入 (`Depends`) を活用する
- 1ファイル1責任の原則に従う
