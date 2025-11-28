// hooks/useScanInsertion.ts

import { useState, useCallback } from 'react';
import axios from 'axios';
import { api } from '@/utils/apiClient'; // 👈 Use the token-aware client

// --- Domain Types (Adjust path as necessary) ---
interface ScanPayload {
  diagnosis: string;
}

interface ScanResponse {
  id: number;
  diagnosis: string;
  farm_id: number;
  timestamp: string;
}

interface InsertionState {
  isPosting: boolean;
  postError: string | null;
  postSuccess: boolean;
}

export const useScanInsertion = () => {
  const [state, setState] = useState<InsertionState>({
    isPosting: false,
    postError: null,
    postSuccess: false,
  });

  const insertScan = useCallback(async (payload: ScanPayload): Promise<boolean> => {
    setState({ isPosting: true, postError: null, postSuccess: false });

    try {
      // POST request using the authorized 'api' instance
      // 💡 FIX: The 'payload' sent here now only contains 'diagnosis'.
      const response = await api.post<ScanResponse>('/scans/', payload);

      if (response.status !== 201 && response.status !== 200) {
        throw new Error('Unexpected response status.');
      }

      // Successful insertion
      setState({ isPosting: false, postError: null, postSuccess: true });
      return true;

    } catch (err: unknown) {
      let detail = 'Scan insertion failed.';
      if (axios.isAxiosError(err)) {
        detail = err.response?.data?.detail || detail;
      }
      
      console.error("Scan insertion failed:", err);
      setState({ isPosting: false, postError: detail, postSuccess: false });
      return false;
    }
  }, []); // Dependencies: None, as all logic is internal or imported

  return { ...state, insertScan };
};