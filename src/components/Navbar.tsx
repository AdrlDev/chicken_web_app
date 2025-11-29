"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Dialog, DialogPanel } from "@headlessui/react";
import Link from "next/link";
// Import necessary icons
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "./themes/ThemeContext";
import ThemeSwitch from "./themes/ThemeSwitch";
import { useAuth } from "@/hooks/loginHooks/useAuth"; // <-- Import the useAuth hook

// --- Navigation Links ---
const navigation = [
  { name: "Home", href: "/" },
  { name: "Scan", href: "/scan" },
  { name: "Train", href: "/train" },
  { name: "About", href: "/about" }, // example page not implemented
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for user dropdown

  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // --- Auth State from Hook ---
  const { user, isLoading, logout } = useAuth();

  // Define colors based on theme
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const hoverColor =
    theme === "dark" ? "hover:text-indigo-400" : "hover:text-indigo-600";
  const activeColor = theme === "dark" ? "text-indigo-400" : "text-indigo-600";
  const bgColor = theme === "dark" ? "bg-gray-900/30" : "bg-white/30";
  const dropdownBg = theme === "dark" ? "bg-gray-800" : "bg-white";

  // Redirect to implemented page or custom 404
  const handleNavClick = (href: string) => {
    const implementedPages = ["/", "/camera", "/train", "/login"]; // Added /login
    router.push(implementedPages.includes(href) ? href : "/not-found");
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    // Redirect to home or login page after logout
    router.push("/login");
  };

  const renderNavButtons = (isMobile = false) =>
    navigation.map((item) => {
      const isActive = pathname === item.href;
      const baseClasses = `block ${
        isMobile
          ? "w-full text-left px-3 py-2 rounded-lg"
          : "relative text-sm font-semibold group"
      } transition-colors duration-300`;

      const itemClasses = isActive ? activeColor : `${textColor} ${hoverColor}`;

      return (
        <button
          key={item.name}
          onClick={() => handleNavClick(item.href)}
          className={`${baseClasses} ${itemClasses}`}
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

  const AuthButtonOrIcon = (isMobile = false) => {
    // Show nothing if loading to prevent flashing the login button
    if (isLoading) return null;

    if (user) {
      // --- Logged In: User Icon / Dropdown ---
      return (
        <div className={`relative ${isMobile ? "w-full" : ""}`}>
          <button
            type="button"
            onClick={() => {
              if (isMobile) {
                handleLogout(); // Mobile logout immediately on button click
              } else {
                setDropdownOpen(!dropdownOpen); // Toggle dropdown on desktop
              }
            }}
            className={`flex items-center justify-center p-2 rounded-full transition-colors duration-300 ${
              isMobile
                ? `w-full ${textColor} ${hoverColor} font-semibold gap-2`
                : `${textColor} ${hoverColor} border border-transparent`
            }`}
            aria-expanded={dropdownOpen}
          >
            <UserIcon className="w-6 h-6" />
            {!isMobile && <span className="sr-only">Open user menu</span>}
            {isMobile && (
              <span className="text-left flex-grow">Logout ({user.email})</span>
            )}
          </button>

          {/* Desktop Dropdown Menu */}
          {!isMobile && dropdownOpen && (
            <div
              className={`absolute right-0 mt-2 w-48 ${dropdownBg} rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none`}
              role="menu"
              aria-orientation="vertical"
            >
              <div className="py-1">
                <span
                  className={`block px-4 py-2 text-sm font-medium ${textColor} border-b border-gray-600/30 truncate`}
                >
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className={`flex items-center w-full px-4 py-2 text-sm ${textColor} ${hoverColor} transition-colors duration-200`}
                  role="menuitem"
                >
                  <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      );
    } else {
      // --- Not Logged In: Login Button ---
      return (
        <button
          onClick={() => handleNavClick("/login")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
            isMobile
              ? `w-full text-left ${textColor} ${hoverColor} border border-gray-600/30`
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
          }`}
        >
          Login
        </button>
      );
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between p-6 lg:px-8 transition-colors duration-500 backdrop-blur-lg shadow-lg ${bgColor} ${textColor}`}
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

        {/* Desktop nav + Auth/Theme Switch */}
        <div className="hidden lg:flex lg:items-center lg:gap-6">
          <div className="flex gap-x-12">{renderNavButtons()}</div>
          {AuthButtonOrIcon(false)} {/* Desktop Auth */}
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
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel
          className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto p-6 sm:max-w-sm sm:ring-1 sm:ring-white/20 backdrop-blur-lg transition-colors duration-500 ${bgColor} ${textColor}`}
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

          {/* Navigation + Auth + ThemeSwitch */}
          <div className="mt-6 flex flex-col gap-4">
            {renderNavButtons(true)}
            <div className="pt-4 mt-4 border-t border-gray-700/50">
              {AuthButtonOrIcon(true)} {/* Mobile Auth */}
            </div>
            <div className="mt-4">
              <ThemeSwitch />
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}
