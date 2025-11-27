"use client";

import { useEffect } from 'react'; // <-- Import useEffect
import { useRouter } from 'next/navigation'; // <-- Import useRouter
import { useAuth } from '@/hooks/loginHooks/useAuth'; // <-- Import useAuth
import { VideoUpload } from "@/components/VideoUpload";
import LoadingSpinner from "@/components/LoadingSpinner"; // <-- Import the spinner
import { motion } from "framer-motion";

export default function VideoUploadPage() {
  const { user, isLoading } = useAuth(); // <-- Get user and loading state
  const router = useRouter();             // <-- Initialize router

  // --- Authentication Check and Redirection ---
  useEffect(() => {
    // If loading is false AND there is no user, redirect to login.
    if (!isLoading && user === null) {
      router.push('/login'); 
    }
  }, [user, isLoading, router]);


  // --- Loading State Check ---
  // Show a spinner while checking the authentication status
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <LoadingSpinner size={80} color1="blue-500" color2="cyan-400" />
      </div>
    );
  }

  // --- Access Denied/Redirecting State ---
  // If loading is finished and user is null, block rendering (redirect has been triggered)
  if (user === null && !isLoading) {
    return null; 
  }

  // --- Authorized User Content ---
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