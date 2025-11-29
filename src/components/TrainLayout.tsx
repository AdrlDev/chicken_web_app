//TrainLayou.tsx

"use client";

import { motion } from "framer-motion";
import React, { ReactNode } from "react";
import { useTheme } from "./themes/ThemeContext";

interface TrainLayoutProps {
  title: string;
  icon?: ReactNode; // ✅ optional icon
  children: ReactNode;
}

export default function TrainLayout({
  title,
  icon,
  children,
}: TrainLayoutProps) {
  const { theme } = useTheme();

  // Backgrounds and text colors based on theme
  const bg = theme === "dark" ? "bg-gray-950" : "bg-gray-50"; // Using 950/50 for a soft look, consistent with ScanPage
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const supTextColor = theme === "dark" ? "text-slate-400" : "text-slate-600"; // For descriptive text

  return (
    <div
      className={`relative min-h-screen ${bg} ${textColor} overflow-x-hidden selection:bg-indigo-500/30 transition-colors duration-500`}
    >
      {/* Decorative Blobs (Moved inside the main container and styled slightly) */}
      <motion.div
        className={`fixed top-0 left-1/2 w-[600px] h-[600px] -translate-x-1/2 rounded-full ${theme === "dark" ? "bg-indigo-700 opacity-10" : "bg-indigo-400 opacity-20"} blur-[150px] pointer-events-none`}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className={`fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full ${theme === "dark" ? "bg-green-700 opacity-10" : "bg-green-400 opacity-20"} blur-[150px] pointer-events-none`}
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />

      {/* Main Content Area (Full Width, Centered Max-Width Container) */}
      <main className="relative z-10 pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Title Section (Matching ScanPage style) */}
        <div className="mb-12 md:mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-4xl md:text-5xl font-extrabold tracking-tight ${textColor} flex items-center gap-2`}
          >
            {icon && <span className="w-10 h-10">{icon}</span>}
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={`${supTextColor} mt-3 text-lg md:text-xl max-w-3xl`}
          >
            Upload datasets and monitor your AI model&apos;s training process in
            real-time.
          </motion.p>
        </div>

        {/* Children Content (The Upload/Log Cards) */}
        <div className="flex flex-col gap-8">{children}</div>
      </main>
    </div>
  );
}
