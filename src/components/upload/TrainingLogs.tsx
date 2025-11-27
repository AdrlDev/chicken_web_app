// components/TrainingLogs.tsx (FIXED)

"use client";

import React, { RefObject } from "react";

// Update the interface to accept the RefObject as a prop
interface TrainingLogsProps {
  logs: string[];
  // Add the RefObject prop definition
  logContainerRef: RefObject<HTMLDivElement | null>;
}

// Remove the local useRef, as the ref is now passed in
export default function TrainingLogs({ logs, logContainerRef }: TrainingLogsProps) { 
  
  // Auto-scroll logic is moved back to the parent component (UploadPage)
  // so this useEffect is now removed or changed if necessary.
  
  // NOTE: If you want the auto-scroll to happen *inside* this component,
  // you can keep the local ref and remove the prop, but your UploadPage
  // component was trying to pass it, so we'll remove the local useEffect here.

  const getLogColor = (log: string) => {
    // ... (rest of the color logic remains the same)
    const lower = log.toLowerCase();
    if (lower.includes("error") || lower.includes("failed") || lower.includes("exception")) {
      return "text-red-600";
    } else if (lower.includes("warning") || log.includes("⚠️")) {
      return "text-yellow-600";
    }
    return "text-gray-700";
  };

  if (!logs || logs.length === 0) return null;

  return (
    <div
      className="mt-6 border border-gray-300 rounded-lg p-4 bg-gray-50 h-64 overflow-y-auto font-mono text-xs text-gray-700"
      // Apply the ref passed from the parent
      ref={logContainerRef} 
    >
      {logs.map((log, idx) => (
        <p key={idx} className={getLogColor(log)}>
          {log}
        </p>
      ))}
    </div>
  );
}