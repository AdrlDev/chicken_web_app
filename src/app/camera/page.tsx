/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from 'react'; // Added useState and useCallback
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/loginHooks/useAuth';
import { useCamera } from "@/hooks/useCamera";
import { useDetectionSocket } from "@/hooks/useDetectionSocket";
import { useScanInsertion } from "@/hooks/chickenScanHooks/useScanInsertion"; // 👈 NEW IMPORT
import Navbar from "@/components/Navbar";
import CameraView from "@/components/CameraView";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion } from "framer-motion";
import Footer from "@/components/footer/Footer";

// Define the shape for detection results (assuming consistency with other components)
interface DetectionResult {
    label: string;
    confidence: number;
    timestampMs?: number; 
}

// List of labels that should be saved to the database (including 'healthy' for tracking)
const LABELS_TO_SAVE = new Set([
    "avian influenza", "blue comb", "coccidiosis", "coccidiosis poops",
    "fowl cholera", "fowl-pox", "mycotic infections", "salmo", "healthy"
]);


export default function CameraPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Camera and Socket Hooks
  const { videoRef, startCamera, stopCamera, isActive, error } = useCamera(); 
  const { detections } = useDetectionSocket(videoRef) as { detections: DetectionResult[] | null };
  
  // Scan Insertion Hook
  const { insertScan } = useScanInsertion(); // 👈 NEW HOOK

  // State to track which detections have already been saved to prevent duplicates
  const [savedDetections, setSavedDetections] = useState<Set<string>>(new Set());
  

  // --- 1. Function to handle saving the most confident detection ---
  const handleDetectionResult = useCallback(async (detection: DetectionResult) => {
    const diagnosis = detection.label.toLowerCase();
    
    // Create a unique key for this detection event (label + time window, e.g., 5 seconds)
    // This is crucial for continuous live streams to prevent saving every frame's detection.
    const uniqueKey = `${diagnosis}-${Math.floor(Date.now() / 5000)}`; 
    
    // Check if we have already saved this detection event
    if (savedDetections.has(uniqueKey)) {
        return;
    }

    // Only save if it's a label we care about and has high confidence
    if (LABELS_TO_SAVE.has(diagnosis) && detection.confidence > 0.4) {
        console.log(`[Camera] Saving diagnosis: ${diagnosis} with confidence ${detection.confidence}`);
        
        const success = await insertScan({
            diagnosis: diagnosis,
        });

        if (success) {
            setSavedDetections(prev => {
                const newSet = new Set(prev);
                newSet.add(uniqueKey);
                return newSet;
            });
            console.log(`[Camera] SUCCESSFULLY SAVED: ${diagnosis}`);
        }else {
            console.error(`[Camera] FAILED to save scan for ${diagnosis}.`);
        }
    }
  }, [insertScan, savedDetections]);


  // --- 2. Effect to monitor new detection results (runs when detections changes) ---
  useEffect(() => {
    // Only process results if the camera is actively running
    if (!isActive || !detections || detections.length === 0) {
      return;
    }

    // Find the single best detection (highest confidence) from the latest frame
    const bestDetection = detections.reduce((best, current) => {
        if (current.confidence > best.confidence) {
            return current;
        }
        return best;
    }, { label: 'healthy', confidence: 0 } as DetectionResult); // Initialize with a dummy low-conf result

    // Process the most confident detection
    if (bestDetection.confidence > 0.4) {
         handleDetectionResult(bestDetection);
    }
    
  }, [detections, isActive, handleDetectionResult]);


  // --- Authentication Check and Redirection ---
  useEffect(() => {
    if (!isLoading && user === null) {
      router.push('/login'); 
    }
    
    // Cleanup function to stop camera
    return () => {
        if (isActive) {
            stopCamera();
        }
    }
  }, [user, isLoading, router, isActive, stopCamera]); 

  // --- Loading State Check ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <LoadingSpinner size={80} color1="blue-500" color2="cyan-400" />
      </div>
    );
  }

  // --- Access Denied/Redirecting State ---
  if (user === null && !isLoading) {
    return null; 
  }

  // --- Authorized User Content ---
  // console.log(detections); // Keep or remove depending on preference

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-50">
        <Navbar />
      </header>
      <CameraView
            videoRef={videoRef}
            onToggleCamera={isActive ? stopCamera : startCamera}
            isActive={isActive}
            error={error}
            detections={detections as any}
          />
      <Footer />
      {/* Background subtle animation circles */}
      <motion.div
        className="absolute top-0 left-1/2 w-[500px] h-[500px] -translate-x-1/2 rounded-full bg-indigo-500 opacity-10 blur-3xl pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full bg-green-500 opacity-10 blur-3xl pointer-events-none"
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />
    </>
  );
}