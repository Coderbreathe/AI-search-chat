from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from contextlib import asynccontextmanager
import logging
from datetime import datetime
import os
import shutil
import uuid
import json
import asyncio
from pathlib import Path
from sse_starlette.sse import EventSourceResponse

from models.document import (
    DocumentMetadata,
    DocumentUploadResponse,
    DocumentListResponse,
    DocumentDeleteResponse
)
from models.chat import ChatRequest, ChatResponse
from services.pdf_processor import PDFProcessor
from services.ai_service import AIService
from services.chunking_service import ChunkingService
from services.vector_store import VectorStore

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# In-memory document storage (replace with database in production)
documents_db: dict[str, DocumentMetadata] = {}

# Initialize AI service
# Initialize services
ai_service = AIService()
vector_store = VectorStore()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    logger.info("🚀 Starting up FastAPI application...")
    logger.info(f"📁 Upload directory: {UPLOAD_DIR.absolute()}")
    logger.info("✅ Application startup complete")
    yield
    # Shutdown
    logger.info("🛑 Shutting down FastAPI application...")


# Initialize FastAPI app
app = FastAPI(
    title="AI Search Chat API",
    description="Backend API for AI-powered search chat with PDF citations",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Search Chat API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "ai-search-chat-backend"
    }


@app.get("/api/status")
async def get_status():
    """Detailed status endpoint"""
    return {
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "api": "healthy",
            "database": "not_configured",
            "ai_service": "not_configured",
            "pdf_processor": "ready"
        }
    }


@app.post("/api/documents/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF document
    
    Args:
        file: PDF file to upload
        
    Returns:
        DocumentUploadResponse with upload status and document metadata
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed"
            )
        
        # Validate file size (max 10MB)
        file_content = await file.read()
        file_size = len(file_content)
        
        if file_size > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(
                status_code=400,
                detail="File size exceeds 10MB limit"
            )
        
        # Generate unique filename
        doc_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix
        unique_filename = f"{doc_id}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        logger.info(f"Saved file: {file_path}")
        
        # Validate PDF
        if not PDFProcessor.validate_pdf(str(file_path)):
            os.remove(file_path)
            raise HTTPException(
                status_code=400,
                detail="Invalid or corrupted PDF file"
            )
        
        # Extract metadata
        pdf_metadata = PDFProcessor.get_pdf_metadata(str(file_path))
        
        # Extract text page by page (Phase 5 requirement)
        pages_data = None
        try:
            pages_data = PDFProcessor.extract_pages_from_pdf(str(file_path))
            text_extracted = True
            total_chars = sum(len(page["text"]) for page in pages_data)
            logger.info(f"Extracted {len(pages_data)} pages with {total_chars} total characters from PDF")
        except Exception as e:
            logger.warning(f"Page extraction failed: {str(e)}") 
            text_extracted = False
        
        # Create document metadata with pages
        document = DocumentMetadata(
            id=doc_id,
            filename=unique_filename,
            original_filename=file.filename,
            file_size=file_size,
            page_count=pdf_metadata["page_count"],
            title=pdf_metadata.get("title"),
            author=pdf_metadata.get("author"),
            upload_date=datetime.utcnow(),
            file_path=str(file_path),
            text_extracted=text_extracted,
            pages=pages_data  # Store page-by-page text
        )
        
        # Index document for search if text extraction was successful
        if text_extracted and pages_data:
            try:
                # Chunk the pages
                chunks = ChunkingService.chunk_pages(pages_data)
                
                # Add to vector store
                num_chunks = vector_store.add_document(doc_id, chunks)
                logger.info(f"Indexed {num_chunks} chunks for document {doc_id}")
            except Exception as e:
                logger.error(f"Failed to index document: {str(e)}")
                # We continue even if indexing fails, document is still uploaded
        
        # Store in database
        documents_db[doc_id] = document
        
        logger.info(f"Document uploaded successfully: {doc_id}")
        
        return DocumentUploadResponse(
            success=True,
            message="Document uploaded successfully",
            document=document
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload document: {str(e)}"
        )


@app.get("/api/documents", response_model=DocumentListResponse)
async def list_documents():
    """
    Get list of all uploaded documents
    
    Returns:
        DocumentListResponse with list of documents
    """
    try:
        documents = list(documents_db.values())
        # Sort by upload date, newest first
        documents.sort(key=lambda x: x.upload_date, reverse=True)
        
        return DocumentListResponse(
            documents=documents,
            total_count=len(documents)
        )
    except Exception as e:
        logger.error(f"Failed to list documents: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve documents: {str(e)}"
        )


@app.get("/api/documents/{doc_id}", response_model=DocumentMetadata)
async def get_document(doc_id: str):
    """
    Get specific document details
    
    Args:
        doc_id: Document ID
        
    Returns:
        DocumentMetadata for the requested document
    """
    if doc_id not in documents_db:
        raise HTTPException(
            status_code=404,
            detail=f"Document not found: {doc_id}"
        )
    
    return documents_db[doc_id]


@app.delete("/api/documents/{doc_id}", response_model=DocumentDeleteResponse)
async def delete_document(doc_id: str):
    """
    Delete a document
    
    Args:
        doc_id: Document ID to delete
        
    Returns:
        DocumentDeleteResponse with deletion status
    """
    try:
        if doc_id not in documents_db:
            raise HTTPException(
                status_code=404,
                detail=f"Document not found: {doc_id}"
            )
        
        document = documents_db[doc_id]
        
        # Delete file from filesystem
        file_path = Path(document.file_path)
        if file_path.exists():
            os.remove(file_path)
            logger.info(f"Deleted file: {file_path}")
        
        # Remove from database
        del documents_db[doc_id]
        
        logger.info(f"Document deleted successfully: {doc_id}")
        
        return DocumentDeleteResponse(
            success=True,
            message="Document deleted successfully",
            document_id=doc_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete document: {str(e)}"
        )


@app.get("/api/pdfs/{doc_id}/file")
async def get_pdf_file(doc_id: str):
    """
    Serve the original PDF file
    
    Args:
        doc_id: Document ID
        
    Returns:
        FileResponse with the PDF file
    """
    if doc_id not in documents_db:
        raise HTTPException(
            status_code=404,
            detail=f"Document not found: {doc_id}"
        )
    
    document = documents_db[doc_id]
    file_path = Path(document.file_path)
    
    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="PDF file not found on server"
        )
        
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=document.original_filename
    )


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint for AI responses (non-streaming)
    """
    try:
        context = None
        
        # If context is requested or we have documents, try to find relevant context
        if request.use_context or (documents_db and request.use_context != False):
            # Get list of doc_ids to search (filter if provided)
            # If doc_ids is explicit in request, use it. If not, search all.
            search_doc_ids = request.document_ids if request.document_ids else list(documents_db.keys())
            
            if search_doc_ids:
                # Perform vector search
                results = vector_store.search(request.message, top_k=5, doc_ids=search_doc_ids)
                
                if results:
                    # Format context string with citations
                    context_parts = []
                    for i, result in enumerate(results, 1):
                        doc = documents_db.get(result.get("doc_id"))
                        filename = doc.filename if doc else "Unknown"
                        page_num = result.get("page_num", "?")
                        text = result.get("text", "").replace("\n", " ")
                        
                        context_parts.append(f"[Source {i}] (File: {filename}, Page: {page_num}): {text}")
                    
                    context = "\n\n".join(context_parts)
                    logger.info(f"Found {len(results)} relevant context chunks")
                    
                    # Add instruction for citation format
                    context += "\n\nINSTRUCTIONS: Answer the user's question based ONLY on the above context. " \
                               "Cite your sources using the format [Source 1], [Source 2], etc. " \
                               "If the answer is not in the context, say you don't know."
        
        response_text = await ai_service.generate_response(
            message=request.message,
            context=context
        )
        
        return ChatResponse(
            message=response_text,
            success=True
        )
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return ChatResponse(
            message="I'm sorry, I encountered an error processing your request.",
            success=False,
            error=str(e)
        )


@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    SSE streaming endpoint for AI responses
    """
    async def event_generator():
        """Generate SSE events"""
        try:
            context = None
            
            # If context is requested or we have documents (default to using context if docs exist)
            if request.use_context or (documents_db and request.use_context != False):
                # Get list of doc_ids to search
                search_doc_ids = request.document_ids if request.document_ids else list(documents_db.keys())
                
                if search_doc_ids:
                    # Tool Call 1: Searching documents
                    yield {
                        "event": "message",
                        "data": json.dumps({
                            "type": "tool_call",
                            "name": "searching_documents",
                            "status": "in_progress"
                        })
                    }
                    await asyncio.sleep(0.8)  # Realistic delay
                    
                    # Perform vector search
                    results = vector_store.search(request.message, top_k=3, doc_ids=search_doc_ids)
                    
                    yield {
                        "event": "message",
                        "data": json.dumps({
                            "type": "tool_call",
                            "name": "searching_documents",
                            "status": "complete"
                        })
                    }
                    await asyncio.sleep(0.3)
                    
                    if results:
                        # Tool Call 2: Retrieving PDF content
                        yield {
                            "event": "message",
                            "data": json.dumps({
                                "type": "tool_call",
                                "name": "retrieving_pdf",
                                "status": "in_progress"
                            })
                        }
                        await asyncio.sleep(0.6)
                        
                        # Format context string
                        context_parts = []
                        sources_metadata = []
                        
                        for i, result in enumerate(results, 1):
                            doc_id = result.get("doc_id")
                            doc = documents_db.get(doc_id)
                            filename = doc.original_filename if doc else "Unknown" # Use original filename for display
                            page_num = result.get("page_num", "?")
                            text = result.get("text", "").replace("\n", " ")
                            
                            context_parts.append(f"[{i}] (File: {filename}, Page: {page_num}): {text}")
                            
                            # Collect metadata for frontend
                            sources_metadata.append({
                                "id": i,
                                "pdf_id": doc_id,
                                "filename": filename,
                                "page": page_num,
                                "text": text[:150] + "..." if len(text) > 150 else text # Preview
                            })
                        
                        context = "\n\n".join(context_parts)
                        logger.info(f"Found {len(results)} relevant context chunks")
                        
                        yield {
                            "event": "message",
                            "data": json.dumps({
                                "type": "tool_call",
                                "name": "retrieving_pdf",
                                "status": "complete"
                            })
                        }
                        await asyncio.sleep(0.3)
                        
                        # Tool Call 3: Analyzing content
                        yield {
                            "event": "message",
                            "data": json.dumps({
                                "type": "tool_call",
                                "name": "analyzing_content",
                                "status": "in_progress"
                            })
                        }
                        await asyncio.sleep(0.7)
                        
                        # Add instruction for citation format
                        context += "\n\nINSTRUCTIONS: Answer the user's question based ONLY on the above context. " \
                                   "Use numbered citations like [1], [2] in your text corresponding to the sources provided. " \
                                   "Does not explicitly mention 'Source 1' or 'File: ...', just use the bracketed numbers. " \
                                   "If the answer is not in the context, say you don't know."
                        
                        yield {
                            "event": "message",
                            "data": json.dumps({
                                "type": "tool_call",
                                "name": "analyzing_content",
                                "status": "complete"
                            })
                        }
                        await asyncio.sleep(0.2)
                        
                        # Send sources metadata event
                        yield {
                            "event": "message",
                            "data": json.dumps({
                                "type": "sources",
                                "content": sources_metadata
                            })
                        }
                        
                        # Detect if we should generate UI components
                        query_lower = request.message.lower()
                        should_generate_chart = any(keyword in query_lower for keyword in ["chart", "graph", "visualize", "plot"])
                        should_generate_table = any(keyword in query_lower for keyword in ["table", "list", "show data"])
                        
                        # Example: Generate a chart component if requested
                        if should_generate_chart and len(results) >= 2:
                            # Create sample data from search results
                            chart_data = []
                            for i, result in enumerate(results[:5], 1):
                                doc = documents_db.get(result.get("doc_id"))
                                chart_data.append({
                                    "label": f"Page {result.get('page_num', i)}",
                                    "value": len(result.get("text", ""))  # Use text length as sample metric
                                })
                            
                            yield {
                                "event": "message",
                                "data": json.dumps({
                                    "type": "component",
                                    "name": "chart",
                                    "props": {
                                        "data": chart_data,
                                        "title": "Content Distribution",
                                        "chartType": "bar"
                                    }
                                })
                            }
                            await asyncio.sleep(0.3)
                        
                        # Example: Generate a table component if requested
                        if should_generate_table and len(results) >= 1:
                            table_data = {
                                "headers": ["Source", "Page", "Preview"],
                                "rows": []
                            }
                            for result in results[:5]:
                                doc = documents_db.get(result.get("doc_id"))
                                filename = doc.original_filename if doc else "Unknown"
                                table_data["rows"].append([
                                    filename,
                                    str(result.get("page_num", "?")),
                                    result.get("text", "")[:50] + "..."
                                ])
                            
                            yield {
                                "event": "message",
                                "data": json.dumps({
                                    "type": "component",
                                    "name": "table",
                                    "props": table_data
                                })
                            }
                            await asyncio.sleep(0.3)
            
            # Tool Call 4: Generating response
            yield {
                "event": "message",
                "data": json.dumps({
                    "type": "tool_call",
                    "name": "generating_response",
                    "status": "in_progress"
                })
            }
            await asyncio.sleep(0.4)
            
            # Stream the AI response
            async for chunk in ai_service.stream_chat_response(
                message=request.message,
                context=context
            ):
                # Send text chunk as SSE event
                yield {
                    "event": "message",
                    "data": json.dumps({
                        "type": "text",
                        "content": chunk
                    })
                }
                
                # Small delay to prevent overwhelming the client
                await asyncio.sleep(0.01)
            
            # Mark generating_response as complete
            yield {
                "event": "message",
                "data": json.dumps({
                    "type": "tool_call",
                    "name": "generating_response",
                    "status": "complete"
                })
            }
            
            # Send completion event
            yield {
                "event": "message",
                "data": json.dumps({
                    "type": "done",
                    "content": ""
                })
            }
            
        except Exception as e:
            logger.error(f"Streaming error: {str(e)}")
            yield {
                "event": "error",
                "data": json.dumps({
                    "type": "error",
                    "content": str(e)
                })
            }
    
    return EventSourceResponse(event_generator())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
