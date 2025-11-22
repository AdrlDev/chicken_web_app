"use client";

import React from "react";
import Dropdown from "@/components/dropdown/Dropdown";
import { useTheme } from "@/components/themes/ThemeContext";

interface LabelDropdownProps {
  labels: string[];
  selectedLabel: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function LabelDropdown({
  labels,
  selectedLabel,
  onChange,
  placeholder = "-- Choose a Label --",
}: LabelDropdownProps) {
  const { theme } = useTheme();

  const textColor = theme === "dark" ? "text-gray-200" : "text-gray-700";
  const helperTextColor = theme === "dark" ? "text-gray-400" : "text-gray-500";

  return (
    <div className="mb-4">
      <label className={`block text-sm mb-3 font-medium mb-1 ${textColor}`}>
        Select Label:
      </label>
      <Dropdown
        options={labels}
        value={selectedLabel}
        onChange={onChange}
        placeholder={placeholder}
      />
      <p className={`text-xs mt-1 ${helperTextColor}`}>
        Leave empty for auto-detection or select a specific label
      </p>
    </div>
  );
}
