export interface Detection {
  label: string;
  confidence?: number;
  bbox: number[];
}