"use client";

import React, { useRef, useEffect } from "react";

interface DetectionBox {
  bbox: number[];
  label: string;
  confidence?: number;
}

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  detections: DetectionBox[];
}

const labelColors: Record<string, string> = {
  "avian Influenza": "#ff9341ff",
  "blue comb": "#00fffbff",
  "coccidiosis": "#da4e4eff",
  "coccidiosis poops": "#cc0909ff",
  "fowl cholera": "#f188f3ff",
  "fowl-pox": "#ff00bfff",
  "Mycotic Infections": "#ffdc5eff",
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

    const draw = () => {
      if (!video || !ctx) return;

      // Always match canvas to current video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scaleX = video.clientWidth / video.videoWidth;
      const scaleY = video.clientHeight / video.videoHeight;

      detections.forEach((det) => {
        if (det.bbox.length < 4) return;
        const [x1, y1, x2, y2] = det.bbox;

        // Scale bbox coordinates
        const sx1 = x1 * scaleX;
        const sy1 = y1 * scaleY;
        const sx2 = x2 * scaleX;
        const sy2 = y2 * scaleY;

        const color = labelColors[det.label] || labelColors.default;
        const confidence = ((det.confidence ?? 0) * 100).toFixed(1) + "%";
        const label = `${det.label} (${confidence})`;

        // Bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx1, sy1, sx2 - sx1, sy2 - sy1);

        // Label background
        ctx.font = "bold 14px Arial";
        const textWidth = ctx.measureText(label).width + 8;
        const textHeight = 18;

        ctx.fillStyle = color + "AA"; // semi-transparent
        ctx.fillRect(sx1, sy1 - textHeight, textWidth, textHeight);

        // Label text
        ctx.fillStyle = "#000";
        ctx.fillText(label, sx1 + 4, sy1 - 4);
      });

      requestAnimationFrame(draw);
    };

    draw(); // start animation loop

    return () => cancelAnimationFrame(draw as unknown as number);
  }, [detections, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
};

export default DetectionOverlay;