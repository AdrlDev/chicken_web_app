/* eslint-disable react-hooks/exhaustive-deps */
// VideoUpload.tsx
"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import {
  BackwardIcon,
  VideoCameraIcon, // New Icon
  ShieldCheckIcon, // New Icon
  ShieldExclamationIcon, // New Icon
  WifiIcon, // New Icon
} from "@heroicons/react/24/solid";
import { useVideoDetectionSocket } from "@/hooks/useVideoDetectionSocket";
import VideoUploadCard from "@/components/card/VideoUploadCard";
import ActionButtonGroup from "@/components/bottons/ActionButtonGroup";
import { useTheme } from "@/components/themes/ThemeContext";
import { useScanInsertion } from "@/hooks/chickenScanHooks/useScanInsertion";
import { DetectionResult } from "@/utils/detectionUtils";
import { motion } from "framer-motion"; // ✨ NEW: Import Framer Motion

// List of diseases you want to save (i.e., not 'Healthy')
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

// Framer Motion variant for status text
const statusVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export const VideoUpload: React.FC = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Use the socket hook
  const { result, startDetection, stopDetection, isConnected, error } =
    useVideoDetectionSocket(videoRef);

  const [isDetectionActive, setIsDetectionActive] = useState(false);
  const { theme } = useTheme();
  const { insertScan } = useScanInsertion();
  const [savedDetections, setSavedDetections] = useState<Set<string>>(
    new Set(),
  );

  // Color variables for consistent theming
  const primaryColor = theme === "dark" ? "text-indigo-400" : "text-indigo-600";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const secondaryTextColor =
    theme === "dark" ? "text-gray-400" : "text-gray-600";
  const statusPanelBg =
    theme === "dark"
      ? "bg-gray-900/70 border border-gray-800"
      : "bg-gray-100 border border-gray-300";

  // State to hold the most recent significant detection for display
  const [currentDiagnosis, setCurrentDiagnosis] = useState<{
    label: string;
    confidence: number;
    isSaved: boolean;
  } | null>(null);

  // --- 1. Function to handle saving the detection ---
  const handleDetectionResult = useCallback(
    async (detection: DetectionResult) => {
      const diagnosis = detection.label.toLowerCase();
      const uniqueKey = `${diagnosis}-${Math.floor(detection.timestampMs / 5000)}`;

      let isSaved = false;

      if (!savedDetections.has(uniqueKey) && DISEASES_TO_SAVE.has(diagnosis)) {
        console.log(`Attempting to save: ${diagnosis}`);

        const success = await insertScan({ diagnosis: diagnosis });

        if (success) {
          setSavedDetections((prev) => new Set(prev).add(uniqueKey));
          isSaved = true;
          console.log(`SUCCESSFULLY SAVED: ${diagnosis}`);
        } else {
          console.error(`FAILED to save scan for ${diagnosis}.`);
        }
      }

      // Update display state regardless of saving
      setCurrentDiagnosis({
        label: diagnosis,
        confidence: detection.confidence,
        isSaved: isSaved || savedDetections.has(uniqueKey),
      });
    },
    [insertScan, savedDetections],
  );

  // --- 2. Effect to monitor new detection results ---
  useEffect(() => {
    if (!isDetectionActive || !result || result.length === 0) {
      if (!isDetectionActive) setCurrentDiagnosis(null); // Clear display when stopped
      return;
    }

    const normalizedResults: DetectionResult[] = result.map((r) => ({
      label: r.label,
      confidence: r.confidence ?? 0,
      timestampMs: r.timestampMs ?? performance.now(),
    }));

    // Find the highest confidence detection (prioritizing non-healthy disease)
    const bestDetection = normalizedResults.reduce(
      (best, current) => {
        const currentIsDisease =
          current.label.toLowerCase() !== "healthy" &&
          DISEASES_TO_SAVE.has(current.label.toLowerCase());
        const bestIsDisease =
          best.label.toLowerCase() !== "healthy" &&
          DISEASES_TO_SAVE.has(best.label.toLowerCase());

        // If current is a disease and has decent confidence, prefer it
        if (currentIsDisease && current.confidence > 0.5) return current;

        // If best is not a disease, but current has higher confidence, update
        if (!bestIsDisease && current.confidence > best.confidence)
          return current;

        // Otherwise, keep the best
        return best;
      },
      {
        label: "healthy",
        confidence: 0,
        timestampMs: performance.now(),
      } as DetectionResult,
    );

    // Process the most confident detection if above threshold
    if (bestDetection.confidence > 0.4) {
      handleDetectionResult(bestDetection);
    }
  }, [result, handleDetectionResult, isDetectionActive]);

  // Normalize detections for the VideoUploadCard display
  const detectionsForCard = useMemo(
    () =>
      result?.length
        ? result.map((r) => ({
            ...r,
            confidence: r.confidence ?? 0,
            timestampMs: r.timestampMs ?? performance.now(),
          }))
        : [],
    [result],
  );

  const handleStartDetection = useCallback(() => {
    startDetection();
    setIsDetectionActive(true);
  }, [startDetection]);

  const handleStopDetection = useCallback(() => {
    stopDetection();
    setIsDetectionActive(false);
    setSavedDetections(new Set());
    setCurrentDiagnosis(null);
  }, [stopDetection]);

  // UI status calculations
  const totalDetections = currentDiagnosis ? detectionsForCard.length : 0;
  const unhealthyDetections = detectionsForCard.filter(
    (d) => d.label.toLowerCase() !== "healthy",
  ).length;

  return (
    <div
      className={`flex flex-col items-center pt-32 px-4 pb-8 md:pb-16 ${textColor}`}
    >
      {/* Heading (Enhanced) */}
      <div className={`text-center mb-10 ${textColor}`}>
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className={primaryColor}>Video AI</span> Detection 🎥
        </motion.h2>
        <motion.p
          className={`mt-2 max-w-2xl mx-auto ${secondaryTextColor}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Upload a video file or link to analyze motion sequences for poultry
          health.
        </motion.p>
      </div>

      {/* Video Upload Card Container */}
      <div className="w-full md:w-4/5 lg:w-3/4" style={{ maxWidth: "1200px" }}>
        <VideoUploadCard
          videoRef={videoRef}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
          detections={detectionsForCard}
          startDetection={handleStartDetection}
          stopDetection={handleStopDetection}
          onFileSelected={(file) => console.log("Selected file", file)}
          isDetectionActive={isDetectionActive} // Pass new state
        />
      </div>

      {/* --- Status & Actions Footer --- */}
      <div className="w-full md:w-4/5 lg:w-3/4" style={{ maxWidth: "1200px" }}>
        {/* Main Action Buttons */}
        <div className="mt-8">
          <ActionButtonGroup
            buttons={[
              {
                label: "Back to Scan Options",
                theme: theme,
                onClick: () => router.push("/scan"),
                icon: <BackwardIcon className="w-5 h-5" />,
              },
            ]}
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

          <h3
            className={`text-lg font-bold mb-3 ${primaryColor} flex items-center`}
          >
            <VideoCameraIcon
              className={`w-5 h-5 mr-2 ${isDetectionActive ? "text-blue-500 animate-pulse" : "text-gray-500"}`}
            />
            Detection Status:
            <motion.span
              key={isDetectionActive ? "Active" : "Ready"}
              className="ml-2"
              initial="hidden"
              animate="visible"
              variants={statusVariants}
            >
              {isDetectionActive
                ? "Scanning Video Stream..."
                : previewUrl
                  ? "Video Loaded, Ready to Play"
                  : "Awaiting Video Upload"}
            </motion.span>
          </h3>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-2 border-r border-dashed border-gray-700/50">
              <p className={`text-xl font-bold ${textColor}`}>
                {totalDetections}
              </p>
              <p className={`text-xs ${secondaryTextColor}`}>
                Objects per Frame
              </p>
            </div>
            <div className="p-2 border-r border-dashed border-gray-700/50">
              <p className="text-xl font-bold text-red-500">
                {unhealthyDetections}
              </p>
              <p className={`text-xs ${secondaryTextColor}`}>
                Unhealthy Findings
              </p>
            </div>
            <div className="p-2">
              <p
                className={`text-xl font-bold ${currentDiagnosis?.isSaved ? "text-green-500" : textColor}`}
              >
                {savedDetections.size}
              </p>
              <p className={`text-xs ${secondaryTextColor}`}>Records Saved</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.p
              className="mt-3 p-3 bg-red-900/20 text-red-400 rounded-lg text-sm font-medium"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ShieldExclamationIcon className="w-4 h-4 inline mr-1" />{" "}
              **Error:** {error}
            </motion.p>
          )}

          {/* Primary Diagnosis */}
          {currentDiagnosis && (
            <motion.div
              className={`mt-3 pt-3 border-t border-dashed ${theme === "dark" ? "border-gray-700" : "border-gray-300"} text-sm ${secondaryTextColor}`}
              key={currentDiagnosis.label + currentDiagnosis.confidence} // Key for re-animation on change
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="font-semibold text-base mb-1">
                Latest Confident Diagnosis:
                <span
                  className={`ml-2 font-bold ${currentDiagnosis.label.toLowerCase() === "healthy" ? "text-green-500" : "text-red-500"}`}
                >
                  {currentDiagnosis.label}
                </span>
              </p>
              <p className="text-xs">
                Confidence:{" "}
                <span className="font-semibold text-indigo-500">
                  {Math.round(currentDiagnosis.confidence * 100)}%
                </span>
                {currentDiagnosis.isSaved && (
                  <span className="ml-4 text-green-500">
                    (<ShieldCheckIcon className="w-3 h-3 inline mr-0.5" />{" "}
                    Saved)
                  </span>
                )}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
