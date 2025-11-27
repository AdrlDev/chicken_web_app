"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation'; // <-- Import useRouter
import { useAuth } from '@/hooks/loginHooks/useAuth';    // <-- Import useAuth
import TrainLayout from "@/components/TrainLayout";
import { useTrainUploader } from "@/hooks/useTrainUploader";
import LabelDropdown from "@/components/dropdown/LabelDropdown";
import DragDropUpload from "@/components/upload/DragDropUpload";
import { CogIcon } from "@heroicons/react/24/solid";
import ImagePreviewGrid from "@/components/upload/ImagePreview";
import UploadTrainButtons from "@/components/upload/UploadTrainButtons";
import TrainingLogs from "@/components/upload/TrainingLogs";
import TrainingProgress from "@/components/upload/TrainingProgress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer/Footer";
import LoadingSpinner from "@/components/LoadingSpinner"; // <-- Import the spinner

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
  const { user, isLoading } = useAuth(); // <-- Get user and loading state
  const router = useRouter();             // <-- Initialize router
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedLabel, setSelectedLabel] = useState("");
  const { 
    uploading, 
    uploadStatuses, 
    uploadImages, 
    reuploadFile, 
    trainModel, 
    trainLogs, 
    trainProgress 
  } = useTrainUploader();
  
  const logContainerRef = useRef<HTMLDivElement>(null);

  // --- Authentication Check and Redirection ---
  useEffect(() => {
    // If loading is false AND there is no user, redirect to login.
    if (!isLoading && user === null) {
      router.push('/login'); 
    }
  }, [user, isLoading, router]);


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
    
  // --- Loading State Check ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <LoadingSpinner size={80} color1="blue-500" color2="cyan-400" />
      </div>
    );
  }

  // --- Access Denied/Redirecting State ---
  if (user === null && !isLoading) {
    return null; // Block rendering if redirect is active
  }

  // --- Authorized User Content ---
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
        {trainLogs.length > 0 && (
            <TrainingLogs 
                logs={trainLogs} 
                // ADD THIS PROP BACK:
                logContainerRef={logContainerRef} 
            />
        )}

        {/* Training Progress */}
        {trainProgress > 0 && <TrainingProgress progress={trainProgress} />}
      </TrainLayout>
      <Footer />
    </>
  );
}