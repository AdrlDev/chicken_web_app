"use client";

import {VideoUpload} from "@/components/VideoUpload";
import { motion } from "framer-motion";

export default function VideoUploadPage() {
  return (
    <>
      <VideoUpload />
      {/* Background subtle animation circles */}
      <motion.div
        className="absolute top-0 left-1/2 w-[500px] h-[500px] -translate-x-1/2 rounded-full bg-indigo-500 opacity-10 blur-3xl pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full bg-green-500 opacity-10 blur-3xl pointer-events-none"
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />
    </>
  );
}