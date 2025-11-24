// detectionUtils.ts
export type Track = {
  id: number;
  label: string;
  confidence?: number;
  bbox: [number, number, number, number]; // raw last bbox
  smoothedBbox: [number, number, number, number];
  lastSeenMs: number;
  ageMs: number;
};

let nextTrackId = 1;

export function iou(a: number[], b: number[]) {
  const x1 = Math.max(a[0], b[0]);
  const y1 = Math.max(a[1], b[1]);
  const x2 = Math.min(a[2], b[2]);
  const y2 = Math.min(a[3], b[3]);
  const interW = Math.max(0, x2 - x1);
  const interH = Math.max(0, y2 - y1);
  const inter = interW * interH;
  const areaA = (a[2] - a[0]) * (a[3] - a[1]);
  const areaB = (b[2] - b[0]) * (b[3] - b[1]);
  const union = areaA + areaB - inter;
  return union > 0 ? inter / union : 0;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function generateColorForLabel(label: string) {
  // deterministic HSL color
  let h = 2166136261 >>> 0;
  for (let i = 0; i < label.length; i++) {
    h ^= label.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  const hue = h % 360;
  return `hsl(${hue}deg 80% 60%)`;
}

/**
 * Match detections to existing tracks by IoU, create new tracks if no match.
 * Also performs smoothing in place using lerp on bbox coordinates.
 */
export function matchDetectionsToTracks(
  tracks: Track[],
  detections: { bbox: [number, number, number, number]; label?: string; confidence?: number }[],
  opts: { iouThreshold?: number; smoothing?: number; nowMs?: number; maxAgeMs?: number },
  mapTrackToDisplay?: (track: Track) => [number, number, number, number]
): Track[] {
  const iouThreshold = opts.iouThreshold ?? 0.3;
  const smoothing = opts.smoothing ?? 0.35;
  const nowMs = opts.nowMs ?? performance.now();
  const maxAgeMs = opts.maxAgeMs ?? 800;

  // mark all tracks as not updated
  const updated = new Set<number>();

  // greedy matching by best IoU
  for (const det of detections) {
    const bbox = det.bbox;
    let bestIdx = -1;
    let bestScore = iouThreshold;
    for (let i = 0; i < tracks.length; i++) {
      if (updated.has(i)) continue;
      if (tracks[i].label !== (det.label ?? tracks[i].label)) continue;
      const score = iou(tracks[i].bbox, bbox);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0) {
      // match to track
      const t = tracks[bestIdx];
      t.confidence = det.confidence ?? t.confidence;
      t.bbox = bbox;
      // smooth
      t.smoothedBbox = [
        lerp(t.smoothedBbox[0], bbox[0], smoothing),
        lerp(t.smoothedBbox[1], bbox[1], smoothing),
        lerp(t.smoothedBbox[2], bbox[2], smoothing),
        lerp(t.smoothedBbox[3], bbox[3], smoothing),
      ];
      t.lastSeenMs = nowMs;
      t.ageMs = 0;
      updated.add(bestIdx);
    } else {
      // create new track
      const newTrack: Track = {
        id: nextTrackId++,
        label: det.label ?? "obj",
        confidence: det.confidence,
        bbox: bbox,
        smoothedBbox: bbox.slice() as [number, number, number, number],
        lastSeenMs: nowMs,
        ageMs: 0,
      };
      tracks.push(newTrack);
      updated.add(tracks.length - 1);
    }
  }

  // increase age for non-updated tracks
  for (let i = 0; i < tracks.length; i++) {
    if (!updated.has(i)) {
      tracks[i].ageMs = nowMs - tracks[i].lastSeenMs;
      // optionally, decay smoothed bbox a bit toward last bbox
      tracks[i].smoothedBbox = [
        lerp(tracks[i].smoothedBbox[0], tracks[i].bbox[0], 0.1),
        lerp(tracks[i].smoothedBbox[1], tracks[i].bbox[1], 0.1),
        lerp(tracks[i].smoothedBbox[2], tracks[i].bbox[2], 0.1),
        lerp(tracks[i].smoothedBbox[3], tracks[i].bbox[3], 0.1),
      ];
    }
  }

  // remove tracks that are too old
  const filtered = tracks.filter((t) => nowMs - t.lastSeenMs < maxAgeMs * 4); // keep a little longer for fade
  // update ageMs fields
  for (const t of filtered) t.ageMs = nowMs - t.lastSeenMs;
  return filtered;
}
