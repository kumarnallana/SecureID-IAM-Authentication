"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  KeyRound, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Eye, 
  EyeOff 
} from "lucide-react";
import { AuthCard } from "@/components/ui/AuthCard";
import { AuthHeader } from "@/components/ui/AuthHeader";
import { OtpInput } from "@/components/ui/OtpInput";
import { PasswordRules } from "@/components/ui/PasswordRules";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";
import { apiRequest } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Screen State: "request" | "reset" | "success"
  const [step, setStep] = useState<"request" | "reset" | "success">("request");

  // Fields
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);

  // Timers & UI
  const [resendCooldown, setResendCooldown] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "error" | "success" | "warning" | "info"; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Request Reset
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const res = await apiRequest("/forgot-password/request", {
        body: { email },
      });

      setChallengeId(res.challengeId);
      setFeedback({ type: "success", message: "Verification code sent to your email." });
      setStep("reset");
      setResendCooldown(60);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    if (otp.length !== 6 || !challengeId) {
      setFeedback({ type: "error", message: "Please enter the 6-digit recovery code." });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("/forgot-password/reset", {
        body: {
          challengeId,
          otp,
          newPassword,
        },
      });

      setStep("success");
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend
  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setIsLoading(true);
    try {
      const res = await apiRequest("/forgot-password/request", {
        body: { email },
      });
      setChallengeId(res.challengeId);
      setFeedback({ type: "info", message: "A new reset code was sent." });
      setResendCooldown(60);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard maxWidth="max-w-md">
      <AuthHeader
        title={step === "success" ? "Password Recovered" : "Recover Account"}
        subtitle={
          step === "request"
            ? "Enter your verified email to receive a password reset token"
            : step === "reset"
            ? "Enter the verification code and choose a new secure password"
            : "Your credentials have been securely updated"
        }
        badge="Identity Recovery"
      />

      <FeedbackBanner
        type={feedback?.type}
        message={feedback?.message || null}
        onDismiss={() => setFeedback(null)}
      />

      <AnimatePresence mode="wait">
        {/* STEP 1: REQUEST EMAIL */}
        {step === "request" && (
          <motion.form
            key="forgot-request"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleRequestSubmit}
            className="space-y-4"
          >
            <div>
              <label htmlFor="recovery-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="recovery-email"
                  type="email"
                  required
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-white text-sm placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan hover:from-brand-500 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Recovery Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </motion.form>
        )}

        {/* STEP 2: VERIFY CODE & ENTER NEW PASSWORD */}
        {step === "reset" && (
          <motion.form
            key="forgot-reset"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleResetSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 text-center">
                6-Digit Recovery Code
              </label>
              <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-xs text-brand-400 hover:text-brand-300 disabled:text-slate-600 font-medium"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                New Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-white text-sm placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordRules password={newPassword} />
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirm-new-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="confirm-new-password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-white text-sm placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan hover:from-brand-500 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>
        )}

        {/* STEP 3: SUCCESS */}
        {step === "success" && (
          <motion.div
            key="forgot-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Password Successfully Reset</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                You can now sign in with your new master password and your configured MFA method.
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan text-white font-semibold text-sm shadow-glow items-center justify-center gap-2 transition-all"
            >
              <span>Sign In with New Password</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}
