"use client";

import React from "react";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type FeedbackType = "error" | "success" | "warning" | "info";

interface FeedbackBannerProps {
  type?: FeedbackType;
  message: string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  testId?: string;
}

const CONFIG = {
  error: {
    bg: "bg-rose-500/10 border-rose-500/30 text-rose-300",
    icon: AlertCircle,
    iconColor: "text-rose-400",
  },
  success: {
    bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
  },
  warning: {
    bg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    icon: AlertTriangle,
    iconColor: "text-amber-400",
  },
  info: {
    bg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
    icon: Info,
    iconColor: "text-cyan-400",
  },
};

export function FeedbackBanner({
  type = "error",
  message,
  onDismiss,
  onRetry,
  className,
  testId = "feedback-banner",
}: FeedbackBannerProps) {
  if (!message) return null;

  const current = CONFIG[type] || CONFIG.error;
  const Icon = current.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "w-full rounded-xl p-3.5 sm:p-4 border flex items-start gap-3 my-3 text-sm backdrop-blur-md",
          current.bg,
          className
        )}
        data-testid={testId}
      >
        <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", current.iconColor)} />

        <div className="flex-1 leading-relaxed break-words">
          {message}
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Retry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
