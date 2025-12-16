import { Source } from "@/types"

interface CitationBadgeProps {
    id: number
    source?: Source
}

export function CitationBadge({ id, source, onClick }: CitationBadgeProps & { onClick?: (source: Source) => void }) {
    return (
        <span
            className="inline-flex items-center justify-center w-5 h-5 ml-1 -translate-y-1 rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold cursor-pointer hover:bg-primary-200 hover:scale-110 transition-all shadow-sm"
            title={source ? `Source: ${source.filename}, Page ${source.page}` : `Source ${id}`}
            onClick={(e) => {
                e.stopPropagation();
                if (source && onClick) onClick(source);
            }}
        >
            {id}
        </span>
    )
}
