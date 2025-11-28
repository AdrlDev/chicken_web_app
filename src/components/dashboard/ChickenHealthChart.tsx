/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTheme } from "@/components/themes/ThemeContext";
import { useChickenHealthData } from "@/hooks/chickenScanHooks/useChickenHealthData"; // 👈 IMPORT THE DATA HOOK
import LoadingSpinner from "@/components/LoadingSpinner"; // 👈 IMPORT SPINNER

// --- Data Configuration (Keep existing) ---
const labelColors: Record<string, string> = {
  "avian influenza": "#ff9341ff",
  "blue comb": "#00fffbff",
  "coccidiosis": "#da4e4eff",
  "coccidiosis poops": "#cc0909ff",
  "fowl cholera": "#f188f3ff",
  "fowl-pox": "#ff00bfff",
  "mycotic infections": "#ffdc5eff",
  "salmo": "#cd0160ff",
  "healthy": "#00FF00",
};

// 1. Theme-Aware Tooltip
const CustomTooltip = ({ active, payload, theme }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`${theme === "dark" ? "bg-slate-800" : "bg-white"} border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md`}>
        <p className={`${theme === "dark" ? "text-slate-300" : "text-slate-600"} font-medium text-sm`}>{payload[0].name}</p>
        <p className={`${theme === "dark" ? "text-white" : "text-slate-900"} font-bold text-lg`}>
          {payload[0].value} <span className={`${theme === "dark" ? "text-slate-400" : "text-slate-500"} text-xs font-normal`}>scans</span>
        </p>
      </div>
    );
  }
  return null;
};

// --- Main Component (MODIFIED) ---
export default function ChickenHealthChart() {
  const { theme } = useTheme();
  
  // 👈 CALL THE DATA HOOK
  const { 
    data, 
    isLoading, 
    error, 
    totalScans, 
    refreshData 
  } = useChickenHealthData(); 

  const cardBg = theme === "dark" ? "bg-slate-900/60 border-white/10 shadow-2xl" : "bg-white/80 border-slate-200 shadow-sm";
  const baseClassName = `w-full backdrop-blur-xl border rounded-2xl p-6 transition-colors duration-300 h-full min-h-[400px] flex flex-col`;

  // --- Conditional Rendering for Loading/Error States ---
  if (isLoading) {
    return (
      <div className={`${baseClassName} ${cardBg} justify-center items-center`}>
        <LoadingSpinner />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Fetching live scan data...</p>
      </div>
    );
  }

  if (error) {
     return (
        <div className={`${baseClassName} ${cardBg} justify-center items-center text-center p-8 bg-red-50 dark:bg-red-900/40 border-red-300 dark:border-red-700`}>
           <p className="font-bold text-red-600 dark:text-red-400 text-lg">Data Error</p>
           <p className="text-sm mt-2 text-red-700 dark:text-red-300">{error}</p>
           <button 
                onClick={refreshData}
                className="mt-4 px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
           >
                Try Refreshing
           </button>
        </div>
     );
  }
  
  if (data.length === 0) {
       return (
        <div className={`${baseClassName} ${cardBg} justify-center items-center`}>
           <p className="font-medium text-slate-500 dark:text-slate-300">No scan data found for this user/farm.</p>
        </div>
       );
  }

  // --- Main Content Display ---
  return (
    <div className={`w-full backdrop-blur-xl border rounded-2xl p-6 ${cardBg} transition-colors duration-300`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <div>
          <h2 className={`text-xl md:text-2xl font-bold ${theme === "dark" ? "text-white" : "text-slate-800"} transition-colors`}>
            Scan Overview
          </h2>
          <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"} mt-1`}>
            Real-time disease detection data
          </p>
        </div>
        <div className="flex gap-3 items-center">
            {/* Refresh Button */}
            <button 
                onClick={refreshData}
                aria-label="Refresh Data"
                className={`p-2 rounded-full border transition-colors ${theme === "dark" ? "border-white/20 hover:bg-white/10" : "border-slate-300 hover:bg-slate-100"}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9c-2.4 0-4.64.65-6.53 1.77L3 7"/><path d="M3 3v4h4"/><path d="M3 12a9 9 0 0 0 9 9c2.4 0 4.64-.65 6.53-1.77L21 17"/><path d="M21 21v-4h-4"/></svg>
            </button>

            <div className={`border ${theme === "dark" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-green-100 text-green-700 border-green-200"} px-3 py-1 rounded-full text-xs font-medium`}>
              Live Data
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        
        {/* Chart Section */}
        <div className="h-[300px] w-full md:w-1/2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data} // 👈 Use the fetched data
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={labelColors[entry.name.toLowerCase()] || "#cccccc"} 
                    className="outline-none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip theme = {`${theme}`} />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Donut Center Text */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span className={`block text-3xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-800"} transition-colors`}>{totalScans}</span>
            <span className={`block text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"} uppercase tracking-wider`}>Total</span>
          </div>
        </div>

        {/* Legend Section */}
        <div className="w-full md:w-1/2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
          <h3 className={`text-xs font-semibold ${theme === "dark" ? "text-slate-500" : "text-slate-400"} uppercase tracking-widest mb-3`}>
            Breakdown
          </h3>
          <div className="space-y-2">
            {data.map((item) => (
              <div 
                key={item.name} 
                className={`flex items-center justify-between p-2 rounded-lg ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-slate-50"} transition-colors group`}
              >
                <div className="flex items-center gap-3">
                  <span 
                    className={`w-2.5 h-2.5 rounded-full ring-2 ring-transparent ${theme === "dark" ? "group-hover:ring-white/20" : "group-hover:ring-slate-200"} transition-all`} 
                    style={{ backgroundColor: labelColors[item.name] || "#ccc" }} 
                  />
                  <span className={`text-sm font-medium ${theme === "dark" ? "text-slate-300 group-hover:text-white" : "text-slate-600 group-hover:text-slate-900"} transition-colors`}>
                    {item.name}
                  </span>
                </div>
                <span className={`text-sm font-bold ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}