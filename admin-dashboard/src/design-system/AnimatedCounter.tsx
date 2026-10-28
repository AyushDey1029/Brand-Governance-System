import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * AnimatedCounter
 * 
 * Smooth, restrained animated number counter that animates only when 
 * genuine new values arrive or on initial mount.
 * 
 * Uses requestAnimationFrame with cubic ease-out curve.
 * Automatically respects OS reduced motion and user theme settings.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 650,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}) => {
  const { isMotionReduced } = useTheme();
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(value);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // If reduced motion is requested, snap directly to value
    if (isMotionReduced || prefersReducedMotion || duration <= 0) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const startValue = prevValueRef.current;
    const endValue = value;
    const change = endValue - startValue;

    // If no meaningful change, skip animation
    if (Math.abs(change) < 0.0001) {
      setDisplayValue(endValue);
      return;
    }

    const startTime = performance.now();

    // Cubic ease-out: 1 - Math.pow(1 - t, 3)
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + change * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration, isMotionReduced]);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`inline-block tabular-nums transition-colors ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
