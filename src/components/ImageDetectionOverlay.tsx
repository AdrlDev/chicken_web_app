"use client";

import React, { useEffect, useRef, useState } from "react";
import { Detection } from "@/domain/entities/Detection";

interface Props {
  imageRef: React.RefObject<HTMLImageElement | null>;
  detections: Detection[];
}

const labelColors: Record<string, string> = {
  "avian Influenza": "#ff9341ff",
  "blue comb": "#00fffbff",
  "coccidiosis": "#da4e4eff",
  "coccidiosis poops": "#cc0909ff",
  "fowl cholera": "#f188f3ff",
  "fowl-pox": "#ff00bfff",
  "Mycotic Infections": "#ffdc5eff",
  // fallback color for labels not listed here
  default: "#00FF00",
};

const ImageDetectionOverlay: React.FC<Props> = ({ imageRef, detections }) => {
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Sync canvas size to image size dynamically
  useEffect(() => {
    const updateDimensions = () => {
      if (imageRef.current) {
        setDimensions({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [imageRef]);

  // Draw bounding boxes
  useEffect(() => {
    const canvas = overlayRef.current;
    const ctx = canvas?.getContext("2d");
    const image = imageRef.current;
    if (!canvas || !ctx || !image) return;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Get scaling ratio between image’s natural and displayed size
    const scaleX = image.clientWidth / image.naturalWidth;
    const scaleY = image.clientHeight / image.naturalHeight;

    // Draw new detections
    detections.forEach((det) => {
      const [x1, y1, x2, y2] = det.bbox;
      const label = det.label ?? "object";
      const color = labelColors[label] || labelColors.default;
      const confidence = (det.confidence * 100).toFixed(1) + "%";

      // Scale bbox coordinates to fit displayed image size
      const sx1 = x1 * scaleX;
      const sy1 = y1 * scaleY;
      const sx2 = x2 * scaleX;
      const sy2 = y2 * scaleY;

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(sx1, sy1, sx2 - sx1, sy2 - sy1);

      // Label background
      const labelText = `${label} (${confidence})`;
      ctx.font = "bold 14px Arial";
      const textWidth = ctx.measureText(labelText).width + 8;
      const textHeight = 18;

      // ✅ use scaled coordinates here instead of (x1, y1)
      ctx.fillStyle = color;
      ctx.fillRect(sx1, sy1 - textHeight, textWidth, textHeight);

      // Label text
      ctx.fillStyle = "#000";
      ctx.fillText(labelText, sx1 + 4, sy1 - 4);
    });
  }, [detections, dimensions, imageRef]);

  return (
    <canvas
      ref={overlayRef}
      width={dimensions.width}
      height={dimensions.height}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
};

export default ImageDetectionOverlay;