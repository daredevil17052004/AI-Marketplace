"use client";

import React, { useEffect, useState } from "react";

interface NumberTickerProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function NumberTicker({
  value,
  duration = 1500,
  prefix = "",
  suffix = "",
  className = "",
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    const endValue = value;

    function step(timestamp: number) {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (endValue - startValue) * easeProgress);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    }

    requestAnimationFrame(step);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {new Intl.NumberFormat().format(displayValue)}
      {suffix}
    </span>
  );
}
