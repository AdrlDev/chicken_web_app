"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/loginHooks/useAuth";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Footer from "@/components/footer/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import FeatureCard from "@/components/scan/FeatureCard";
import { useTheme } from "@/components/themes/ThemeContext";

// Updated imports with better, more contextual icons (assuming they exist or using placeholders)
import {
  CameraIcon,
  PhotoIcon,
  VideoCameraIcon,
  BeakerIcon, // For AI/Diagnosis
  CpuChipIcon, // For Processing Power/Speed
  ChartPieIcon, // For Accuracy
} from "@heroicons/react/24/outline";

export default function ScanPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-900";
  const supTextColor = theme === "dark" ? "text-slate-400" : "text-slate-500";
  const cardBg = theme === "dark" ? "bg-gray-800/50" : "bg-gray-50"; // Light background for stats

  // Color variables
  const primaryColor = "text-indigo-500";
  const primaryBg = "bg-indigo-500/10";

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

  // Define updated card data
  const scanFeatures = [
    {
      title: "Real-Time Flock Monitoring",
      subtitle:
        "Start **Live Detection** using your device's camera for immediate health alerts.",
      icon: <CameraIcon className="w-7 h-7" />,
      href: "/scan/live",
    },
    {
      title: "Diagnostic Image Upload",
      subtitle:
        "Upload high-resolution **Image Scans** of individual birds for rapid, detailed AI assessment.",
      icon: <PhotoIcon className="w-7 h-7" />,
      href: "/scan/image",
    },
    {
      title: "Behavioral Video Analysis",
      subtitle:
        "Upload **Video Scans** to analyze group behavior, movement, and early distress signs.",
      icon: <VideoCameraIcon className="w-7 h-7" />,
      href: "/scan/video",
    },
  ];

  // Quick Stats Data - Placeholder for dynamic data
  const quickStats = [
    {
      label: "Detection Accuracy",
      value: "98.5%",
      icon: <ChartPieIcon className="w-6 h-6 text-green-500" />,
      description: "Validated for common poultry diseases.",
    },
    {
      label: "Processing Speed",
      value: "50ms",
      icon: <CpuChipIcon className="w-6 h-6 text-red-500" />,
      description: "Diagnosis time per image/frame.",
    },
    {
      label: "Diseases Covered",
      value: "12+",
      icon: <BeakerIcon className="w-6 h-6 text-blue-500" />,
      description: "Comprehensive AI model database.",
    },
  ];

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className={`relative min-h-screen ${theme === "dark" ? "bg-gray-950" : "bg-gray-50"} ${textColor} overflow-x-hidden selection:bg-indigo-500/30 transition-colors duration-300`}
    >
      <header
        className={`fixed inset-x-0 top-0 z-50 backdrop-blur-sm ${theme === "dark" ? "bg-gray-950/70" : "bg-gray-50/70"} border-b ${theme === "dark" ? "border-white/5" : "border-slate-200"}`}
      >
        <Navbar />
      </header>

      <main className="relative z-10 pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Welcome Section (Updated) */}
        <div className="mb-12 md:mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-4xl md:text-5xl font-extrabold tracking-tight ${textColor}`}
          >
            <span className={primaryColor}>Poultry Health</span> Detection
            Platform
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={`${supTextColor} mt-3 text-lg md:text-xl max-w-3xl`}
          >
            Instantly diagnose and monitor your flock with our advanced
            **AI-powered computer vision**. Choose a method below to begin a
            rapid, non-invasive health scan.
          </motion.p>
        </div>

        {/* --- */}

        {/* Quick Stats/System Capability Section (Stunning Addition) */}
        <motion.div
          className={`p-6 md:p-8 rounded-2xl mb-12 ${cardBg} border ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <h2 className={`text-xl font-semibold mb-4 ${primaryColor}`}>
            AI System Capabilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-4 p-3 rounded-lg"
              >
                <div className={`p-3 rounded-full ${primaryBg} flex-shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className={`text-sm font-medium ${textColor} mt-1`}>
                    {stat.label}
                  </p>
                  <p className={`text-xs ${supTextColor}`}>
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* --- */}

        {/* Dashboard Grid - Feature Cards (Scanning Methods) */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className={`text-2xl md:text-3xl font-bold tracking-tight mb-6 ${textColor}`}
        >
          Select Your Scan Method
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {scanFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              transition={{ delay: 0.6 + index * 0.1 }} // Delayed after stats
            >
              {/* FeatureCard component is assumed to handle its own styling/animation */}
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </motion.div>
      </main>

      <Footer />

      {/* Decorative Blobs - Made them slightly more vibrant/distinct for dark/light mode */}
      <motion.div
        className={`fixed top-0 left-1/2 w-[500px] h-[500px] -translate-x-1/2 rounded-full ${theme === "dark" ? "bg-indigo-700 opacity-10" : "bg-indigo-400 opacity-20"} blur-[150px] pointer-events-none`}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className={`fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full ${theme === "dark" ? "bg-green-700 opacity-10" : "bg-green-400 opacity-20"} blur-[150px] pointer-events-none`}
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
