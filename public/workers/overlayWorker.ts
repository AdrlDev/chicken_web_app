// overlayWorker.ts
import { drawOverlay, OverlayTrack, OverlayStats } from "@/utils/drawOverlay";
import { matchDetectionsToTracks, Track } from "@/utils/detectionUtils";
import { Detection } from "@/domain/entities/Detection";

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let width = 640;
let height = 360;
let dpr = 1;

let tracks: Track[] = [];
let latestDetections: Detection[] = [];
let stats: OverlayStats = {};

const maxTrackAgeMs = 800;
const smoothingFactor = 0.35;

self.onmessage = (ev: MessageEvent) => {
  const data = ev.data;
  if (!data) return;

  switch (data.type) {
    case "init":
      canvas = data.canvas as OffscreenCanvas;
      dpr = self.devicePixelRatio || 1;
      ctx = canvas.getContext("2d")!;
      width = canvas.width / dpr;
      height = canvas.height / dpr;
      ctx!.scale(dpr, dpr);
      break;

    case "resize":
      width = data.width;
      height = data.height;
      if (canvas) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx = canvas.getContext("2d")!;
        ctx!.scale(dpr, dpr);
      }
      break;

    case "frame":
      // Convert OverlayTrack[] to Detection[] for matchDetectionsToTracks
      latestDetections = (data.detections || []).map((d: OverlayTrack) => ({
        bbox: d.bbox,
        label: d.label,
        confidence: d.confidence,
        timestampMs: performance.now(),
      })) as Detection[];
      break;

    case "stats":
      stats = data.stats || {};
      break;
  }
};

// Worker draw loop
function drawLoop() {
  if (!ctx || !canvas) {
    setTimeout(drawLoop, 16);
    return;
  }

  const nowMs = performance.now();

  // Update tracks with IoU smoothing
  tracks = matchDetectionsToTracks(tracks, latestDetections, {
    iouThreshold: 0.3,
    smoothing: smoothingFactor,
    nowMs,
    maxAgeMs: maxTrackAgeMs,
  });

  // Prepare overlay tracks
  const overlayTracks: OverlayTrack[] = tracks
    .filter(t => t.ageMs <= maxTrackAgeMs)
    .map(t => ({
      bbox: t.smoothedBbox as [number, number, number, number],
      label: t.label,
      confidence: t.confidence,
    }));

  // Draw
  drawOverlay(ctx, width, height, overlayTracks, stats);

  setTimeout(drawLoop, 16); // ~60 FPS
}

drawLoop();
