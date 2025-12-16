# AI Search Chat Application

A modern, full-stack RAG (Retrieval-Augmented Generation) application that enables intelligent conversations with your PDF documents. Built with Next.js, FastAPI, and Google Gemini AI.


## ✨ Features

- **📄 PDF Upload & Processing**: Upload multiple PDF documents with automatic text extraction
- **🔍 Semantic Search**: Vector-based search using sentence transformers for relevant context retrieval
- **💬 Streaming Chat**: Real-time AI responses with Server-Sent Events (SSE)
- **📚 Citations**: Inline citations with clickable references to source documents
- **📖 PDF Viewer**: Integrated PDF viewer with page navigation, zoom, and text highlighting
- **🎯 Tool Call Visualization**: See the AI's reasoning process step-by-step
- **📊 Generative UI**: Dynamic charts, tables, and cards generated during responses
- **🎨 Smooth Animations**: Polished UI with Framer Motion animations
- **🌙 Dark Mode**: Theme switcher with localStorage persistence
- **📱 Responsive Design**: Mobile-friendly interface with adaptive layouts
- **🐳 Docker Support**: One-command deployment with Docker Compose

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 14)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Chat UI      │  │ PDF Viewer   │  │ Document Mgmt│          │
│  │ - Streaming  │  │ - Navigation │  │ - Upload     │          │
│  │ - Citations  │  │ - Highlight  │  │ - List       │          │
│  │ - Tool Calls │  │ - Zoom       │  │ - Delete     │          │
│  │ - Gen UI     │  │ - Search     │  │ - Progress   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                    │ HTTP/SSE (Server-Sent Events)
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ AI Service   │  │ Vector Store │  │ PDF Processor│          │
│  │ - Gemini API │  │ - Embeddings │  │ - Text Extr. │          │
│  │ - Streaming  │  │ - Similarity │  │ - Metadata   │          │
│  │ - Tool Calls │  │ - Search     │  │ - Chunking   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ In-Memory Storage (documents_db, vector_store)       │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### Streaming Protocol (SSE)

The application uses Server-Sent Events for real-time streaming:

```
Client → POST /api/chat/stream → Server

Server streams events:
1. tool_call (in_progress) → "Searching documents..."
2. tool_call (complete) → "✓ Search complete"
3. tool_call (in_progress) → "Reading PDF..."
4. tool_call (complete) → "✓ PDF retrieved"
5. tool_call (in_progress) → "Analyzing content..."
6. tool_call (complete) → "✓ Analysis complete"
7. component → { type: "chart", props: {...} }
8. sources → [{ id, filename, page, text }]
9. tool_call (in_progress) → "Generating response..."
10. text → "Based on the document..." (chunked)
11. text → "the answer is..." (chunked)
12. done → Stream complete
```
## Total Time Taken
   Start Time: 9:30am
   End Time: 12:00am
   
## Video Tutorial (Loom)
https://www.loom.com/share/28bfd53dda274d9d87636c1a9a08f8d2
## Screenshots

<img width="1919" height="1013" alt="image" src="https://github.com/user-attachments/assets/a75a07ce-59de-4984-8ea3-110afdef0a28" />

<img width="1917" height="1023" alt="image" src="https://github.com/user-attachments/assets/2f48e365-5803-46a3-973c-470997ddb189" />

<img width="1919" height="1024" alt="image" src="https://github.com/user-attachments/assets/f2792404-dc90-4af2-93f1-d0c9d69ef494" />

<img width="1919" height="1020" alt="Screenshot 2025-12-16 232627" src="https://github.com/user-attachments/assets/85d2d168-6856-43ab-8f34-9fc2cea6721b" />


## 🚀 Setup Instructions

### Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.11+
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Option 1: Docker Deployment (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-search-chat

# Create .env file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Build and run with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API key
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Run the server
python main.py
```

Backend will run on `http://localhost:8000`

**Backend Dependencies:**
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `google-generativeai` - Gemini AI SDK
- `sentence-transformers` - Text embeddings
- `PyPDF2` - PDF text extraction
- `scikit-learn` - Cosine similarity
- `numpy` - Vector operations
- `python-multipart` - File upload handling

#### Frontend Setup

```bash
cd frontend

# Install Node.js dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run the development server
npm run dev
```

Frontend will run on `http://localhost:3000`

**Frontend Dependencies:**
- `next` - React framework
- `react` & `react-dom` - UI library
- `typescript` - Type safety
- `tailwindcss` - Styling
- `framer-motion` - Animations
- `react-pdf` & `pdfjs-dist` - PDF rendering
- `lucide-react` - Icons

## 📝 Environment Variables

### Backend (.env)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ Yes | - |
| `OPENAI_API_KEY` | OpenAI API key (fallback) | ❌ No | - |
| `HOST` | Server host | ❌ No | `0.0.0.0` |
| `PORT` | Server port | ❌ No | `8000` |

### Frontend (.env.local)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | ✅ Yes | `http://localhost:8000` |

## 🎯 Usage

1. **Upload PDFs**: Click "Documents" → "Upload Document" → Select PDF files
2. **Ask Questions**: Type your question in the chat input
3. **View Citations**: Click numbered citations `[1]` to open the PDF viewer
4. **Explore PDFs**: Navigate pages, zoom, and view highlighted text
5. **Generate Visualizations**: Ask for "chart" or "table" to get dynamic components
6. **Toggle Dark Mode**: Click the moon/sun icon in the header

### Example Queries

- "What are the main topics in this document?"
- "Show me a chart of the content distribution"
- "Create a table of key findings"
- "Summarize the conclusions on page 5"

## 📚 Libraries Used

### Backend
| Library | Version | Purpose | Justification |
|---------|---------|---------|---------------|
| `fastapi` | 0.104.1 | Web framework | Modern, async, auto-docs, type hints |
| `uvicorn` | 0.24.0 | ASGI server | Fast, production-ready |
| `google-generativeai` | 0.3.1 | AI model | Gemini 1.5 Flash for streaming |
| `sentence-transformers` | 2.2.2 | Embeddings | State-of-the-art semantic search |
| `PyPDF2` | 3.0.1 | PDF processing | Reliable text extraction |
| `scikit-learn` | 1.3.2 | Vector similarity | Efficient cosine similarity |
| `numpy` | 1.26.2 | Array operations | Fast vector computations |

### Frontend
| Library | Version | Purpose | Justification |
|---------|---------|---------|---------------|
| `next` | 14.2.18 | React framework | App Router, SSR, performance |
| `react` | 18.3.1 | UI library | Industry standard |
| `typescript` | 5.6.3 | Type safety | Catch errors at compile time |
| `tailwindcss` | 3.4.15 | Styling | Utility-first, rapid development |
| `framer-motion` | 11.11.17 | Animations | Declarative, performant |
| `react-pdf` | 9.1.1 | PDF rendering | Canvas-based, reliable |
| `lucide-react` | 0.462.0 | Icons | Lightweight, customizable |

## 🎨 Design Decisions

### 1. Queue System (In-Memory)

**Decision**: Used in-memory storage instead of Redis/RQ

**Justification**:
- **Simplicity**: No additional infrastructure required
- **Performance**: Direct memory access is faster for small-scale
- **Development Speed**: Faster iteration during development
- **Sufficient for Demo**: Handles concurrent requests adequately

**Trade-offs**:
- ❌ Data lost on restart (acceptable for demo)
- ❌ Not horizontally scalable (single instance)
- ✅ Zero configuration
- ✅ Instant deployment

**Production Alternative**: For production, would use Redis + Celery for:
- Persistent storage
- Distributed task queue
- Horizontal scaling
- Background job processing

### 2. Generative UI Implementation

**Decision**: Component-based with dynamic rendering

**Approach**:
1. **Query Detection**: Keyword matching ("chart", "table", "visualize")
2. **Data Formatting**: Backend formats data for specific component types
3. **Component Registry**: Frontend maps component names to React components
4. **Dynamic Rendering**: Components rendered based on streamed events

**Implementation**:
```typescript
// Backend sends:
{ type: "component", name: "chart", props: { data: [...], title: "..." } }

// Frontend renders:
<ComponentRenderer name="chart" props={props} />
```

**Trade-offs**:
- ✅ Flexible and extensible
- ✅ Type-safe with TypeScript
- ✅ Error boundaries prevent crashes
- ❌ Limited to predefined components
- ❌ No AI-generated component code (security risk)

### 3. Streaming Protocol (SSE vs WebSocket)

**Decision**: Server-Sent Events (SSE)

**Justification**:
- **Unidirectional**: Server → Client (perfect for AI streaming)
- **HTTP-based**: Works through firewalls and proxies
- **Auto-reconnect**: Built-in reconnection logic
- **Simpler**: Less overhead than WebSocket
- **Browser Support**: Native EventSource API

**Trade-offs**:
- ✅ Simpler implementation
- ✅ Better for one-way streaming
- ❌ No client → server streaming (not needed)

### 4. Vector Store (In-Memory vs Database)

**Decision**: In-memory with scikit-learn

**Justification**:
- **Fast**: No database round-trips
- **Simple**: No external dependencies
- **Sufficient**: Works well for <100 documents
- **Portable**: Works anywhere Python runs

**Production Alternative**: Pinecone, Weaviate, or Qdrant for:
- Persistent storage
- Millions of vectors
- Advanced filtering
- Distributed search

### 5. PDF Rendering (react-pdf vs iframe)

**Decision**: react-pdf with Canvas rendering

**Justification**:
- **Control**: Full control over rendering and interactions
- **Highlighting**: Can implement custom text highlighting
- **Zoom/Navigation**: Built-in controls
- **Cross-browser**: Consistent rendering

**Trade-offs**:
- ✅ Better UX and control
- ✅ Custom features (search, highlight)
- ❌ Larger bundle size
- ❌ More complex implementation

## 🐛 Troubleshooting

### Backend Issues

**"sentence-transformers not available"**
```bash
pip install sentence-transformers numpy scikit-learn
```

**PDF upload fails**
- Check `uploads/` directory exists and is writable
- Verify PDF is not corrupted
- Check file size limits

**Port 8000 already in use**
```bash
# Find and kill the process
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :8000
kill -9 <PID>
```

### Frontend Issues

**"Module not found: react-pdf"**
```bash
npm install react-pdf pdfjs-dist
```

**PDF viewer not loading**
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend is running and accessible
- Check browser console for CORS errors

**Dark mode not persisting**
- Check localStorage is enabled
- Clear browser cache and reload

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Google Gemini for powerful AI capabilities
- Next.js team for an amazing framework
- FastAPI for elegant Python APIs

- Hugging Face for sentence-transformers



