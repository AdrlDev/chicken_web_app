"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use 'next/navigation' for App Router
import { useAuth } from '@/hooks/loginHooks/useAuth'; // Adjust path to your custom hook
import LandingPage from "@/components/LandingPage";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Footer from "@/components/footer/Footer";
import LoadingSpinner from "@/components/LoadingSpinner"; // You might need to create this

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // --- Authentication Check and Redirection ---
  useEffect(() => {
    // 1. If loading is false AND there is no user, redirect to login.
    if (!isLoading && user === null) {
      // Replace '/login' with the actual path to your login page
      router.push('/login'); 
    }
  }, [user, isLoading, router]);

  // --- Loading State ---
  // If the user data is still being fetched (or token is being checked), show a spinner.
  if (isLoading) {
    // You should use a simple spinner component here.
    return (
      <div className="flex justify-center items-center min-h-screen">
        {/* Replace with your actual loading component or message */}
        <LoadingSpinner />
      </div>
    );
  }

  // --- Access Denied/Redirecting State (Optional, but good for clarity) ---
  // If loading is finished and user is null, the useEffect hook has already triggered the redirect.
  if (user === null && !isLoading) {
    return null; // Component renders nothing while waiting for the router push
  }
  
  // --- Authorized User Content ---
  // If loading is finished AND we have a user, render the page content.
  return (
    <>
      <header className="absolute inset-x-0 top-0 z-50">
        <Navbar />
      </header>
      <LandingPage />
      <Footer />
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