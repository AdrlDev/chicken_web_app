export interface Detection {
  label: string;
  confidence?: number;
  bbox: [number, number, number, number];
  timestampMs: number;
}