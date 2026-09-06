"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export function AuthCard({
  children,
  className,
  maxWidth = "max-w-lg",
}: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn("w-full mx-auto relative", maxWidth)}
    >
      {/* Outer subtle glow border */}
      <div className="absolute -inset-[1px] bg-gradient-to-b from-brand-500/30 via-white/[0.08] to-accent-cyan/20 rounded-2xl blur-[1px] pointer-events-none" />
      
      <div
        className={cn(
          "relative glass-panel rounded-2xl p-6 sm:p-8 md:p-10 shadow-card transition-shadow duration-300 hover:shadow-card-hover",
          className
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}
