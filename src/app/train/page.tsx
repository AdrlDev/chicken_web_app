"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import TrainLayout from "@/components/TrainLayout";
import { useTrainUploader } from "@/hooks/useTrainUploader";
import Dropdown from "@/components/Dropdown";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/solid";

const labels = [
  "healthy",
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
  const [trainingStarted, setTrainingStarted] = useState(false);

  const {
    uploading,
    uploadStatuses,
    uploadImages,
    reuploadFile,
    trainModel,
    trainLogs,
    trainProgress,
  } = useTrainUploader();

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [trainLogs]);

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
  };

  const handleTrainModel = async () => {
    setTrainingStarted(true); // Start training
    try {
      await trainModel();
    } catch {
      alert("Failed to start training");
      setTrainingStarted(false);
    }
  };

  const handleNewUpload = () => {
    // Reset state for new upload
    setSelectedFiles([]);
    setSelectedLabel("");
    setTrainingStarted(false);
  };

  const overallProgress =
    uploadStatuses.length > 0
      ? uploadStatuses.reduce((sum, status) => sum + status.progress, 0) / uploadStatuses.length
      : 0;

  // Determine what to show
  const showUploadUI = !trainingStarted && (uploading || uploadStatuses.length === 0 || uploadStatuses.some(s => s.status !== "completed"));
  const showTrainButton = !trainingStarted && uploadStatuses.length > 0 && uploadStatuses.every(s => s.status === "completed");
  const showNewUploadButton = trainingStarted && trainProgress >= 100; // You can adjust logic if needed

  return (
    <TrainLayout title="🐔 Dataset Uploader (ChickenAI)">
      {/* Upload UI */}
      {showUploadUI && (
        <>
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

          {/* Drag & Drop Upload */}
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

          {/* Image Preview Grid */}
          {uploadStatuses.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadStatuses.map((status, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden shadow-md border border-gray-200">
                  <Image
                    src={
                      status.fileName.startsWith("http")
                        ? status.fileName
                        : (() => {
                            const file = selectedFiles.find(f => f.name === status.fileName);
                            return file ? URL.createObjectURL(file) : "";
                          })()
                    }
                    alt={status.fileName}
                    width={300}
                    height={200}
                    className="h-32 w-full object-cover"
                    unoptimized
                  />

                  {/* Status Overlay */}
                  <div className="absolute top-1 right-1 flex items-center space-x-1">
                    {status.status === "completed" && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                    {status.status === "error" && <XCircleIcon className="h-5 w-5 text-red-500" />}
                    {status.status === "processing" && <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />}
                  </div>

                  {/* File Name */}
                  <p className="text-xs mt-1 text-center text-gray-500 truncate">{status.fileName}</p>

                  {/* Progress Bar */}
                  {(status.status === "uploading" || status.status === "processing") && (
                    <div className="w-full bg-gray-200 h-2 mt-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          status.status === "processing" ? "bg-yellow-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${status.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Status Message */}
                  {status.message && (
                    <p className={`text-xs mt-1 text-center ${
                      status.status === "error" ? "text-red-600" :
                      status.status === "completed" ? "text-green-600" :
                      "text-gray-500"
                    }`}>{status.message}</p>
                  )}

                  {/* Reupload Button */}
                  {status.status === "error" && (
                    <button
                      className="mt-2 w-full py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                      onClick={() => reuploadFile(status.fileName, selectedLabel)}
                    >
                      Reupload
                    </button>
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
        </>
      )}

      {/* Train Button */}
      {showTrainButton && (
        <button
          className="w-full py-3 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 mt-6"
          onClick={handleTrainModel}
        >
          Train Model
        </button>
      )}

      {/* New Upload Button */}
      {showNewUploadButton && (
        <button
          className="w-full py-3 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 mt-6"
          onClick={handleNewUpload}
        >
          New Upload
        </button>
      )}

      {/* Logs */}
      {(trainingStarted || trainLogs.length > 0) && (
        <div
          className="mt-6 border border-gray-300 rounded-lg p-4 bg-gray-50 h-64 overflow-y-auto font-mono text-xs text-gray-700"
          ref={logContainerRef}
        >
          {trainLogs.map((log, idx) => {
            let colorClass = "text-gray-700";
            const logLower = log.toLowerCase();
            if (logLower.includes("error") || logLower.includes("failed") || logLower.includes("exception")) {
              colorClass = "text-red-600";
            } else if (logLower.includes("warning") || log.includes("⚠️")) {
              colorClass = "text-yellow-600";
            }
            return <p key={idx} className={colorClass}>{log}</p>;
          })}
        </div>
      )}

      {/* Training Progress */}
      {trainingStarted && trainProgress > 0 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${Math.round(trainProgress)}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">Training Progress: {Math.round(trainProgress)}%</p>
        </div>
      )}
    </TrainLayout>
  );
}
