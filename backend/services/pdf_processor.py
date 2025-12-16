"""
PDF Processing Service
Handles PDF text extraction and metadata extraction
"""
import os
from typing import Dict, Optional
from PyPDF2 import PdfReader
import logging

logger = logging.getLogger(__name__)


class PDFProcessor:
    """Service for processing PDF files"""
    
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """
        Extract text content from a PDF file
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            Extracted text content
            
        Raises:
            Exception: If PDF cannot be read or processed
        """
        try:
            reader = PdfReader(file_path)
            text_content = []
            
            for page_num, page in enumerate(reader.pages, 1):
                try:
                    text = page.extract_text()
                    if text.strip():
                        text_content.append(f"--- Page {page_num} ---\n{text}")
                except Exception as e:
                    logger.warning(f"Failed to extract text from page {page_num}: {str(e)}")
                    continue
            
            full_text = "\n\n".join(text_content)
            logger.info(f"Successfully extracted {len(full_text)} characters from PDF")
            return full_text
            
        except Exception as e:
            logger.error(f"Failed to process PDF: {str(e)}")
            raise Exception(f"Failed to extract text from PDF: {str(e)}")
    
    @staticmethod
    def extract_pages_from_pdf(file_path: str) -> list[dict]:
        """
        Extract text content from PDF page by page
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            List of dictionaries with page_num and text for each page
            
        Raises:
            Exception: If PDF cannot be read or processed
        """
        try:
            reader = PdfReader(file_path)
            pages = []
            
            for page_num, page in enumerate(reader.pages, 1):
                try:
                    text = page.extract_text()
                    pages.append({
                        "page_num": page_num,
                        "text": text.strip() if text else ""
                    })
                except Exception as e:
                    logger.warning(f"Failed to extract text from page {page_num}: {str(e)}")
                    pages.append({
                        "page_num": page_num,
                        "text": ""
                    })
            
            logger.info(f"Successfully extracted {len(pages)} pages from PDF")
            return pages
            
        except Exception as e:
            logger.error(f"Failed to process PDF pages: {str(e)}")
            raise Exception(f"Failed to extract pages from PDF: {str(e)}")
    
    @staticmethod
    def get_pdf_metadata(file_path: str) -> Dict[str, any]:
        """
        Extract metadata from a PDF file
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            Dictionary containing PDF metadata
        """
        try:
            reader = PdfReader(file_path)
            metadata = reader.metadata
            
            return {
                "page_count": len(reader.pages),
                "title": metadata.get("/Title", "Unknown") if metadata else "Unknown",
                "author": metadata.get("/Author", "Unknown") if metadata else "Unknown",
                "subject": metadata.get("/Subject", "") if metadata else "",
                "creator": metadata.get("/Creator", "") if metadata else "",
            }
        except Exception as e:
            logger.error(f"Failed to extract metadata: {str(e)}")
            return {
                "page_count": 0,
                "title": "Unknown",
                "author": "Unknown",
                "subject": "",
                "creator": "",
            }
    
    @staticmethod
    def validate_pdf(file_path: str) -> bool:
        """
        Validate if a file is a valid PDF
        
        Args:
            file_path: Path to the file
            
        Returns:
            True if valid PDF, False otherwise
        """
        try:
            reader = PdfReader(file_path)
            # Try to access pages to ensure it's readable
            _ = len(reader.pages)
            return True
        except Exception as e:
            logger.error(f"PDF validation failed: {str(e)}")
            return False
