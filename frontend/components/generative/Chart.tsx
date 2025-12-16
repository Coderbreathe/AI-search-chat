"use client";

import { motion } from "framer-motion";

interface ChartDataPoint {
    label: string;
    value: number;
}

interface ChartProps {
    data: ChartDataPoint[];
    title?: string;
    chartType?: "bar" | "line";
}

export default function Chart({ data, title, chartType = "bar" }: ChartProps) {
    if (!data || data.length === 0) {
        return <div className="text-gray-500 text-sm">No data available</div>;
    }

    const maxValue = Math.max(...data.map(d => d.value));
    const chartHeight = 200;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-4 border border-primary-200 shadow-sm"
        >
            {title && (
                <h3 className="text-sm font-semibold text-gray-800 mb-3">{title}</h3>
            )}

            <div className="relative" style={{ height: chartHeight + 40 }}>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-10 flex flex-col justify-between text-xs text-gray-500 w-12">
                    <span>{maxValue}</span>
                    <span>{Math.round(maxValue / 2)}</span>
                    <span>0</span>
                </div>

                {/* Chart area */}
                <div className="absolute left-14 right-0 top-0 bottom-10 flex items-end justify-around gap-2">
                    {data.map((point, index) => {
                        const heightPercent = (point.value / maxValue) * 100;

                        return (
                            <motion.div
                                key={index}
                                className="flex flex-col items-center flex-1 max-w-[80px]"
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                            >
                                <div className="w-full flex items-end justify-center relative" style={{ height: chartHeight }}>
                                    {chartType === "bar" ? (
                                        <div
                                            className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t hover:from-primary-700 hover:to-primary-500 transition-colors cursor-pointer relative group"
                                            style={{ height: `${heightPercent}%` }}
                                        >
                                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                                {point.value}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full relative">
                                            <div
                                                className="absolute bottom-0 left-1/2 w-3 h-3 bg-primary-600 rounded-full transform -translate-x-1/2"
                                                style={{ bottom: `${heightPercent}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-gray-600 mt-2 text-center truncate w-full">
                                    {point.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>

                {/* X-axis */}
                <div className="absolute left-14 right-0 bottom-0 h-px bg-gray-300" />
            </div>
        </motion.div>
    );
}
