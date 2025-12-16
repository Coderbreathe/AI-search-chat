"""
AI Service for chat completions with streaming support
Supports both OpenAI and Google Gemini
"""
import os
import logging
from typing import AsyncGenerator, Optional
import json
from dotenv import load_dotenv
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

logger = logging.getLogger(__name__)

# Try to import AI libraries
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI library not available")

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("Google Generative AI library not available")


class AIService:
    """Service for AI chat completions with streaming"""
    
    def __init__(self):
        self.provider = os.getenv("AI_PROVIDER", "gemini").lower()
        
        if self.provider == "openai" and OPENAI_AVAILABLE:
            self.api_key = os.getenv("OPENAI_API_KEY")
            if self.api_key:
                openai.api_key = self.api_key
                self.client = openai.OpenAI(api_key=self.api_key)
                self.model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
                logger.info(f"Initialized OpenAI with model: {self.model}")
            else:
                logger.warning("OPENAI_API_KEY not found in environment")
                self.client = None
                
        elif self.provider == "gemini" and GEMINI_AVAILABLE:
            self.api_key = os.getenv("GEMINI_API_KEY")
            if self.api_key:
                genai.configure(api_key=self.api_key)
                self.model = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")
                self.client = genai.GenerativeModel(self.model)

                logger.info(f"Initialized Gemini with model: {self.model}")
            else:
                logger.warning("GEMINI_API_KEY not found in environment")
                self.client = None
        else:
            logger.warning(f"AI provider '{self.provider}' not available or not supported")
            self.client = None
    
    async def stream_chat_response(
        self,
        message: str,
        context: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Stream chat response from AI
        
        Args:
            message: User's message
            context: Optional context from documents
            
        Yields:
            Text chunks from AI response
        """
        if not self.client:
            yield "AI service is not configured. Please add API key to .env file."
            return
        
        try:
            # Build the prompt
            if context:
                prompt = f"""Based on the following context, answer the user's question.
                
Context:
{context}

Question: {message}

Answer:"""
            else:
                prompt = message
            
            # Stream response based on provider
            if self.provider == "openai":
                async for chunk in self._stream_openai(prompt):
                    yield chunk
            elif self.provider == "gemini":
                async for chunk in self._stream_gemini(prompt):
                    yield chunk
            else:
                yield "Unsupported AI provider"
                
        except Exception as e:
            logger.error(f"Error in stream_chat_response: {str(e)}")
            yield f"Error: {str(e)}"
    
    async def _stream_openai(self, prompt: str) -> AsyncGenerator[str, None]:
        """Stream response from OpenAI"""
        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that answers questions based on provided documents. Be concise and accurate."},
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                temperature=0.7,
                max_tokens=1000
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            logger.error(f"OpenAI streaming error: {str(e)}")
            yield f"Error: {str(e)}"
    
    async def _stream_gemini(self, prompt: str) -> AsyncGenerator[str, None]:
        """Stream response from Gemini"""
        try:
            response = self.client.generate_content(
                prompt,
                stream=True,
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 1000,
                }
            )
            
            for chunk in response:
                if chunk.text:
                    yield chunk.text
                    
        except Exception as e:
            logger.error(f"Gemini streaming error: {str(e)}")
            yield f"Error: {str(e)}"
    
    async def generate_response(
        self,
        message: str,
        context: Optional[str] = None
    ) -> str:
        """
        Generate complete (non-streaming) response
        
        Args:
            message: User's message
            context: Optional context from documents
            
        Returns:
            Complete AI response
        """
        chunks = []
        async for chunk in self.stream_chat_response(message, context):
            chunks.append(chunk)
        return "".join(chunks)
