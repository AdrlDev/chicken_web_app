/* eslint-disable react-hooks/exhaustive-deps */
// VideoUpload.tsx
"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BackwardIcon } from "@heroicons/react/24/solid";
import { useVideoDetectionSocket } from "@/hooks/useVideoDetectionSocket";
import VideoUploadCard from "@/components/card/VideoUploadCard";
import ActionButtonGroup from "@/components/bottons/ActionButtonGroup";
import { useTheme } from "@/components/themes/ThemeContext";
// 👈 IMPORT THE NECESSARY HOOKS
import { useScanInsertion } from "@/hooks/chickenScanHooks/useScanInsertion"; 
import { useAuth } from '@/hooks/loginHooks/useAuth'; // Needed to get the user/farm ID

// Define the shape of a single detection result for clarity
interface DetectionResult {
    label: string;
    confidence: number;
    timestampMs: number;
}


export const VideoUpload: React.FC = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Use the socket hook
  const { result, startDetection, stopDetection } = useVideoDetectionSocket(videoRef);
  
  // Use the theme hook
  const { theme } = useTheme();

  // 👈 Use the auth hook to get the user ID (assuming user.id is the farm_id)
  const { user } = useAuth();
  const farmId = user?.id; // Assuming user.id holds the farm_id

  // 👈 Use the insertion hook
  const { insertScan } = useScanInsertion(); 

  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-900";
  
  // State to track which detections have already been saved to prevent duplicates
  const [savedDetections, setSavedDetections] = useState<Set<string>>(new Set());
  
  // List of diseases you want to save (i.e., not 'Healthy')
  const DISEASES_TO_SAVE = new Set([
      "Avian Influenza", "Blue Comb", "Coccidiosis", "Coccidiosis Poops",
      "Fowl Cholera", "Fowl-pox", "Mycotic Infections", "Salmo"
  ]);

  // --- 1. Function to handle saving the detection ---
  const handleDetectionResult = useCallback(async (detection: DetectionResult) => {
    if (!farmId) {
        console.error("Cannot save scan: Farm ID is missing (user not authenticated).");
        return;
    }
    
    const diagnosis = detection.label;
    
    // Create a unique key for this detection event (label + time window)
    const uniqueKey = `${diagnosis}-${Math.floor(detection.timestampMs / 5000)}`; // Group by 5 seconds
    
    // Check if we have already saved this detection event
    if (savedDetections.has(uniqueKey)) {
        return;
    }

    // Only save if it's an actual disease and has high confidence
    if (DISEASES_TO_SAVE.has(diagnosis) && detection.confidence > 0.7) {
        console.log(`Saving diagnosis: ${diagnosis} with confidence ${detection.confidence}`);
        
        const success = await insertScan({
            diagnosis: diagnosis,
            farm_id: farmId,
        });

        if (success) {
            setSavedDetections(prev => {
                const newSet = new Set(prev);
                newSet.add(uniqueKey);
                return newSet;
            });
            // Optional: Show a toast notification here
        }
    }
  }, [farmId, insertScan, savedDetections]);

  // --- 2. Effect to monitor new detection results ---
  useEffect(() => {
    // Ensure 'result' is an array of detections from the latest frame
    if (result && result.length > 0) {
        
        // Normalize the detection results
        const normalizedResults: DetectionResult[] = result.map((r) => ({
            label: r.label,
            confidence: r.confidence ?? 0,
            timestampMs: r.timestampMs ?? performance.now(),
        }));
        
        // Find the highest confidence non-healthy detection (or the highest healthy one)
        const bestDetection = normalizedResults.reduce((best, current) => {
            // Prioritize diseases over 'Healthy' if confidence is similar
            if (DISEASES_TO_SAVE.has(current.label) && current.confidence > 0.6) {
                return current;
            }
            if (current.confidence > best.confidence) {
                return current;
            }
            return best;
        }, { label: 'Healthy', confidence: 0, timestampMs: performance.now() } as DetectionResult);

        // Process the most confident detection
        if (bestDetection.confidence > 0.7) {
             handleDetectionResult(bestDetection);
        }
    }
  }, [result, handleDetectionResult, DISEASES_TO_SAVE]);

  // Normalize detections for the VideoUploadCard display
  const detectionsForCard = result?.length
    ? result.map((r) => ({
        ...r,
        confidence: r.confidence ?? 0,
        timestampMs: r.timestampMs ?? performance.now(),
      }))
    : [];

  return (
    <div className={`flex flex-col items-center pt-32 px-4 pb-8 md:pb-16 ${textColor}`}>
      <h1 className="text-3xl font-bold mb-6 text-center">
        🎥 Chicken Video Detection (Live)
      </h1>

      {/* Video Upload Card */}
      <VideoUploadCard
        videoRef={videoRef}
        previewUrl={previewUrl}
        setPreviewUrl={setPreviewUrl}
        detections={detectionsForCard}
        startDetection={startDetection}
        stopDetection={stopDetection}
        onFileSelected={(file) => console.log("Selected file", file)}
      />

      {/* ... ActionButtonGroup remains the same ... */}
       <ActionButtonGroup
        buttons={[
          {
            label: "Back to Camera",
            theme: theme,
            onClick: () => router.push("/camera"),
            icon: <BackwardIcon className="w-5 h-5" />,
          },
        ]}
      />
    </div>
  );
};