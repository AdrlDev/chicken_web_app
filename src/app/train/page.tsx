// components/pages/UploadPage.tsx

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/loginHooks/useAuth';
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
import LoadingSpinner from "@/components/LoadingSpinner";

const labels = [
  "healthy",
  "avian Influenza",
  "blue comb",
  "coccidiosis",
  "fowl cholera",
  "fowl-pox",
  "mycotic infections",
];

// Define a function to show the browser notification
const showNotification = (title: string, body: string) => {
    // Check if notifications are supported and permitted
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        // Request permission if not already granted/denied
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body });
            }
        });
    }
};

export default function UploadPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [isTrainingActive, setIsTrainingActive] = useState(false); // <-- NEW STATE
  
  const { 
    uploading, 
    uploadStatuses, 
    uploadImages, 
    reuploadFile, 
    trainModel, 
    trainLogs, 
    trainProgress 
  } = useTrainUploader(setIsTrainingActive); // <-- PASS SETTER TO HOOK
  
  const logContainerRef = useRef<HTMLDivElement>(null);

  // --- 1. Authentication Check ---
  useEffect(() => {
    if (!isLoading && user === null) {
      router.push('/login'); 
    }
  }, [user, isLoading, router]);

  // ⭐️ FIX: Dedicated useEffect for requesting Notification Permission ONCE
  useEffect(() => {
    if ('Notification' in window) {
        Notification.requestPermission();
    }
  }, []); // Empty dependency array ensures this runs only on mount


  // --- 2. Training Status & Notification Logic ---
  useEffect(() => {
    const finishLog = trainLogs.find(log => 
        log.includes("✅ Training finished") || 
        log.includes("❌ Training failed")
    );

    if (finishLog) {
        // Training is done (success or failure)
        setIsTrainingActive(false); 
        
        if (finishLog.includes("✅ Training finished")) {
            showNotification("✅ Training Complete", "The model has finished training!");
        } else {
             showNotification("❌ Training Failed", "An error occurred during training.");
        }
    } 
    // The logic below for re-mount state stabilization is now handled better inside useTrainUploader
    
  }, [trainLogs]); // Dependency array updated to [trainLogs]


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
      // Set training state immediately
      setIsTrainingActive(true); 
      const data = await trainModel();
      alert(data.message || "Training started!");
    } catch {
      setIsTrainingActive(false); // Reset on immediate API failure
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
    return null;
  }

  // --- Determine if the training section should be visible ---
  // Show training section if active, or if logs/progress exist from a previous session
  const isProgressVisible = isTrainingActive || trainLogs.length > 0 || trainProgress > 0; 


  // --- Authorized User Content ---
  return (
    <>
      <header className="absolute inset-x-0 top-0 z-50">
        <Navbar />
      </header>
      <TrainLayout title="Dataset Uploader" icon={<CogIcon className="w-6 h-6" />}>
        {/* Upload/Labeling section only shown if training is NOT active */}
        {!isTrainingActive && (
          <>
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

            {/* Overall Progress for Uploads */}
            {uploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Overall Upload Progress: {Math.round(overallProgress)}%
                </p>
              </div>
            )}
            
            {/* Help Text */}
            <p className="mt-4 text-center text-sm text-gray-500">
                {selectedLabel
                ? `Images will be labeled as "${selectedLabel}"`
                : "Images will be automatically labeled using AI detection"
                }
            </p>
          </>
        )}
        
        {/* Upload / Train Buttons - Visible regardless of training state */}
        <UploadTrainButtons
          uploading={uploading}
          selectedFilesCount={selectedFiles.length}
          hasCompletedUploads={uploadStatuses.some(s => s.status === "completed")}
          onUpload={handleUpload}
          onTrain={handleTrainModel}
          isTrainingActive={isTrainingActive} // <-- PASS NEW PROP
        />

        {/* Training Status and Logs Section */}
        {isProgressVisible && (
            <>
                <h3 className="mt-8 text-xl font-semibold">
                    {isTrainingActive ? "Model Training in Progress..." : "Last Training Session"}
                </h3>
                
                {/* Training Progress */}
                {(isTrainingActive || trainProgress > 0) && <TrainingProgress progress={trainProgress} />}

                {/* Training Logs */}
                {trainLogs.length > 0 && (
                    <TrainingLogs 
                        logs={trainLogs} 
                        logContainerRef={logContainerRef} 
                    />
                )}
            </>
        )}
      </TrainLayout>
      <Footer />
    </>
  );
}