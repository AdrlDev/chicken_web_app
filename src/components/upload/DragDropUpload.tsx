"use client";

import React, { useRef, DragEvent, ChangeEvent } from "react";
import { useTheme } from "@/components/themes/ThemeContext";

interface DragDropUploadProps {
  uploading: boolean;
  onFilesAdded: (files: File[]) => void;
  label?: string;
}

export default function DragDropUpload({
  uploading,
  onFilesAdded,
  label = "Drag & drop images here, or browse to upload",
}: DragDropUploadProps) {
  const { theme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploading) return;
    const files = Array.from(e.dataTransfer.files);
    onFilesAdded(files);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (uploading || !e.target.files) return;
    const files = Array.from(e.target.files);
    onFilesAdded(files);
  };

  const bg = theme === "dark" ? "bg-gray-800 border-gray-600" : "bg-gray-100 border-gray-300";
  const hoverBg = theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200";
  const text = theme === "dark" ? "text-gray-200" : "text-gray-600";

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition ${bg} ${hoverBg}`}
    >
      <input
        ref={inputRef}
        id="fileInput"
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />
      <p className={`text-lg font-medium ${text}`}>
        {label.split("browse").map((part, idx, arr) =>
          idx === arr.length - 1 ? (
            <span key={idx}>{part}</span>
          ) : (
            <span key={idx}>
              {part}
              <span className="text-green-500 font-semibold">browse</span>
            </span>
          )
        )}
      </p>
    </div>
  );
}
