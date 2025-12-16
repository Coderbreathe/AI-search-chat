"use client";

import { motion } from "framer-motion";
import { Info, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";

interface InfoCardProps {
    title: string;
    value: string | number;
    icon?: "info" | "alert" | "success" | "trend";
    color?: "blue" | "red" | "green" | "purple";
}

const iconMap = {
    info: Info,
    alert: AlertCircle,
    success: CheckCircle,
    trend: TrendingUp,
};

const colorMap = {
    blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        iconBg: "bg-blue-100",
    },
    red: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        iconBg: "bg-red-100",
    },
    green: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        iconBg: "bg-green-100",
    },
    purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-700",
        iconBg: "bg-purple-100",
    },
};

export default function InfoCard({
    title,
    value,
    icon = "info",
    color = "blue",
}: InfoCardProps) {
    const Icon = iconMap[icon];
    const colors = colorMap[color];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`${colors.bg} ${colors.border} border rounded-lg p-4 shadow-sm`}
        >
            <div className="flex items-start space-x-3">
                <div className={`${colors.iconBg} p-2 rounded-lg flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">{title}</h4>
                    <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
                </div>
            </div>
        </motion.div>
    );
}
