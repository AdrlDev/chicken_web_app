"use client";

import { ReactNode } from "react";
import { useTheme } from "./themes/ThemeContext";

interface BackgroundProps {
  children: ReactNode;
}

export default function Background({ children }: BackgroundProps) {
  const { theme } = useTheme();

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden transition-colors duration-500 ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
    >
      {/* Optional dynamic blobs */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 opacity-40 transition-opacity duration-500"
      >
        <div
          className={`relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg]
            ${theme === "dark"
              ? "bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500"
              : "bg-gradient-to-tr from-purple-300 via-pink-300 to-yellow-300"}
            sm:left-[calc(50%-30rem)] sm:w-[72rem]`}
        />
      </div>

      <div
        className="relative z-10 w-full min-h-screen text-gray-900 dark:text-white transition-colors duration-500"
      >
        {children}
      </div>
    </div>
  );
}
