"use client";
import LoginForm from "@/components/LoginForm";
import { motion } from "framer-motion";
import { useTheme } from "@/components/themes/ThemeContext";

export default function LoginPage() {
    const handleLogin = (token: string) => {
        // Save JWT token in localStorage or cookies
        localStorage.setItem("token", token);
        console.log("Logged in with token:", token);
    };

    const { theme } = useTheme();

  return (
    <>
    <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
      <LoginForm onLoginSuccess={handleLogin} />
    </div>
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