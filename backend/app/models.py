"""SQLAlchemy データベースモデル"""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text

from .database import Base


class Document(Base):
    """Markdownドキュメントモデル"""

    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False, default="Untitled")
    content = Column(Text, nullable=False, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
