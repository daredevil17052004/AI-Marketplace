"use client";

import React, { useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const SparklesCore = ({
  id,
  className,
  background = "transparent",
  minSize = 0.6,
  maxSize = 2.4,
  particleDensity = 60,
  particleColor = "#FF4F00",
}: {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
}) => {
  const generatedId = useId();
  const canvasId = id || generatedId;
  const [particles, setParticles] = useState<
    Array<{ x: number; y: number; size: number; duration: number; delay: number }>
  >([]);

  useEffect(() => {
    const count = Math.min(particleDensity, 80);
    const pts = [];
    for (let i = 0; i < count; i++) {
      pts.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (maxSize - minSize) + minSize,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
      });
    }
    setParticles(pts);
  }, [particleDensity, minSize, maxSize]);

  return (
    <div
      id={canvasId}
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
      style={{ background }}
    >
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: particleColor,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
            y: [0, -15, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
