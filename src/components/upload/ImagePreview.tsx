"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
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
}: ImagePreviewGridProps) {
  const { theme } = useTheme();
  const [showAll, setShowAll] = useState(false);

  // NEW STATE to manage the loading status of generating local preview URLs
  const [isLocalLoading, setIsLocalLoading] = useState(false); 
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [statusItems, setStatusItems] = useState<StatusItem[]>([]);

  const shouldShowLocalFiles = uploadStatuses.length === 0;

  // Generate object URLs for local files
  useEffect(() => {
    // Only process local files if they should be shown
    if (!shouldShowLocalFiles) {
        setFileItems([]); // Crucial: Clear local files if upload has started
        setIsLocalLoading(false); // Reset loading state
        return;
    }

    const newItems: FileItem[] = selectedFiles.map((file) => ({
      type: "local",
      file,
      loading: true,
    }));

    setFileItems(newItems);

    // Use a counter or promise to track when all are loaded
    let loadedCount = 0;
    const totalFiles = newItems.length;

    newItems.forEach((item, idx) => {
      const url = URL.createObjectURL(item.file);

      // Use requestAnimationFrame for slightly smoother timing, though setTimeout is fine too
      // The delay simulates actual browser loading time.
      setTimeout(() => {
        setFileItems((prev) => {
          const updated = [...prev];
          updated[idx] = { ...item, url, loading: false };
          return updated;
        });

        loadedCount++;
        // 2. Set loading state FALSE when all files have generated URLs
        if (loadedCount === totalFiles) {
             setIsLocalLoading(false);
        }
      }, 50);
    });

    // Handle case where selectedFiles is empty (reset loading)
    if (selectedFiles.length === 0) {
        setIsLocalLoading(false);
    }

    return () => {
      newItems.forEach((item) => item.url && URL.revokeObjectURL(item.url));
      // Cleanup for the overall loading state on unmount or dependency change
      setIsLocalLoading(false);
    };
  }, [selectedFiles, shouldShowLocalFiles]);

  // Track loading for uploaded status images
  useEffect(() => {
    const newStatusItems: StatusItem[] = uploadStatuses.map((status) => ({
      type: "status",
      status,
      loading: true,
      // NOTE: Ensure your status.fileName contains a URL if the image has been publicly saved
      url: status.fileName.startsWith("http") ? status.fileName : undefined,
    }));
    setStatusItems(newStatusItems);
  }, [uploadStatuses]);

  const handleStatusImageLoad = (idx: number) => {
    setStatusItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], loading: false };
      return updated;
    });
  };

  // --- Final Item Array for Rendering ---
  // The allItems list now automatically excludes the local files once uploadStatuses has items.
  const allItems: Item[] = [...fileItems, ...statusItems];
  const itemsToShow = showAll ? allItems : allItems.slice(0, 6);

  // --- NEW: Central Loading Spinner for Preview Generation ---
  if (isLocalLoading) {
     return (
        <div className={`mt-6 flex justify-center items-center h-40 ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"} rounded-lg shadow-inner`}>
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent border-b-transparent rounded-full animate-spin"></div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">Preparing image previews...</p>
            </div>
        </div>
     );
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

            return (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className={`relative rounded-lg overflow-hidden shadow-md border border-gray-200 h-40 flex items-center justify-center ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
              >
                {/* Image */}
                {src && (
                  <Image
                    src={src}
                    alt={fileName}
                    fill
                    style={{ objectFit: "cover" }}
                    unoptimized
                    onLoadingComplete={() => item.type === "status" && handleStatusImageLoad(idx - fileItems.length)}
                  />
                )}

                {/* Loading Overlay */}
                {isLoading && (
                  <div className={`absolute inset-0 flex items-center justify-center ${theme === "dark" ? "bg-gray-900/70" : "bg-white/70"}`}>
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent border-b-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Status Overlay */}
                {item.type === "status" && (
                  <div className="absolute top-1 right-1 flex items-center space-x-1">
                    {item.status.status === "completed" && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                    {item.status.status === "error" && <XCircleIcon className="h-5 w-5 text-red-500" />}
                    {item.status.status === "processing" && <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />}
                  </div>
                )}

                {/* File Name */}
                <p className="text-xs mt-1 text-center text-gray-500 truncate absolute bottom-1 left-0 w-full px-1">{fileName}</p>

                {/* Progress Bar */}
                {item.type === "status" && (item.status.status === "uploading" || item.status.status === "processing") && (
                  <div className="w-full bg-gray-200 h-2 mt-1 absolute bottom-0 left-0">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.status.status === "processing" ? "bg-yellow-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${item.status.progress}%` }}
                    />
                  </div>
                )}

                {/* Status Message */}
                {item.type === "status" && item.status.message && (
                  <p className={`text-xs mt-1 text-center ${
                    item.status.status === "error" ? "text-red-600" :
                    item.status.status === "completed" ? "text-green-600" :
                    "text-gray-500"
                  }`}>{item.status.message}</p>
                )}

                {/* Reupload Button */}
                {item.type === "status" && item.status.status === "error" && (
                  <button
                    className="mt-2 w-full py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                    onClick={() => reuploadFile(item.status.fileName, selectedLabel, selectedFiles)}
                  >
                    Reupload
                  </button>
                )}
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
                icon: showAll ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />,
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
