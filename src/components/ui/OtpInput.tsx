"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  hasError?: boolean;
  autoFocus?: boolean;
  onComplete?: (code: string) => void;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  hasError = false,
  autoFocus = true,
  onComplete,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of length
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      // Cleared
      const newDigits = [...digits];
      newDigits[index] = "";
      const updated = newDigits.join("");
      onChange(updated);
      return;
    }

    // Handle single or multiple digit entry (like autofill)
    const newDigits = [...digits];
    const incomingChars = rawVal.split("");
    let targetIndex = index;

    for (const char of incomingChars) {
      if (targetIndex < length) {
        newDigits[targetIndex] = char;
        targetIndex++;
      }
    }

    const updated = newDigits.join("");
    onChange(updated);

    if (targetIndex < length) {
      inputRefs.current[targetIndex]?.focus();
    } else {
      inputRefs.current[length - 1]?.blur();
      if (updated.length === length && onComplete) {
        onComplete(updated);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move back and clear previous
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasteData) return;

    onChange(pasteData);
    const nextIdx = Math.min(pasteData.length, length - 1);
    inputRefs.current[nextIdx]?.focus();

    if (pasteData.length === length && onComplete) {
      onComplete(pasteData);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 sm:gap-3 my-4",
        hasError && "animate-shake"
      )}
      data-testid="otp-input"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          data-testid={`otp-digit-${index}`}
          className={cn(
            "w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl",
            "bg-surface-100 text-white border transition-all duration-200 outline-none select-none",
            hasError
              ? "border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.3)] text-rose-300"
              : digit
              ? "border-brand-500/80 bg-brand-500/10 shadow-[0_0_10px_rgba(99,102,241,0.25)]"
              : "border-white/10 hover:border-white/20 focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      ))}
    </div>
  );
}
