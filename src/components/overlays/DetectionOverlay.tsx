"use client";

import React, { useRef, useEffect } from "react";
import { Detection } from "@/domain/entities/Detection";
import { roundRect, hexToRgba, labelColors } from "@/utils/canvasUtils";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  detections: Detection[];
}

const LiveDetectionOverlay: React.FC<Props> = ({ videoRef, detections }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      if (!video || !ctx) return;

      // Set canvas size to match video display size
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scaleX = canvas.width / video.videoWidth;
      const scaleY = canvas.height / video.videoHeight;

      detections.forEach((det) => {
        if (!det.bbox || det.bbox.length < 4) return;
        const [x1, y1, x2, y2] = det.bbox;

        const sx1 = x1 * scaleX;
        const sy1 = y1 * scaleY;
        const sx2 = x2 * scaleX;
        const sy2 = y2 * scaleY;

        const width = sx2 - sx1;
        const height = sy2 - sy1;

        const color = labelColors[det.label] || labelColors.default;
        const confidence = ((det.confidence ?? 0) * 100).toFixed(1) + "%";
        const label = `${det.label} (${confidence})`;

        // Rounded bounding box
        ctx.strokeStyle = hexToRgba(color, 1);
        ctx.lineWidth = 2;
        roundRect(ctx, sx1, sy1, width, height, 6, false, true);

        // Label background
        ctx.font = "bold 14px Arial";
        const textWidth = ctx.measureText(label).width + 8;
        const textHeight = 18;
        ctx.fillStyle = hexToRgba(color, 0.7);
        roundRect(ctx, sx1, sy1 - textHeight, textWidth, textHeight, 4, true, false);

        // Label text
        ctx.fillStyle = "#000";
        ctx.fillText(label, sx1 + 4, sy1 - 4);
      });

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      // Cleanup: cancel animation loop
      cancelAnimationFrame(draw as unknown as number);
    };
  }, [detections, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
};

export default LiveDetectionOverlay;
