/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import axios from "axios";

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

interface UploadStatus {
  fileName: string;
  taskId: string;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
  message?: string;
}

export function useTrainUploader() {
  const [uploading, setUploading] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);

  // Poll for status of a specific upload
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

      // Continue polling if still processing
      if (response.data.status === "processing") {
        setTimeout(() => checkStatus(fileName, taskId), 2000);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const uploadImages = async (files: File[], label: string) => {
    if (!files.length) {
      alert("Please select at least one image.");
      return;
    }
    if (!label) {
      alert("Please select a label.");
      return;
    }

    setUploading(true);
    // Initialize status for all files
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
        // Update progress for current file
        const updateProgress = (progress: number) => {
          setUploadStatuses(prev => prev.map((status, idx) => 
            idx === i ? { ...status, progress } : status
          ));
        };

        // Upload the file
        const response = await axios.post<UploadResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/auto-label-train`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (evt) => {
              if (evt.total) {
                updateProgress(Math.round((evt.loaded / evt.total) * 100));
              }
            },
          }
        );

        // Update status and start polling
        setUploadStatuses(prev => prev.map((status, idx) => 
          idx === i ? {
            ...status,
            taskId: response.data.image_id,
            status: "processing",
            message: "Processing started"
          } : status
        ));

        // Start polling for this file
        checkStatus(file.name, response.data.image_id);

      } catch (err: any) {
        setUploadStatuses(prev => prev.map((status, idx) => 
          idx === i ? {
            ...status,
            status: "error",
            message: err.response?.data?.detail || "Upload failed"
          } : status
        ));
      }
    }

    setUploading(false);
  };

  return { 
    uploading, 
    uploadStatuses,
    uploadImages 
  };
}