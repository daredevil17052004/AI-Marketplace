"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface HoverItem {
  id?: string | number;
  title: string;
  description: string;
  link?: string;
  icon?: React.ReactNode;
  badge?: string;
  meta?: React.ReactNode;
}

export const HoverEffect = ({
  items,
  className,
}: {
  items: HoverItem[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-6 gap-4",
        className
      )}
    >
      {items.map((item, idx) => {
        const Content = (
          <div
            className="relative group block p-2 h-full w-full"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.span
                  className="absolute inset-0 h-full w-full bg-[#FF4F00]/8 block rounded-2xl"
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.15 },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.15, delay: 0.1 },
                  }}
                />
              )}
            </AnimatePresence>
            <div className="rounded-xl h-full w-full p-6 overflow-hidden bg-white border border-[#EAE3D9] group-hover:border-[#FFB38A] relative z-10 transition duration-300 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  {item.icon && (
                    <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#EAE3D9] flex items-center justify-center text-[#FF4F00] group-hover:bg-[#FF4F00] group-hover:text-white transition-colors duration-200">
                      {item.icon}
                    </div>
                  )}
                  {item.badge && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-[#FFF2EB] text-[#FF4F00] border border-[#FFD6BE]">
                      {item.badge}
                    </span>
                  )}
                </div>
                <h4 className="font-heading font-medium text-[#201515] text-lg tracking-tight mb-2 group-hover:text-[#FF4F00] transition-colors">
                  {item.title}
                </h4>
                <p className="text-[#5A4E46] text-sm leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>
              {item.meta && (
                <div className="mt-6 pt-4 border-t border-[#F2ECE4]">
                  {item.meta}
                </div>
              )}
            </div>
          </div>
        );

        return item.link ? (
          <Link
            href={item.link}
            key={item.id ?? item.link ?? idx}
            className="h-full block focus:outline-none"
          >
            {Content}
          </Link>
        ) : (
          <div key={item.id ?? idx} className="h-full block">
            {Content}
          </div>
        );
      })}
    </div>
  );
};
