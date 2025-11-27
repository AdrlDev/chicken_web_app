// Login page component
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // <-- Import router
import { useAuth } from '@/hooks/loginHooks/useAuth';    // <-- Import useAuth
import LoginForm from "@/components/LoginForm";
import { motion } from "framer-motion";
import { useTheme } from "@/components/themes/ThemeContext";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function LoginPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const { theme } = useTheme();

    // Check if user is already logged in
    useEffect(() => {
        // If loading is finished AND we have a user, redirect to dashboard
        if (!isLoading && user) {
            router.push("/");
        }
    }, [user, isLoading, router]);

    // If still loading, prevent the form from flashing
    if (isLoading) {
        return (
            <div className={`flex justify-center items-center min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
                <LoadingSpinner className={`${theme === "dark" ? "bg-gray-900" : "bg-white"}`} />
            </div>
        );
    }

    // Only render the form if not logged in and not loading
    return (
        <>
        <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
            {/* The redirect is now handled inside LoginForm */}
            <LoginForm /> 
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