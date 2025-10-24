"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import TrainLayout from "@/components/TrainLayout";
import { useTrainUploader } from "@/hooks/useTrainUploader";

const labels = [
  "Healthy",
  "avian Influenza",
  "blue comb",
  "coccidiosis",
  "coccidiosis poops",
  "fowl cholera",
  "fowl-pox",
  "mycotic infections",
];

export default function UploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedLabel, setSelectedLabel] = useState("");
  const { uploading, progress, responseMsg, uploadImages } = useTrainUploader();

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleUpload = async () => {
    await uploadImages(selectedFiles, selectedLabel);
    setSelectedFiles([]);
  };

  return (
    <TrainLayout title="🐔 Dataset Uploader (ChickenAI)">
      {/* Label Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Select Label:
        </label>
        <select
          value={selectedLabel}
          onChange={(e) => setSelectedLabel(e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
        >
          <option value="">-- Choose a Label --</option>
          {labels.map((lbl) => (
            <option key={lbl} value={lbl}>
              {lbl}
            </option>
          ))}
        </select>
      </div>

      {/* Drag and Drop Upload */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <input
          id="fileInput"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-gray-600">
          Drag & drop images here, or{" "}
          <span className="text-green-600 font-semibold">browse</span> to upload
        </p>
      </div>

      {/* Image Preview */}
      {selectedFiles.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="relative">
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                width={300}
                height={200}
                className="rounded-lg shadow-md h-32 w-full object-cover"
                unoptimized
              />
              <p className="text-xs mt-1 text-center text-gray-500 truncate">
                {file.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Uploading... {progress}%
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        disabled={uploading}
        onClick={handleUpload}
        className={`mt-6 w-full py-3 rounded-lg font-semibold text-white transition ${
          uploading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {uploading ? "Uploading..." : "Start Upload & Train"}
      </button>

      {/* Response Message */}
      {responseMsg && (
        <div className="mt-4 text-center text-sm text-gray-700">
          {responseMsg}
        </div>
      )}
    </TrainLayout>
  );
}