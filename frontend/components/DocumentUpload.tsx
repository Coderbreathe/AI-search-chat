'use client'

import { useCallback, useState } from 'react'
import { uploadDocument } from '@/lib/api'
import type { UploadProgress } from '@/types'

interface DocumentUploadProps {
    onUploadComplete?: () => void
}

export default function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)

    const handleFileUpload = async (file: File) => {
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            alert('Only PDF files are allowed')
            return
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB')
            return
        }

        setUploadProgress({
            file,
            progress: 0,
            status: 'uploading',
        })

        try {
            // Simulate upload progress
            setUploadProgress(prev => prev ? { ...prev, progress: 30 } : null)

            await uploadDocument(file)

            setUploadProgress(prev => prev ? { ...prev, progress: 100, status: 'complete' } : null)

            // Clear progress after a delay
            setTimeout(() => {
                setUploadProgress(null)
                onUploadComplete?.()
            }, 1500)

        } catch (error) {
            setUploadProgress(prev => prev ? {
                ...prev,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed'
            } : null)

            setTimeout(() => {
                setUploadProgress(null)
            }, 3000)
        }
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            handleFileUpload(files[0])
        }
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFileUpload(files[0])
        }
    }

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragging
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-300 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800 hover:border-neutral-400 dark:hover:border-gray-600'
                    }
          ${uploadProgress ? 'opacity-50 pointer-events-none' : ''}
        `}
            >
                <div className="space-y-3">
                    <div className="text-4xl">📄</div>
                    <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            Drop PDF file here or click to browse
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">
                            Maximum file size: 10MB
                        </p>
                    </div>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                        disabled={!!uploadProgress}
                    />
                    <label
                        htmlFor="file-upload"
                        className="inline-block px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 cursor-pointer transition-colors"
                    >
                        Select File
                    </label>
                </div>
            </div>

            {/* Upload Progress */}
            {uploadProgress && (
                <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="text-2xl">
                                {uploadProgress.status === 'complete' && '✅'}
                                {uploadProgress.status === 'error' && '❌'}
                                {uploadProgress.status === 'uploading' && '📤'}
                                {uploadProgress.status === 'processing' && '⚙️'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                    {uploadProgress.file.name}
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-gray-400">
                                    {uploadProgress.status === 'uploading' && 'Uploading...'}
                                    {uploadProgress.status === 'processing' && 'Processing...'}
                                    {uploadProgress.status === 'complete' && 'Upload complete!'}
                                    {uploadProgress.status === 'error' && uploadProgress.error}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {uploadProgress.status !== 'error' && (
                        <div className="w-full bg-neutral-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-primary-600 dark:bg-primary-500 h-2 transition-all duration-300 rounded-full"
                                style={{ width: `${uploadProgress.progress}%` }}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
