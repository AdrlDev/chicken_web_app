"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "@/components/themes/ThemeContext";
import ActionButtonGroup from "@/components/bottons/ActionButtonGroup";
import { VideoCameraIcon, CogIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

// Animated icon component
const AnimatedIcon = ({ src, alt, delay = 0, theme }: { src: string; alt: string; delay?: number; theme: "light" | "dark" }) => (
  <motion.div
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 1, delay, repeat: Infinity, repeatType: "reverse" }}
    className="w-20 h-20 md:w-24 md:h-24 relative"
  >
    <Image
      src={src}
      alt={alt}
      fill
      style={{
        objectFit: "contain",
        filter: theme === "dark" ? "invert(1) brightness(1.2)" : "none",
      }}
    />
  </motion.div>
);

export default function LandingPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const subTextColor = theme === "dark" ? "text-gray-300" : "text-gray-700";

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-center px-6 py-16 ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
      {/* Hero Text */}
      <div className="text-center z-10">
        <h1 className={`text-4xl md:text-6xl font-extrabold mb-4 ${textColor}`}>
          🐔 Chicken Scanner
        </h1>
        <p className={`text-lg md:text-xl mb-8 ${subTextColor}`}>
          Detect poultry diseases in real-time — fast, smart, and reliable.
        </p>

        {/* Call to action */}
        <ActionButtonGroup
            buttons={[
              {
                label: "Start Scanning",
                theme: theme,
                onClick: () => router.push("/camera"),
                icon: <VideoCameraIcon className="w-5 h-5" />,
              },
              {
                label: "Train Model",
                theme: theme,
                onClick: () => router.push("/train"),
                icon: <CogIcon className="w-5 h-5" />,
              },
            ]}
        />
      </div>

      {/* Animated Icons */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-8 md:gap-12">
        <AnimatedIcon src="/healthy_chicken.png" alt="Healthy Chicken" delay={0} theme={theme} />
        <AnimatedIcon src="/disease_chicken.png" alt="Disease Detection" delay={0.3} theme={theme} />
        <AnimatedIcon src="/scan_chicken.png" alt="Scanned Chicken" delay={0.6} theme={theme} />
      </div>
    </div>
  );
}
