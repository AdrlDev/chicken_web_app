// HomePage.tsx (Layout Adjusted for Flat Cards and Stacked Charts)

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/loginHooks/useAuth";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Footer from "@/components/footer/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import ChickenHealthChart from "@/components/dashboard/ChickenHealthChart"; // Static Import
import HealthTrendChart from "@/components/dashboard/HealthTrendChart"; // Static Import
import { useTheme } from "@/components/themes/ThemeContext";
import { useStatCardData } from "@/hooks/chickenScanHooks/useStatCardData";
import StatCard from "@/components/dashboard/StatCard";

// Icon definitions remain the same...
// Icon for Total Scans
const ScanIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
  </svg>
);

// Icon for Health Rate
const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 14c1.49-1.28 3.6-2.34 4.63-2.75 1.39-.55 2.37-1.93 2.37-3.41 0-2.35-1.91-4.25-4.25-4.25-1.74 0-3.23 1.05-3.87 2.56-.51-1.07-1.3-1.98-2.28-2.67M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const { totalScans, healthRate, healthRatePercent, isStatsLoading } =
    useStatCardData();

  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-900";
  const supTextColor = theme === "dark" ? "text-slate-400" : "text-slate-500";
  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-white";

  // Card styling for charts (will be applied below)
  const chartCardStyle = `p-6 md:p-8 rounded-2xl border backdrop-blur-xl ${theme === "dark" ? "bg-slate-900/60 border-white/10 shadow-2xl" : "bg-white/80 border-slate-200 shadow-sm"} transition-colors duration-300 h-full flex flex-col`;

  useEffect(() => {
    if (!isLoading && user === null) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (user === null && !isLoading) {
    return null;
  }

  const scanValue = isStatsLoading ? (
    <LoadingSpinner size={24} />
  ) : (
    totalScans.toLocaleString()
  );
  const healthValue = isStatsLoading ? (
    <LoadingSpinner size={24} />
  ) : (
    healthRate
  );

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
        {/* Welcome Section */}
        <div className="mb-8 md:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-3xl md:text-4xl font-bold tracking-tight ${textColor}`}
          >
            Dashboard
          </motion.h1>
          <p className={`${supTextColor} mt-2 text-sm md:text-base`}>
            Your flock&apos;s health overview at a glance.
          </p>
        </div>

        {/* Daily Health Trend - Full Width (TOP) */}
        <motion.div
          // 🔥 FIX: Restore the Card styling (chartCardStyle) and flex-col/min-h
          className={`mb-6 ${chartCardStyle} min-h-[400px]`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* 🔥 FIX: Restore Title and Subtitle */}
          <h2
            className={`text-xl font-bold mb-1 ${theme === "dark" ? "text-white" : "text-slate-800"}`}
          >
            Daily Health Trend
          </h2>
          <p className={`text-sm mb-4 ${supTextColor}`}>
            Monitor healthy and detected issue scans over the last 7 days.
          </p>
          {/* This wrapper div provides the necessary flex-grow for the chart to fill the remaining space */}
          <div className="flex-grow">
            <HealthTrendChart />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scan Overview (Pie Chart) - Takes 2/3 of the bottom row */}
          <motion.div
            className={`lg:col-span-2 min-h-[400px]`} // Apply card styling to chart itself
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex-grow">
              <ChickenHealthChart />
            </div>
          </motion.div>

          {/* Side Stats Column (1/3 of the bottom row) - NO CARD STYLING */}
          <motion.div
            className="grid grid-cols-1 gap-6 lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Stat Card 1: Total Scans - Use StatCard component, but remove outer card styling via its implementation */}
            <StatCard
              title="TOTAL SCANS"
              value={scanValue}
              colorClass={`${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`}
              icon={ScanIcon}
              showProgressBar={false}
              // Assuming StatCard handles minimal/flat styling internally,
              // otherwise you'd need to modify StatCard.tsx to accept a 'flat' prop.
              // For now, we rely on the component being flat by default or making StatCard flat.
            />

            {/* Stat Card 2: Health Rate - Uses live data */}
            <StatCard
              title="HEALTH RATE"
              value={healthValue}
              colorClass={`${theme === "dark" ? "text-green-400" : "text-green-600"}`}
              icon={HeartIcon}
              showProgressBar={true}
              progressBarValue={healthRatePercent}
            />
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Decorative Blobs */}
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
