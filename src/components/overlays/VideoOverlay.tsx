"use client";

import React, { useRef, useEffect } from "react";
import { Detection } from "@/domain/entities/Detection";
import { roundRect, hexToRgba, labelColors } from "@/utils/canvasUtils";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  detections: Detection[] | null;
}

const VideoOverlay: React.FC<Props> = ({ videoRef, detections }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Resize canvas when video or window changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const resizeCanvas = () => {
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("fullscreenchange", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("fullscreenchange", resizeCanvas);
    };
  }, [videoRef]);

  // Draw bounding boxes when detections change
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = video.getBoundingClientRect();
    const videoRatio = video.videoWidth / video.videoHeight;
    const rectRatio = rect.width / rect.height;

    let scaleX = rect.width / video.videoWidth;
    let scaleY = rect.height / video.videoHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (rectRatio > videoRatio) {
      scaleX = scaleY;
      offsetX = (rect.width - video.videoWidth * scaleX) / 2;
    } else {
      scaleY = scaleX;
      offsetY = (rect.height - video.videoHeight * scaleY) / 2;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections?.forEach((det) => {
      if (!det.bbox || det.bbox.length < 4) return;

      const [x1, y1, x2, y2] = det.bbox;
      const sx1 = x1 * scaleX + offsetX;
      const sy1 = y1 * scaleY + offsetY;
      const sx2 = x2 * scaleX + offsetX;
      const sy2 = y2 * scaleY + offsetY;

      const color = labelColors[det.label] || labelColors.default;
      const confidence = ((det.confidence ?? 0) * 100).toFixed(1) + "%";
      const label = `${det.label} (${confidence})`;

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(sx1, sy1, sx2 - sx1, sy2 - sy1);

      // Dynamic font size
      const boxHeight = sy2 - sy1;
      const fontSize = Math.max(Math.min(boxHeight / 5, 20), 10); // 10px min, 20px max
      ctx.font = `bold ${fontSize}px Arial`;

      const textWidth = ctx.measureText(label).width + 8;
      const textHeight = fontSize + 6;

      // Draw semi-transparent, rounded label background
      const radius = Math.min(6, textHeight / 2);
      ctx.fillStyle = hexToRgba(color, 0.7); // 70% opacity
      roundRect(ctx, sx1, sy1 - textHeight, textWidth, textHeight, radius, true, false);

      // Draw text
      ctx.fillStyle = "#000";
      ctx.fillText(label, sx1 + 4, sy1 - 4);
    });
  }, [detections, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
    />
  );
};

export default VideoOverlay;
