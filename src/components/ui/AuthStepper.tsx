"use client";

import React from "react";
import { Check, User, Mail, Smartphone, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepItem {
  id: number;
  label: string;
  icon: React.ElementType;
}

const STEPS: StepItem[] = [
  { id: 1, label: "Account", icon: User },
  { id: 2, label: "Email", icon: Mail },
  { id: 3, label: "Phone", icon: Smartphone },
  { id: 4, label: "MFA", icon: Shield },
  { id: 5, label: "Done", icon: Sparkles },
];

interface AuthStepperProps {
  currentStep: number;
  steps?: StepItem[];
}

export function AuthStepper({
  currentStep,
  steps = STEPS,
}: AuthStepperProps) {
  return (
    <div className="w-full mb-8" data-testid="auth-stepper">
      <div className="flex items-center justify-between relative">
        {/* Background connector bar */}
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-[2px] bg-slate-800 z-0" />
        
        {/* Active connector progress */}
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-[2px] bg-gradient-to-r from-brand-500 to-accent-cyan z-0 transition-all duration-500 ease-out"
          style={{
            width: `${((Math.min(currentStep, steps.length) - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10 group"
              data-testid={`stepper-step-${step.id}`}
            >
              <div
                data-testid={`step-dot-${step.id}`}
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border text-xs sm:text-sm font-semibold transition-all duration-300",
                  isCompleted &&
                    "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]",
                  isCurrent &&
                    "bg-brand-600 border-brand-400 text-white shadow-[0_0_16px_rgba(99,102,241,0.5)] scale-110",
                  !isCompleted &&
                    !isCurrent &&
                    "bg-surface-200 border-slate-700/60 text-slate-400"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 stroke-[2.5]" />
                ) : (
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>

              <span
                className={cn(
                  "mt-2 text-[11px] sm:text-xs font-medium tracking-tight whitespace-nowrap transition-colors duration-200",
                  isCurrent && "text-brand-300 font-semibold",
                  isCompleted && "text-slate-300",
                  !isCurrent && !isCompleted && "text-slate-400"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
