'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import MessageBubble from './MessageBubble'
import InputBox from './InputBox'
import DocumentUpload from './DocumentUpload'
import DocumentList from './DocumentList'
import PDFViewer from './PDFViewer'
import ThemeToggle from './ThemeToggle'
import { useStreamingChat } from '@/lib/useStreamingChat'
import { useIsMobile } from '@/lib/useMediaQuery'
import { Source } from '@/types'

type LayoutMode = 'chat-only' | 'split-view' | 'pdf-only'

export default function ChatInterface() {
  const { messages, isStreaming, error, sendMessage, clearMessages } = useStreamingChat()
  const [showDocuments, setShowDocuments] = useState(false)
  const [documentRefresh, setDocumentRefresh] = useState(0)
  const [pdfState, setPdfState] = useState<{
    isOpen: boolean
    url: string | null
    page: number
    highlight: string | null
  }>({
    isOpen: false,
    url: null,
    page: 1,
    highlight: null
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  // Determine layout mode based on PDF state and screen size
  const layoutMode: LayoutMode = !pdfState.isOpen
    ? 'chat-only'
    : isMobile
      ? 'pdf-only'
      : 'split-view'

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    await sendMessage(content)
  }

  const handleUploadComplete = () => {
    setDocumentRefresh(prev => prev + 1)
  }

  const handleCitationClick = (source: Source) => {
    // Save scroll position before opening PDF
    const scrollPosition = chatScrollRef.current?.scrollTop || 0

    // Construct URL for the PDF file
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const pdfUrl = `${baseUrl}/api/pdfs/${source.pdf_id}/file`

    setPdfState({
      isOpen: true,
      url: pdfUrl,
      // Ensure page is a number. Backend might send string or number
      page: typeof source.page === 'number' ? source.page : parseInt(source.page as unknown as string) || 1,
      highlight: source.text
    })

    // Restore scroll position after state update
    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = scrollPosition
      }
    }, 0)
  }

  return (
    <div className="flex h-screen max-w-full mx-auto">
      {/* Main Chat Area */}
      <motion.div
        className="flex flex-col min-w-0"
        layout
        animate={{
          width: layoutMode === 'chat-only' ? '100%' : layoutMode === 'split-view' ? '60%' : '0%',
          opacity: layoutMode === 'pdf-only' ? 0 : 1
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ display: layoutMode === 'pdf-only' ? 'none' : 'flex' }}
      >
        {/* Header - Perplexity Style */}
        <header className="flex-shrink-0 border-b border-neutral-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="w-full px-6 py-3">
            <div className="flex items-center justify-between w-full">
              {/* Left: Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Search
                </h1>
              </div>

              {/* Right: Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowDocuments(!showDocuments)}
                  className={`
                    px-3 py-1.5 text-sm font-medium rounded-lg transition-all
                    ${showDocuments
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-neutral-600 hover:bg-neutral-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  Documents
                </button>
                <ThemeToggle />
                {messages.length > 0 && (
                  <button
                    onClick={() => clearMessages()}
                    className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-gray-500 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-800"
                  >
                    New
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Messages Area - Perplexity Style */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto bg-white dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-6 max-w-md">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
                      What can I help with?
                    </h2>
                    <p className="text-neutral-600 dark:text-gray-400 text-sm">
                      Ask me anything about your documents
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 mt-8">
                    {[
                      'Summarize the key findings',
                      'What are the main topics?',
                      'Show me important statistics',
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSendMessage(suggestion)}
                        className="px-4 py-3 text-sm text-left text-neutral-700 dark:text-gray-300 bg-neutral-50 dark:bg-gray-900 border border-neutral-200 dark:border-gray-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-gray-800 hover:border-neutral-300 dark:hover:border-gray-700 transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onCitationClick={handleCitationClick}
                  />
                ))}
                {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 text-sm font-medium">AI</span>
                    </div>
                    <div className="flex-1 bg-white rounded-2xl px-4 py-3 shadow-sm border border-neutral-200">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Input Area - Now part of InputBox component */}
        <InputBox
          onSend={handleSendMessage}
          disabled={isStreaming}
          placeholder="Ask anything..."
        />
      </motion.div>

      {/* Document Sidebar */}
      {
        showDocuments && (
          <div className="w-96 border-l border-neutral-200 bg-neutral-50 flex flex-col">
            <div className="flex-shrink-0 px-4 py-4 border-b border-neutral-200 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Documents
                </h2>
                <button
                  onClick={() => setShowDocuments(false)}
                  className="text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Upload Section */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                  Upload PDF
                </h3>
                <DocumentUpload onUploadComplete={handleUploadComplete} />
              </div>

              {/* Document List */}
              <div>
                <DocumentList refreshTrigger={documentRefresh} />
              </div>
            </div>
          </div>
        )
      }
      <PDFViewer
        isOpen={pdfState.isOpen}
        url={pdfState.url}
        initialPage={pdfState.page}
        highlightText={pdfState.highlight}
        onClose={() => setPdfState(prev => ({ ...prev, isOpen: false }))}
        layoutMode={layoutMode}
      />
    </div >
  )
}
