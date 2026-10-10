"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "row-span-1 rounded-2xl group/bento hover:shadow-xl transition duration-300 p-6 bg-white border border-[#EAE3D9] hover:border-[#FFB38A] justify-between flex flex-col space-y-4 relative overflow-hidden",
        className
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF4F00]/5 via-transparent to-transparent rounded-bl-full pointer-events-none group-hover/bento:from-[#FF4F00]/10 transition-colors duration-300" />
      
      {header && <div className="w-full flex-1 min-h-[6rem] rounded-xl overflow-hidden">{header}</div>}

      <div className="group-hover/bento:translate-x-1 transition duration-200 relative z-10">
        {icon && <div className="mb-3 text-[#FF4F00]">{icon}</div>}
        <div className="font-heading font-medium text-[#201515] text-lg mb-1 tracking-tight">
          {title}
        </div>
        <div className="font-sans font-normal text-[#5A4E46] text-sm leading-relaxed">
          {description}
        </div>
      </div>
    </motion.div>
  );
};
