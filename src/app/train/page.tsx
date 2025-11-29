// components/pages/UploadPage.tsx

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/loginHooks/useAuth";
import TrainLayout from "@/components/TrainLayout";
import { useTrainUploader } from "@/hooks/useTrainUploader";
import LabelDropdown from "@/components/dropdown/LabelDropdown";
import DragDropUpload from "@/components/upload/DragDropUpload";
import {
  CogIcon,
  CloudArrowUpIcon,
  AcademicCapIcon,
  ClockIcon,
} from "@heroicons/react/24/solid"; // Added more icons
import ImagePreviewGrid from "@/components/upload/ImagePreview";
import UploadTrainButtons from "@/components/upload/UploadTrainButtons";
import TrainingLogs from "@/components/upload/TrainingLogs";
import TrainingProgress from "@/components/upload/TrainingProgress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion } from "framer-motion"; // ✨ NEW: Import Framer Motion

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
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  } else if ("Notification" in window && Notification.permission !== "denied") {
    // Request permission if not already granted/denied
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body });
      }
    });
  }
};

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function UploadPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [isAddingFiles, setIsAddingFiles] = useState(false);

  const {
    uploading,
    uploadStatuses,
    uploadImages,
    reuploadFile,
    trainModel,
    trainLogs,
    trainProgress,
  } = useTrainUploader(setIsTrainingActive);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // --- 1. Authentication Check ---
  useEffect(() => {
    if (!isLoading && user === null) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // ⭐️ FIX: Dedicated useEffect for requesting Notification Permission ONCE
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // --- 2. Training Status & Notification Logic ---
  useEffect(() => {
    const finishLog = trainLogs.find(
      (log) =>
        log.includes("✅ Training finished") ||
        log.includes("❌ Training failed"),
    );

    if (finishLog) {
      // Training is done (success or failure)
      setIsTrainingActive(false);

      if (finishLog.includes("✅ Training finished")) {
        showNotification(
          "✅ Training Complete",
          "The model has finished training!",
        );
      } else {
        showNotification(
          "❌ Training Failed",
          "An error occurred during training.",
        );
      }
    }
  }, [trainLogs]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [trainLogs]);

  const handleFilesAdded = (files: File[]) => {
    // 1. Set loading state to true
    setIsAddingFiles(true);
    setSelectedFiles((prev) => [...prev, ...files]);
    // 3. Use a slight delay to allow the DOM to update and the preview component to start processing
    setTimeout(() => {
      setIsAddingFiles(false);
    }, 100);
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

  // --- Overall Progress Calculation & Upload Stats ---
  const successfullyUploadedCount = uploadStatuses.filter(
    (s) => s.status === "completed",
  ).length;
  const failedUploadCount = uploadStatuses.filter(
    (s) => s.status === "error",
  ).length;
  const pendingUploadCount = selectedFiles.length - uploadStatuses.length;

  const overallProgress =
    uploadStatuses.length > 0
      ? uploadStatuses.reduce((sum, status) => sum + status.progress, 0) /
        uploadStatuses.length
      : 0;

  // --- Loading State Check ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <LoadingSpinner size={80} color1="indigo-500" color2="purple-400" />
      </div>
    );
  }

  // --- Access Denied/Redirecting State ---
  if (user === null && !isLoading) {
    return null;
  }

  // --- Determine if the training section should be visible ---
  const isProgressVisible =
    isTrainingActive || trainLogs.length > 0 || trainProgress > 0;

  // --- Authorized User Content ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="absolute inset-x-0 top-0 z-50">
        <Navbar />
      </header>

      <TrainLayout
        title="AI Model Training & Dataset Upload"
        icon={<CogIcon className="w-7 h-7 text-indigo-500" />}
      >
        <motion.div
          className="relative"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Spinner overlay while files are initially being processed by the browser */}
          {isAddingFiles && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 z-40 flex items-center justify-center rounded-xl backdrop-blur-sm transition-opacity duration-300">
              <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
                <LoadingSpinner
                  size={50}
                  color1="indigo-500"
                  color2="purple-400"
                />
                <p className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Preparing Images...
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Processing {selectedFiles.length} files for preview.
                </p>
              </div>
            </div>
          )}

          {/* Upload/Labeling section only shown if training is NOT active */}
          {!isTrainingActive && (
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                <CloudArrowUpIcon className="w-5 h-5 mr-2 text-green-500" />
                Step 1: Upload and Label Data
              </h2>

              {/* Label Dropdown */}
              <motion.div
                variants={itemVariants}
                className="mb-6 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700"
              >
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Assign Label for Uploaded Images:
                </p>
                <LabelDropdown
                  labels={labels}
                  selectedLabel={selectedLabel}
                  onChange={setSelectedLabel}
                />
              </motion.div>

              {/* Drag & Drop Upload */}
              <motion.div variants={itemVariants}>
                <DragDropUpload
                  uploading={uploading}
                  onFilesAdded={handleFilesAdded}
                  label="Drag & drop images here, or browse to upload"
                />
              </motion.div>

              {/* Upload Statistics and Progress Bar */}
              {(uploadStatuses.length > 0 || selectedFiles.length > 0) && (
                <motion.div
                  variants={itemVariants}
                  className="mt-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 shadow-inner"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-4">
                    {/* Total Files Loaded */}
                    <div className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                      <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {selectedFiles.length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Total Files
                      </p>
                    </div>

                    {/* Successfully Uploaded */}
                    <div className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                      <p className="text-xl font-bold text-green-600">
                        {successfullyUploadedCount}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Uploaded
                      </p>
                    </div>

                    {/* Pending Uploads ✨ NEW BADGE */}
                    <div className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                      <p className="text-xl font-bold text-amber-500">
                        {pendingUploadCount}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        **Pending**
                      </p>
                    </div>

                    {/* Failed Uploads */}
                    <div className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                      <p className="text-xl font-bold text-red-600">
                        {failedUploadCount}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Failed
                      </p>
                    </div>
                  </div>

                  {/* Overall Progress for Uploads */}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">
                      Upload Completion: {Math.round(overallProgress)}%
                    </p>
                    <div className="w-full bg-indigo-200 dark:bg-indigo-700 rounded-full h-3">
                      <motion.div
                        className="bg-indigo-500 h-3 rounded-full shadow-lg transition-all duration-500"
                        style={{ width: `${overallProgress}%` }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Image Preview Grid */}
              {(uploadStatuses.length > 0 || selectedFiles.length > 0) && (
                <motion.div variants={itemVariants} className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
                    Image Previews ({selectedLabel || "Unlabeled"})
                  </h3>
                  <ImagePreviewGrid
                    uploadStatuses={uploadStatuses}
                    selectedFiles={selectedFiles}
                    selectedLabel={selectedLabel}
                    reuploadFile={reuploadFile}
                  />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Upload / Train Buttons - Visible regardless of training state */}
          <motion.div
            variants={itemVariants}
            className="mt-8 pt-6 border-t border-dashed border-gray-300 dark:border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
              <AcademicCapIcon className="w-5 h-5 mr-2 text-purple-500" />
              Step 2: Start Model Training
            </h2>
            <UploadTrainButtons
              uploading={uploading}
              selectedFilesCount={selectedFiles.length}
              hasCompletedUploads={uploadStatuses.some(
                (s) => s.status === "completed",
              )}
              onUpload={handleUpload}
              onTrain={handleTrainModel}
              isTrainingActive={isTrainingActive}
            />
          </motion.div>

          {/* Training Status and Logs Section */}
          {isProgressVisible && (
            <motion.div
              variants={itemVariants}
              className="mt-8 p-6 rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-blue-400/50 dark:border-blue-600/50"
            >
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2 text-blue-500 animate-spin-slow" />
                {isTrainingActive
                  ? "Model Training in Progress..."
                  : "Last Training Session Report"}
              </h3>

              {/* Training Progress */}
              {(isTrainingActive || trainProgress > 0) && (
                <TrainingProgress progress={trainProgress} />
              )}

              {/* Training Logs */}
              {trainLogs.length > 0 && (
                <TrainingLogs
                  logs={trainLogs}
                  logContainerRef={logContainerRef}
                />
              )}
            </motion.div>
          )}
        </motion.div>
      </TrainLayout>
      <Footer />
    </div>
  );
}
