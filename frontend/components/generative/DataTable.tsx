"use client";

import { motion } from "framer-motion";

interface DataTableProps {
    headers: string[];
    rows: string[][];
}

export default function DataTable({ headers, rows }: DataTableProps) {
    if (!headers || !rows || rows.length === 0) {
        return <div className="text-gray-500 text-sm">No data available</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
        >
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-primary-50 to-blue-50 border-b border-gray-200">
                        <tr>
                            {headers.map((header, index) => (
                                <th
                                    key={index}
                                    className="px-4 py-3 text-left font-semibold text-gray-700"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <motion.tr
                                key={rowIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: rowIndex * 0.05, duration: 0.3 }}
                                className={`
                  border-b border-gray-100 last:border-b-0
                  ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  hover:bg-primary-50 transition-colors
                `}
                            >
                                {row.map((cell, cellIndex) => (
                                    <td
                                        key={cellIndex}
                                        className="px-4 py-3 text-gray-700"
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
