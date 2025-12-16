"""
Document Models
Pydantic models for document handling
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PDFPage(BaseModel):
    """Model for individual PDF page"""
    page_num: int
    text: str


class DocumentMetadata(BaseModel):
    """Document metadata model"""
    id: str
    filename: str
    original_filename: str
    file_size: int
    page_count: int
    title: Optional[str] = None
    author: Optional[str] = None
    upload_date: datetime
    file_path: str
    text_extracted: bool = False
    pages: Optional[List[PDFPage]] = None  # Page-by-page text storage


class DocumentUploadResponse(BaseModel):
    """Response model for document upload"""
    success: bool
    message: str
    document: Optional[DocumentMetadata] = None


class DocumentListResponse(BaseModel):
    """Response model for listing documents"""
    documents: list[DocumentMetadata]
    total_count: int


class DocumentDeleteResponse(BaseModel):
    """Response model for document deletion"""
    success: bool
    message: str
    document_id: str
