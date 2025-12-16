'use client'

import { useEffect, useState } from 'react'
import { getDocuments, deleteDocument } from '@/lib/api'
import type { Document } from '@/types'

interface DocumentListProps {
    refreshTrigger?: number
}

export default function DocumentList({ refreshTrigger }: DocumentListProps) {
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const fetchDocuments = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getDocuments()
            setDocuments(response.documents)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load documents')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDocuments()
    }, [refreshTrigger])

    const handleDelete = async (docId: string) => {
        if (!confirm('Are you sure you want to delete this document?')) {
            return
        }

        try {
            setDeletingId(docId)
            await deleteDocument(docId)
            setDocuments(prev => prev.filter(doc => doc.id !== docId))
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete document')
        } finally {
            setDeletingId(null)
        }
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="animate-spin text-3xl mb-2">⚙️</div>
                    <p className="text-sm text-neutral-500 dark:text-gray-400">Loading documents...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                <button
                    onClick={fetchDocuments}
                    className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                >
                    Try again
                </button>
            </div>
        )
    }

    if (documents.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-5xl mb-3">📚</div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">No documents yet</p>
                <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">
                    Upload a PDF to get started
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Uploaded Documents ({documents.length})
                </h3>
                <button
                    onClick={fetchDocuments}
                    className="text-xs text-neutral-600 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                    Refresh
                </button>
            </div>

            <div className="space-y-2">
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg p-3 hover:border-neutral-300 dark:hover:border-gray-600 transition-all group"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                                <div className="text-2xl flex-shrink-0">📄</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                        {doc.original_filename}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-1 text-xs text-neutral-500 dark:text-gray-400">
                                        <span>{doc.page_count} pages</span>
                                        <span>•</span>
                                        <span>{formatFileSize(doc.file_size)}</span>
                                        <span>•</span>
                                        <span>{formatDate(doc.upload_date)}</span>
                                    </div>
                                    {doc.title && doc.title !== 'Unknown' && (
                                        <p className="text-xs text-neutral-600 dark:text-gray-400 mt-1 italic truncate">
                                            {doc.title}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => handleDelete(doc.id)}
                                disabled={deletingId === doc.id}
                                className="ml-2 text-neutral-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                title="Delete document"
                            >
                                {deletingId === doc.id ? (
                                    <span className="text-sm">⏳</span>
                                ) : (
                                    <span className="text-sm">🗑️</span>
                                )}
                            </button>
                        </div>

                        {doc.text_extracted && (
                            <div className="mt-2 flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                                <span>✓</span>
                                <span>Text extracted</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
