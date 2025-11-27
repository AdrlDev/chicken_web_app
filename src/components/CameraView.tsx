"use client";

import React from "react";
import { Detection } from "@/domain/entities/Detection";
import DetectionOverlay from "./overlays/DetectionOverlay";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/themes/ThemeContext";
import { CameraIcon, PhotoIcon, VideoCameraIcon } from "@heroicons/react/24/solid";
import ActionButtonGroup from "@/components/bottons/ActionButtonGroup";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onToggleCamera: () => void;
  isActive: boolean;
  error?: string | null;
  detections: Detection[];
}

export default function CameraView({
  videoRef,
  onToggleCamera,
  isActive,
  error,
  detections,
}: Props) {
  const router = useRouter();
  const { theme } = useTheme();

  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-900";
  const cardBg = theme === "dark" ? "bg-gray-800/60 border-gray-700" : "bg-white/80 border-gray-200";

  return (
    <>
      <div className="flex flex-col items-center pt-32 px-4 pb-8 md:pb-16">
        {/* Heading */}
        <div className={`text-center mb-6 ${textColor}`}>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            🐔 Chicken Scanner Live
          </h2>
          <p className="mt-2 max-w-2xl mx-auto">
            Real-time camera scanning and quick uploads.
          </p>
        </div>

        {/* Video Card */}
        <div
          className={`w-full md:w-4/5 lg:w-3/4 ${cardBg} border rounded-2xl shadow-xl overflow-hidden relative`}
          style={{ maxWidth: "1200px" }}
        >
          <div className="relative h-[300px] sm:h-[350px] md:h-auto md:aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover bg-black transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}
              style={{ transform: "scaleX(-1)" }}
            />

            {!isActive && (
              <div className={`absolute inset-0 flex flex-col items-center justify-center ${textColor} bg-gradient-to-b from-transparent to-black/20`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-20 h-20 mb-3 opacity-80"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5L19.5 6.75m0 0L23.25 10.5M19.5 6.75v10.5M4.5 6.75h9.75a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V9a2.25 2.25 0 012.25-2.25z"
                  />
                </svg>
                <p className="text-xl font-medium">Camera is Off</p>
              </div>
            )}

            {isActive && (
              <div className="absolute inset-0 pointer-events-none">
                <DetectionOverlay videoRef={videoRef} detections={detections} />
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <ActionButtonGroup
          buttons={[
            {
              label: isActive ? "Stop Camera" : "Start Camera",
              onClick: onToggleCamera,
              icon: <CameraIcon className="w-5 h-5" />,
              isActive: isActive,
              theme: theme,
            },
            {
              label: "Upload Image",
              onClick: () => router.push("/upload"),
              icon: <PhotoIcon className="w-5 h-5" />,
              theme: theme,
            },
            {
              label: "Upload Video",
              onClick: () => router.push("/video"),
              icon: <VideoCameraIcon className="w-5 h-5" />,
              theme: theme,
            },
          ]}
        />

        {error && <p className={`mt-4 text-center ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>{error}</p>}
      </div>
    </>
  );
}
