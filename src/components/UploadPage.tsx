/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef, useState } from "react";
import { useImageDetectionSocket } from "@/hooks/useImageDetectionSocket";
import { useTheme } from "@/components/themes/ThemeContext";
import { PhotoIcon } from "@heroicons/react/24/solid";
import ActionButtonGroup from "@/components/bottons/ActionButtonGroup";
import DetectionCard from "@/components/card/DetectionCard";

export default function UploadPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { detections, sendImage, isConnected, error } = useImageDetectionSocket();
  const { theme } = useTheme();

  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-900";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImageSrc(base64);
      sendImage(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center pt-32 px-4 pb-8 md:pb-16">
      {/* Heading */}
      <div className={`text-center mb-6 ${textColor}`}>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          📸 Upload Detection
        </h2>
        <p className="mt-2 max-w-2xl mx-auto">
          Upload an image to detect poultry diseases in real-time.
        </p>
      </div>

      {/* Image Card */}
      <DetectionCard
        imageSrc={imageSrc}
        imageRef={imageRef}
        detections={detections}
        aspectRatio="16 / 9"
        maxWidth="1200px"
      />

      {/* Action Buttons */}
      <div className="mt-6">
        <ActionButtonGroup
          buttons={[
            {
              label: "Choose Image",
              onClick: () => document.getElementById("upload-input")?.click(),
              icon: <PhotoIcon className="w-5 h-5" />,
            },
          ]}
        />
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          id="upload-input"
          className="hidden"
        />
      </div>

      {!isConnected && (
        <p className="text-yellow-400 mt-3">Connecting to detection server...</p>
      )}

      {error && <p className="text-red-400 mt-3">{error}</p>}
    </div>
  );
}
