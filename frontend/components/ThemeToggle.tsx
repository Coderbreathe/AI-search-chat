"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/ThemeProvider";

export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent rendering until mounted to avoid hydration mismatch
    if (!mounted) {
        return (
            <div className="p-2 rounded-lg w-9 h-9" aria-label="Loading theme toggle">
                {/* Placeholder to prevent layout shift */}
            </div>
        );
    }

    try {
        const { theme, toggleTheme } = useTheme();

        return (
            <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === "light" ? (
                    <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                    <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
            </button>
        );
    } catch (error) {
        // Fallback if ThemeProvider is not available
        return null;
    }
}
