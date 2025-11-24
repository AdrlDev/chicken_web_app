//VideoUploadCard

import React, { DragEvent, useRef } from "react";
import { Detection } from "@/domain/entities/Detection";
import VideoOverlay from "@/components/overlays/VideoOverlay";
import ActionButtonGroup from "@/components/bottons/ActionButtonGroup";
import { VideoCameraSlashIcon } from "@heroicons/react/24/solid";
import { useTheme } from "@/components/themes/ThemeContext";
import { getYouTubeEmbedUrl } from "@/utils/canvasUtils";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  onFileSelected?: (file: File) => void;
  detections?: Detection[];
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
  maxWidth = "1200px",
  startDetection,
  stopDetection,
}: Props) {

  const inputRef = useRef<HTMLInputElement>(null);

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

  const youtubeEmbed = previewUrl ? getYouTubeEmbedUrl(previewUrl) : null;

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

  return (
    <div className="w-full mx-auto" 
      style={{ maxWidth,
              minHeight: "350px",
              maxHeight: "700px", 
    }}>
      <div className="relative w-full" style={{ paddingBottom: "56.25%", minHeight: "350px",
              maxHeight: "700px",  }}>
        
        {/* Upload / Drop area */}
        {!previewUrl && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div
              className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-2xl transition text-center ${bg} ${hoverBg} ${text}`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
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
          <div className="absolute inset-0 w-full h-full">
            {youtubeEmbed ? (
              <iframe
                src={youtubeEmbed}
                allow="autoplay; fullscreen"
                className="w-full h-full rounded-2xl"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full rounded-2xl object-cover"
                onPlay={startDetection}
                onPause={stopDetection}
                onEnded={stopDetection}
              >
                <source src={previewUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            <VideoOverlay videoRef={videoRef} detections={detections} />

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
    </div>
  );
}
