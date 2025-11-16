/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useRef } from "react";
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
  const reuploadFile = async (fileName: string, label: string) => {
    const file = uploadStatuses.find(s => s.fileName === fileName);
    if (!file) return alert("File not found for reupload");

    setUploadStatuses(prev => prev.map(s =>
      s.fileName === fileName ? { ...s, status: "uploading", progress: 0, message: "" } : s
    ));

    const fileObj = (window as any).selectedFiles?.find((f: File) => f.name === fileName);
    if (!fileObj) return alert("File object not found");

    await uploadImages([fileObj], label);
  };

  // ------------------------
  // Trigger model training
  // ------------------------
  const trainModel = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/train-model`);
      
      // Open WebSocket for live logs
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/train`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Connected to YOLO WebSocket");
      };

      ws.onmessage = (event) => {
        setTrainLogs(prev => [...prev, event.data]);
      };
      ws.onclose = () => {
        setTrainLogs(prev => [...prev, "⚠️ Training WebSocket closed"]);
      };
      ws.onerror = () => {
        setTrainLogs(prev => [...prev, "❌ Training WebSocket error"]);
      };

      return res.data;
    } catch (err) {
      throw new Error("Failed to start training");
    }
  };

  return {
    uploading,
    uploadStatuses,
    uploadImages,
    reuploadFile,
    trainModel,
    trainLogs
  };
}