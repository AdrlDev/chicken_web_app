"use client";

import React, { useEffect, useRef } from "react";

interface TrainingLogsProps {
  logs: string[];
}

export default function TrainingLogs({ logs }: TrainingLogsProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (log: string) => {
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
