"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/loginHooks/useAuth';
import { useCamera } from "@/hooks/useCamera";
import { useDetectionSocket } from "@/hooks/useDetectionSocket";
import Navbar from "@/components/Navbar";
import CameraView from "@/components/CameraView";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion } from "framer-motion";
import Footer from "@/components/footer/Footer";

export default function CameraPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // isActive and stopCamera are used inside useEffect (in the cleanup)
  const { videoRef, startCamera, stopCamera, isActive, error } = useCamera(); 
  const { detections } = useDetectionSocket(videoRef);

  // --- Authentication Check and Redirection ---
  useEffect(() => {
    // 1. Authentication Check
    if (!isLoading && user === null) {
      router.push('/login'); 
    }
    
    // 2. Cleanup function to stop camera
    // ESLint requires 'isActive' and 'stopCamera' to be included here
    return () => {
        if (isActive) {
            stopCamera();
        }
    }
  }, [user, isLoading, router, isActive, stopCamera]); // <-- Dependencies are now exhaustive

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
  console.log(detections);

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
            detections={detections}
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