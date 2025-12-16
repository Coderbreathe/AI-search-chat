"""
Chat-related Pydantic models
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    message: str = Field(..., description="User's message")
    document_ids: Optional[List[str]] = Field(default=None, description="Optional list of document IDs to use as context")
    use_context: bool = Field(default=False, description="Whether to use document context")


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    message: str = Field(..., description="AI's response")
    success: bool = Field(default=True)
    error: Optional[str] = Field(default=None)


class StreamChunk(BaseModel):
    """Model for streaming chunks"""
    type: str = Field(..., description="Type of chunk: 'text', 'done', 'error'")
    content: str = Field(..., description="Chunk content")
