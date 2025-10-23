/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef, useState } from "react";
import { useImageDetectionSocket } from "@/hooks/useImageDetectionSocket";
import ImageDetectionOverlay from "@/components/ImageDetectionOverlay";

export default function UploadPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { detections, sendImage, isConnected, error } = useImageDetectionSocket();

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
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white relative p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">📸 Upload Detection</h1>

      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
        Choose Image
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>

      {!isConnected && (
        <p className="text-yellow-400 mt-3">Connecting to detection server...</p>
      )}

      {error && <p className="text-red-400 mt-3">{error}</p>}

      <div
        className="relative mt-6 rounded-xl border border-gray-700 bg-gray-800 overflow-hidden flex items-center justify-center"
        style={{ width: "80%", maxWidth: "640px", aspectRatio: "4 / 3" }}
      >
        {imageSrc ? (
          <>
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Uploaded"
              className="w-full h-full object-contain"
            />
            <ImageDetectionOverlay imageRef={imageRef} detections={detections} />
          </>
        ) : (
          <p className="text-gray-400">No image uploaded yet</p>
        )}
      </div>
    </main>
  );
}