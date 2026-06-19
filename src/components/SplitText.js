"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * SplitText - React Bits inspired
 * Animates text by splitting into individual characters with stagger effect
 */
export default function SplitText({
  text = "",
  className = "",
  delay = 0,
  duration = 0.05,
  ease = "easeOut",
  splitType = "chars", // "chars" | "words"
  animationFrom = { opacity: 0, y: 40 },
  animationTo = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-50px",
  onAnimationComplete,
}) {
  const elements = useMemo(() => {
    if (splitType === "words") {
      return text.split(" ").map((word, i) => ({
        text: word,
        key: `word-${i}`,
      }));
    }
    return text.split("").map((char, i) => ({
      text: char === " " ? "\u00A0" : char,
      key: `char-${i}`,
    }));
  }, [text, splitType]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: duration,
        delayChildren: delay,
      },
    },
  };

  const childVariants = {
    hidden: animationFrom,
    visible: {
      ...animationTo,
      transition: {
        duration: 0.4,
        ease,
      },
    },
  };

  return (
    <motion.span
      className={className}
      style={{ display: "inline-flex", flexWrap: "wrap", overflow: "hidden" }}
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
            willChange: "transform, opacity",
          }}
        >
          {el.text}
        </motion.span>
      ))}
    </motion.span>
  );
}
