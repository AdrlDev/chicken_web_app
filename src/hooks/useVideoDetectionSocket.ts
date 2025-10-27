/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";

export interface DetectionBox {
  bbox: number[];
  label: string;
  confidence?: number;
}

export const useVideoDetectionSocket = (
  videoRef: React.RefObject<HTMLVideoElement | null>
) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<DetectionBox[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const animationRef = useRef<number | null>(null);

  const startDetection = () => {
    if (!videoRef.current) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/video-detect`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    ws.onopen = () => {
      console.log("🟢 Connected to video detection WebSocket");
      setIsDetecting(true);
      video.play();

      const sendFrame = () => {
        if (!video || ws.readyState !== WebSocket.OPEN) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) blob.arrayBuffer().then((buffer) => ws.send(buffer));
        }, "image/jpeg", 0.5);

        animationRef.current = requestAnimationFrame(sendFrame);
      };

      sendFrame();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Some YOLO servers send an object {boxes: [], labels: []}
        // Normalize both formats:
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
          setResult([]);
        }
      } catch (err) {
        console.error("❌ Invalid detection data", err);
      }
    };

    ws.onclose = () => {
      console.log("🔴 WebSocket closed");
      setIsDetecting(false);
    };
  };

  const stopDetection = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsDetecting(false);
  };

  useEffect(() => stopDetection, []); // cleanup on unmount

  return { isDetecting, result, startDetection, stopDetection };
};