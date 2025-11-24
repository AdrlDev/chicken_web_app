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

const VideoOverlay: React.FC<Props> = ({
  videoRef,
  detections,
  maxTrackAgeMs = DEFAULT_MAX_AGE,
  smoothingFactor = DEFAULT_SMOOTHING,
  showStats = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tracksRef = useRef<Track[]>([]);
  const detRef = useRef<Detection[] | null>(detections);
  const videoDimsRef = useRef({
    width: 0,
    height: 0,
    videoWidth: 0,
    videoHeight: 0,
  });

  // Stats refs
  const statsRef = useRef({
    drawFps: 0,
    detectFps: 0,
    latency: 0,
    lastDrawTs: performance.now(),
    lastDetTs: performance.now(),
  });

  // Keep detections updated
  useEffect(() => {
    detRef.current = detections;
    const now = performance.now();
    const s = statsRef.current;

    if (detections && detections.length > 0) {
      // Update detection FPS
      const deltaDet = now - s.lastDetTs;
      if (deltaDet > 0) {
        const currentDetFps = 1000 / deltaDet;
        s.detectFps = s.detectFps ? 0.9 * s.detectFps + 0.1 * currentDetFps : currentDetFps;
      }
      s.lastDetTs = now;

      // Compute latency
      const latencies = detections
        .map(d => (d.timestampMs ? now - d.timestampMs : undefined))
        .filter((x): x is number => x !== undefined);
      if (latencies.length) s.latency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
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

    // Resize after metadata loads
    if (video.readyState >= 1) {
      resizeCanvas();
    } else {
      video.addEventListener("loadedmetadata", resizeCanvas, { once: true });
    }

    window.addEventListener("resize", resizeCanvas);
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(video);

    let raf = 0;

    const drawLoop = () => {
      const now = performance.now();
      const latestDets = detRef.current ?? [];

      // Update draw FPS (exponential moving average)
      const s = statsRef.current;
      const deltaDraw = now - s.lastDrawTs;
      if (deltaDraw > 0) {
        const currentFps = 1000 / deltaDraw;
        s.drawFps = s.drawFps ? 0.9 * s.drawFps + 0.1 * currentFps : currentFps;
      }
      s.lastDrawTs = now;

      // Update tracks
      tracksRef.current = matchDetectionsToTracks(tracksRef.current, latestDets, {
        iouThreshold: 0.3,
        smoothing: smoothingFactor,
        nowMs: now,
        maxAgeMs: maxTrackAgeMs,
      });

      // Map tracks to overlay
      const overlayTracks: OverlayTrack[] = tracksRef.current
        .filter(t => t.ageMs <= maxTrackAgeMs)
        .map(t => ({
          bbox: t.smoothedBbox as [number, number, number, number],
          label: t.label,
          confidence: t.confidence,
        }));

      // Draw overlays and stats
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

export default VideoOverlay;
