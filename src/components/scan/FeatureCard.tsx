"use client";
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/themes/ThemeContext";

// Define the required properties for the card
interface FeatureCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  subtitle,
  icon,
  href,
}) => {
  const { theme } = useTheme();

  // Dynamic styling based on theme
  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
      : "bg-white border-slate-200 hover:bg-gray-50";

  const iconBg =
    theme === "dark"
      ? "bg-indigo-600/20 text-indigo-400"
      : "bg-indigo-500/10 text-indigo-600";

  const supTextColor = theme === "dark" ? "text-slate-400" : "text-slate-500";

  return (
    <motion.a
      href={href}
      className={`block p-6 rounded-xl border ${cardBg} transition duration-300 ease-in-out shadow-lg 
                  transform h-full flex flex-col hover:shadow-xl hover:-translate-y-0.5`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.01 }}
      // Use a short delay/duration to make the animation feel quick and responsive
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div
        className={`w-10 h-full flex items-center justify-center rounded-full mb-4 ${iconBg}`}
      >
        {icon}
      </div>
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <p className={`text-sm ${supTextColor}`}>{subtitle}</p>
    </motion.a>
  );
};

export default FeatureCard;
