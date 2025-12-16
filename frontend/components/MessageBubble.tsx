'use client'

import { Message, Source } from '@/types'
import { formatTimestamp } from '@/lib/utils'
import { SourceCard } from './SourceCard'
import { CitationBadge } from './CitationBadge'
import ToolCallIndicator from './ToolCallIndicator'
import ComponentRenderer from './generative/ComponentRenderer'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message, onCitationClick }: MessageBubbleProps & { onCitationClick?: (source: Source) => void }) {
  const isUser = message.role === 'user'

  // Helper to parse content with citations
  const renderContent = (content: string, sources: Source[] = []) => {
    // Regex to match [1], [2], etc.
    const parts = content.split(/(\[\d+\])/g)

    return parts.map((part, i) => {
      const match = part.match(/\[(\d+)\]/)
      if (match) {
        const id = parseInt(match[1])
        const source = sources.find(s => s.id === id)
        return <CitationBadge key={i} id={id} source={source} onClick={onCitationClick} />
      }
      return <span key={i}>{part}</span>
    })
  }

  if (isUser) {
    return (
      <div className="flex items-start justify-end space-x-3">
        <div className="flex-1 flex justify-end">
          <div className="max-w-2xl">
            <div className="bg-primary-600 dark:bg-primary-700 text-white rounded-2xl px-4 py-3 shadow-sm">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
            <div className="flex justify-end mt-1 px-2">
              <span className="text-xs text-neutral-500 dark:text-gray-400">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-medium">You</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start space-x-3 group">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 mt-1">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="flex-1 max-w-none min-w-0">
        <div className="bg-transparent">
          {/* Tool Calls Section */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mb-4">
              {message.toolCalls.map((toolCall, index) => (
                <ToolCallIndicator
                  key={`${toolCall.name}-${index}`}
                  name={toolCall.name}
                  status={toolCall.status}
                />
              ))}
            </div>
          )}

          {/* Generative Components Section */}
          {message.components && message.components.length > 0 && (
            <div className="mb-4 space-y-3">
              {message.components.map((component, index) => (
                <ComponentRenderer
                  key={`${component.name}-${index}`}
                  name={component.name}
                  props={component.props}
                />
              ))}
            </div>
          )}

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-[15px] leading-relaxed text-neutral-900 dark:text-gray-100 whitespace-pre-wrap break-words m-0">
              {renderContent(message.content, message.sources)}
              {message.isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-primary-600 dark:bg-primary-500 animate-pulse"></span>
              )}
            </p>
          </div>

          {/* Sources Section */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Sources</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {message.sources.map((source) => (
                  <SourceCard key={source.id} source={source} onClick={onCitationClick} />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-start mt-1 px-2">
          <span className="text-xs text-neutral-500">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  )
}