import { useEffect, useRef, useState } from "react";
import { Detection } from "@/domain/entities/Detection";
import { VideoResult } from "@/domain/entities/VideoResult";

interface UseVideoDetectionSocket {
  isDetecting: boolean;
  result: Detection[];
  startDetection: () => void;
  stopDetection: () => void;
}

export const useVideoDetectionSocket = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  frameRate: number = 5, // 🧠 adjustable send rate (5fps default)
): UseVideoDetectionSocket => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<Detection[]>([]);
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

      // 1. Send the STOP signal as text data
      try {
        // Use the signal string that the backend (detection_ws.py) is listening for
        wsRef.current.send("STOP_DETECTION");
      } catch (error) {
        console.error("❌ Failed to send stop signal:", error);
      }

      // 2. Close the connection gracefully (Code 1000 is Normal Closure)
      wsRef.current.close(1000, "Manual stop");
    }

    wsRef.current = null;
    setIsDetecting(false);
    // You might also want to clear the results when detection is fully stopped:
    // setResult([]);
  };
  // ----------------------------------------------------

  const startDetection = () => {
    const video = videoRef.current;
    if (!video) {
      console.warn("🎥 No video element found");
      return;
    }

    stopDetection(); // Close previous connections

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/video-detect`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    ws.onopen = () => {
      console.log("🟢 Connected to video detection WebSocket");
      setIsDetecting(true);
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
                  blob.arrayBuffer().then((buffer) => ws.send(buffer));
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

    ws.onerror = (err) => console.error("⚠️ WebSocket error:", err);

    ws.onclose = (e) => {
      console.log(`🔴 WebSocket closed (code ${e.code}):`, e.reason);
      setIsDetecting(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      wsRef.current = null;

      // 🔁 Optional: auto-reconnect logic
      if (e.code !== 1000) {
        console.log("♻️ Attempting reconnection...");
        setTimeout(startDetection, 3000);
      }
    };
  };

  useEffect(() => stopDetection, []);

  return { isDetecting, result, startDetection, stopDetection };
};
