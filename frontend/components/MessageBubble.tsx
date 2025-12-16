'use client'

import { Message, Source } from '@/types'
import { formatTimestamp } from '@/lib/utils'
import { SourceCard } from './SourceCard'
import { CitationBadge } from './CitationBadge'
import ToolCallIndicator from './ToolCallIndicator'
import ComponentRenderer from './generative/ComponentRenderer'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message, onCitationClick }: MessageBubbleProps & { onCitationClick?: (source: Source) => void }) {
  const isUser = message.role === 'user'

  // Helper to preprocess content for citations
  // Converts [1] to brackets with a custom protocol we can intercept: [1](#citation-1)
  const preprocessContent = (content: string) => {
    return content.replace(/\[(\d+)\]/g, '[$1](#citation-$1)')
  }

  // Custom renderer for links to handle citations
  const components = {
    a: ({ href, children, ...props }: any) => {
      if (href?.startsWith('#citation-')) {
        const id = parseInt(href.replace('#citation-', ''))
        const source = message.sources?.find(s => s.id === id)
        return <CitationBadge id={id} source={source} onClick={onCitationClick} />
      }
      return <a href={href} {...props} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{children}</a>
    },
    // Style other elements
    ul: ({ children }: any) => <ul className="list-disc pl-4 mb-4 space-y-1">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal pl-4 mb-4 space-y-1">{children}</ol>,
    li: ({ children }: any) => <li className="mb-1">{children}</li>,
    h1: ({ children }: any) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
    code: ({ inline, className, children, ...props }: any) => {
      if (inline) {
        return <code className="bg-neutral-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm font-mono" {...props}>{children}</code>
      }
      return (
        <code className="block bg-neutral-100 dark:bg-gray-800 rounded-lg p-3 text-sm font-mono overflow-x-auto mb-4" {...props}>
          {children}
        </code>
      )
    },
    table: ({ children }: any) => <div className="overflow-x-auto mb-4"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">{children}</table></div>,
    th: ({ children }: any) => <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">{children}</th>,
    td: ({ children }: any) => <td className="px-3 py-2 whitespace-nowrap text-sm border-t border-gray-100 dark:border-gray-800">{children}</td>,
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
            <div className="text-[15px] leading-relaxed text-neutral-900 dark:text-gray-100 break-words m-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {preprocessContent(message.content) + (message.isStreaming ? ' \u258B' : '')}
              </ReactMarkdown>
            </div>
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