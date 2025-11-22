"use client";

import { useTheme } from "./ThemeContext";
import { SunIcon, MoonIcon, StarIcon } from "@heroicons/react/24/solid";
import React from "react";

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle light/dark mode"
      className={`relative w-18 h-10 rounded-full flex items-center transition-colors duration-500 px-2`}
      style={{
        backgroundColor: isDark
          ? "rgba(75,85,99,0.8)" // gray-700
          : "rgba(243,244,246,0.8)", // gray-100
      }}
    >
      {/* Sliding circle */}
      <div
        className={`absolute top-1 left-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center transform transition-all duration-500`}
        style={{
          transform: isDark ? "translateX(100%)" : "translateX(0%)",
        }}
      >
        {isDark ? (
          <MoonIcon className="w-5 h-5 text-gray-700" />
        ) : (
          <SunIcon className="w-5 h-5 text-yellow-500" />
        )}
      </div>
    </button>
  );
}
