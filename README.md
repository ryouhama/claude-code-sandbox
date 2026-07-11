# claude-code-sandbox

Claude Code を試すためのサンドボックスリポジトリ。

コード・設定・プロンプトなどを自由に試すための実験場です。壊しても問題ありません。

## 使い方

このディレクトリで Claude Code を起動して、気軽に試してください。

```sh
claude
```

## 構成

- `.claude/settings.json` — このリポジトリ用の Claude Code 設定
- `.gitignore` — 一般的な無視ルール
- `server/` — A2A(Agent2Agent)エージェントサーバー(Python / uv / FastAPI)
- `frontend/` — ローカル動作確認用フロント(pnpm / Vite / React)

## A2A アプリケーション

カスタムエージェントを `server/src/app/agents/` に実装し、A2A プロトコルの
Web API として外部アプリへ公開する。詳細は `server/README.md` を参照。

```sh
# バックエンド (:8000)
cd server && uv sync && uv run uvicorn app.main:app --reload --port 8000

# フロントエンド (:5173、/a2a は :8000 へ proxy)
cd frontend && pnpm install && pnpm dev
```
