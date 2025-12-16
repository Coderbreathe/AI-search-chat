"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from "react-pdf";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search } from "lucide-react";

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type LayoutMode = 'chat-only' | 'split-view' | 'pdf-only';

interface PDFViewerProps {
    url: string | null;
    initialPage?: number;
    highlightText?: string | null;
    isOpen: boolean;
    onClose: () => void;
    layoutMode: LayoutMode;
}

export default function PDFViewer({
    url,
    initialPage = 1,
    highlightText,
    isOpen,
    onClose,
    layoutMode,
}: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(initialPage);
    const [scale, setScale] = useState(1.0);
    const [searchText, setSearchText] = useState("");
    const [showSearch, setShowSearch] = useState(false);

    // Reset page number when url or initialPage changes
    useEffect(() => {
        setPageNumber(initialPage);
    }, [url, initialPage]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    // Animation variants
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    const panelVariants = {
        hidden: {
            x: '100%',
            opacity: 0,
            scale: 0.95
        },
        visible: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
                duration: 0.3
            }
        },
        exit: {
            x: '100%',
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.25,
                ease: 'easeInOut'
            }
        }
    };

    const isMobileOverlay = layoutMode === 'pdf-only';
    const isSplitView = layoutMode === 'split-view';

    return (
        <AnimatePresence>
            {isOpen && url && (
                <>
                    {/* Backdrop for mobile overlay */}
                    {isMobileOverlay && (
                        <motion.div
                            className="fixed inset-0 bg-black bg-opacity-50 z-40"
                            variants={overlayVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={onClose}
                        />
                    )}

                    {/* PDF Viewer Panel */}
                    <motion.div
                        className={`
              ${isMobileOverlay ? 'fixed inset-0 z-50' : 'relative'}
              ${isSplitView ? 'w-[40%]' : 'w-full'}
              flex flex-col bg-gray-900 shadow-2xl
            `}
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between bg-gray-800 p-4 shadow-md text-white flex-shrink-0">
                            <div className="flex items-center space-x-4">
                                <h2 className="text-lg font-semibold text-gray-100">PDF Viewer</h2>
                                <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-2 py-1">
                                    <button
                                        onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                                        disabled={pageNumber <= 1}
                                        className="p-1 hover:bg-gray-600 rounded disabled:opacity-50 transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm">
                                        Page {pageNumber} of {numPages || "--"}
                                    </span>
                                    <button
                                        onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages || 1))}
                                        disabled={pageNumber >= (numPages || 1)}
                                        className="p-1 hover:bg-gray-600 rounded disabled:opacity-50 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-2 py-1">
                                    <button
                                        onClick={() => setScale((prev) => Math.max(prev - 0.2, 0.5))}
                                        className="p-1 hover:bg-gray-600 rounded transition-colors"
                                    >
                                        <ZoomOut className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                                    <button
                                        onClick={() => setScale((prev) => Math.min(prev + 0.2, 3.0))}
                                        className="p-1 hover:bg-gray-600 rounded transition-colors"
                                    >
                                        <ZoomIn className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowSearch(!showSearch)}
                                    className="p-2 hover:bg-gray-700 rounded transition-colors"
                                    aria-label="Search PDF"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-700 rounded transition-colors"
                                    aria-label="Close PDF viewer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        {showSearch && (
                            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                                <input
                                    type="text"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    placeholder="Search in PDF..."
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-auto p-4 flex justify-center bg-gray-900">
                            <div className="bg-white shadow-xl">
                                <Document
                                    file={url}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    loading={
                                        <div className="flex items-center justify-center p-10 text-white">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                        </div>
                                    }
                                    error={
                                        <div className="p-10 text-red-500 bg-white">
                                            Failed to load PDF.
                                        </div>
                                    }
                                >
                                    <Page
                                        pageNumber={pageNumber}
                                        scale={scale}
                                        renderTextLayer={true}
                                        renderAnnotationLayer={true}
                                        customTextRenderer={({ str, itemIndex }) => {
                                            // Very basic checking for highlighting
                                            if (highlightText && str.toLowerCase().includes(highlightText.toLowerCase())) {
                                                return `<mark class="bg-yellow-200 text-transparent bg-opacity-50">${str}</mark>`;
                                            }
                                            return str;
                                        }}
                                    />
                                </Document>
                            </div>
                        </div>

                        {/* Styles for react-pdf */}
                        <style jsx global>{`
              .react-pdf__Page__canvas {
                margin: 0 auto;
              }
              .react-pdf__Page__textContent {
                user-select: text;
              }
            `}</style>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
