"use client";

import React from "react";
import { useTheme } from "@/components/themes/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer
      className={`w-full backdrop-blur-lg shadow-inner transition-colors duration-500 ${
        theme === "dark"
          ? "bg-gray-900/30 text-gray-300/80"
          : "bg-white/30 text-gray-800/80"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4 text-center text-sm">
        © {new Date().getFullYear()} aeDev — built with care
      </div>
    </footer>
  );
}
