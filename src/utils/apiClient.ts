// utils/apiClient.ts (Create this new file)

import axios from 'axios';

// --- Configuration ---
// Adjust the baseURL to match your FastAPI backend, or keep it relative if using a proxy.
const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aedev.cloud/chickenapi/v1';
const TOKEN_KEY: string = 'authToken';

// --- Axios Instance for Authorized API Calls ---
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Injects the Auth Token into every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    // Note: The key in localStorage must match the key used here!
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});