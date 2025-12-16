"""
Text Chunking Service
Splits documents into chunks for vector search
"""
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


class ChunkingService:
    """Service for chunking text documents"""
    
    @staticmethod
    def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """
        Split text into overlapping chunks
        
        Args:
            text: Text to chunk
            chunk_size: Target size of each chunk in characters
            overlap: Number of characters to overlap between chunks
            
        Returns:
            List of text chunks
        """
        if not text or len(text) == 0:
            return []
        
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = start + chunk_size
            
            # If this is not the last chunk, try to break at a sentence or word boundary
            if end < text_length:
                # Look for sentence boundary (. ! ?)
                for i in range(end, max(start, end - 100), -1):
                    if text[i] in '.!?\n':
                        end = i + 1
                        break
                else:
                    # If no sentence boundary, look for word boundary
                    for i in range(end, max(start, end - 50), -1):
                        if text[i].isspace():
                            end = i
                            break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            # Move start position with overlap
            start = end - overlap if end < text_length else text_length
        
        logger.info(f"Created {len(chunks)} chunks from {text_length} characters")
        return chunks
    
    @staticmethod
    def chunk_pages(pages: List[Dict], chunk_size: int = 500, overlap: int = 50) -> List[Dict]:
        """
        Chunk PDF pages into smaller pieces with metadata
        
        Args:
            pages: List of page dictionaries with page_num and text
            chunk_size: Target size of each chunk
            overlap: Overlap between chunks
            
        Returns:
            List of chunk dictionaries with page_num, chunk_index, and text
        """
        all_chunks = []
        chunk_id = 0
        
        for page in pages:
            page_num = page.get("page_num", 0)
            page_text = page.get("text", "")
            
            if not page_text:
                continue
            
            # Chunk the page text
            text_chunks = ChunkingService.chunk_text(page_text, chunk_size, overlap)
            
            # Add metadata to each chunk
            for idx, chunk_text in enumerate(text_chunks):
                all_chunks.append({
                    "chunk_id": chunk_id,
                    "page_num": page_num,
                    "chunk_index": idx,
                    "text": chunk_text
                })
                chunk_id += 1
        
        logger.info(f"Created {len(all_chunks)} chunks from {len(pages)} pages")
        return all_chunks
