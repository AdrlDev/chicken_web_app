"use client";

import Link from "next/link";
import { useTheme } from "./themes/ThemeContext";

export default function NotFound404() {
  const { theme } = useTheme();

  const bgClass = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const primaryText = theme === "dark" ? "text-white" : "text-gray-900";
  const secondaryText = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const accent = theme === "dark" ? "bg-indigo-500 hover:bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-500";

  return (
    <main className={`grid min-h-screen place-items-center px-6 py-24 sm:py-32 lg:px-8 ${bgClass}`}>
      <div className="text-center">
        <p className="text-6xl font-extrabold text-indigo-400 sm:text-7xl lg:text-8xl">404</p>
        <h1 className={`mt-6 text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight ${primaryText}`}>
          Page not found
        </h1>
        <p className={`mt-6 text-lg sm:text-xl font-medium ${secondaryText}`}>
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className={`rounded-md px-4 py-3 text-sm sm:text-base font-semibold text-white shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${accent}`}
          >
            Go back home
          </Link>
          <Link
            href="/contact"
            className={`text-sm sm:text-base font-semibold ${primaryText}`}
          >
            Contact support <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
