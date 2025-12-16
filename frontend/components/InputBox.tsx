'use client'

import { useState, useRef, KeyboardEvent, useEffect } from 'react'
import { Send } from 'lucide-react'

interface InputBoxProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function InputBox({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
}: InputBoxProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSend = () => {
    const trimmedInput = input.trim()
    if (trimmedInput && !disabled) {
      onSend(trimmedInput)
      setInput('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-neutral-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="w-full px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full pl-5 pr-24 py-4 text-[15px] bg-neutral-50 dark:bg-gray-900 border border-neutral-200 dark:border-gray-800 text-neutral-900 dark:text-gray-100 placeholder:text-neutral-400 dark:placeholder:text-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed scrollbar-thin max-h-40"
              style={{ minHeight: '60px' }}
            />
            {/* Send button inside input */}
            <div className="absolute right-3 bottom-3 flex items-center space-x-2">
              <button
                onClick={handleSend}
                disabled={disabled || !input.trim()}
                className="w-9 h-9 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 active:bg-primary-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}