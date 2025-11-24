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

  const videoWidth = videoDims?.videoWidth || canvasWidth;
  const videoHeight = videoDims?.videoHeight || canvasHeight;
  const scaleX = (videoDims?.width || canvasWidth) / videoWidth;
  const scaleY = (videoDims?.height || canvasHeight) / videoHeight;

  tracks.forEach(t => {
    // Detect if bbox is [x1,y1,x2,y2] or [x,y,w,h]
    const [x1Orig, y1Orig] = t.bbox; // use const
    let x2 = t.bbox[2];
    let y2 = t.bbox[3];

    // handle [x,y,w,h] format
    if (x2 <= 1.5 && y2 <= 1.5) {
      x2 = x1Orig + t.bbox[2];
      y2 = y1Orig + t.bbox[3];
    }

    const sx1 = x1Orig * scaleX;
    const sy1 = y1Orig * scaleY;
    const sx2 = x2 * scaleX;
    const sy2 = y2 * scaleY;

    const w = sx2 - sx1;
    const h = sy2 - sy1;

    const color = labelColors[t.label] || labelColors.default;

    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, Math.min(4, Math.round(Math.max(1, h / 80))));
    roundRect(ctx, sx1, sy1, w, h, 6, false, true);

    // Draw label
    const conf = t.confidence ? `${Math.round(t.confidence * 100)}%` : "";
    const labelText = `${t.label} ${conf}`.trim();
    const fontSize = Math.max(Math.min(h / 5, 18), 10);
    ctx.font = `bold ${fontSize}px Inter, Arial`;
    const textWidth = ctx.measureText(labelText).width + 8;
    const textHeight = fontSize + 6;
    const radius = Math.min(6, textHeight / 2);

    ctx.fillStyle = hexToRgba(color, 0.78);
    roundRect(ctx, sx1, sy1 - textHeight, textWidth, textHeight, radius, true, false);

    ctx.fillStyle = "#000";
    ctx.fillText(labelText, sx1 + 4, sy1 - 4);
  });

  if (stats) {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "#00000055";
    ctx.fillRect(8, 8, 220, 48);
    ctx.fillStyle = "#fff";
    ctx.font = `12px Inter, Arial`;
    ctx.fillText(`Detect FPS: ${stats.detectionFps ?? "-"}`, 16, 26);
    ctx.fillText(`Latency: ${stats.latency ?? "-"} ms`, 16, 46);
    ctx.restore();
  }
}
