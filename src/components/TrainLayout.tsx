"use client";
import React from "react";

interface TrainLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function TrainLayout({ title, children }: TrainLayoutProps) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl w-full mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>
        {children}
      </div>
    </main>
  );
}