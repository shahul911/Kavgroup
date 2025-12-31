"""Document management routes"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional
from datetime import datetime
import shutil
import uuid
import logging

from models import Document, DocumentCreate
from auth import get_current_user
from database import db, UPLOAD_DIR

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Documents"])


@router.post("/admin/documents")
async def upload_document(
    file: UploadFile = File(...),
    documentType: str = Form(...),
    billDate: Optional[str] = Form(None),
    dueDate: Optional[str] = Form(None),
    reminderDate: Optional[str] = Form(None),
    reminderEnabled: bool = Form(False),
    amount: Optional[float] = Form(None),
    notes: Optional[str] = Form(None),
    current_user: str = Depends(get_current_user)
):
    # Validate file type
    allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File type not allowed. Only PDF and images are accepted.")
    
    # Validate file size (10MB max)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")
    
    # Generate unique filename
    file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'pdf'
    unique_filename = f"{uuid.uuid4().hex}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Create document record
    document = Document(
        fileName=file.filename,
        filePath=str(file_path),
        fileUrl=f"/api/uploads/documents/{unique_filename}",
        documentType=documentType,
        billDate=billDate,
        dueDate=dueDate,
        reminderDate=reminderDate,
        reminderEnabled=reminderEnabled,
        amount=amount,
        notes=notes
    )
    
    await db.documents.insert_one(document.dict())
    
    return {"success": True, "document": document.dict()}


@router.get("/admin/documents")
async def get_documents(
    documentType: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    query = {}
    if documentType:
        query['documentType'] = documentType
    
    documents = await db.documents.find(query, {'_id': 0}).sort('createdAt', -1).to_list(200)
    return {"documents": documents}


@router.delete("/admin/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: str = Depends(get_current_user)
):
    # Get document to find file path
    document = await db.documents.find_one({"id": document_id})
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete file from filesystem
    try:
        import os
        if os.path.exists(document['filePath']):
            os.remove(document['filePath'])
    except Exception as e:
        logger.error(f"Failed to delete file: {e}")
    
    # Delete from database
    await db.documents.delete_one({"id": document_id})
    
    return {"success": True, "message": "Document deleted"}
