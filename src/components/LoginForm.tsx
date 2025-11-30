// components/LoginForm.tsx
"use client";

import { useState } from "react";
import { useTheme } from "@/components/themes/ThemeContext";
import { useAuth } from "@/hooks/loginHooks/useAuth";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2 } from "lucide-react"; // Importing icons for better input fields

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error: authError, isLoading: authLoading } = useAuth();
  const [localError, setLocalError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  const { theme } = useTheme();
  const router = useRouter();

  // --- Theme Classes ---
  const isDark = theme === "dark";
  const textColor = isDark ? "text-gray-50" : "text-gray-900";
  const cardBg = isDark
    ? "bg-gray-800/80 backdrop-blur-md"
    : "bg-white/90 backdrop-blur-md";
  const inputBg = isDark ? "bg-gray-700/50" : "bg-gray-50";
  const placeholderColor = isDark
    ? "placeholder-gray-400"
    : "placeholder-gray-500";

  // Combine loading states
  const loading = authLoading || localLoading;
  const error = authError || localError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Only proceed if not already loading
    if (loading) return;

    setLocalLoading(true);
    setLocalError("");

    try {
      const success = await login(email, password);

      if (success) {
        router.push("/");
      } else {
        // Use authError from hook, or a default message
        setLocalError(
          authError || "Login failed. Please check your credentials.",
        );
      }
    } catch (err) {
      console.error(err);
      setLocalError("A network error occurred. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 antialiased duration-500">
      {/* Login Card */}
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-md ${cardBg} shadow-2xl ${isDark ? "shadow-indigo-900/20" : "shadow-gray-400/30"} 
                    rounded-3xl p-8 md:p-10 space-y-8 transition-all duration-500 
                    hover:shadow-3xl transform hover:scale-[1.01] border ${isDark ? "border-gray-700" : "border-gray-200"}`}
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <h2
            className={`text-3xl md:text-4xl font-extrabold ${textColor} tracking-tight`}
          >
            Portal Login
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Access your personalized dashboard.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-xl flex items-center justify-center space-x-2 animate-pulse">
            <Lock className="w-5 h-5" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Input Fields */}
        <div className="flex flex-col space-y-5">
          {/* Email Input */}
          <div className="relative">
            <label
              htmlFor="email"
              className={`block ${textColor} font-semibold text-sm mb-2`}
            >
              Email Address
            </label>
            <div className="flex items-center">
              <Mail
                className={`w-5 h-5 absolute left-4 ${isDark ? "text-indigo-400" : "text-blue-500"}`}
              />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className={`w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl ${inputBg} ${textColor} 
                            ${placeholderColor} focus:outline-none focus:ring-4 focus:ring-opacity-50 
                            focus:ring-blue-500 dark:focus:ring-indigo-500 transition-all duration-300`}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="relative">
            <label
              htmlFor="password"
              className={`block ${textColor} font-semibold text-sm mb-2`}
            >
              Password
            </label>
            <div className="flex items-center">
              <Lock
                className={`w-5 h-5 absolute left-4 ${isDark ? "text-indigo-400" : "text-blue-500"}`}
              />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={`w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl ${inputBg} ${textColor} 
                            ${placeholderColor} focus:outline-none focus:ring-4 focus:ring-opacity-50 
                            focus:ring-blue-500 dark:focus:ring-indigo-500 transition-all duration-300`}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 flex items-center justify-center space-x-2 
                    bg-gradient-to-r from-blue-600 to-indigo-700 
                    hover:from-indigo-700 hover:to-blue-600 
                    text-white font-extrabold text-lg rounded-xl shadow-lg 
                    ${isDark ? "shadow-indigo-500/40" : "shadow-blue-500/50"}
                    transition-all duration-300 transform hover:scale-[1.02] 
                    disabled:opacity-60 disabled:shadow-none disabled:cursor-not-allowed`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Secure Login</span>
          )}
        </button>

        {/* Footer Link */}
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
          Don’t have an account?
          <a
            href="/register"
            className="text-blue-500 hover:text-blue-400 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium ml-1 
                       transition-colors duration-200 hover:underline"
          >
            Create one
          </a>
        </p>
      </form>
    </div>
  );
}
