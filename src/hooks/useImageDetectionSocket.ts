"use client";

import { useEffect, useRef, useState } from "react";
import { Detection } from "@/domain/entities/Detection";

interface DetectionResponse {
  detections: Detection[];
}

export function useImageDetectionSocket() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "wss://aedev.cloud/ws/detect"; // update if needed
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected for image detection");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data: DetectionResponse = JSON.parse(event.data);
        if (data.detections) {
          setDetections(data.detections);
        }
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
      setError("Connection error");
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket closed");
      setIsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  /**
   * Sends a base64-encoded image to the WebSocket server
   */
  const sendImage = (base64: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ image: base64 }));
    } else {
      console.warn("⚠️ WebSocket not open, cannot send image");
      setError("WebSocket not connected");
    }
  };

  return { detections, sendImage, isConnected, error };
}