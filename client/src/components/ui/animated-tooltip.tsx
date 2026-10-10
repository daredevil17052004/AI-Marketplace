"use client";

import React, { useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

export const AnimatedTooltip = ({
  items,
}: {
  items: {
    id: number | string;
    name: string;
    designation: string;
    image?: string;
    initials?: string;
  }[];
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | string | null>(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0);
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );

  const handleMouseMove = (event: any) => {
    const halfWidth = event.target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  return (
    <div className="flex flex-row items-center justify-center -space-x-3">
      {items.map((item) => (
        <div
          className="relative group -mr-2"
          key={item.id}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -top-16 -left-1/2 translate-x-1/2 flex text-xs flex-col items-center justify-center rounded-xl bg-[#201515] z-50 shadow-xl px-4 py-2 border border-[#3A2B2B]"
              >
                <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-[#FF4F00] to-transparent h-px" />
                <div className="absolute left-10 w-[40%] z-30 -bottom-px bg-gradient-to-r from-transparent via-[#FF7A38] to-transparent h-px" />
                <div className="font-bold text-white relative z-30 text-xs">
                  {item.name}
                </div>
                <div className="text-[#D4CCC2] text-[10px]">{item.designation}</div>
              </motion.div>
            )}
          </AnimatePresence>
          <div
            onMouseMove={handleMouseMove}
            className="h-10 w-10 rounded-full border-2 border-white bg-[#FAF8F5] flex items-center justify-center text-xs font-semibold text-[#201515] shadow-sm relative transition duration-300 group-hover:scale-105 group-hover:z-30 cursor-pointer overflow-hidden"
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="object-cover !m-0 !p-0 object-top rounded-full h-full w-full"
              />
            ) : (
              <span className="text-[#FF4F00] font-heading font-medium">
                {item.initials || item.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
