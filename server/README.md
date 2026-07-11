# a2a-app-server

A2A(Agent2Agent)プロトコル準拠のエージェントサーバー。
カスタムエージェントを `src/app/agents/` に実装し、A2A の Web API として公開する。

## セットアップ・起動

```bash
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

## 動作確認

```bash
# Agent Card
curl http://localhost:8000/.well-known/agent-card.json

# メッセージ送信(echo)
curl -X POST http://localhost:8000/a2a \
  -H 'Content-Type: application/json' \
  -H 'A2A-Version: 1.0' \
  -d '{"jsonrpc":"2.0","id":1,"method":"SendMessage","params":{"message":{"messageId":"m1","role":"ROLE_USER","parts":[{"text":"hello"}]}}}'
```

## テスト・Lint

```bash
uv run pytest
uv run ruff check . && uv run ruff format --check .
```

## 構成

- `src/app/agents/` — カスタムエージェント(A2A 非依存。ここを育てる)
- `src/app/a2a/` — A2A プロトコル層(アダプタ・Agent Card 生成。原則触らない)
- `src/app/api/` — 運用用 REST(`/api/health`)
- `src/app/main.py` — FastAPI エントリポイント

新しいエージェントを追加するには、`agents/base.py` の `Agent` Protocol を満たす
クラスを `agents/` に追加し、`main.py` で差し替える(実装例: `agents/echo.py`)。
