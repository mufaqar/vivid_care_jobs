import React from "react";

interface CircleRotatingProps {
  bgColor: string; // color for gradient
  size: string;    // Tailwind size classes, e.g., "h-10 w-10"
}

/**
 * Rotating conic-gradient circle for hover animations.
 */
const CircleRotating: React.FC<CircleRotatingProps> = ({ bgColor, size }) => {
  return (
    <div
      className={`${size} absolute rounded-full z-0 group-hover:animate-spin-slow`}
      style={{
        backgroundImage: `conic-gradient(
          ${bgColor} 0deg,
          ${bgColor} 30deg,
          transparent 30deg,
          transparent 180deg,
          ${bgColor} 180deg,
          ${bgColor} 210deg,
          transparent 210deg,
          transparent 360deg
        )`,
      }}
    ></div>
  );
};

export default CircleRotating;
