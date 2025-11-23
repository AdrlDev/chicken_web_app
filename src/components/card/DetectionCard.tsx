/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { useTheme } from "@/components/themes/ThemeContext";
import ImageDetectionOverlay from "@/components/overlays/ImageDetectionOverlay";
import { Detection } from "@/domain/entities/Detection";

interface Props {
  imageSrc: string | null;
  imageRef: React.RefObject<HTMLImageElement | null>;
  detections: Detection[];
  aspectRatio?: string; // default 16/9
  maxWidth?: string; // default 1200px
}

export default function DetectionCard({
  imageSrc,
  imageRef,
  detections,
  aspectRatio = "16 / 9",
  maxWidth = "1200px",
}: Props) {
  const { theme } = useTheme();
  const cardBg = theme === "dark" ? "bg-gray-800/60 border-gray-700" : "bg-white/80 border-gray-200";
  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-900";

  return (
    <div
      className={`w-full md:w-4/5 lg:w-3/4 ${cardBg} border rounded-2xl shadow-xl overflow-hidden relative flex items-center justify-center`}
      style={{ aspectRatio, maxWidth }}
    >
      {imageSrc ? (
        <>
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Uploaded"
            className="w-full h-full object-fill"
          />
          <ImageDetectionOverlay imageRef={imageRef} detections={detections} />
        </>
      ) : (
        <p className={`text-center ${textColor}`}>No image uploaded yet</p>
      )}
    </div>
  );
}
