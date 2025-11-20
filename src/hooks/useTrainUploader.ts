/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";

export interface UploadStatus {
  fileName: string;
  taskId: string;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
  message?: string;
}

interface UploadResponse {
  message: string;
  image_id: string;
}

interface ProcessingStatusResponse {
  status: string;
  result?: {
    message: string;
    mode: string;
    image: string;
    label_file: string;
    label_name: string;
    classes: string[];
  };
  error?: string;
}

export function useTrainUploader() {
  const [uploading, setUploading] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [trainLogs, setTrainLogs] = useState<string[]>([]);
  const [trainProgress, setTrainingProgress] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);

  // ------------------------
  // Status Polling
  // ------------------------
  const checkStatus = useCallback(async (fileName: string, taskId: string) => {
    try {
      const response = await axios.get<ProcessingStatusResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/auto-label-train/${taskId}`
      );

      setUploadStatuses(prev => prev.map(status => {
        if (status.taskId === taskId) {
          return {
            ...status,
            status: response.data.status as any,
            message: response.data.result?.message || response.data.error
          };
        }
        return status;
      }));

      if (response.data.status === "processing") {
        setTimeout(() => checkStatus(fileName, taskId), 2000);
      }
    } catch (err: any) {
      setUploadStatuses(prev => prev.map(status => {
        if (status.taskId === taskId) {
          return {
            ...status,
            status: "error",
            message: "Failed to check processing status"
          };
        }
        return status;
      }));
    }
  }, []);

  // ------------------------
  // Upload images
  // ------------------------
  const uploadImages = async (files: File[], label: string) => {
    if (!files.length) return alert("Please select at least one image.");
    if (!label) return alert("Please select a label.");

    setUploading(true);
    setUploadStatuses(files.map(file => ({
      fileName: file.name,
      taskId: "",
      status: "uploading",
      progress: 0
    })));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("label_name", label);

      try {
        const updateProgress = (progress: number) => {
          setUploadStatuses(prev => prev.map((status, idx) =>
            idx === i ? { ...status, progress } : status
          ));
        };

        const response = await axios.post<UploadResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/auto-label-train`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (evt) => {
              if (evt.total) updateProgress(Math.round((evt.loaded / evt.total) * 100));
            },
          }
        );

        setUploadStatuses(prev => prev.map((status, idx) =>
          idx === i
            ? { ...status, taskId: response.data.image_id, status: "processing", message: "Processing started" }
            : status
        ));

        checkStatus(file.name, response.data.image_id);

      } catch (err: any) {
        setUploadStatuses(prev => prev.map((status, idx) =>
          idx === i
            ? { ...status, status: "error", message: err.response?.data?.detail || "Upload failed" }
            : status
        ));
      }
    }

    setUploading(false);
  };

  // ------------------------
  // Reupload single file
  // ------------------------
  const reuploadFile = async (fileName: string, label: string, selectedFiles: File[]) => {
    const fileObj = selectedFiles.find(f => f.name === fileName);
    if (!fileObj) return alert("File object not found");

    setUploadStatuses(prev => prev.map(s =>
      s.fileName === fileName ? { ...s, status: "uploading", progress: 0, message: "" } : s
    ));

    await uploadImages([fileObj], label);
  };

  // ------------------------
  // Trigger model training
  // ------------------------
  const trainModel = async () => {
    try {
      // Start training via API
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/train-model`)
        .catch(() => console.warn("Training API may still be running."));

      // Open WS if not already connected
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/train`);
        wsRef.current = ws;

        ws.onopen = () => setTrainLogs(prev => [...prev, "🔗 Connected to Training WebSocket"]);
        ws.onmessage = (e) => {
          let data;
          try {
            data = JSON.parse(e.data);
          } catch {
            // Non-JSON message, treat as log
            setTrainLogs(prev => [...prev, e.data]);
            return;
          }

          if (data.event === "batch_end" && data.progress !== undefined) {
            animateProgress(data.progress);
            setTrainLogs(prev => [...prev, `Epoch ${data.epoch}, Batch ${data.batch}/${data.total_batches}, Loss: ${data.loss}`]);
          } else if (data.event === "epoch_end") {
            animateProgress(Math.round((data.epoch / data.total_epochs) * 100));
            setTrainLogs(prev => [...prev, `Epoch ${data.epoch}/${data.total_epochs}`]);
          } else if (data.event === "model_saved") {
            setTrainLogs(prev => [...prev, "💾 Model saved"]);
          }
      };
        ws.onclose = (e) => setTrainLogs(prev => [...prev, `🛑 WS closed (${e.code})`]);
        ws.onerror = (err) => setTrainLogs(prev => [...prev, `❌ WS error (${err})`]);
      }

      return { message: "Training started" };
    } catch (err) {
      throw new Error("Failed to start training");
    }
  };

  // ------------------------
  // Optional: auto cleanup on unmount
  // ------------------------
  useEffect(() => {
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  const progressRef = useRef<number>(0);

  const animateProgress = (target: number) => {
  const step = () => {
      const current = progressRef.current;
      const diff = target - current;
      if (Math.abs(diff) < 0.5) {
        progressRef.current = target;
        setTrainingProgress(target);
        return;
      }
      const next = current + diff * 0.1; // smooth interpolation
      progressRef.current = next;
      setTrainingProgress(next);
      requestAnimationFrame(step);
    };
    step();
  };

  return {
    uploading,
    uploadStatuses,
    uploadImages,
    reuploadFile,
    trainModel,
    trainLogs,
    trainProgress
  };
}