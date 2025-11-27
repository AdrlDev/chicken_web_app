"use client";

import React from "react";
import { useTheme } from "@/components/themes/ThemeContext";
import { CogIcon, PhotoIcon } from "@heroicons/react/24/solid";
import ActionButtonGroup from "@/components/bottons/ActionButtonGroup";

interface UploadTrainButtonsProps {
  uploading: boolean;
  selectedFilesCount: number;
  hasCompletedUploads: boolean;
  onUpload: () => void;
  onTrain: () => void;
  // FIX: Add the missing prop here
  isTrainingActive: boolean;
}

export default function UploadTrainButtons({
  uploading,
  selectedFilesCount,
  hasCompletedUploads,
  onUpload,
  onTrain,
  // FIX: Destructure the new prop
  isTrainingActive
}: UploadTrainButtonsProps) {
  const { theme } = useTheme();

  const buttons = [
    {
      label:
        uploading
          ? "Processing..."
          : selectedFilesCount === 0
            ? "Select Files"
            : `Upload ${selectedFilesCount} File${selectedFilesCount > 1 ? "s" : ""}`,
      onClick: onUpload,
      isEnable: !uploading && selectedFilesCount > 0 && !isTrainingActive, // 👈 Disable if no files
      theme,
      icon: <PhotoIcon className="w-5 h-5" />,
    },
  ];

  if (hasCompletedUploads || isTrainingActive) {
    buttons.push({
      label: isTrainingActive ? "Training..." : "Train Model",
      onClick: onTrain,
      isEnable: hasCompletedUploads && !isTrainingActive,
      theme,
      icon: <CogIcon className="w-5 h-5" />,
    });
  }

  return <ActionButtonGroup buttons={buttons} />;
}
