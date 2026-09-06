"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Smartphone, 
  ArrowLeft 
} from "lucide-react";
import { AuthCard } from "@/components/ui/AuthCard";
import { AuthHeader } from "@/components/ui/AuthHeader";
import { OtpInput } from "@/components/ui/OtpInput";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";
import { apiRequest } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();

  // Screen State: "credentials" | "mfa-choice" | "mfa-challenge"
  const [screen, setScreen] = useState<"credentials" | "mfa-choice" | "mfa-challenge">("credentials");

  // Form Fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // MFA Challenge State
  const [loginToken, setLoginToken] = useState<string | null>(null);
  const [availableMethods, setAvailableMethods] = useState<Array<{ method: string; target: string }>>([]);
  const [selectedMethod, setSelectedMethod] = useState<"AUTHENTICATOR" | "SMS" | "EMAIL">("AUTHENTICATOR");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // UI State
  const [feedback, setFeedback] = useState<{ type: "error" | "success" | "warning" | "info"; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Step 1: Submit Credentials
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const res = await apiRequest("/login", {
        body: { identifier, password, rememberMe },
      });

      setLoginToken(res.loginToken);

      if (res.availableMethods && res.availableMethods.length > 0) {
        setAvailableMethods(res.availableMethods);
      }

      if (res.challengeId) {
        // Direct challenge issued
        setChallengeId(res.challengeId);
        setSelectedMethod(res.mfaMethod || "EMAIL");
        setScreen("mfa-challenge");
      } else if (res.requireMfa) {
        setSelectedMethod(res.mfaMethod || "AUTHENTICATOR");
        // Start challenge for method
        const challengeRes = await apiRequest("/login/challenge", {
          body: {
            loginToken: res.loginToken,
            method: res.mfaMethod || "AUTHENTICATOR",
          },
        });
        setChallengeId(challengeRes.challengeId);
        setScreen("mfa-challenge");
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 2: Verify MFA OTP
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6 || !loginToken || !challengeId) return;
    setFeedback(null);
    setIsLoading(true);

    try {
      const res = await apiRequest("/verify-login-otp", {
        body: {
          loginToken,
          method: selectedMethod,
          challengeId,
          otp: otpCode,
        },
      });

      setFeedback({ type: "success", message: "Verification successful! Redirecting..." });
      setTimeout(() => {
        router.push(res.redirectTo || "/dashboard");
      }, 500);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Challenge
  const handleResend = async () => {
    if (resendCooldown > 0 || !loginToken) return;
    setIsLoading(true);
    try {
      const challengeRes = await apiRequest("/login/challenge", {
        body: { loginToken, method: selectedMethod },
      });
      setChallengeId(challengeRes.challengeId);
      setFeedback({ type: "info", message: "New verification code dispatched." });
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
        title={screen === "credentials" ? "Sign In to SecureID" : "Two-Factor Authentication"}
        subtitle={
          screen === "credentials"
            ? "Enter your enterprise credentials to access protected resources"
            : `Enter the security verification code for your ${selectedMethod.toLowerCase()}`
        }
        badge="Zero-Trust IAM"
      />

      <FeedbackBanner
        type={feedback?.type}
        message={feedback?.message || null}
        onDismiss={() => setFeedback(null)}
      />

      <AnimatePresence mode="wait">
        {/* CREDENTIALS FORM */}
        {screen === "credentials" && (
          <motion.form
            key="login-cred"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleLoginSubmit}
            className="space-y-4"
            data-testid="login-form"
          >
            {/* Email / Identifier */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Work Email or ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="name@organization.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  data-testid="login-email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-white text-sm placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="login-password"
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
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  data-testid="login-remember"
                  className="w-4 h-4 rounded border-slate-700 bg-surface-100 text-brand-500 focus:ring-brand-500"
                />
                <span>Remember this device for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              data-testid="login-submit-btn"
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan hover:from-brand-500 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-3">
              <p className="text-xs text-slate-400">
                Don't have an identity account?{" "}
                <Link href="/" className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-2">
                  Register now
                </Link>
              </p>
            </div>
          </motion.form>
        )}

        {/* MFA STEP-UP CHALLENGE */}
        {screen === "mfa-challenge" && (
          <motion.div
            key="login-mfa"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center"
            data-testid="login-otp-form"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-3">
                {selectedMethod === "AUTHENTICATOR" ? <KeyRound className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
              </div>
              <h2 className="text-lg font-bold text-white">Security Verification</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter the 6-digit code from your{" "}
                <span className="text-slate-200 font-semibold">
                  {selectedMethod === "AUTHENTICATOR" ? "Authenticator App" : selectedMethod}
                </span>
              </p>
            </div>

            <div data-testid="login-otp-group">
              <OtpInput
                value={otpCode}
                onChange={setOtpCode}
                onComplete={handleVerifyOtp}
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpCode.length !== 6 || isLoading}
                data-testid="login-verify-btn"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => setScreen("credentials")}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>

                {selectedMethod !== "AUTHENTICATOR" && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isLoading}
                    data-testid="login-resend-btn"
                    className="text-brand-400 hover:text-brand-300 disabled:text-slate-600 font-medium"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}
