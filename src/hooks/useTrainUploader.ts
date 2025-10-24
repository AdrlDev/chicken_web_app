/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import axios from "axios";

export function useTrainUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [responseMsg, setResponseMsg] = useState("");

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
    setProgress(0);
    setResponseMsg("");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("label_name", label);

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auto-label-train`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (evt) => {
              if (evt.total) {
                setProgress(Math.round((evt.loaded / evt.total) * 100));
              }
            },
          }
        );

        console.log("✅ Uploaded:", res.data);
        setResponseMsg(`✅ Uploaded ${file.name} successfully.`);
      } catch (err: any) {
        console.error("❌ Upload error:", err);
        setResponseMsg(`❌ Failed to upload ${file.name}.`);
      }
    }

    setUploading(false);
  };

  return { uploading, progress, responseMsg, uploadImages };
}