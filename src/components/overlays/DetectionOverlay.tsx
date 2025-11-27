"use client";

import React, { useRef, useEffect } from "react";
import { Detection } from "@/domain/entities/Detection";
import { drawOverlay, OverlayTrack } from "@/utils/drawOverlay";
import { matchDetectionsToTracks, Track } from "@/utils/detectionUtils";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  detections: Detection[] | null;
  maxTrackAgeMs?: number;
  smoothingFactor?: number;
  showStats?: boolean;
}

const DEFAULT_MAX_AGE = 800;
const DEFAULT_SMOOTHING = 0.35;

const LiveCameraOverlay: React.FC<Props> = ({
  videoRef,
  detections,
  maxTrackAgeMs = DEFAULT_MAX_AGE,
  smoothingFactor = DEFAULT_SMOOTHING,
  showStats = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tracksRef = useRef<Track[]>([]);
  const detRef = useRef<Detection[] | null>(detections);

  console.log(detections)

  const videoDimsRef = useRef({
    width: 0,
    height: 0,
    videoWidth: 0,
    videoHeight: 0,
  });

  const statsRef = useRef({
    drawFps: 0,
    detectFps: 0,
    latency: 0,
    lastDrawTs: performance.now(),
    lastDetTs: performance.now(),
  });

  // Sync latest detections
  useEffect(() => {
    detRef.current = detections;
    const now = performance.now();
    const s = statsRef.current;

    if (detections && detections.length > 0) {
      // detection FPS
      const delta = now - s.lastDetTs;
      if (delta > 0) {
        const fps = 1000 / delta;
        s.detectFps = s.detectFps ? 0.9 * s.detectFps + 0.1 * fps : fps;
      }
      s.lastDetTs = now;

      // latency
      const lat = detections
        .map(d => (d.timestampMs ? now - d.timestampMs : undefined))
        .filter((x): x is number => x !== undefined);

      if (lat.length) {
        s.latency = lat.reduce((a, b) => a + b, 0) / lat.length;
      }
    }
  }, [detections]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      const rect = video.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      videoDimsRef.current = {
        width: rect.width,
        height: rect.height,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      };
    };

    if (video.readyState >= 1) resizeCanvas();
    else video.addEventListener("loadedmetadata", resizeCanvas, { once: true });

    window.addEventListener("resize", resizeCanvas);
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(video);

    let raf = 0;

    const drawLoop = () => {
      const now = performance.now();
      const latest = detRef.current ?? [];
      const s = statsRef.current;

      // draw FPS (smooth)
      const delta = now - s.lastDrawTs;
      if (delta > 0) {
        const fps = 1000 / delta;
        s.drawFps = s.drawFps ? 0.9 * s.drawFps + 0.1 * fps : fps;
      }
      s.lastDrawTs = now;

      // update object tracking
      tracksRef.current = matchDetectionsToTracks(tracksRef.current, latest, {
        iouThreshold: 0.3,
        smoothing: smoothingFactor,
        nowMs: now,
        maxAgeMs: maxTrackAgeMs,
      });

      const overlayTracks: OverlayTrack[] = tracksRef.current
        .filter(t => t.ageMs <= maxTrackAgeMs)
        .map(t => ({
          bbox: t.smoothedBbox as [number, number, number, number],
          label: t.label,
          confidence: t.confidence,
        }));

      // draw overlay
      drawOverlay(
        ctx,
        canvas.width,
        canvas.height,
        overlayTracks,
        showStats
          ? {
              detectionFps: Math.round(s.detectFps),
              latency: Math.round(s.latency),
            }
          : undefined,
        videoDimsRef.current
      );

      raf = requestAnimationFrame(drawLoop);
    };

    raf = requestAnimationFrame(drawLoop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resizeCanvas);
      ro.disconnect();
    };
  }, [videoRef, smoothingFactor, maxTrackAgeMs, showStats]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
    />
  );
};

export default LiveCameraOverlay;
