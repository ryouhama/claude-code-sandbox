# A2A アプリのよく使う操作をまとめる。
# ルートから `make <target>` で server/ frontend/ をまたいで実行する。

.DEFAULT_GOAL := help

.PHONY: help setup dev-server dev-front test lint build check

help: ## このヘルプを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

setup: ## 依存をインストール(server + frontend)
	cd server && uv sync
	cd frontend && pnpm install

dev-server: ## サーバーを :8000 で起動(reload 付き)
	cd server && uv run uvicorn app.main:app --reload --port 8000

dev-front: ## フロントを :5173 で起動(/a2a は :8000 へ proxy)
	cd frontend && pnpm dev

test: ## サーバーのテストを実行
	cd server && uv run pytest

lint: ## lint(server: ruff / frontend: oxlint)
	cd server && uv run ruff check .
	cd frontend && pnpm lint

build: ## フロントを本番ビルド(型チェック込み)
	cd frontend && pnpm build

check: lint test ## lint + test をまとめて実行
