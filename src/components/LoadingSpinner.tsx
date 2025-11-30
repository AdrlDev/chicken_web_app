// components/LoadingSpinner.tsx

"use client";

import React from "react";
// Import the necessary types from framer-motion
import { motion, Variants, Transition } from "framer-motion";

interface LoadingSpinnerProps {
  size?: number;
  color1?: string;
  color2?: string;
  className?: string;
}

// 1. Define the Transition object separately to ensure 'ease' is correctly typed
const circleTransition: Transition = {
  duration: 1.8,
  // TypeScript infers that 'easeInOut' is a valid Easing type
  ease: "easeInOut",
  repeat: Infinity,
  repeatDelay: 0,
};

// 2. Define Variants using the imported type
const spinnerVariants: Variants = {
  animate: {
    scale: [0.8, 1.2, 0.8],
    opacity: [0.6, 1, 0.6],
    // Use the correctly typed transition object
    transition: circleTransition,
  },
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 64,
  // Default to Tailwind JIT-friendly strings (or actual hex/rgb values)
  color1 = "indigo-500",
  color2 = "purple-400",
  className = "",
}) => {
  const containerSize = `${size}px`;
  const circleSize = `${size * 0.7}px`;

  // Use a map to get the actual CSS color value if using Tailwind defaults.
  // For production stability, it's better to pass hex codes (e.g., #6366F1)
  // or define a mapping object here. For simplicity, we'll assume the caller
  // either passes hex/rgb OR the Tailwind default classes are in global CSS.
  //
  // NOTE: If your use of color1/color2 fails in production, you must change
  // these defaults to hex codes, like:
  // const defaultColor1 = '#6366F1'; (indigo-500)

  // Define the transition for the second circle using a spread and override
  const secondCircleTransition: Transition = {
    ...circleTransition,
    delay: 0.9, // Half a cycle delay
  };

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: containerSize, height: containerSize }}
      aria-label="Loading..."
      role="status"
    >
      {/* First Circle */}
      <motion.div
        className="absolute rounded-full" // Removed dynamic bg- class
        style={{
          width: circleSize,
          height: circleSize,
          // 🔥 FIX: Use inline style to apply the color safely
          backgroundColor: `var(--color-${color1})`, // Assuming Tailwind colors are exposed as CSS variables
        }}
        variants={spinnerVariants}
        initial="animate"
        animate="animate"
      />

      {/* Second Circle (using the delayed transition object) */}
      <motion.div
        className="absolute rounded-full" // Removed dynamic bg- class
        style={{
          width: circleSize,
          height: circleSize,
          top: "25%",
          left: "25%",
          transform: "translate(-50%, -50%)",
          // 🔥 FIX: Use inline style to apply the color safely
          backgroundColor: `var(--color-${color2})`,
        }}
        variants={spinnerVariants}
        initial="animate"
        animate="animate"
        // Use the new secondCircleTransition object
        transition={secondCircleTransition}
      />
    </div>
  );
};

export default LoadingSpinner;
