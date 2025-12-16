"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);

        // Set initial value
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        // Create listener
        const listener = () => setMatches(media.matches);

        // Add listener
        media.addEventListener("change", listener);

        // Cleanup
        return () => media.removeEventListener("change", listener);
    }, [matches, query]);

    return matches;
}

// Convenience hooks for common breakpoints
export function useIsMobile() {
    return useMediaQuery("(max-width: 768px)");
}

export function useIsTablet() {
    return useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
}

export function useIsDesktop() {
    return useMediaQuery("(min-width: 1025px)");
}
