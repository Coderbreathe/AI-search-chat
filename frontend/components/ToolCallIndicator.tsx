"use client";

import { motion } from "framer-motion";
import { Search, FileText, Brain, Sparkles, Check } from "lucide-react";

export type ToolCallStatus = "in_progress" | "complete";

export interface ToolCallProps {
    name: string;
    status: ToolCallStatus;
}

const toolIcons = {
    searching_documents: Search,
    retrieving_pdf: FileText,
    analyzing_content: Brain,
    generating_response: Sparkles,
};

const toolLabels = {
    searching_documents: "Searching documents",
    retrieving_pdf: "Reading PDF",
    analyzing_content: "Analyzing content",
    generating_response: "Generating response",
};

export default function ToolCallIndicator({ name, status }: ToolCallProps) {
    const Icon = toolIcons[name as keyof typeof toolIcons] || Search;
    const label = toolLabels[name as keyof typeof toolLabels] || name;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-2 text-sm mb-2"
        >
            <div className={`
        flex items-center space-x-2 px-3 py-1.5 rounded-lg
        ${status === "in_progress"
                    ? "bg-primary-50 text-primary-700 border border-primary-200"
                    : "bg-green-50 text-green-700 border border-green-200"}
      `}>
                {status === "in_progress" ? (
                    <>
                        <Icon className="w-4 h-4 animate-pulse" />
                        <span className="font-medium">{label}...</span>
                    </>
                ) : (
                    <>
                        <Check className="w-4 h-4" />
                        <span className="font-medium">{label}</span>
                    </>
                )}
            </div>
        </motion.div>
    );
}
