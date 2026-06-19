"use client";

import "./ShinyText.css";

/**
 * ShinyText - React Bits inspired
 * Text with a moving shine/shimmer effect
 */
export default function ShinyText({
  children,
  className = "",
  shimmerWidth = 100,
  speed = 3,
  disabled = false,
}) {
  return (
    <span
      className={`shiny-text ${disabled ? "shiny-text--disabled" : ""} ${className}`}
      style={{
        "--shimmer-width": `${shimmerWidth}px`,
        "--shiny-speed": `${speed}s`,
      }}
    >
      {children}
    </span>
  );
}
