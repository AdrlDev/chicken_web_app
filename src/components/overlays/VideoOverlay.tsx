//VideoOverlay.tsx

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
  // ⭐️ MODIFIED: Added scale and offset properties to the ref type
  const videoDimsRef = useRef<{
    width: number;
    height: number;
    videoWidth: number;
    videoHeight: number;
    scaleX: number; // Added
    scaleY: number; // Added
    offsetX: number; // Added
    offsetY: number; // Added
  }>({
    width: 0,
    height: 0,
    videoWidth: 0,
    videoHeight: 0,
    // ⭐️ REQUIRED: Initialize with placeholder values
    scaleX: 0,
    scaleY: 0,
    offsetX: 0,
    offsetY: 0,
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

      // 🛑 LATENCY FIX/WORKAROUND: Only compute if timestampMs is positive/sane.
      // This helps avoid the massive negative latency displayed in the video.
      const latencies = detections
        .map(d => {
          // Check if timestamp is a reasonable, recent Unix timestamp (e.g., within 24 hours of now)
          if (d.timestampMs && d.timestampMs > (now - 86400000) && d.timestampMs < (now + 1000)) {
            return now - d.timestampMs;
          }
          return undefined;
        })
        .filter((x): x is number => x !== undefined);
      
      if (latencies.length) {
          // Use an exponential moving average for latency for smoother display
          const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
          s.latency = s.latency ? 0.9 * s.latency + 0.1 * avgLatency : avgLatency;
      } else {
           s.latency = -1; // Indicate invalid/missing latency
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
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      if (vw === 0 || vh === 0) return; // Skip if video metadata hasn't loaded properly

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // --- ⭐️ CORE SCALING FIX: Aspect Ratio Calculation for object-fit: cover ---
      const videoAspectRatio = vw / vh;
      const elementAspectRatio = rect.width / rect.height;
      
      let scale: number;
      let offsetX: number;
      let offsetY: number;
      
      // We assume object-fit: cover due to the bounding box issues observed.
      if (videoAspectRatio > elementAspectRatio) {
        // Video is wider than element: fit height, clip width.
        scale = rect.height / vh;
        offsetX = (rect.width - vw * scale) / 2;
        offsetY = 0;
      } else {
        // Video is taller than element: fit width, clip height.
        scale = rect.width / vw;
        offsetX = 0;
        offsetY = (rect.height - vh * scale) / 2;
      }

      videoDimsRef.current = {
        width: rect.width,
        height: rect.height,
        videoWidth: vw,
        videoHeight: vh,
        scaleX: scale, // Pass calculated scale
        scaleY: scale, // Pass calculated scale
        offsetX: offsetX, // Pass calculated offset
        offsetY: offsetY, // Pass calculated offset
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
