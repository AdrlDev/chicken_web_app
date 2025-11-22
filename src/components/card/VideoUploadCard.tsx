"use client";

import React, { DragEvent } from "react";
import { Detection } from "@/domain/entities/Detection";
import VideoOverlay from "@/components/VideoOverlay";
import ActionButtonGroup from "@/components/bottons/ActionButtonGroup";
import { VideoCameraSlashIcon } from "@heroicons/react/24/solid";
import { useTheme } from "@/components/themes/ThemeContext";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  onFileSelected?: (file: File) => void;
  detections?: Detection[];
  aspectRatio?: string;
  maxWidth?: string;
  startDetection?: () => void;
  stopDetection?: () => void;
}

export default function VideoUploadCard({
  videoRef,
  previewUrl,
  setPreviewUrl,
  onFileSelected,
  detections = [],
  aspectRatio = "16 / 9",
  maxWidth = "1200px",
  startDetection,
  stopDetection,
}: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileSelected?.(file);
  };

  const { theme } = useTheme();

  const bg = theme === "dark" ? "bg-gray-800 border-gray-600" : "bg-gray-100 border-gray-300";
  const hoverBg = theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200";
  const text = theme === "dark" ? "text-gray-200" : "text-gray-600";

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onFileSelected?.(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    stopDetection?.();
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handlePlay = () => startDetection?.();
  const handlePause = () => stopDetection?.();

  return (
    <div
      className="relative w-full bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700 overflow-hidden"
      style={{ maxWidth, aspectRatio }}
    >
      {/* Upload / Drop area */}
      {!previewUrl && (
        <div
          className="flex items-center justify-center z-10 w-full h-full"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-500 rounded-2xl hover:border-blue-400 transition cursor-pointer p-6 text-center ${bg} ${hoverBg} ${text}`}>
            <input
              type="file"
              accept="video/*"
              className="hidden w-full h-full"
              onChange={handleFileChange}
            />
            <span className="text-gray-400">
              Click to upload or drag a video file here
            </span>
          </div>
        </div>
      )}

      {/* Video & Overlay */}
      {previewUrl && (
        <div className="relative w-full min-h-[250px]">
          <video
            ref={videoRef}
            src={previewUrl}
            controls
            className="w-full h-auto rounded-2xl object-contain pointer-events-auto"
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handlePause}
          />

          <div className="absolute inset-0 pointer-events-none">
            <VideoOverlay videoRef={videoRef} detections={detections} />
          </div>

          {/* Remove Button */}
          <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <ActionButtonGroup
              buttons={[
                {
                  label: "Remove Video",
                  onClick: handleRemove,
                  icon: <VideoCameraSlashIcon className="w-5 h-5" />,
                },
              ]}
            />
          </div>
        </div>
      )}
    </div>

  );
}
