// components/LoginForm.tsx
"use client";

import { useState } from "react";
import { useTheme } from "@/components/themes/ThemeContext";
import { useAuth } from "@/hooks/loginHooks/useAuth"; // <-- Import your custom hook
import { useRouter } from "next/navigation"; // <-- Import router for redirection


export default function LoginForm() { // Removed props
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error: authError, isLoading: authLoading } = useAuth(); // Use state from useAuth
  const [localError, setLocalError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  
  const { theme } = useTheme();
  const router = useRouter();

  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const formColor = theme === "dark" ? "bg-gray-700" : "bg-gray-100";
  
  // Combine loading states
  const loading = authLoading || localLoading;
  const error = authError || localError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setLocalError("");

    try {
      // 1. Call the login function from useAuth
      const success = await login(email, password);

      if (success) {
        // 2. Redirect to dashboard immediately on success
        router.push("/");
      } else {
        // The error is already set in the useAuth hook (authError)
        setLocalError(authError || "Login failed due to unknown error.");
      }
    } catch (err) {
      console.error(err);
      setLocalError("Something went wrong with the network.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center dark:from-gray-900 dark:to-gray-800 p-4">
      <form 
        onSubmit={handleSubmit} 
        className={`w-full max-w-md ${formColor} shadow-lg rounded-2xl p-8 space-y-6 transition-colors duration-300`}
      >
        <h2 className={`text-2xl md:text-3xl font-bold text-center ${textColor}`}>Welcome Back</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="flex flex-col space-y-4">
          <div>
            <label htmlFor="email" className={`block ${textColor} font-medium mb-1`}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-400 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className={`block ${textColor} font-medium mb-1`}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-400 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-500 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
          Don’t have an account? <a href="/register" className="text-blue-500 hover:underline dark:text-indigo-400">Sign Up</a>
        </p>
      </form>
    </div>
  );
}