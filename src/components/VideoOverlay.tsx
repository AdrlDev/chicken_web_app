"use client";

import React, { useRef, useEffect } from "react";

interface DetectionBox {
  bbox: number[];
  label: string;
  confidence?: number;
}

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  detections: DetectionBox[] | null;
}

const labelColors: Record<string, string> = {
  "avian Influenza": "#ff9341",
  "blue comb": "#00fffb",
  "coccidiosis": "#da4e4e",
  "coccidiosis poops": "#cc0909",
  "fowl cholera": "#f188f3",
  "fowl-pox": "#ff00bf",
  "mycotic infections": "#ffdc5e",
  default: "#00FF00",
};

const VideoOverlay: React.FC<Props> = ({ videoRef, detections }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      if (!video || !ctx) return;

      // 🧠 Match canvas size to the rendered video size
      const width = video.clientWidth;
      const height = video.clientHeight;
      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);

      // ✅ Scale detections to match current display size
      const scaleX = width / video.videoWidth;
      const scaleY = height / video.videoHeight;

      detections?.forEach((det) => {
        if (!det.bbox || det.bbox.length < 4) return;
        const [x1, y1, x2, y2] = det.bbox;

        const sx1 = x1 * scaleX;
        const sy1 = y1 * scaleY;
        const sx2 = x2 * scaleX;
        const sy2 = y2 * scaleY;

        const color = labelColors[det.label] || labelColors.default;
        const confidence = ((det.confidence ?? 0) * 100).toFixed(1) + "%";
        const label = `${det.label} (${confidence})`;

        // Box
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx1, sy1, sx2 - sx1, sy2 - sy1);

        // Label
        ctx.font = "bold 14px Arial";
        const textWidth = ctx.measureText(label).width + 8;
        const textHeight = 18;

        ctx.fillStyle = color;
        ctx.fillRect(sx1, sy1 - textHeight, textWidth, textHeight);

        ctx.fillStyle = "#000";
        ctx.fillText(label, sx1 + 4, sy1 - 4);
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [detections, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
    />
  );
};

export default VideoOverlay;