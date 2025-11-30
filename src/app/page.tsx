"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/loginHooks/useAuth";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Footer from "@/components/footer/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import ChickenHealthChart from "@/components/dashboard/ChickenHealthChart";
import { useTheme } from "@/components/themes/ThemeContext";
// 👈 IMPORT THE NEW HOOK
import { useStatCardData } from "@/hooks/chickenScanHooks/useStatCardData";
import StatCard from "@/components/dashboard/StatCard";
// Import icons (assuming you use lucide-react or similar, otherwise replace with actual SVGs)

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

  // 👈 CALL THE NEW STATS HOOK
  const { totalScans, healthRate, healthRatePercent, isStatsLoading } =
    useStatCardData();

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
        <LoadingSpinner />
      </div>
    );
  }

  if (user === null && !isLoading) {
    return null;
  }

  // Use a temporary loading message for the stats cards if they are still fetching
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

        {/* Dashboard Grid - Clean and Modularized */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart (2 columns wide) */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* ChickenHealthChart is already using the data fetching hook */}
            <ChickenHealthChart />
          </motion.div>

          {/* Side Stats Column (1 column wide, using StatCard component) */}
          <motion.div
            className="grid grid-cols-1 gap-6 lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Stat Card 1: Total Scans - Uses live data */}
            <StatCard
              title="TOTAL SCANS"
              value={scanValue} // 👈 DYNAMIC VALUE
              colorClass={`${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`}
              icon={ScanIcon}
              showProgressBar={false}
            />

            {/* Stat Card 2: Health Rate - Uses live data */}
            <StatCard
              title="HEALTH RATE"
              value={healthValue} // 👈 DYNAMIC VALUE
              colorClass={`${theme === "dark" ? "text-green-400" : "text-green-600"}`}
              icon={HeartIcon}
              showProgressBar={true} // Enable progress bar for this card
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
