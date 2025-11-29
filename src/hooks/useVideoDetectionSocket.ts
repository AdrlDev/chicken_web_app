import { useEffect, useRef, useState } from "react";
import { Detection } from "@/domain/entities/Detection";
import { VideoResult } from "@/domain/entities/VideoResult";

interface UseVideoDetectionSocket {
  isDetecting: boolean;
  result: Detection[];
  startDetection: () => void;
  stopDetection: () => void;
  // ✨ FIX: Add isConnected and error to the interface
  isConnected: boolean;
  error: string | null;
}

export const useVideoDetectionSocket = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  frameRate: number = 5, // 🧠 adjustable send rate (5fps default)
): UseVideoDetectionSocket => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<Detection[]>([]);
  // ✨ FIX: Add state for connection and error
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const lastSendTime = useRef<number>(0);
  const animationRef = useRef<number | null>(null);

  // ----------------------------------------------------
  // ⭐️ FIX: Explicitly send STOP signal before closing
  // ----------------------------------------------------
  const stopDetection = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("🟡 Sending STOP signal to backend...");

      try {
        wsRef.current.send("STOP_DETECTION");
      } catch (error) {
        console.error("❌ Failed to send stop signal:", error);
      }

      wsRef.current.close(1000, "Manual stop");
    }

    wsRef.current = null;
    setIsDetecting(false);
    // Setting connection to false will be handled in ws.onclose,
    // but we can ensure the error is cleared on an intentional stop.
    setError(null);
  };
  // ----------------------------------------------------

  const startDetection = () => {
    const video = videoRef.current;
    if (!video) {
      console.warn("🎥 No video element found");
      setError("No video element found.");
      return;
    }

    stopDetection(); // Close previous connections
    setError(null); // Clear previous errors on start

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/video-detect`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    ws.onopen = () => {
      console.log("🟢 Connected to video detection WebSocket");
      setIsDetecting(true);
      // ✨ FIX: Update isConnected
      setIsConnected(true);
      setError(null);
      video.play().catch(() => {});

      const sendFrame = () => {
        const videoElement = videoRef.current;
        // Ensure video element is available AND not paused/ended
        if (
          !videoElement ||
          videoElement.paused ||
          videoElement.ended ||
          ws.readyState !== WebSocket.OPEN
        ) {
          animationRef.current = requestAnimationFrame(sendFrame);
          return;
        }

        const now = performance.now();
        const interval = 1000 / frameRate;

        if (now - lastSendTime.current >= interval) {
          try {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
              (blob) => {
                if (blob && ws.readyState === WebSocket.OPEN) {
                  ws.send(blob);
                }
              },
              "image/jpeg",
              0.5,
            );

            lastSendTime.current = now;
          } catch (err) {
            console.error("❌ Frame send error:", err);
          }
        }

        animationRef.current = requestAnimationFrame(sendFrame);
      };

      sendFrame();
    };

    ws.onmessage = (event) => {
      try {
        const data: VideoResult = JSON.parse(event.data);

        const detections = data.detections;

        if (detections && Array.isArray(detections)) {
          setResult(detections); // store the detections
        } else {
          console.warn("⚠️ Unexpected data format", data);
        }
      } catch (err) {
        console.error("❌ Invalid detection data", err);
      }
    };

    ws.onerror = (err) => {
      // ✨ FIX: Update error state
      console.error("⚠️ WebSocket error:", err);
      setError("WebSocket connection failed. Check server status.");
    };

    ws.onclose = (e) => {
      console.log(`🔴 WebSocket closed (code ${e.code}):`, e.reason);
      setIsDetecting(false);
      // ✨ FIX: Update isConnected
      setIsConnected(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      wsRef.current = null;

      if (e.code !== 1000 && e.code !== 1001) {
        // 1000=Normal Closure, 1001=Going Away
        console.log("♻️ Attempting reconnection...");
        setError(
          `Connection lost (Code ${e.code}). Attempting reconnection...`,
        );
        setTimeout(startDetection, 3000);
      } else {
        setError(null); // Clear error on clean closure
      }
    };
  };

  useEffect(() => stopDetection, []);

  return {
    isDetecting,
    result,
    startDetection,
    stopDetection,
    isConnected,
    error,
  };
};
