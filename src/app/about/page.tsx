"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/components/themes/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer/Footer";
import {
  HeartHandshake, // Trust/Care
  BrainCircuit, // AI/Tech
  ShieldCheck, // Accuracy/Reliability
  Globe, // Global Impact
} from "lucide-react"; // Using Lucide for modern icons

// --- Framer Motion Variants ---
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
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// --- Core Component ---
export default function AboutPage() {
  const { theme } = useTheme();

  // Theme-aware styles
  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-950" : "bg-gray-50";
  const primaryTextColor = isDark ? "text-gray-100" : "text-gray-900";
  const secondaryTextColor = isDark ? "text-slate-400" : "text-slate-600";
  const cardBg = isDark
    ? "bg-gray-800/60 border-gray-700"
    : "bg-white/90 border-gray-200";
  const primaryColor = "text-indigo-500";

  const missionPoints = [
    {
      icon: <BrainCircuit className={`w-8 h-8 ${primaryColor}`} />,
      title: "Advanced AI Core",
      description:
        "Leveraging cutting-edge computer vision models (YOLOv8) trained on comprehensive veterinary datasets to ensure robust and fast diagnostics.",
    },
    {
      icon: <ShieldCheck className={`w-8 h-8 ${primaryColor}`} />,
      title: "Unrivaled Accuracy",
      description:
        "Our models are continuously validated, providing high confidence (98.5%+) in detecting common poultry diseases and early distress signs.",
    },
    {
      icon: <HeartHandshake className={`w-8 h-8 ${primaryColor}`} />,
      title: "Built with Care",
      description:
        "Our mission is to support farmers by reducing losses and improving animal welfare through non-invasive, timely health monitoring.",
    },
    {
      icon: <Globe className={`w-8 h-8 ${primaryColor}`} />,
      title: "Accessibility & Scalability",
      description:
        "Providing an accessible platform that works on various devices, making advanced diagnostics available to farms of any size globally.",
    },
  ];

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300`}>
      <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-sm bg-opacity-70">
        <Navbar />
      </header>

      <main className="relative z-10 pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.section variants={itemVariants} className="mb-16 text-center">
            <h1
              className={`text-5xl md:text-7xl font-extrabold tracking-tight mb-4 ${primaryTextColor}`}
            >
              The Power of <span className={primaryColor}>AI Health Scan</span>
            </h1>
            <p
              className={`text-xl md:text-2xl max-w-4xl mx-auto ${secondaryTextColor}`}
            >
              We&apos;re transforming poultry management from reactive treatment
              to{" "}
              <span className={primaryColor}>proactive, instant diagnosis</span>{" "}
              using computer vision technology.
            </p>
          </motion.section>

          <hr
            className={`mb-16 ${isDark ? "border-gray-800" : "border-gray-200"}`}
          />

          {/* Mission & Vision */}
          <motion.section
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-12 mb-20"
          >
            <div>
              <h2 className={`text-3xl font-bold mb-4 ${primaryColor}`}>
                Our Vision
              </h2>
              <p className={`text-lg ${secondaryTextColor} leading-relaxed`}>
                To set the global standard for non-invasive livestock health
                monitoring. We envision a future where disease detection is
                instant, accessible, and integrated directly into daily farming
                operations, eliminating the lag time and subjectivity of
                traditional diagnosis.
              </p>
            </div>
            <div>
              <h2 className={`text-3xl font-bold mb-4 ${primaryColor}`}>
                The Problem We Solve
              </h2>
              <p className={`text-lg ${secondaryTextColor} leading-relaxed`}>
                Poultry diseases spread rapidly, causing devastating financial
                loss and requiring costly, time-consuming lab tests. Our AI
                system provides **on-the-spot analysis** from simple image or
                video uploads, allowing farmers to isolate affected birds and
                begin treatment within minutes, not days.
              </p>
            </div>
          </motion.section>

          <hr
            className={`mb-16 ${isDark ? "border-gray-800" : "border-gray-200"}`}
          />

          {/* Feature Pillars */}
          <section className="mb-20">
            <motion.h2
              variants={itemVariants}
              className={`text-center text-4xl font-bold mb-12 ${primaryTextColor}`}
            >
              Our Core Pillars
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {missionPoints.map((point, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  transition={{ delay: 0.1 * index }}
                  className={`p-6 rounded-2xl ${cardBg} border shadow-xl backdrop-blur-sm h-full flex flex-col`}
                >
                  <div
                    className={`mb-4 p-3 rounded-xl inline-block ${isDark ? "bg-indigo-600/10" : "bg-indigo-100"}`}
                  >
                    {point.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{point.title}</h3>
                  <p className={`text-sm ${secondaryTextColor} flex-grow`}>
                    {point.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <motion.section
            variants={itemVariants}
            className="text-center p-10 md:p-16 rounded-3xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/30"
          >
            <h2
              className={`text-3xl md:text-4xl font-extrabold mb-4 ${primaryColor}`}
            >
              Ready to Proactively Manage Flock Health?
            </h2>
            <p className={`text-lg mb-6 ${secondaryTextColor}`}>
              Start a scan today and experience the future of veterinary
              diagnostics.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = "/scan")}
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/50 hover:bg-indigo-700 transition-colors"
            >
              Go to Scan Page
            </motion.button>
          </motion.section>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
