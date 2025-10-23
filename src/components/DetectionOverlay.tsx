"use client";

import React, { useRef, useEffect } from "react";

interface DetectionBox {
  bbox: number[]; // allow dynamic length
  label: string;
  confidence?: number;
}

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  detections: DetectionBox[];
}

const labelColors: Record<string, string> = {
  "avian Influenza": "#ff9341ff",
  "newcastle Disease": "#FF0000",
  "fowl Pox": "#FFA500",
  "infectious Bronchitis": "#00FFFF",
  // fallback color for labels not listed here
  default: "#00FF00",
};

const DetectionOverlay: React.FC<Props> = ({ videoRef, detections }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas size to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((det) => {
      if (det.bbox.length < 4) return; // skip invalid
      const [x1, y1, x2, y2] = det.bbox;
      const color = labelColors[det.label] || labelColors.default;
      const label = `${det.label} ${((det.confidence ?? 0) * 100).toFixed(1)}%`;

      // Bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      // Label background
      ctx.font = "14px Arial";
      const textWidth = ctx.measureText(label).width;
      const textHeight = 18;
      ctx.fillStyle = color + "80";
      ctx.fillRect(x1, y1 - textHeight, textWidth + 6, textHeight);

      // Label text
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(label, x1 + 3, y1 - 4);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detections]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
};

export default DetectionOverlay;