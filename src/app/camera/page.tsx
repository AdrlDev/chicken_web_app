"use client";

import { useCamera } from "@/hooks/useCamera";
import { useDetectionSocket } from "@/hooks/useDetectionSocket";
import { CameraView } from "@/components/CameraView";

export default function CameraPage() {
  const { videoRef, startCamera, stopCamera, isActive, error } = useCamera();
  const { detections } = useDetectionSocket(videoRef);

  console.log(detections)

  return (
    <main>
      <CameraView
        videoRef={videoRef}
        onToggleCamera={isActive ? stopCamera : startCamera}
        isActive={isActive}
        error={error}
        detections={detections}
      />
    </main>
  );
}