"use client";

import React from "react";
import Image from "next/image";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/solid";

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
};

type StatusItem = {
  type: "status";
  status: UploadStatus;
};

export default function ImagePreviewGrid({
  uploadStatuses,
  selectedFiles,
  selectedLabel,
  reuploadFile,
}: ImagePreviewGridProps) {
  // Combine local files and uploaded statuses with proper typing
  const filesToShow: (FileItem | StatusItem)[] = [
    ...selectedFiles.map(file => ({ type: "local", file } as FileItem)),
    ...uploadStatuses.map(status => ({ type: "status", status } as StatusItem)),
  ];

  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
      {filesToShow.map((item, idx) => {
        let src: string | undefined;
        let fileName: string;

        if (item.type === "local") {
          src = URL.createObjectURL(item.file);
          fileName = item.file.name;
        } else {
          fileName = item.status.fileName;
          src = item.status.fileName.startsWith("http") ? item.status.fileName : undefined;
        }

        return (
          <div key={idx} className="relative rounded-lg overflow-hidden shadow-md border border-gray-200 h-40">
            {src && (
              <Image
                src={src}
                alt={fileName}
                fill
                style={{ objectFit: "cover" }}
                unoptimized
              />
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
            <p className="text-xs mt-1 text-center text-gray-500 truncate">{fileName}</p>

            {/* Progress Bar */}
            {item.type === "status" && (item.status.status === "uploading" || item.status.status === "processing") && (
              <div className="w-full bg-gray-200 h-2 mt-1">
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
          </div>
        );
      })}
    </div>
  );
}
