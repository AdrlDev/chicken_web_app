// components/LoadingSpinner.tsx

"use client";

import React from 'react';
// Import the necessary types from framer-motion
import { motion, Variants, Transition } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: number;
  color1?: string;
  color2?: string;
  className?: string;
}

// 1. Define the Transition object separately to ensure 'ease' is correctly typed
const circleTransition: Transition = {
  duration: 1.8,
  // Fix: TypeScript infers that 'easeInOut' is a valid Easing type, resolving the error.
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
  color1 = 'indigo-500',
  color2 = 'purple-400',
  className = '',
}) => {
  const containerSize = `${size}px`;
  const circleSize = `${size * 0.7}px`;

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
        className={`absolute rounded-full bg-${color1}`}
        style={{ width: circleSize, height: circleSize }}
        variants={spinnerVariants}
        initial="animate"
        animate="animate"
      />

      {/* Second Circle (using the delayed transition object) */}
      <motion.div
        className={`absolute rounded-full bg-${color2}`}
        style={{ width: circleSize, height: circleSize, top: '25%', left: '25%', transform: 'translate(-50%, -50%)' }}
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