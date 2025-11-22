"use client";

import { motion } from "framer-motion";
import React, { ReactNode } from "react";
import { useTheme } from "./themes/ThemeContext";

interface TrainLayoutProps {
  title: string;
  children: ReactNode;
}

export default function TrainLayout({ title, children }: TrainLayoutProps) {
  const { theme } = useTheme();

  // Backgrounds and text colors based on theme
  const bg = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const cardBg = theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const shadow = theme === "dark" ? "shadow-2xl shadow-black/50" : "shadow-xl";

  return (
    <>
      <div className={`${bg} min-h-screen flex flex-col items-center justify-start py-16 px-4`}>
        {/* Card Container */}
        <div className={`max-w-4xl w-full mt-22 rounded-3xl border ${cardBg} ${shadow} p-8 md:p-12 flex flex-col gap-6 transition-colors duration-500`}>
          {/* Title */}
          <h1 className={`text-3xl md:text-4xl font-extrabold ${textColor} text-center`}>
            {title}
          </h1>

          {/* Children Content */}
          <div className="flex flex-col gap-6">
            {children}
          </div>
        </div>
      </div>

      {/* Background subtle animation circles */}
      <motion.div
        className="absolute top-0 left-1/2 w-[500px] h-[500px] -translate-x-1/2 rounded-full bg-indigo-500 opacity-10 blur-3xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full bg-green-500 opacity-10 blur-3xl"
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />
    </>
    
  );
}
