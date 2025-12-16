/**
 * API client for communicating with the FastAPI backend
 */

import type { DocumentUploadResponse, DocumentListResponse, DocumentDeleteResponse, Document } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        'Unable to connect to backend server. Make sure it is running on ' + API_BASE_URL
      )
    }
    throw error
  }
}

/**
 * Health check endpoint
 */
export async function checkBackendHealth(): Promise<{
  status: string
  timestamp: string
  service: string
}> {
  return apiFetch('/api/health')
}

/**
 * Get detailed backend status
 */
export async function getBackendStatus(): Promise<{
  status: string
  timestamp: string
  components: Record<string, string>
}> {
  return apiFetch('/api/status')
}

/**
 * Upload a PDF document
 */
export async function uploadDocument(file: File): Promise<DocumentUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to upload document')
  }

  return await response.json()
}

/**
 * Get list of all uploaded documents
 */
export async function getDocuments(): Promise<DocumentListResponse> {
  return apiFetch('/api/documents')
}

/**
 * Get specific document details
 */
export async function getDocument(docId: string): Promise<Document> {
  return apiFetch(`/api/documents/${docId}`)
}

/**
 * Delete a document
 */
export async function deleteDocument(docId: string): Promise<DocumentDeleteResponse> {
  return apiFetch(`/api/documents/${docId}`, {
    method: 'DELETE',
  })
}

/**
 * Export API base URL for use in other modules
 */
export { API_BASE_URL }