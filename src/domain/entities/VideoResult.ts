import { Detection } from "./Detection";

export interface VideoResult {
  detections: Detection[];
  fps?: number;
}