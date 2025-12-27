"""Pydantic スキーマ定義"""
from datetime import datetime

from pydantic import BaseModel, Field


class DocumentBase(BaseModel):
    """ドキュメントの基本スキーマ"""
    title: str = Field(default="Untitled", max_length=255)
    content: str = Field(default="")


class DocumentCreate(DocumentBase):
    """ドキュメント作成用スキーマ"""
    pass


class DocumentUpdate(BaseModel):
    """ドキュメント更新用スキーマ"""
    title: str | None = Field(default=None, max_length=255)
    content: str | None = None


class DocumentResponse(DocumentBase):
    """ドキュメントレスポンス用スキーマ"""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    """ドキュメント一覧レスポンス用スキーマ"""
    id: str
    title: str
    updated_at: datetime

    class Config:
        from_attributes = True
