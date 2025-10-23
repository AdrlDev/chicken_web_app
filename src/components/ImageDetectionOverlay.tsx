"use client";

import React, { useEffect, useRef, useState } from "react";
import { Detection } from "@/domain/entities/Detection";

interface Props {
  imageRef: React.RefObject<HTMLImageElement | null>;
  detections: Detection[];
}

const labelColors: Record<string, string> = {
  "avian Influenza": "#ff9341ff",
  "newcastle Disease": "#FF0000",
  "fowl Pox": "#FFA500",
  "infectious Bronchitis": "#00FFFF",
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
    if (!canvas || !ctx || !imageRef.current) return;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw new detections
    detections.forEach((det) => {
      const [x1, y1, x2, y2] = det.bbox;
      const label = det.label ?? "object";
      const color = labelColors[label] || labelColors.default;
      const confidence = (det.confidence * 100).toFixed(1) + "%";

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      // Label background
      const labelText = `${label} (${confidence})`;
      const textWidth = ctx.measureText(labelText).width + 8;
      const textHeight = 18;

      ctx.fillStyle = color;
      ctx.fillRect(x1, y1 - textHeight, textWidth, textHeight);

      // Label text
      ctx.fillStyle = "#000";
      ctx.font = "bold 14px Arial";
      ctx.fillText(labelText, x1 + 4, y1 - 4);
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