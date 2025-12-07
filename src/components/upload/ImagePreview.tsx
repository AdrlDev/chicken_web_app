// components/upload/ImagePreview.tsx

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import ActionButtonGroup from "@/components/bottons/ActionButtonGroup";
import { useTheme } from "@/components/themes/ThemeContext";

interface UploadStatus {
  fileName: string;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
  message?: string;
}

interface ImagePreviewGridProps {
  uploadStatuses: UploadStatus[];
  selectedFiles: File[];
  selectedLabel: string;
  reuploadFile: (fileName: string, label: string, files: File[]) => void;
  onPreviewsReady: (isReady: boolean) => void;
}

type FileItem = {
  type: "local";
  file: File;
  url?: string;
  loading?: boolean;
};

type StatusItem = {
  type: "status";
  status: UploadStatus;
  loading?: boolean;
  url?: string;
};

type Item = FileItem | StatusItem;

export default function ImagePreviewGrid({
  uploadStatuses,
  selectedFiles,
  selectedLabel,
  reuploadFile,
  onPreviewsReady,
}: ImagePreviewGridProps) {
  const { theme } = useTheme();
  const [showAll, setShowAll] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [statusItems, setStatusItems] = useState<StatusItem[]>([]);

  // Use theme-aware colors
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  // If uploadStatuses has content, we show those (uploaded files), otherwise show local files
  const shouldShowLocalFiles = uploadStatuses.length === 0;

  // Generate object URLs for local files
  useEffect(() => {
    if (!shouldShowLocalFiles) {
      setFileItems([]);
      setIsLocalLoading(false);
      return;
    }

    // Handle case where selectedFiles is empty (reset loading)
    if (selectedFiles.length === 0) {
      setIsLocalLoading(false);
      onPreviewsReady(true);
      return;
    }

    // Set initial loading state when files are available
    setIsLocalLoading(true);
    onPreviewsReady(false);

    const newItems: FileItem[] = selectedFiles.map((file) => ({
      type: "local",
      file,
      loading: true,
    }));

    setFileItems(newItems);

    let loadedCount = 0;
    const totalFiles = newItems.length;

    newItems.forEach((item, idx) => {
      const url = URL.createObjectURL(item.file);

      // FIX: Changed artificial delay from 50ms to 0ms
      setTimeout(() => {
        setFileItems((prev) => {
          const updated = [...prev];
          // Ensure index is valid to prevent crashes during rapid state changes
          if (updated[idx]) {
            updated[idx] = { ...item, url, loading: false };
          }
          return updated;
        });

        loadedCount++;
        // Set loading state FALSE when all files have generated URLs
        if (loadedCount === totalFiles) {
          setIsLocalLoading(false);
          onPreviewsReady(true);
        }
      }, 0); // <-- FIX: Removed artificial delay
    });

    return () => {
      newItems.forEach((item) => item.url && URL.revokeObjectURL(item.url));
      setIsLocalLoading(false);
    };
  }, [selectedFiles, shouldShowLocalFiles, onPreviewsReady]); // FIX: Added missing dependency

  // Track loading for uploaded status images
  useEffect(() => {
    // Only process status items if uploadStatuses is not empty (i.e., upload has started)
    if (!shouldShowLocalFiles) {
      const newStatusItems: StatusItem[] = uploadStatuses.map((status) => ({
        type: "status",
        status,
        loading: true,
        // ASSUMPTION: The fileName contains the accessible URL after upload/processing
        url: status.fileName.startsWith("http") ? status.fileName : undefined,
      }));
      setStatusItems(newStatusItems);
    }
  }, [uploadStatuses, shouldShowLocalFiles]);

  const handleStatusImageLoad = (idx: number) => {
    setStatusItems((prev) => {
      const updated = [...prev];
      if (updated[idx]) {
        updated[idx] = { ...updated[idx], loading: false };
      }
      return updated;
    });
  };

  // --- Final Item Array for Rendering ---
  const allItems: Item[] = shouldShowLocalFiles ? fileItems : statusItems;
  const itemsToShow = showAll ? allItems : allItems.slice(0, 6);

  // --- Central Loading Spinner for Preview Generation ---
  if (isLocalLoading) {
    return (
      <div
        className={`mt-6 flex justify-center items-center h-40 ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"} rounded-lg shadow-inner`}
      >
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent border-b-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Preparing image previews...
          </p>
        </div>
      </div>
    );
  }

  // Show nothing if neither local files nor upload statuses exist
  if (allItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 relative">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {itemsToShow.map((item, idx) => {
            let src: string | undefined;
            let fileName: string;
            let isLoading = false;

            if (item.type === "local") {
              src = item.url;
              fileName = item.file.name;
              isLoading = item.loading ?? false;
            } else {
              fileName = item.status.fileName;
              src = item.url;
              isLoading = item.loading ?? false;
            }

            // FIX: Safely determine item's status, message, progress, and activity state using type guards
            const status = item.type === "status" ? item.status.status : null;
            const message = item.type === "status" ? item.status.message : null;
            const progress = item.type === "status" ? item.status.progress : 0;
            const isUploadActive =
              status === "uploading" || status === "processing";

            return (
              <motion.div
                key={fileName + idx} // Use a more unique key
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className={`relative rounded-xl overflow-hidden shadow-lg border ${borderColor} h-40 flex items-center justify-center ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
              >
                {/* Image */}
                {src && (
                  <Image
                    src={src}
                    alt={fileName}
                    fill
                    style={{ objectFit: "cover" }}
                    unoptimized
                    onLoadingComplete={() =>
                      item.type === "status" && handleStatusImageLoad(idx)
                    }
                  />
                )}

                {/* Loading Overlay (Initial file processing/image loading) */}
                {isLoading && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center ${theme === "dark" ? "bg-gray-900/70" : "bg-white/70"}`}
                  >
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent border-b-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Status Indicator (Top Right) */}
                {item.type === "status" && (
                  <div className="absolute top-2 right-2 flex items-center space-x-1 p-1 rounded-full bg-black/50 backdrop-blur-sm shadow-md">
                    {status === "completed" && (
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    )}
                    {status === "error" && (
                      <XCircleIcon className="h-5 w-5 text-red-400" />
                    )}
                    {isUploadActive && (
                      <ClockIcon className="h-5 w-5 text-yellow-400 animate-spin" />
                    )}
                  </div>
                )}

                {/* Status Overlay (Covers image for feedback) */}
                {/* Check if item is a StatusItem AND if status is completed or error */}
                {item.type === "status" &&
                  (status === "completed" || status === "error") && (
                    <div
                      className={`absolute inset-0 flex flex-col items-center justify-center p-2 text-center transition-all duration-300 ${
                        status === "completed"
                          ? "bg-green-800/70"
                          : "bg-red-800/70"
                      }`}
                    >
                      <p className={`text-sm font-bold text-white mb-2`}>
                        {status === "completed"
                          ? "UPLOAD SUCCESS"
                          : "UPLOAD FAILED"}
                      </p>
                      {status === "error" && (
                        <button
                          onClick={() =>
                            reuploadFile(
                              item.status.fileName,
                              selectedLabel,
                              selectedFiles,
                            )
                          }
                          className="mt-1 px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-xs font-medium shadow-xl"
                        >
                          Reupload
                        </button>
                      )}
                      {message && (
                        <p className={`text-xs mt-1 text-white opacity-80`}>
                          {message}
                        </p>
                      )}
                    </div>
                  )}

                {/* File Name & Progress Bar (Bottom) */}
                <div
                  className={`absolute bottom-0 left-0 w-full p-2 transition-all duration-300 ${
                    isUploadActive ? "bg-black/90" : "bg-black/70"
                  }`}
                >
                  {/* Progress Bar */}
                  {isUploadActive && (
                    <div className="w-full bg-gray-600 h-1 mb-1 rounded-full">
                      <motion.div
                        className={`h-1 rounded-full ${status === "processing" ? "bg-yellow-500" : "bg-blue-500"}`}
                        style={{ width: `${progress}%` }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  )}

                  {/* File Name */}
                  <p className="text-xs text-white truncate px-1 font-mono">
                    {fileName}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Show All / See Less Button */}
      {allItems.length > 6 && (
        <div className="mt-4 flex justify-center">
          <ActionButtonGroup
            buttons={[
              {
                label: showAll ? "See Less" : "Show All",
                onClick: () => setShowAll((prev) => !prev),
                theme: theme,
                icon: showAll ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
