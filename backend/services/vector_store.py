"""
Vector Store Service
Handles embeddings and semantic search
"""
import logging
from typing import List, Dict, Optional
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

# Try to import sentence transformers
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    logger.warning("sentence-transformers not available")


class VectorStore:
    """In-memory vector store for semantic search"""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize vector store
        
        Args:
            model_name: Name of the sentence-transformers model to use
        """
        self.chunks: List[Dict] = []
        self.embeddings: Optional[np.ndarray] = None
        self.model = None
        
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                self.model = SentenceTransformer(model_name)
                logger.info(f"Initialized vector store with model: {model_name}")
            except Exception as e:
                logger.error(f"Failed to load embedding model: {str(e)}")
        else:
            logger.warning("Vector store initialized without embeddings support")
    
    def add_document(self, doc_id: str, chunks: List[Dict]) -> int:
        """
        Add document chunks to the vector store
        
        Args:
            doc_id: Document ID
            chunks: List of chunk dictionaries with chunk_id, page_num, text
            
        Returns:
            Number of chunks added
        """
        if not self.model:
            logger.warning("No embedding model available")
            return 0
        
        if not chunks:
            return 0
        
        # Add doc_id to each chunk
        for chunk in chunks:
            chunk["doc_id"] = doc_id
        
        # Generate embeddings
        texts = [chunk["text"] for chunk in chunks]
        try:
            new_embeddings = self.model.encode(texts, show_progress_bar=False)
            
            # Add to store
            self.chunks.extend(chunks)
            
            if self.embeddings is None:
                self.embeddings = new_embeddings
            else:
                self.embeddings = np.vstack([self.embeddings, new_embeddings])
            
            logger.info(f"Added {len(chunks)} chunks for document {doc_id}")
            return len(chunks)
            
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {str(e)}")
            return 0
    
    def search(self, query: str, top_k: int = 5, doc_ids: Optional[List[str]] = None) -> List[Dict]:
        """
        Search for relevant chunks
        
        Args:
            query: Search query
            top_k: Number of results to return
            doc_ids: Optional list of document IDs to filter by
            
        Returns:
            List of relevant chunks with similarity scores
        """
        if not self.model or self.embeddings is None or len(self.chunks) == 0:
            logger.warning("Vector store is empty or model not available")
            return []
        
        try:
            # Generate query embedding
            query_embedding = self.model.encode([query], show_progress_bar=False)[0]
            
            # Calculate similarities
            similarities = cosine_similarity([query_embedding], self.embeddings)[0]
            
            # Filter by doc_ids if provided
            if doc_ids:
                filtered_indices = [
                    i for i, chunk in enumerate(self.chunks)
                    if chunk.get("doc_id") in doc_ids
                ]
            else:
                filtered_indices = list(range(len(self.chunks)))
            
            # Get top-k results from filtered indices
            filtered_similarities = [(i, similarities[i]) for i in filtered_indices]
            top_indices = sorted(filtered_similarities, key=lambda x: x[1], reverse=True)[:top_k]
            
            # Build results
            results = []
            for idx, score in top_indices:
                chunk = self.chunks[idx].copy()
                chunk["similarity_score"] = float(score)
                results.append(chunk)
            
            logger.info(f"Found {len(results)} relevant chunks for query")
            return results
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            return []
    
    def remove_document(self, doc_id: str) -> int:
        """
        Remove all chunks for a document
        
        Args:
            doc_id: Document ID to remove
            
        Returns:
            Number of chunks removed
        """
        indices_to_remove = [
            i for i, chunk in enumerate(self.chunks)
            if chunk.get("doc_id") == doc_id
        ]
        
        if not indices_to_remove:
            return 0
        
        # Remove chunks
        self.chunks = [
            chunk for i, chunk in enumerate(self.chunks)
            if i not in indices_to_remove
        ]
        
        # Remove embeddings
        if self.embeddings is not None:
            mask = np.ones(len(self.embeddings), dtype=bool)
            mask[indices_to_remove] = False
            self.embeddings = self.embeddings[mask]
        
        logger.info(f"Removed {len(indices_to_remove)} chunks for document {doc_id}")
        return len(indices_to_remove)
    
    def get_stats(self) -> Dict:
        """Get vector store statistics"""
        return {
            "total_chunks": len(self.chunks),
            "total_documents": len(set(chunk.get("doc_id") for chunk in self.chunks)),
            "model_loaded": self.model is not None,
            "embeddings_generated": self.embeddings is not None
        }
