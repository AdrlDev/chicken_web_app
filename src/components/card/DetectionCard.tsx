/* eslint-disable @next/next/no-img-element */
"use client";

import React, { ReactNode } from "react"; // ✨ NEW: Import ReactNode for placeholder
import { useTheme } from "@/components/themes/ThemeContext";
import ImageDetectionOverlay from "@/components/overlays/ImageDetectionOverlay";
import { Detection } from "@/domain/entities/Detection";
import LoadingSpinner from "../LoadingSpinner"; // Assuming you have this component
import { motion } from "framer-motion";

interface Props {
  imageSrc: string | null;
  imageRef: React.RefObject<HTMLImageElement | null>;
  detections: Detection[];
  aspectRatio?: string; // default 16/9
  maxWidth?: string; // default 1200px
  // ✨ FIX: Add placeholder to Props
  placeholder: ReactNode;
  // ✨ FIX: Add isProcessing to Props
  isProcessing: boolean;
}

export default function DetectionCard({
  imageSrc,
  imageRef,
  detections,
  aspectRatio = "16 / 9",
  maxWidth = "1200px",
  placeholder, // Destructure the new prop
  isProcessing = false, // Destructure the new prop
}: Props) {
  const { theme } = useTheme();

  // Updated card style for the "Scan Page" aesthetic
  const cardStyle =
    theme === "dark"
      ? "bg-gray-900 ring-1 ring-indigo-500/50 shadow-2xl shadow-indigo-900/40"
      : "bg-white ring-1 ring-gray-200 shadow-xl";

  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-900";

  return (
    <div
      className={`w-full md:w-4/5 lg:w-3/4 ${cardStyle} rounded-2xl overflow-hidden relative flex items-center justify-center transition-all duration-500`}
      style={{ aspectRatio, maxWidth }}
    >
      {/* --- Image Display --- */}
      {imageSrc ? (
        <>
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Uploaded for detection"
            className={`w-full h-full object-fill transition-opacity duration-300 ${isProcessing ? "opacity-30" : "opacity-100"}`} // Dim image during processing
          />
          {/* Overlay only visible when NOT processing and detections are available */}
          {!isProcessing && detections && detections.length > 0 && (
            <ImageDetectionOverlay
              imageRef={imageRef}
              detections={detections}
            />
          )}

          {/* Processing Overlay */}
          {isProcessing && (
            <motion.div
              className={`absolute inset-0 flex flex-col items-center justify-center ${theme === "dark" ? "bg-black/50" : "bg-white/50"} backdrop-blur-sm`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <LoadingSpinner
                size={60}
                color1="indigo-500"
                color2="purple-400"
              />
              <p className={`mt-4 text-xl font-semibold ${textColor}`}>
                Analyzing Image...
              </p>
            </motion.div>
          )}
        </>
      ) : (
        // --- Placeholder Display ---
        <div className="absolute inset-0">{placeholder}</div>
      )}
    </div>
  );
}
