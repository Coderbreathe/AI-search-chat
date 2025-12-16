/**
 * Core type definitions for the application
 * These will be expanded in future phases
 */

// API Response Types
export interface HealthCheckResponse {
  status: string
  timestamp: string
  service: string
}

export interface StatusResponse {
  status: string
  timestamp: string
  components: {
    api: string
    database: string
    ai_service: string
    pdf_processor: string
  }
}

// Common Types
export interface ApiError {
  detail: string
  status: number
}

// Message Types
export interface ToolCall {
  name: string
  status: 'in_progress' | 'complete'
}

export interface GenerativeComponent {
  name: string
  props: Record<string, any>
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Source[]
  toolCalls?: ToolCall[]
  components?: GenerativeComponent[]
  isStreaming?: boolean
}

// Citation Types
export interface Source {
  id: number
  pdf_id: string
  filename: string
  page: number | string
  text: string
}

// Document Types
export interface Document {
  id: string
  filename: string
  original_filename: string
  file_size: number
  page_count: number
  title?: string
  author?: string
  upload_date: string
  file_path: string
  text_extracted: boolean
}

export interface DocumentUploadResponse {
  success: boolean
  message: string
  document?: Document
}

export interface DocumentListResponse {
  documents: Document[]
  total_count: number
}

export interface DocumentDeleteResponse {
  success: boolean
  message: string
  document_id: string
}

export interface UploadProgress {
  file: File
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'