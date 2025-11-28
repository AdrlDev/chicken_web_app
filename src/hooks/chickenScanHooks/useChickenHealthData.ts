/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
// hooks/useChickenHealthData.ts

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { api } from '@/utils/apiClient'; // 👈 Use the token-aware client

// --- Domain Types (Adjust path as necessary) ---
interface ScanData {
  name: string;
  value: number;
  [key: string]: any;
}

interface FetchState {
  data: ScanData[];
  isLoading: boolean;
  error: string | null;
  totalScans: number;
  refreshData: () => void;
}

export const useChickenHealthData = (): FetchState => {
  const [state, setState] = useState<Omit<FetchState, 'refreshData'>>({
    data: [],
    isLoading: true,
    error: null,
    totalScans: 0,
  });
  
  // State trigger for manual data refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // GET request using the authorized 'api' instance
      // The backend filters this data by the authenticated user's ID
      const response = await api.get<{ diagnosis: string; value: number }[]>('/scans/counts');
      
      const rawData = response.data;
      
      // Format data for the Recharts component
      const formattedData: ScanData[] = rawData.map(item => ({
        name: item.diagnosis, 
        value: item.value,    
      }));

      const total = formattedData.reduce((sum, item) => sum + item.value, 0);

      setState({
        data: formattedData,
        isLoading: false,
        error: null,
        totalScans: total,
      });

    } catch (err: unknown) {
      let detail = 'Failed to load scan data.';
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        detail = 'Authentication required. Please log in.';
      } else if (axios.isAxiosError(err)) {
         detail = err.response?.data?.detail || detail;
      }
      
      console.error("Failed to fetch chicken health data:", err);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: detail,
      }));
    }
  }, [refreshTrigger]); // Intentional dependency for manual refresh

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Public function to trigger a data refresh
  const refreshData = useCallback(() => {
      setRefreshTrigger(prev => prev + 1);
  }, []);

  return { ...state, refreshData };
};