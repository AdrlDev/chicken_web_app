"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface ActionButton {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  isActive?: boolean;
  theme?: "light" | "dark";
}

interface Props {
  buttons: ActionButton[];
}

export default function ActionButtonGroup({ buttons }: Props) {
  return (
    <div className="mt-6 flex justify-center relative z-20">
      <div
        className={`inline-flex rounded-full p-1 shadow-lg backdrop-blur-sm transition-colors duration-500
          bg-white/30 dark:bg-gray-900/30`}
      >
        {buttons.map((btn, idx) => {
          const isActive = btn.isActive ?? false;
          const theme = btn.theme ?? "light";

          const buttonBase =
            "px-5 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-semibold flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50";

          const buttonActive =
            theme === "dark"
              ? "bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow"
              : "bg-gradient-to-r from-green-400 to-lime-400 text-gray-900 shadow";

          const buttonInactive =
            theme === "dark"
              ? "text-white hover:bg-white/10"
              : "text-gray-900 hover:bg-black/10";

          return (
            <button
              key={idx}
              onClick={btn.onClick}
              className={`${buttonBase} ${isActive ? buttonActive : buttonInactive}`}
            >
              {btn.icon && (
                <motion.span
                  className={`flex items-center ${theme === "dark" ? "text-white" : ""}`}
                  whileHover={{ scale: 1.2, rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {btn.icon}
                </motion.span>
              )}
              {btn.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
