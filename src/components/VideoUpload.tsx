// VideoUpload.tsx
"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BackwardIcon } from "@heroicons/react/24/solid";
import { useVideoDetectionSocket } from "@/hooks/useVideoDetectionSocket";
import VideoUploadCard from "@/components/card/VideoUploadCard";
import ActionButtonGroup from "@/components/bottons/ActionButtonGroup";
import { useTheme } from "@/components/themes/ThemeContext";

export const VideoUpload: React.FC = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { result, startDetection, stopDetection } = useVideoDetectionSocket(videoRef);
  const { theme } = useTheme();

  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-900";

  return (
    <div className={`flex flex-col items-center pt-32 px-4 pb-8 md:pb-16 ${textColor}`}>
      <h1 className="text-3xl font-bold mb-6 text-center">
        🎥 Chicken Video Detection (Live)
      </h1>

      {/* Video Upload Card */}
      <VideoUploadCard
        videoRef={videoRef}
        previewUrl={previewUrl}
        setPreviewUrl={setPreviewUrl}
        detections={
          result?.length
            ? result.map((r) => ({
                ...r,
                confidence: r.confidence ?? 0,
                timestampMs: r.timestampMs ?? performance.now(), // add timestamp
              }))
            : [] // empty array if result is null or empty
        }
        startDetection={startDetection}
        stopDetection={stopDetection}
        onFileSelected={(file) => console.log("Selected file", file)}
      />

      <ActionButtonGroup
        buttons={[
          {
            label: "Back to Camera",
            theme: theme,
            onClick: () => router.push("/camera"),
            icon: <BackwardIcon className="w-5 h-5" />,
          },
        ]}
      />
    </div>
  );
};
