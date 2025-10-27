"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useVideoDetectionSocket } from "@/hooks/useVideoDetectionSocket";
import VideoOverlay from "./VideoOverlay";

export const VideoUpload: React.FC = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { isDetecting, result, startDetection, stopDetection } =
    useVideoDetectionSocket(videoRef);

  console.log(result)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    stopDetection();
  };

  const handlePlay = () => {
    // Start detection automatically when the video plays
    if (!isDetecting) {
      startDetection();
    }
  };

  const handlePause = () => {
    // Stop detection when paused
    if (isDetecting) {
      stopDetection();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🎥 Chicken Video Detection (Live)
      </h1>

      <div className="relative flex flex-col items-center gap-4 bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-lg">
        {!previewUrl ? (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:border-blue-400 transition">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <span className="text-gray-400">
              Click to upload or drag a video file here
            </span>
          </label>
        ) : (
          <div className="relative w-full">
            <video
              ref={videoRef}
              src={previewUrl}
              controls
              className="w-full rounded-lg"
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={stopDetection}
            />
            <VideoOverlay videoRef={videoRef} detections={result} />
            <button
              onClick={handleRemove}
              className="text-sm text-gray-400 hover:text-red-400 mt-2 block mx-auto"
            >
              Remove Video
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => router.push("/camera")}
        className="mt-8 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
      >
        Back to Camera
      </button>
    </div>
  );
};
