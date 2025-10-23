"use client";

import React from "react";
import { Detection } from "@/domain/entities/Detection";
import DetectionOverlay from "./DetectionOverlay";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onToggleCamera: () => void;
  isActive: boolean;
  error?: string | null;
  detections: Detection[];
}

export const CameraView: React.FC<Props> = ({
  videoRef,
  onToggleCamera,
  isActive,
  error,
  detections,
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white relative p-4">
    <h1 className="text-3xl font-bold mb-6 text-center">
      🐔 Chicken Scanner Live
    </h1>

    {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

    <div
      className="relative rounded-xl border border-gray-700 bg-gray-800 overflow-hidden flex items-center justify-center"
      style={{
        width: "80%",
        maxWidth: "640px",
        aspectRatio: "4 / 3",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover bg-black transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
        style={{ transform: "scaleX(-1)" }} // optional: mirror view
      />

      {isActive ? (
        <>
          <DetectionOverlay
            videoRef={videoRef}
            detections={detections}
          />
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-800/80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 mb-3 opacity-70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5L19.5 6.75m0 0L23.25 10.5M19.5 6.75v10.5M4.5 6.75h9.75a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V9a2.25 2.25 0 012.25-2.25z"
            />
          </svg>
          <p className="text-lg font-medium">Camera is Off</p>
        </div>
      )}
    </div>

    <div className="flex gap-4 mt-6">
      <button
        onClick={onToggleCamera}
        className={`px-6 py-3 rounded-lg font-semibold transition ${
          isActive
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {isActive ? "Stop Camera" : "Start Camera"}
      </button>
    </div>
  </div>
);