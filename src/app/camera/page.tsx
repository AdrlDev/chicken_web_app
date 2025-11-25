"use client";

import { useCamera } from "@/hooks/useCamera";
import { useDetectionSocket } from "@/hooks/useDetectionSocket";
import Navbar from "@/components/Navbar";
import CameraView from "@/components/CameraView";
import { motion } from "framer-motion";
import Footer from "@/components/footer/Footer";

export default function CameraPage() {
  const { videoRef, startCamera, stopCamera, isActive, error } = useCamera();
  const { detections } = useDetectionSocket(videoRef);

  console.log(detections)

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