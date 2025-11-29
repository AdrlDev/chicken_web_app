/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useImageDetectionSocket } from "@/hooks/useImageDetectionSocket";
import { useTheme } from "@/components/themes/ThemeContext";
import { PhotoIcon, BackwardIcon } from "@heroicons/react/24/solid";
import ActionButtonGroup from "@/components/bottons/ActionButtonGroup";
import DetectionCard from "@/components/card/DetectionCard";
import { DetectionResult } from "@/utils/detectionUtils";

// 👈 IMPORT THE NECESSARY HOOKS
import { useScanInsertion } from "@/hooks/chickenScanHooks/useScanInsertion";

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

export default function UploadPage() {
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  // Type inference should work here, but we ensure 'detections' is treated as DetectionResult[]
  const { detections, sendImage, isConnected, error } =
    useImageDetectionSocket() as {
      detections: DetectionResult[] | null;
      sendImage: (base64: string) => void;
      isConnected: boolean;
      error: string | null;
    };
  const { theme } = useTheme();

  // 👈 Use the insertion hook
  const { insertScan } = useScanInsertion();

  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-900";

  // State to track if the current image's result has already been saved
  const [isScanSaved, setIsScanSaved] = useState(false);

  // --- 1. Function to handle saving the most confident detection ---
  // Fixes: Parameter 'detectionResults' implicitly has an 'any' type.
  const handleScanInsertion = useCallback(
    async (detectionResults: DetectionResult[]) => {
      if (isScanSaved) {
        return;
      }

      // Fixes: Parameter 'best' and 'current' implicitly has an 'any' type.
      const bestDetection = detectionResults.reduce(
        (best: DetectionResult, current: DetectionResult) => {
          // Use the nullish coalescing operator (?? 0) for safety
          if ((current.confidence ?? 0) > (best.confidence ?? 0)) {
            return current;
          }
          return best;
        },
        { label: "", confidence: 0, timestampMs: 0 },
      );

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
    // We confirm detections is not null and has items before calling the handler
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

  return (
    <div className="flex flex-col items-center pt-32 px-4 pb-8 md:pb-16">
      {/* Heading */}
      <div className={`text-center mb-6 ${textColor}`}>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          📸 Upload Detection
        </h2>
        <p className="mt-2 max-w-2xl mx-auto">
          Upload an image to detect poultry diseases in real-time.
        </p>
      </div>

      {/* Image Card */}
      <DetectionCard
        imageSrc={imageSrc}
        imageRef={imageRef}
        detections={detections as any}
        aspectRatio="16 / 9"
        maxWidth="1200px"
      />

      {/* Action Buttons */}
      <div className="mt-6">
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

      {!isConnected && (
        <p className="text-yellow-400 mt-3">
          Connecting to detection server...
        </p>
      )}

      {error && <p className="text-red-400 mt-3">{error}</p>}

      {/* Display confirmation that the scan was saved */}
      {isScanSaved && (
        <p className="text-green-500 mt-3 font-semibold">
          Scan result successfully recorded!
        </p>
      )}
    </div>
  );
}
