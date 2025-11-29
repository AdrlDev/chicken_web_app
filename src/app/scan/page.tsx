"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/loginHooks/useAuth";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Footer from "@/components/footer/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
// Assuming this is the component you use for general stat display
import FeatureCard from "@/components/scan/FeatureCard";
import { useTheme } from "@/components/themes/ThemeContext";
// Placeholder icons - replace with actual imports (e.g., from lucide-react or heroicons)
import {
  CameraIcon,
  PhotoIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";

export default function ScanPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-900";
  const supTextColor = theme === "dark" ? "text-slate-400" : "text-slate-500";
  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-white";

  useEffect(() => {
    if (!isLoading && user === null) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (user === null && !isLoading) {
    return null;
  }

  // Define card data
  const scanFeatures = [
    {
      title: "Live Detection",
      subtitle: "Start real-time diagnosis using your device's camera.",
      icon: <CameraIcon className="w-6 h-6" />,
      href: "/scan/live",
    },
    {
      title: "Image Scan",
      subtitle: "Upload individual photos for rapid, one-time assessment.",
      icon: <PhotoIcon className="w-6 h-6" />,
      href: "/scan/image",
    },
    {
      title: "Video Scan",
      subtitle:
        "Upload video files to analyze your flock's behavior and health.",
      icon: <VideoCameraIcon className="w-6 h-6" />,
      href: "/scan/video",
    },
  ];

  return (
    <div
      className={`relative min-h-screen ${bgColor} ${textColor} overflow-x-hidden selection:bg-indigo-500/30 transition-colors duration-300`}
    >
      <header
        className={`fixed inset-x-0 top-0 z-50 backdrop-blur-md ${bgColor} border-b ${theme === "dark" ? "border-white/5" : "border-slate-200"}`}
      >
        <Navbar />
      </header>

      <main className="relative z-10 pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Welcome Section (Updated) */}
        <div className="mb-12 md:mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-3xl md:text-4xl font-bold tracking-tight ${textColor}`}
          >
            Start Your Health Scan
          </motion.h1>
          <p className={`${supTextColor} mt-2 text-base md:text-lg`}>
            Select a scanning method to diagnose your flock using AI-powered
            detection.
          </p>
        </div>

        {/* Dashboard Grid - Feature Cards (Replaces old grid) */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {scanFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </motion.div>
      </main>

      <Footer />

      {/* Decorative Blobs (Unchanged) */}
      <motion.div
        className={`fixed top-0 left-1/2 w-[500px] h-[500px] -translate-x-1/2 rounded-full ${theme === "dark" ? "opacity-10" : "opacity-20"} bg-indigo-500 blur-[100px] pointer-events-none`}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className={`fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-green-500 ${theme === "dark" ? "opacity-10" : "opacity-20"} blur-[100px] pointer-events-none`}
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
