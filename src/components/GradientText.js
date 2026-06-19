"use client";

import "./GradientText.css";

/**
 * GradientText - React Bits inspired
 * Text with animated flowing gradient effect
 */
export default function GradientText({
  children,
  className = "",
  colors = ["#3B82F6", "#60A5FA", "#93C5FD", "#3B82F6"],
  animationSpeed = 4,
  showBorder = false,
}) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    backgroundSize: `${colors.length * 100}% 100%`,
    animationDuration: `${animationSpeed}s`,
  };

  return (
    <span className={`gradient-text-wrapper ${className}`}>
      {showBorder && (
        <span
          className="gradient-text-border"
          style={gradientStyle}
        />
      )}
      <span
        className="gradient-text-content"
        style={gradientStyle}
      >
        {children}
      </span>
    </span>
  );
}
