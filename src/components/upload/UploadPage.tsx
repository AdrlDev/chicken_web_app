/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useImageDetectionSocket } from "@/hooks/useImageDetectionSocket";
import { useTheme } from "@/components/themes/ThemeContext";
import {
  PhotoIcon,
  BackwardIcon,
  ShieldCheckIcon, // Used for Success/Status
  CloudArrowUpIcon, // Used for Upload placeholder
  WifiIcon, // Used for Connection Status
} from "@heroicons/react/24/solid";
import ActionButtonGroup from "@/components/bottons/ActionButtonGroup";
import DetectionCard from "@/components/card/DetectionCard";
import { DetectionResult } from "@/utils/detectionUtils";
import { useScanInsertion } from "@/hooks/chickenScanHooks/useScanInsertion";
import { motion } from "framer-motion"; // ✨ NEW: Import Framer Motion

// List of labels that should be saved to the database
const DISEASES_TO_SAVE = new Set([
  "avian influenza",
  "blue comb",
  "coccidiosis",
  "coccidiosis poops",
  "fowl cholera",
  "fowl-pox",
  "mycotic infections",
  "salmo",
  "healthy",
]);

// Helper function to get the best detection
const getBestDetection = (
  detectionResults: DetectionResult[],
): DetectionResult => {
  // Finds the detection with the highest confidence
  return detectionResults.reduce(
    (best, current) => {
      if ((current.confidence ?? 0) > (best.confidence ?? 0)) {
        return current;
      }
      return best;
    },
    // Initialize with a safe default
    { label: "No Detection", confidence: 0, timestampMs: Date.now() },
  );
};

export default function UploadPage() {
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const { detections, sendImage, isConnected, error } =
    useImageDetectionSocket() as {
      detections: DetectionResult[] | null;
      sendImage: (base64: string) => void;
      isConnected: boolean;
      error: string | null;
    };
  const { theme } = useTheme();

  const { insertScan } = useScanInsertion();

  // Color variables for consistent theming
  const primaryColor = theme === "dark" ? "text-indigo-400" : "text-indigo-600";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const secondaryTextColor =
    theme === "dark" ? "text-gray-400" : "text-gray-600";
  const statusPanelBg =
    theme === "dark"
      ? "bg-gray-900/70 border border-gray-800"
      : "bg-gray-100 border border-gray-300";

  const [isScanSaved, setIsScanSaved] = useState(false);

  // --- 1. Function to handle saving the most confident detection ---
  const handleScanInsertion = useCallback(
    async (detectionResults: DetectionResult[]) => {
      if (isScanSaved) {
        return;
      }

      const bestDetection = getBestDetection(detectionResults);

      const diagnosis = bestDetection.label.toLowerCase();
      const confidence = bestDetection.confidence ?? 0;

      if (DISEASES_TO_SAVE.has(diagnosis) && confidence > 0.4) {
        console.log(
          `Saving diagnosis: ${diagnosis} with confidence ${confidence}`,
        );

        const success = await insertScan({
          diagnosis: diagnosis,
        });

        if (success) {
          setIsScanSaved(true);
          console.log(`SUCCESSFULLY SAVED scan for: ${diagnosis}`);
        } else {
          console.error(`FAILED to save scan for ${diagnosis}.`);
        }
      }
    },
    [insertScan, isScanSaved],
  );

  // --- 2. Effect to monitor new detection results and save ---
  useEffect(() => {
    if (detections && detections.length > 0 && !isScanSaved) {
      handleScanInsertion(detections);
    }
  }, [detections, handleScanInsertion, isScanSaved]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state for a new image upload
    setIsScanSaved(false);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImageSrc(base64);
      // Send image to socket and wait for detections
      sendImage(base64);
    };
    reader.readAsDataURL(file);
  };

  // Get the best result for display
  const bestResult =
    detections && detections.length > 0 ? getBestDetection(detections) : null;

  // Determine current detection status message
  let statusMessage = "No Image Uploaded.";
  if (imageSrc && !detections) {
    statusMessage = "Processing image...";
  } else if (bestResult && bestResult.confidence > 0.4) {
    statusMessage = `Primary Diagnosis: ${bestResult.label}`;
  } else if (imageSrc && detections && detections.length === 0) {
    statusMessage = "Analysis Complete: No significant detection found.";
  }

  return (
    <div className="flex flex-col items-center pt-32 px-4 pb-8 md:pb-16">
      {/* Heading (Enhanced) */}
      <div className={`text-center mb-10 ${textColor}`}>
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className={primaryColor}>Image AI</span> Upload 📸
        </motion.h2>
        <motion.p
          className={`mt-2 max-w-2xl mx-auto ${secondaryTextColor}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Upload a poultry image for deep learning based health assessment.
        </motion.p>
      </div>

      {/* Image Card Container */}
      <div className="w-full md:w-4/5 lg:w-3/4" style={{ maxWidth: "1200px" }}>
        <DetectionCard
          imageSrc={imageSrc}
          imageRef={imageRef}
          detections={detections as any}
          aspectRatio="16 / 9"
          maxWidth="1200px"
          // Add a stunning placeholder when no image is uploaded
          placeholder={
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} ${secondaryTextColor}`}
            >
              <CloudArrowUpIcon
                className={`w-20 h-20 mb-3 ${primaryColor} opacity-70`}
              />
              <p className="text-2xl font-semibold">Ready for Upload</p>
              <p className="mt-1 text-base">
                Select &apos;Choose Image&apos; below to start analysis.
              </p>
            </div>
          }
          // Add a processing indicator
          isProcessing={!!imageSrc && !detections}
        />
      </div>

      {/* Action Buttons & Status Panel */}
      <div className="w-full md:w-4/5 lg:w-3/4" style={{ maxWidth: "1200px" }}>
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
                label: "Choose Image",
                onClick: () => document.getElementById("upload-input")?.click(),
                icon: <PhotoIcon className="w-5 h-5" />,
                theme: theme,
              },
            ]}
          />
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="upload-input"
            className="hidden"
          />
        </div>

        {/* Status Panel (Detailed Footer) */}
        <div
          className={`mt-6 p-4 rounded-xl ${statusPanelBg} shadow-inner backdrop-blur-sm`}
        >
          {/* Connection Status */}
          <motion.div
            className={`flex items-center text-sm mb-3 pb-3 border-b border-dashed ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <WifiIcon
              className={`w-4 h-4 mr-2 ${isConnected ? "text-green-500" : "text-yellow-500 animate-pulse"}`}
            />
            <span
              className={isConnected ? "text-green-500" : "text-yellow-500"}
            >
              {isConnected ? "Server Connected" : "Connecting to AI server..."}
            </span>
          </motion.div>

          {/* Main Detection Status */}
          <h3
            className={`text-lg font-bold mb-3 ${primaryColor} flex items-center`}
          >
            <ShieldCheckIcon className="w-5 h-5 mr-2 text-indigo-500" />
            <motion.span
              key={statusMessage} // Key change for motion effect on status update
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Detection Status: {statusMessage}
            </motion.span>
          </h3>

          {/* Error Message */}
          {error && (
            <motion.p
              className="mt-3 p-3 bg-red-900/20 text-red-400 rounded-lg text-sm font-medium"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              **Socket Error:** {error}
            </motion.p>
          )}

          {/* Scan Saved Confirmation */}
          {isScanSaved && (
            <motion.p
              className="mt-3 p-3 bg-green-900/20 text-green-400 rounded-lg text-sm font-semibold"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ShieldCheckIcon className="w-4 h-4 inline mr-1" /> Scan result
              successfully recorded to database!
            </motion.p>
          )}

          {/* Confidence Detail */}
          {bestResult && bestResult.confidence > 0.4 && (
            <div
              className={`mt-3 pt-3 border-t border-dashed ${theme === "dark" ? "border-gray-700" : "border-gray-300"} text-sm ${secondaryTextColor}`}
            >
              Confidence:{" "}
              <span className="font-semibold text-indigo-500">
                {Math.round(bestResult.confidence * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
