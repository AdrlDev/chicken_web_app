"use client";

import React from "react";
import { Detection } from "@/domain/entities/Detection";
import DetectionOverlay from "./overlays/DetectionOverlay";
import { useTheme } from "@/components/themes/ThemeContext";
import {
  CameraIcon,
  BackwardIcon,
  ShieldCheckIcon, // New Icon for Status
  ShieldExclamationIcon, // New Icon for Error
  EyeSlashIcon, // New Icon for Camera Off Placeholder
} from "@heroicons/react/24/solid";
import ActionButtonGroup from "@/components/bottons/ActionButtonGroup";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // ✨ NEW: Import Framer Motion

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onToggleCamera: () => void;
  isActive: boolean;
  error?: string | null;
  detections: Detection[];
}

export default function CameraView({
  videoRef,
  onToggleCamera,
  isActive,
  error,
  detections,
}: Props) {
  const { theme } = useTheme();
  const router = useRouter();

  const primaryColor = theme === "dark" ? "text-indigo-400" : "text-indigo-600";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const secondaryTextColor =
    theme === "dark" ? "text-gray-400" : "text-gray-600";

  // 1. Updated Card Style: Deeper background, subtle glow for dark mode
  const cardStyle =
    theme === "dark"
      ? "bg-gray-900 ring-1 ring-indigo-500/50 shadow-2xl shadow-indigo-900/40"
      : "bg-white ring-1 ring-gray-200 shadow-xl";

  // Calculate health status
  const detectionCount = detections.length;
  const unhealthyCount = detections.filter((d) => d.label !== "healthy").length;
  const healthStatus =
    detectionCount > 0
      ? unhealthyCount > 0
        ? "Warning"
        : "Healthy"
      : "Monitoring...";

  // Framer Motion variant for status text
  const statusVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <div className="flex flex-col items-center pt-32 px-4 pb-8 md:pb-16">
        {/* Heading (Enhanced with primary color) */}
        <div className={`text-center mb-10 ${textColor}`}>
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className={primaryColor}>Live AI</span> Scanning 🐔
          </motion.h2>
          <motion.p
            className={`mt-2 max-w-2xl mx-auto ${secondaryTextColor}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Real-time visual monitoring for avian health diagnostics.
          </motion.p>
        </div>

        {/* Video Card Container */}
        <div
          className={`w-full md:w-4/5 lg:w-3/4 ${cardStyle} rounded-2xl overflow-hidden relative transition-all duration-500`}
          style={{ maxWidth: "1200px" }}
        >
          {/* Aspect Ratio Box for Video/Canvas */}
          <div className="relative h-[300px] sm:h-[400px] md:h-auto md:aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              // 2. Subtle animation for video stream start/stop
              className={`w-full h-full object-cover bg-black transition-opacity duration-700 ${isActive ? "opacity-100" : "opacity-0"}`}
              style={{ transform: "scaleX(-1)" }}
            />

            {/* Camera Off Placeholder (Enhanced) */}
            {!isActive && (
              <motion.div
                className={`absolute inset-0 flex flex-col items-center justify-center ${textColor} bg-gray-950/90 dark:bg-black/80 backdrop-blur-sm`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <EyeSlashIcon className="w-20 h-20 mb-3 text-indigo-500 opacity-70 animate-pulse-slow" />
                <p className="text-2xl font-semibold">Camera Stream Offline</p>
                <p className={`mt-1 text-base ${secondaryTextColor}`}>
                  Press &apos;Start Camera&apos; to begin monitoring.
                </p>
              </motion.div>
            )}

            {/* Detection Overlay */}
            {isActive && (
              <div className="absolute inset-0 pointer-events-none">
                <DetectionOverlay videoRef={videoRef} detections={detections} />
              </div>
            )}
          </div>
        </div>

        {/* --- Status & Actions Footer --- */}
        <div
          className="w-full md:w-4/5 lg:w-3/4"
          style={{ maxWidth: "1200px" }}
        >
          {/* Action Buttons */}
          <div className="mt-8">
            <ActionButtonGroup
              buttons={[
                {
                  label: "Back to Scan Options",
                  onClick: () => router.push("/scan"),
                  icon: <BackwardIcon className="w-5 h-5" />,
                  theme: theme,
                },
                {
                  label: isActive ? "Stop Monitoring" : "Start Camera Stream",
                  onClick: onToggleCamera,
                  icon: <CameraIcon className="w-5 h-5" />,
                  isActive: isActive,
                  theme: theme,
                },
              ]}
            />
          </div>

          {/* Status Panel (Detailed Footer) */}
          <div
            className={`mt-6 p-4 rounded-xl ${theme === "dark" ? "bg-gray-900/70 border border-gray-800" : "bg-gray-100 border border-gray-300"} shadow-inner backdrop-blur-sm`}
          >
            <h3
              className={`text-lg font-bold mb-3 ${primaryColor} flex items-center`}
            >
              {error ? (
                <ShieldExclamationIcon className="w-5 h-5 mr-2 text-red-500 animate-pulse" />
              ) : (
                <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-500" />
              )}
              <motion.span
                key={healthStatus} // Key change for motion effect on status update
                variants={statusVariants}
                initial="hidden"
                animate="visible"
              >
                {error
                  ? "System Error"
                  : `Real-Time Health Status: ${healthStatus}`}
              </motion.span>
            </h3>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-2 border-r border-dashed border-gray-700/50">
                <p className={`text-xl font-bold ${textColor}`}>
                  {detectionCount}
                </p>
                <p className={`text-xs ${secondaryTextColor}`}>
                  Objects Detected
                </p>
              </div>
              <div className="p-2 border-r border-dashed border-gray-700/50">
                <p className="text-xl font-bold text-green-500">
                  {detectionCount - unhealthyCount}
                </p>
                <p className={`text-xs ${secondaryTextColor}`}>
                  Healthy Instances
                </p>
              </div>
              <div className="p-2">
                <p className="text-xl font-bold text-red-500">
                  {unhealthyCount}
                </p>
                <p className={`text-xs ${secondaryTextColor}`}>
                  Warning Instances
                </p>
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <motion.p
                className="mt-3 p-3 bg-red-900/20 text-red-400 rounded-lg text-sm font-medium"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                **Error:** {error}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
