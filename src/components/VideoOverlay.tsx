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
  "avian Influenza": "#ff9341ff",
  "blue comb": "#00fffbff",
  "coccidiosis": "#da4e4eff",
  "coccidiosis poops": "#cc0909ff",
  "fowl cholera": "#f188f3ff",
  "fowl-pox": "#ff00bfff",
  "mycotic infections": "#ffdc5eff",
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

    // 🟢 Resize canvas to match video size
    const resizeCanvas = () => {
      if (!canvas || !video) return;
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    };

    const draw = () => {
      if (!video || !ctx) return;
      resizeCanvas();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rect = video.getBoundingClientRect();
      const scaleX = rect.width / video.videoWidth;
      const scaleY = rect.height / video.videoHeight;

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

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx1, sy1, sx2 - sx1, sy2 - sy1);

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

    // 🔄 Handle fullscreen change
    const handleFullscreenChange = () => {
      setTimeout(() => resizeCanvas(), 200);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("resize", resizeCanvas);

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [detections, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
    />
  );
};

export default VideoOverlay;
