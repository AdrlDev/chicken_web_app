/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useCallback } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      console.log("🎥 Starting camera...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      const video = videoRef.current;
      if (!video) {
        console.error("⚠️ videoRef not ready (video not rendered yet)");
        return;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      streamRef.current = stream;
      video.srcObject = stream;

      await video.play();
      console.log("✅ Camera stream playing");
      setIsActive(true);
    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Failed to access camera. Check HTTPS and permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    console.log("🛑 Stopping camera");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  return { videoRef, startCamera, stopCamera, isActive, error };
}