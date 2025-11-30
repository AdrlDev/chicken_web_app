/* eslint-disable @typescript-eslint/no-explicit-any */
// components/dashboard/HealthTrendChart.tsx

"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  CartesianGrid,
} from "recharts";
import { useTheme } from "@/components/themes/ThemeContext";
// 🚀 DYNAMIC FIX: Import the hook to fetch real data
import { useHealthTrendData } from "@/hooks/chickenScanHooks/useHealthTrendData";
import LoadingSpinner from "@/components/LoadingSpinner";

// --- REMOVED: Placeholder Data Structure (mockData) ---

const CustomChartTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    const healthy = payload.find((p: any) => p.dataKey === "Healthy Scans");
    const issues = payload.find((p: any) => p.dataKey === "Detected Issues");

    const textColor = theme === "dark" ? "text-white" : "text-slate-900";
    const supTextColor = theme === "dark" ? "text-slate-400" : "text-slate-500";

    return (
      <div
        className={`p-3 rounded-lg shadow-xl backdrop-blur-md border ${theme === "dark" ? "bg-slate-800/80 border-slate-700" : "bg-white/80 border-slate-200"}`}
      >
        <p className={`font-semibold ${supTextColor} text-sm mb-1`}>{label}</p>
        {healthy && (
          <p className={`text-sm ${textColor}`}>
            <span className="font-bold text-green-500 mr-2">•</span>
            Healthy: <span className="font-bold">{healthy.value}</span>
          </p>
        )}
        {issues && (
          <p className={`text-sm ${textColor}`}>
            <span className="font-bold text-red-500 mr-2">•</span>
            Issues: <span className="font-bold">{issues.value}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function HealthTrendChart() {
  const { theme } = useTheme();

  // 🚀 DYNAMIC FIX: Call the hook to get dynamic data and state
  const { data, isLoading, error } = useHealthTrendData(7);

  if (isLoading) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <LoadingSpinner />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Loading Health Trend...
        </p>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <p className="font-medium text-slate-500 dark:text-slate-300">
          {error || "No time series data available for the last 7 days."}
        </p>
      </div>
    );
  }

  const axisColor = theme === "dark" ? "#475569" : "#cbd5e1"; // slate-600 / slate-300

  return (
    <div className="h-[300px] w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          // 🚀 DYNAMIC FIX: Use the fetched data
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {/* Gradient for Healthy Scans (Green) */}
            <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            {/* Gradient for Detected Issues (Red) */}
            <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={axisColor}
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke={axisColor}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke={axisColor} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomChartTooltip theme={theme} />} />

          <Area
            type="monotone"
            dataKey="Healthy Scans"
            stackId="1"
            stroke="#22c55e" // green-500
            fill="url(#colorHealthy)"
            strokeWidth={2}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="Detected Issues"
            stackId="1"
            stroke="#ef4444" // red-500
            fill="url(#colorIssues)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
