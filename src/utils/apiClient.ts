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
  // 💡 FIX: Ensure the header is set only if the token exists, and use standard capitalization
  if (token) {
    // CRITICAL: Ensure 'Authorization' is correctly capitalized and the format is 'Bearer <token>'
    config.headers.Authorization = `Bearer ${token}`; 
  } else {
    // 💡 GOOD PRACTICE: Explicitly delete the header if no token is present
    delete config.headers.Authorization;
  }
  return config;
}, error => {
  return Promise.reject(error);
});