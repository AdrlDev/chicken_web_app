"use client";

import { useEffect, useRef, useState } from "react";
import { Detection } from "@/domain/entities/Detection";
import { FrameEncoder } from "@/domain/services/FrameEncoder";

export const useDetectionSocket = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  // Connect once
  useEffect(() => {
    const ws = new WebSocket("ws://aedev.cloud/ws/detect");
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Connected to YOLO WebSocket");
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.detections) {
          setDetections((prev) => {
            const same = JSON.stringify(prev) === JSON.stringify(data.detections);
            return same ? prev : data.detections;
          });
        }
      } catch (err) {
        console.error("Failed to parse WebSocket data:", err);
      }
    };

    ws.onclose = () => {
      console.log("🛑 WebSocket closed");
      setConnected(false);
    };

    return () => ws.close();
  }, []);

  // Only send frames when:
  // - socket is open
  // - video has valid frames (videoWidth > 0)
  useEffect(() => {
    const video = videoRef.current;
    const socket = socketRef.current;
    if (!video || !socket) return;

    const sendFrame = () => {
      if (!connected || socket.readyState !== WebSocket.OPEN) return;
      if (!video.videoWidth || !video.videoHeight) return; // camera not ready yet
      const frame = FrameEncoder.encode(video);
      if (frame) socket.send(frame);
    };

    const interval = setInterval(sendFrame, 300);

    return () => clearInterval(interval);
  }, [connected, videoRef]);

  return { detections };
};