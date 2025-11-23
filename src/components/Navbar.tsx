"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Dialog, DialogPanel } from "@headlessui/react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTheme } from "./themes/ThemeContext";
import ThemeSwitch from "./themes/ThemeSwitch";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Scan", href: "/camera" },
  { name: "Train", href: "/train" },
  { name: "About", href: "/about" }, // example page not implemented
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to implemented page or custom 404
  const handleNavClick = (href: string) => {
    const implementedPages = ["/", "/camera", "/train"]; // add all implemented pages here
    router.push(implementedPages.includes(href) ? href : "/not-found");
    setMobileMenuOpen(false);
  };

  const renderNavButtons = (isMobile = false) =>
    navigation.map((item) => {
      const isActive = pathname === item.href;
      const baseClasses = `block ${
        isMobile ? "w-full text-left px-3 py-2 rounded-lg" : "relative text-sm font-semibold group"
      } transition-colors duration-300`;
      const activeClasses = isActive
        ? theme === "dark"
          ? "text-indigo-400"
          : "text-indigo-600"
        : theme === "dark"
        ? "text-white hover:text-indigo-400"
        : "text-gray-900 hover:text-indigo-600";

      return (
        <button
          key={item.name}
          onClick={() => handleNavClick(item.href)}
          className={`${baseClasses} ${activeClasses}`}
        >
          {item.name}

          {/* Animated underline */}
          {!isMobile && (
            <span
              className={`absolute left-0 -bottom-1 h-[2px] bg-indigo-500 rounded-full transition-all duration-300
                ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
            ></span>
          )}
        </button>
      );
    });

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between p-6 lg:px-8 transition-colors duration-500 backdrop-blur-lg shadow-lg ${
          theme === "dark" ? "bg-gray-900/30 text-white" : "bg-white/30 text-gray-900"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors duration-500 ${
              theme === "dark" ? "bg-white/10" : "bg-gray-200/20"
            }`}
          >
            <span className="select-none font-bold">🐔</span>
          </div>
          <h1 className="text-xl font-semibold transition-colors duration-500">
            Chicken Scanner
          </h1>
        </Link>

        {/* Desktop nav + theme switch */}
        <div className="hidden lg:flex lg:items-center lg:gap-6">
          <div className="flex gap-x-12">{renderNavButtons()}</div>
          <ThemeSwitch />
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-2.5 text-current"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel
          className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto p-6 sm:max-w-sm sm:ring-1 sm:ring-white/20 backdrop-blur-lg transition-colors duration-500 ${
            theme === "dark" ? "bg-gray-900/30 text-white" : "bg-white/30 text-gray-900"
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors duration-500 ${
                  theme === "dark" ? "bg-white/10" : "bg-gray-200/20"
                }`}
              >
                <span className="select-none font-bold">🐔</span>
              </div>
              <h1 className="text-xl font-semibold transition-colors duration-500">
                Chicken Scanner
              </h1>
            </Link>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-current"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation + ThemeSwitch */}
          <div className="mt-6 flex flex-col gap-4">
            {renderNavButtons(true)}
            <div className="mt-4">
              <ThemeSwitch />
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}
