"use client";

import { motion } from "framer-motion";

export default function SkeletonMessage() {
    return (
        <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
            <div className="flex-1 max-w-2xl min-w-0">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-neutral-200">
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                    </div>
                </div>
            </div>
        </div>
    );
}
