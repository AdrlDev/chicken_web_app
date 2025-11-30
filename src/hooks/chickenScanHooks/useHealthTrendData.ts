/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
// hooks/chickenScanHooks/useHealthTrendData.ts

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { api } from "@/utils/apiClient"; // 👈 Use the token-aware client

// ----------------------------------------------------
// 1. Define Data Types
// ----------------------------------------------------

/**
 * Interface for the raw data received from the API for a single day.
 * We assume the backend is adjusted to provide this structure for trend data.
 */
interface RawTrendData {
  date: string; // e.g., '2025-11-25'
  healthy_count: number;
  issue_count: number;
}

/**
 * Interface for the formatted data used by the Recharts component.
 */
export interface ChartDataPoint {
  name: string; // Day of the week (e.g., 'Mon', 'Tue')
  "Healthy Scans": number;
  "Detected Issues": number;
}

// ----------------------------------------------------
// 2. Define the Hook
// ----------------------------------------------------

export const useHealthTrendData = (days: number = 7) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Helper function to format the date string into a readable day name.
   * @param dateString - Date string (e.g., '2025-11-25')
   */
  const formatDateToDay = (dateString: string): string => {
    // Note: To correctly display the weekday, you often need to adjust for time zone
    // issues when constructing the Date object from a simple YYYY-MM-DD string.
    // For simplicity, we use the standard Date constructor here.
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    // Use 'en-US' locale for 'Mon', 'Tue', etc.
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const fetchTrendData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 🚀 DYNAMIC FIX: Use the authorized 'api' instance
      // Assuming your backend exposes an endpoint for time-series data.
      // E.g., /scans/trend?days=7
      const response = await api.get<RawTrendData[]>(
        `/scans/trend?days=${days}`,
      );

      const rawData = response.data;

      // Transform the API data into the format Recharts expects
      const formattedData: ChartDataPoint[] = rawData.map((item) => ({
        name: formatDateToDay(item.date),
        "Healthy Scans": item.healthy_count,
        "Detected Issues": item.issue_count,
      }));

      setData(formattedData);
    } catch (err: unknown) {
      let detail = "Failed to load health trend data.";
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        detail = "Authentication required. Please log in.";
      } else if (axios.isAxiosError(err)) {
        detail = err.response?.data?.detail || detail;
      }

      console.error("Failed to fetch health trend data:", err);
      setError(detail);
      setData([]); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  }, [days]); // Dependency 'days' is correct

  // Initial data fetch
  useEffect(() => {
    fetchTrendData();
  }, [fetchTrendData]);

  // Public function to trigger a data refresh
  const refreshData = useCallback(() => {
    fetchTrendData();
  }, [fetchTrendData]);

  return {
    data,
    isLoading,
    error,
    refreshData,
  };
};
