"use client";

import { ComponentType } from "react";
import Chart from "./Chart";
import DataTable from "./DataTable";
import InfoCard from "./InfoCard";

// Component registry mapping component names to actual components
const componentRegistry: Record<string, ComponentType<any>> = {
    chart: Chart,
    table: DataTable,
    card: InfoCard,
};

interface ComponentRendererProps {
    name: string;
    props: Record<string, any>;
}

export default function ComponentRenderer({ name, props }: ComponentRendererProps) {
    const Component = componentRegistry[name];

    if (!Component) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <strong>Error:</strong> Unknown component "{name}"
            </div>
        );
    }

    try {
        return <Component {...props} />;
    } catch (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <strong>Error rendering component:</strong> {error instanceof Error ? error.message : "Unknown error"}
            </div>
        );
    }
}
