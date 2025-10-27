import { useEffect, useRef, useState } from "react";

export interface DetectionBox {
  bbox: number[];
  label: string;
  confidence?: number;
}

interface UseVideoDetectionSocket {
  isDetecting: boolean;
  result: DetectionBox[];
  startDetection: () => void;
  stopDetection: () => void;
}

export const useVideoDetectionSocket = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  frameRate: number = 5 // 🧠 adjustable send rate (5fps default)
): UseVideoDetectionSocket => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<DetectionBox[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const lastSendTime = useRef<number>(0);
  const animationRef = useRef<number | null>(null);

  const stopDetection = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, "Manual stop");
    }
    wsRef.current = null;
    setIsDetecting(false);
  };

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
        if (!video || ws.readyState !== WebSocket.OPEN) return;

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
              0.5
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
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          setResult(data);
        } else if (Array.isArray(data.boxes)) {
          const detections = data.boxes.map((bbox: number[], i: number) => ({
            bbox,
            label: data.labels?.[i] ?? "unknown",
            confidence: data.confidences?.[i] ?? 0,
          }));
          setResult(detections);
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
