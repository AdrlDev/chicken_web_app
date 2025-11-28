// hooks/useStatCardData.ts
"use client";
import { useChickenHealthData } from "@/hooks/chickenScanHooks/useChickenHealthData"; // Reuse the main data hook

interface StatData {
    totalScans: number;
    healthRate: string; // e.g., "92%"
    isStatsLoading: boolean;
}

export const useStatCardData = (): StatData => {
    const { data, isLoading, totalScans } = useChickenHealthData();

    const calculateHealthRate = () => {
        if (totalScans === 0 || data.length === 0) {
            return "0%";
        }

        const healthyEntry = data.find(item => item.name === "Healthy");
        
        if (!healthyEntry) {
            // If there are scans but none are "Healthy", the rate is 0%.
            return "0%"; 
        }

        // Calculate (Healthy Scans / Total Scans) * 100
        const rate = (healthyEntry.value / totalScans) * 100;
        return `${Math.round(rate)}%`;
    };

    return {
        totalScans,
        healthRate: calculateHealthRate(),
        isStatsLoading: isLoading,
    };
};