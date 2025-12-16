/**
 * Custom hook for streaming chat with SSE using fetch
 */
import { useState, useCallback, useRef } from 'react'
import { API_BASE_URL } from './api'
import { Message, Source } from '../types'

interface UseStreamingChatReturn {
    messages: Message[]
    isStreaming: boolean
    error: string | null
    sendMessage: (content: string) => Promise<void>
    clearMessages: () => void
}

export function useStreamingChat(): UseStreamingChatReturn {
    const [messages, setMessages] = useState<Message[]>([])
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    const sendMessage = useCallback(async (content: string) => {
        // Add user message
        const userMessage: Message = {
            id: `msg_${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setError(null)
        setIsStreaming(true)

        // Create assistant message placeholder
        const assistantMessageId = `msg_${Date.now() + 1}`

        const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isStreaming: true,
            sources: []
        }

        setMessages((prev) => [...prev, assistantMessage])

        try {
            // Create abort controller for cancellation
            const abortController = new AbortController()
            abortControllerRef.current = abortController

            // Make POST request with streaming
            const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: content,
                    use_context: true, // Enable context for RAG
                }),
                signal: abortController.signal,
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) {
                throw new Error('No response body')
            }

            // Read the stream
            while (true) {
                const { done, value } = await reader.read()

                if (done) {
                    break
                }

                // Decode the chunk
                const chunk = decoder.decode(value, { stream: true })

                // Split by newlines to handle multiple SSE events
                // Note: This basic splitting assumes one JSON object per line which is standard for SSE generally
                // but robust SSE parsing handles 'data: ' prefix more carefully across chunks.
                // For simplicity we split on newlines and look for 'data: '
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonData = line.substring(6) // Remove 'data: ' prefix
                            const data = JSON.parse(jsonData)

                            if (data.type === 'text') {
                                // Append text chunk to the current message
                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === assistantMessageId
                                            ? { ...msg, content: msg.content + data.content }
                                            : msg
                                    )
                                )
                            } else if (data.type === 'tool_call') {
                                // Handle tool call events
                                setMessages((prev) =>
                                    prev.map((msg) => {
                                        if (msg.id === assistantMessageId) {
                                            const toolCalls = msg.toolCalls || []
                                            const existingIndex = toolCalls.findIndex(tc => tc.name === data.name)

                                            if (existingIndex >= 0) {
                                                // Update existing tool call status
                                                const updatedToolCalls = [...toolCalls]
                                                updatedToolCalls[existingIndex] = {
                                                    name: data.name,
                                                    status: data.status
                                                }
                                                return { ...msg, toolCalls: updatedToolCalls }
                                            } else {
                                                // Add new tool call
                                                return {
                                                    ...msg,
                                                    toolCalls: [...toolCalls, { name: data.name, status: data.status }]
                                                }
                                            }
                                        }
                                        return msg
                                    })
                                )
                            } else if (data.type === 'component') {
                                // Handle component events
                                setMessages((prev) =>
                                    prev.map((msg) => {
                                        if (msg.id === assistantMessageId) {
                                            const components = msg.components || []
                                            return {
                                                ...msg,
                                                components: [...components, { name: data.name, props: data.props }]
                                            }
                                        }
                                        return msg
                                    })
                                )
                            } else if (data.type === 'sources') {
                                // Add sources to the current message
                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === assistantMessageId
                                            ? { ...msg, sources: data.content }
                                            : msg
                                    )
                                )
                            } else if (data.type === 'done') {
                                // Stream complete
                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === assistantMessageId
                                            ? { ...msg, isStreaming: false }
                                            : msg
                                    )
                                )
                                setIsStreaming(false)
                                abortControllerRef.current = null
                                return
                            } else if (data.type === 'error') {
                                setError(data.content)
                                setIsStreaming(false)
                                abortControllerRef.current = null
                                return
                            }
                        } catch (parseErr) {
                            console.error('Error parsing SSE data:', parseErr)
                        }
                    }
                }
            }

            setIsStreaming(false)
            abortControllerRef.current = null

        } catch (err) {
            console.error('Error in streaming:', err)
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err.message || 'Failed to connect')
            }
            setIsStreaming(false)
            abortControllerRef.current = null
        }
    }, [])

    const clearMessages = useCallback(() => {
        setMessages([])
        setError(null)
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
    }, [])

    return {
        messages,
        isStreaming,
        error,
        sendMessage,
        clearMessages,
    }
}
