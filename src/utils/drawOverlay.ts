import { roundRect, hexToRgba, labelColors } from "@/utils/canvasUtils";

export interface OverlayTrack {
  bbox: [number, number, number, number]; // [x1,y1,x2,y2] in video intrinsic pixels
  label: string;
  confidence?: number;
}

export interface OverlayStats {
  detectionFps?: number;
  latency?: number;
}

export interface VideoDims {
  width: number;      // display width
  height: number;     // display height
  videoWidth: number; // intrinsic video width
  videoHeight: number;// intrinsic video height
  // ⭐️ ADD THESE NEW PROPERTIES:
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  tracks: OverlayTrack[],
  stats?: OverlayStats,
  videoDims?: VideoDims
) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // --- ⭐️ FIX: Use the explicit scale and offset values from videoDims ---
  // Fallback to simple scaling if the extended VideoDims is not provided.
  const scaleX = videoDims?.scaleX ?? 1;
  const scaleY = videoDims?.scaleY ?? 1;
  const offsetX = videoDims?.offsetX ?? 0;
  const offsetY = videoDims?.offsetY ?? 0;
  // ---

  tracks.forEach(t => {
    const [x1Orig, y1Orig] = t.bbox;
    let x2 = t.bbox[2];
    let y2 = t.bbox[3];

    // Ensure intrinsic coordinates are used if normalized [x,y,w,h] is accidentally passed
    // NOTE: This logic is generally risky if you mix formats. Assuming input is [x1, y1, x2, y2]
    // or [x, y, w, h] relative to intrinsic video size.
    if (x2 <= 1.5 && y2 <= 1.5) { 
      x2 = x1Orig + t.bbox[2];
      y2 = y1Orig + t.bbox[3];
    }

    // 1. Scale the intrinsic video coordinates to the display size
    const scaledX1 = x1Orig * scaleX;
    const scaledY1 = y1Orig * scaleY;
    const scaledX2 = x2 * scaleX;
    const scaledY2 = y2 * scaleY;

    // 2. Apply the offset to position the box correctly within the canvas
    const sx1 = scaledX1 + offsetX;
    const sy1 = scaledY1 + offsetY;
    const sx2 = scaledX2 + offsetX;
    const sy2 = scaledY2 + offsetY;

    const w = sx2 - sx1;
    const h = sy2 - sy1;

    // Boundary check (optional, but good practice)
    if (w <= 0 || h <= 0) return; 

    const color = labelColors[t.label] || labelColors.default;

    // Draw box
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, Math.min(4, Math.round(Math.max(1, h / 80))));
    roundRect(ctx, sx1, sy1, w, h, 6, false, true); // Use sx1, sy1, w, h

    // Draw label
    const conf = t.confidence ? `${Math.round(t.confidence * 100)}%` : "";
    const labelText = `${t.label} ${conf}`.trim();
    const fontSize = Math.max(Math.min(h / 5, 18), 10);
    ctx.font = `bold ${fontSize}px Inter, Arial`;
    const textWidth = ctx.measureText(labelText).width + 8;
    const textHeight = fontSize + 6;
    const radius = Math.min(6, textHeight / 2);

    ctx.fillStyle = hexToRgba(color, 0.78);
    // Position text background block above the top-left corner
    roundRect(ctx, sx1, sy1 - textHeight, textWidth, textHeight, radius, true, false);

    ctx.fillStyle = "#000";
    // Position text inside the background block
    ctx.fillText(labelText, sx1 + 4, sy1 - 4); 
  });

  // Stats drawing remains unchanged
  if (stats) {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "#00000055";
    ctx.fillRect(8, 8, 220, 48);
    ctx.fillStyle = "#fff";
    ctx.font = `12px Inter, Arial`;
    ctx.fillText(`Detect FPS: ${stats.detectionFps ?? "-"}`, 16, 26);
    // ⭐️ FIX: Latency display issue. The reported negative latency is too large.
    // We display a formatted latency, falling back safely if it's invalid.
    const latencyDisplay = (stats.latency && stats.latency > 0) 
        ? `${Math.round(stats.latency)}` 
        : "-";
    ctx.fillText(`Latency: ${latencyDisplay} ms`, 16, 46);
    ctx.restore();
  }
}
