"use client";

import React from "react";

interface UploadTrainButtonsProps {
  uploading: boolean;
  selectedFilesCount: number;
  hasCompletedUploads: boolean;
  onUpload: () => void;
  onTrain: () => void;
}

export default function UploadTrainButtons({
  uploading,
  selectedFilesCount,
  hasCompletedUploads,
  onUpload,
  onTrain,
}: UploadTrainButtonsProps) {
  return (
    <div className="mt-6 space-y-3">
      <button
        disabled={uploading || selectedFilesCount === 0}
        onClick={onUpload}
        className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
          uploading || selectedFilesCount === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 shadow-md"
        }`}
      >
        {uploading
          ? "Processing..."
          : selectedFilesCount === 0
            ? "Select Files to Upload"
            : `Upload ${selectedFilesCount} File${selectedFilesCount > 1 ? "s" : ""}`}
      </button>

      {hasCompletedUploads && (
        <button
          onClick={onTrain}
          className="w-full py-3 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-md transition-all duration-200"
        >
          Train Model
        </button>
      )}
    </div>
  );
}
