"""FastAPI メインエントリーポイント"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import documents

# データベーステーブル作成
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Markdown Editor API",
    description="Markdownエディタ用バックエンドAPI",
    version="1.0.0",
)

# CORS設定（開発環境用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite開発サーバー
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(documents.router)


@app.get("/")
def root():
    """ヘルスチェック用エンドポイント"""
    return {"status": "ok", "message": "Markdown Editor API"}
