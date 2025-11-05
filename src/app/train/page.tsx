"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import TrainLayout from "@/components/TrainLayout";
import { useTrainUploader } from "@/hooks/useTrainUploader";
import Dropdown from "@/components/Dropdown";

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
  const { uploading, uploadStatuses, uploadImages } = useTrainUploader();

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
    setSelectedFiles([]); // Clear selected files after upload starts
  };

  // Calculate overall progress
  const overallProgress = uploadStatuses.length > 0
    ? uploadStatuses.reduce((sum, status) => sum + status.progress, 0) / uploadStatuses.length
    : 0;

  return (
    <TrainLayout title="🐔 Dataset Uploader (ChickenAI)">
      {/* Label Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Select Label (Optional):
        </label>
        <Dropdown
          options={labels}
          value={selectedLabel}
          onChange={setSelectedLabel}
          placeholder="-- Auto-detect or Choose a Label --"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty for auto-detection or select a specific label
        </p>
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
          disabled={uploading}
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

      {/* Upload Status List */}
      {uploadStatuses.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploadStatuses.map((status, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {status.fileName}
                </p>
                <span className={`text-xs px-2 py-1 rounded ${
                  status.status === 'completed' ? 'bg-green-100 text-green-800' :
                  status.status === 'error' ? 'bg-red-100 text-red-800' :
                  status.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                </span>
              </div>
              
              {/* Progress bar */}
              {(status.status === 'uploading' || status.status === 'processing') && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      status.status === 'processing' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${status.progress}%` }}
                  />
                </div>
              )}
              
              {/* Status message */}
              {status.message && (
                <p className={`text-xs mt-1 ${
                  status.status === 'error' ? 'text-red-600' :
                  status.status === 'completed' ? 'text-green-600' :
                  'text-gray-500'
                }`}>
                  {status.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Overall Progress */}
      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Overall Progress: {Math.round(overallProgress)}%
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        disabled={uploading || selectedFiles.length === 0}
        onClick={handleUpload}
        className={`mt-6 w-full py-3 rounded-lg font-semibold text-white transition ${
          uploading || selectedFiles.length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {uploading 
          ? "Processing..." 
          : selectedFiles.length === 0 
            ? "Select Files to Upload"
            : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`
        }
      </button>

      {/* Help Text */}
      <p className="mt-4 text-center text-sm text-gray-500">
        {selectedLabel 
          ? `Images will be labeled as "${selectedLabel}"`
          : "Images will be automatically labeled using AI detection"
        }
      </p>
    </TrainLayout>
  );
}