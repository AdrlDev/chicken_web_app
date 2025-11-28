// hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { UserOut, AuthHook, TokenResponse } from '@/domain/types/auth'; // Adjust path as necessary

// --- Configuration ---
// const API_BASE_URL: string = '/api';
const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aedev.cloud/chickenapi/v1';
const TOKEN_KEY: string = 'authToken';

// --- Axios Instance for Authorized API Calls ---
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useAuth = (): AuthHook => {
  const [user, setUser] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- 3. Check Auth Status (Protected Route Call) ---
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      // Expect UserOut response from /auth/me
      const response = await api.get<UserOut>('/auth/me');
      setUser(response.data);
      setError(null);
    } catch (err: unknown) {
      // Handle expired/invalid token
      console.error('Auth check failed. Token removed.', err);
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- 1. Login Function ---
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      // Expect TokenResponse from /auth/login
      const response = await api.post<TokenResponse>('/auth/login', { email, password });
      const { access_token } = response.data;
      
      localStorage.setItem(TOKEN_KEY, access_token);
      
      // Fetch user details immediately after login
      await checkAuthStatus();
      
      return true;
    } catch (err: unknown) {
      // Use AxiosError for proper error handling
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail || 'Login failed';
        setError(detail);
      } else {
        setError('An unknown login error occurred.');
      }
      return false;
    }
  }, [checkAuthStatus]);

  // --- 2. Register Function ---
  const register = useCallback(async (email: string, password: string, accountType: string = 'admin'): Promise<UserOut | null> => {
    setError(null);
    try {
      const response = await api.post<UserOut>('/auth/register', { email, password, accountType });
      
      // Automatically log in the user after successful registration
      const loggedIn = await login(email, password); 
      
      if (loggedIn) {
        return response.data; // Return registration response (UserOut)
      }
      return null;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail || 'Registration failed';
        setError(detail);
        throw new Error(detail);
      }
      setError('An unknown registration error occurred.');
      throw new Error('An unknown registration error occurred.');
    }
  }, [login]);

  // --- Logout Function ---
  const logout = useCallback((): void => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // Run once on component mount to check for an existing token
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
  };
};