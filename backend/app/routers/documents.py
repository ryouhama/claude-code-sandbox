"""ドキュメントCRUD API"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Document
from ..schemas import DocumentCreate, DocumentListResponse, DocumentResponse, DocumentUpdate
from ..services.export import export_to_html

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("", response_model=list[DocumentListResponse])
def get_documents(db: Session = Depends(get_db)):
    """全ドキュメント一覧を取得"""
    documents = db.query(Document).order_by(Document.updated_at.desc()).all()
    return documents


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, db: Session = Depends(get_db)):
    """指定IDのドキュメントを取得"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.post("", response_model=DocumentResponse, status_code=201)
def create_document(doc: DocumentCreate, db: Session = Depends(get_db)):
    """新規ドキュメントを作成"""
    document = Document(title=doc.title, content=doc.content)
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.put("/{document_id}", response_model=DocumentResponse)
def update_document(
    document_id: str,
    doc: DocumentUpdate,
    db: Session = Depends(get_db),
):
    """ドキュメントを更新"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.title is not None:
        document.title = doc.title
    if doc.content is not None:
        document.content = doc.content

    db.commit()
    db.refresh(document)
    return document


@router.delete("/{document_id}", status_code=204)
def delete_document(document_id: str, db: Session = Depends(get_db)):
    """ドキュメントを削除"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    db.delete(document)
    db.commit()
    return None


@router.get("/{document_id}/export")
def export_document(
    document_id: str,
    db: Session = Depends(get_db),
):
    """ドキュメントをHTML形式でエクスポート"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    html_content = export_to_html(document.title, document.content)
    return HTMLResponse(content=html_content)
