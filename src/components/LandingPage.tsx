"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "./themes/ThemeContext";

// Animated icon component
const AnimatedIcon = ({ src, alt, delay = 0 }: { src: string; alt: string; delay?: number }) => (
  <motion.div
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 1, delay, repeat: Infinity, repeatType: "reverse" }}
    className="w-20 h-20 md:w-24 md:h-24 relative"
  >
    <Image src={src} alt={alt} fill style={{ objectFit: "contain" }} />
  </motion.div>
);

export default function LandingPage() {
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
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/camera">
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-500 transition-all duration-300">
              Start Scanning
            </button>
          </Link>
          <Link href="/train">
            <button className="px-6 py-3 bg-gray-200 text-gray-900 rounded-full font-semibold hover:bg-gray-300 transition-all duration-300">
              Train Model
            </button>
          </Link>
        </div>
      </div>

      {/* Animated Icons */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-8 md:gap-12">
        <AnimatedIcon src="/icons/chicken1.svg" alt="Healthy Chicken" delay={0} />
        <AnimatedIcon src="/icons/virus.svg" alt="Disease Detection" delay={0.3} />
        <AnimatedIcon src="/icons/chicken2.svg" alt="Scanned Chicken" delay={0.6} />
      </div>
    </div>
  );
}
