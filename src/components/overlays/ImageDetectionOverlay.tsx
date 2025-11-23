"use client";

import React, { useEffect, useRef, useState } from "react";
import { Detection } from "@/domain/entities/Detection";
import { roundRect, hexToRgba, labelColors } from "@/utils/canvasUtils";

interface Props {
  imageRef: React.RefObject<HTMLImageElement | null>;
  detections: Detection[];
}

const ImageDetectionOverlay: React.FC<Props> = ({ imageRef, detections }) => {
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Sync canvas size to image size
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = image.clientWidth / image.naturalWidth;
    const scaleY = image.clientHeight / image.naturalHeight;

    detections.forEach((det) => {
      if (!det.bbox || det.bbox.length < 4) return;

      const [x1, y1, x2, y2] = det.bbox;
      const sx1 = x1 * scaleX;
      const sy1 = y1 * scaleY;
      const sx2 = x2 * scaleX;
      const sy2 = y2 * scaleY;

      const color = labelColors[det.label] || labelColors.default;
      const confidence = ((det.confidence ?? 0) * 100).toFixed(1) + "%";
      const label = `${det.label} (${confidence})`;

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(sx1, sy1, sx2 - sx1, sy2 - sy1);

      // Dynamic font size
      const boxHeight = sy2 - sy1;
      const fontSize = Math.max(Math.min(boxHeight / 5, 20), 10);
      ctx.font = `bold ${fontSize}px Arial`;

      const textWidth = ctx.measureText(label).width + 8;
      const textHeight = fontSize + 6;
      const radius = Math.min(6, textHeight / 2);

      // Rounded semi-transparent label background
      ctx.fillStyle = hexToRgba(color, 0.7);
      roundRect(ctx, sx1, sy1 - textHeight, textWidth, textHeight, radius, true, false);

      // Draw text
      ctx.fillStyle = "#000";
      ctx.fillText(label, sx1 + 4, sy1 - 4);
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
