"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * BlurText - React Bits inspired
 * Text that animates from blurred to sharp, word by word
 */
export default function BlurText({
  text = "",
  className = "",
  delay = 0.2,
  duration = 0.5,
  yOffset = 10,
  animateBy = "words", // "words" | "chars"
  direction = "top", // "top" | "bottom"
  threshold = 0.1,
  rootMargin = "-50px",
  onAnimationComplete,
}) {
  const elements = useMemo(() => {
    if (animateBy === "words") {
      return text.split(" ").map((word, i) => ({
        text: word,
        key: `word-${i}`,
      }));
    }
    return text.split("").map((char, i) => ({
      text: char === " " ? "\u00A0" : char,
      key: `char-${i}`,
    }));
  }, [text, animateBy]);

  const yFrom = direction === "top" ? -yOffset : yOffset;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: delay,
      },
    },
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      y: yFrom,
      filter: "blur(12px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.span
      className={className}
      style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.3em" }}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold, margin: rootMargin }}
      onAnimationComplete={onAnimationComplete}
    >
      {elements.map((el) => (
        <motion.span
          key={el.key}
          variants={childVariants}
          style={{
            display: "inline-block",
            willChange: "transform, opacity, filter",
          }}
        >
          {el.text}
        </motion.span>
      ))}
    </motion.span>
  );
}
