/**
 * Draw a rounded rectangle on canvas.
 * @param ctx CanvasRenderingContext2D
 * @param x top-left x
 * @param y top-left y
 * @param width rectangle width
 * @param height rectangle height
 * @param radius corner radius
 * @param fill fill the rectangle
 * @param stroke stroke the rectangle border
 */
export function roundRect(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill = true,
  stroke = false,
) {
  if (radius > width / 2) radius = width / 2;
  if (radius > height / 2) radius = height / 2;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

/**
 * Convert hex color to RGBA string.
 * @param hex Hex string e.g., "#ff0000"
 * @param alpha Alpha value 0-1
 */
export function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Label colors mapping for detections
 */
export const labelColors: Record<string, string> = {
  "avian Influenza": "#ff9341ff",
  "blue comb": "#00fffbff",
  coccidiosis: "#da4e4eff",
  "fowl cholera": "#f188f3ff",
  "fowl-pox": "#ff00bfff",
  "mycotic infections": "#ffdc5eff",
  salmo: "#403A78",
  "marek's disease": "#A52A2A",
  default: "#00FF00",
};

/**
 * Get Youtube Video Embed Url
 */
export function getYouTubeEmbedUrl(url: string) {
  // naive way to extract YouTube video ID
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu.be\/)([^&]+)/);
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}`;
}
