"use client";

import React from "react";
import { Check, Dot } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRulesProps {
  password: string;
}

export function PasswordRules({ password }: PasswordRulesProps) {
  const rules = [
    { label: "At least 8 characters", met: password.length >= 8, id: "rule-length" },
    { label: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(password), id: "rule-uppercase" },
    { label: "At least one lowercase letter (a-z)", met: /[a-z]/.test(password), id: "rule-lowercase" },
    { label: "At least one number (0-9)", met: /[0-9]/.test(password), id: "rule-number" },
    { label: "At least one special character (!@#$%^&*)", met: /[^A-Za-z0-9]/.test(password), id: "rule-special" },
  ];

  const metCount = rules.filter((r) => r.met).length;

  const strengthConfig = [
    { label: "None", color: "bg-slate-700", text: "text-slate-400", width: "w-0" },
    { label: "Weak", color: "bg-rose-500", text: "text-rose-400", width: "w-1/4" },
    { label: "Fair", color: "bg-amber-500", text: "text-amber-400", width: "w-2/4" },
    { label: "Good", color: "bg-cyan-500", text: "text-cyan-400", width: "w-3/4" },
    { label: "Strong", color: "bg-emerald-500", text: "text-emerald-400", width: "w-full" },
  ];

  const strengthIndex = password.length === 0 ? 0 : metCount <= 1 ? 1 : metCount <= 3 ? 2 : metCount === 4 ? 3 : 4;
  const currentStrength = strengthConfig[strengthIndex];

  return (
    <div className="mt-3 space-y-3" data-testid="password-rules-container">
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Password Strength</span>
          <span className={cn("font-medium transition-colors", currentStrength.text)}>
            {currentStrength.label}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300 rounded-full", currentStrength.color, currentStrength.width)}
          />
        </div>
      </div>

      {/* Rules Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs">
        {rules.map((rule) => (
          <div
            key={rule.id}
            id={rule.id}
            className={cn(
              "flex items-center gap-1.5 transition-colors duration-200",
              rule.met ? "text-emerald-400 font-medium" : "text-slate-400"
            )}
          >
            {rule.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3] shrink-0" />
            ) : (
              <Dot className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
            <span className="truncate">{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
