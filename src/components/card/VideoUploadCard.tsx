// VideoUploadCard.tsx

import React, { DragEvent, useRef } from "react";
import { Detection } from "@/domain/entities/Detection";
import VideoOverlay from "@/components/overlays/VideoOverlay";
import ActionButtonGroup from "@/components/bottons/ActionButtonGroup";
import {
  VideoCameraSlashIcon,
  CloudArrowUpIcon, // New Icon
  PlayIcon, // New Icon
  StopIcon, // New Icon
} from "@heroicons/react/24/solid";
import { useTheme } from "@/components/themes/ThemeContext";
import { getYouTubeEmbedUrl } from "@/utils/canvasUtils";
import { motion } from "framer-motion"; // ✨ NEW: Import Framer Motion

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  onFileSelected?: (file: File) => void;
  detections?: Detection[];
  maxWidth?: string;
  startDetection?: () => void;
  stopDetection?: () => void;
  // ✨ NEW: Prop to track if detection is running
  isDetectionActive: boolean;
}

export default function VideoUploadCard({
  videoRef,
  previewUrl,
  setPreviewUrl,
  onFileSelected,
  detections = [],
  maxWidth = "1200px",
  startDetection,
  stopDetection,
  isDetectionActive, // Destructure new prop
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  // Updated Card Style to match ScanPage aesthetic
  const cardStyle =
    theme === "dark"
      ? "bg-gray-900 ring-1 ring-indigo-500/50 shadow-2xl shadow-indigo-900/40"
      : "bg-white ring-1 ring-gray-200 shadow-xl";

  // Updated Upload/Drop Area Style
  const uploadBg = theme === "dark" ? "bg-gray-800/80" : "bg-white/80";
  const uploadBorder =
    theme === "dark" ? "border-indigo-500/50" : "border-gray-400";
  const uploadHover =
    theme === "dark" ? "hover:bg-gray-700/80" : "hover:bg-gray-100/80";
  const uploadText = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const primaryColor = theme === "dark" ? "text-indigo-400" : "text-indigo-600";

  const youtubeEmbed = previewUrl ? getYouTubeEmbedUrl(previewUrl) : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 💡 IMPORTANT: Stop detection before loading new video
    stopDetection?.();
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileSelected?.(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    stopDetection?.(); // Stop detection before loading new video
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

  // Button to manually control playback and detection
  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play();
      startDetection?.();
    } else {
      videoRef.current.pause();
      stopDetection?.();
    }
  };

  return (
    <div
      className={`w-full mx-auto ${cardStyle} rounded-2xl transition-all duration-500 overflow-hidden`}
      style={{ maxWidth }}
    >
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {/* Upload / Drop area (Enhanced Placeholder) */}
        {!previewUrl && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-2xl transition text-center backdrop-blur-sm ${uploadBg} ${uploadHover} ${uploadText} ${uploadBorder}`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <CloudArrowUpIcon
                className={`w-20 h-20 mb-3 ${primaryColor} opacity-70`}
              />
              <span className="text-2xl font-semibold">
                Click to Upload Video
              </span>
              <span className="mt-1 text-sm text-gray-400">
                Or drag and drop a video file here (MP4 recommended)
              </span>
            </div>
          </motion.div>
        )}

        {/* Video & Overlay */}
        {previewUrl && (
          <div className="absolute inset-0 w-full h-full">
            {youtubeEmbed ? (
              <iframe
                src={youtubeEmbed}
                allow="autoplay; fullscreen"
                className="w-full h-full object-cover"
                style={{ borderRadius: "1rem" }} // Apply border radius to iframe
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay={false} // Start paused
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                style={{ borderRadius: "1rem" }}
                // Remove onPlay/onPause/onEnded handlers here, control via button for manual detection start
              >
                <source src={previewUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            {/* Video Detection Overlay */}
            <VideoOverlay videoRef={videoRef} detections={detections} />

            {/* Control & Remove Buttons */}
            <div className="absolute top-4 right-4 z-50 pointer-events-auto">
              <ActionButtonGroup
                buttons={[
                  // Play/Pause Button
                  {
                    label: isDetectionActive
                      ? "Stop Analysis"
                      : "Start Analysis",
                    onClick: handlePlayPause,
                    icon: isDetectionActive ? (
                      <StopIcon className="w-5 h-5" />
                    ) : (
                      <PlayIcon className="w-5 h-5" />
                    ),
                    theme: theme,
                  },
                  // Remove Button
                  {
                    label: "Remove Video",
                    onClick: handleRemove,
                    icon: <VideoCameraSlashIcon className="w-5 h-5" />,
                    theme: theme,
                  },
                ]}
              />
            </div>

            {/* Live Detection Indicator */}
            {isDetectionActive && (
              <motion.div
                className="absolute bottom-0 left-0 m-4 p-2 bg-red-600/80 text-white rounded-lg text-sm font-semibold flex items-center shadow-lg backdrop-blur-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-3 h-3 bg-white rounded-full mr-2 animate-ping-slow" />
                LIVE ANALYSIS
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
