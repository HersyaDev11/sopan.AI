"use client";

import { motion } from "framer-motion";

/**
 * AnimatedContent - React Bits inspired
 * Wrapper that animates children into view with fade + slide effect
 */
export default function AnimatedContent({
  children,
  className = "",
  distance = 50,
  direction = "up", // "up" | "down" | "left" | "right"
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  rootMargin = "-50px",
  once = true,
  ease = "easeOut",
}) {
  const directionMap = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  const offset = directionMap[direction] || directionMap.up;

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x: offset.x,
        y: offset.y,
        filter: "blur(6px)",
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{
        once,
        amount: threshold,
        margin: rootMargin,
      }}
      transition={{
        duration,
        delay,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}
