"""データベース接続設定"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./markdown_editor.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite用設定
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """データベースセッションの依存性注入用ジェネレータ"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
