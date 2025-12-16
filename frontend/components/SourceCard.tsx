import { Source } from '../types'
import { FileText } from 'lucide-react'

interface SourceCardProps {
    source: Source
    onClick?: (source: Source) => void
}

export function SourceCard({ source, onClick }: SourceCardProps) {
    return (
        <div
            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer text-left w-64 flex-shrink-0"
            onClick={() => onClick?.(source)}
        >
            <div className="flex items-start gap-2 mb-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex-shrink-0">
                    {source.id}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate" title={source.filename}>
                        {source.filename}
                    </h4>
                    <p className="text-xs text-gray-500">Page {source.page}</p>
                </div>
            </div>
            <p className="text-xs text-gray-600 line-clamp-3">
                "{source.text}"
            </p>
        </div>
    )
}
