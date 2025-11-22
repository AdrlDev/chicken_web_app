"use client";

import React from "react";

interface TrainingProgressProps {
  progress: number; // 0 to 100
}

export default function TrainingProgress({ progress }: TrainingProgressProps) {
  if (progress <= 0) return null;

  return (
    <div className="mt-2">
      <div className="w-full bg-gray-200 h-2 rounded-full">
        <div
          className="bg-purple-500 h-2 rounded-full transition-all duration-200"
          style={{ width: `${Math.round(progress)}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mt-1">
        Training Progress: {Math.round(progress)}%
      </p>
    </div>
  );
}
