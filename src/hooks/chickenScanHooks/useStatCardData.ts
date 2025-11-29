// hooks/useStatCardData.ts
"use client";
import { useChickenHealthData } from "@/hooks/chickenScanHooks/useChickenHealthData"; // Reuse the main data hook

interface StatData {
    totalScans: number;
    healthRate: string; // e.g., "92%"
    healthRatePercent: number;  // e.g., 92 (for progress bar)
    isStatsLoading: boolean;
}

export const useStatCardData = (): StatData => {
    const { data, isLoading, totalScans } = useChickenHealthData();

    // Variable to hold the raw percentage for the new field
    let rawHealthRate = 0;

    const calculateHealthRate = () => {
        if (totalScans === 0 || data.length === 0) {
            return "0%";
        }

        const healthyEntry = data.find(item => item.name === "healthy");
        
        if (!healthyEntry) {
            // If there are scans but none are "Healthy", the rate is 0%.
            rawHealthRate = 0;
            // If there are scans but none are "Healthy", the rate is 0%.
            return "0%"; 
        }

        // Calculate (Healthy Scans / Total Scans) * 100
        const rate = (healthyEntry.value / totalScans) * 100;

        // Store the rounded number in the external variable
        rawHealthRate = Math.round(rate);

        return `${Math.round(rate)}%`;
    };

    return {
        totalScans,
        healthRate: calculateHealthRate(),
        healthRatePercent: rawHealthRate,
        isStatsLoading: isLoading,
    };
};