"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export function AuthHeader({
  title,
  subtitle,
  badge = "Enterprise IAM",
}: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      {/* Brand Icon Badge */}
      <div className="relative mb-4 group">
        <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-500 to-accent-cyan rounded-2xl blur-sm opacity-60 group-hover:opacity-90 transition duration-300"></div>
        <div className="relative w-14 h-14 rounded-2xl bg-surface-100 border border-white/10 flex items-center justify-center shadow-inner">
          <ShieldCheck className="w-8 h-8 text-brand-400 group-hover:scale-105 transition-transform duration-300" />
        </div>
        <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-brand-600/80 text-white rounded-md border border-brand-400/30">
          v2.0
        </span>
      </div>

      {badge && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-500/10 text-brand-300 border border-brand-500/20 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping" />
          {badge}
        </span>
      )}

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-slate-400 max-w-sm">
          {subtitle}
        </p>
      )}
    </div>
  );
}
