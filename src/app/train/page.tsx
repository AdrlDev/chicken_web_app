"use client";

import React, { useState, useRef, useEffect } from "react";
import TrainLayout from "@/components/TrainLayout";
import { useTrainUploader } from "@/hooks/useTrainUploader";
import LabelDropdown from "@/components/dropdown/LabelDropdown";
import DragDropUpload from "@/components/upload/DragDropUpload";
import { CogIcon } from "@heroicons/react/24/solid";
import ImagePreviewGrid from "@/components/upload/ImagePreview"; // use typed version
import UploadTrainButtons from "@/components/upload/UploadTrainButtons";
import TrainingLogs from "@/components/upload/TrainingLogs";
import TrainingProgress from "@/components/upload/TrainingProgress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer/Footer";

const labels = [
  "healthy",
  "avian Influenza",
  "blue comb",
  "coccidiosis",
  "fowl cholera",
  "fowl-pox",
  "mycotic infections",
];

export default function UploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedLabel, setSelectedLabel] = useState("");
  const { uploading, uploadStatuses, uploadImages, reuploadFile, trainModel, trainLogs, trainProgress } = useTrainUploader();
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [trainLogs]);

  const handleFilesAdded = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleUpload = async () => {
    await uploadImages(selectedFiles, selectedLabel);
  };

  const handleTrainModel = async () => {
    try {
      const data = await trainModel();
      alert(data.message || "Training started!");
    } catch {
      alert("Failed to start training");
    }
  };

  const overallProgress = uploadStatuses.length > 0
    ? uploadStatuses.reduce((sum, status) => sum + status.progress, 0) / uploadStatuses.length
    : 0;

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-50">
        <Navbar />
      </header>
      <TrainLayout title="Dataset Uploader" icon={<CogIcon className="w-6 h-6" />}>
        <LabelDropdown
          labels={labels}
          selectedLabel={selectedLabel}
          onChange={setSelectedLabel}
        />

        {/* Drag & Drop Upload */}
        <DragDropUpload
          uploading={uploading}
          onFilesAdded={handleFilesAdded}
          label="Drag & drop images here, or browse to upload"
        />

        {/* Image Preview Grid */}
        {(uploadStatuses.length > 0 || selectedFiles.length > 0) && (
          <ImagePreviewGrid
            uploadStatuses={uploadStatuses}
            selectedFiles={selectedFiles}
            selectedLabel={selectedLabel}
            reuploadFile={reuploadFile}
          />
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

        {/* Upload / Train Buttons */}
        <UploadTrainButtons
          uploading={uploading}
          selectedFilesCount={selectedFiles.length}
          hasCompletedUploads={uploadStatuses.some(s => s.status === "completed")}
          onUpload={handleUpload}
          onTrain={handleTrainModel}
        />

        {/* Help Text */}
        <p className="mt-4 text-center text-sm text-gray-500">
          {selectedLabel
            ? `Images will be labeled as "${selectedLabel}"`
            : "Images will be automatically labeled using AI detection"
          }
        </p>

        {/* Training Logs */}
        {trainLogs.length > 0 && <TrainingLogs logs={trainLogs} />}

        {/* Training Progress */}
        {trainProgress > 0 && <TrainingProgress progress={trainProgress} />}
      </TrainLayout>
      <Footer />
    </>
  );
}
