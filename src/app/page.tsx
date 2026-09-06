"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Mail, 
  Smartphone, 
  Lock, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Sparkles, 
  KeyRound,
  QrCode
} from "lucide-react";
import { AuthCard } from "@/components/ui/AuthCard";
import { AuthHeader } from "@/components/ui/AuthHeader";
import { AuthStepper } from "@/components/ui/AuthStepper";
import { OtpInput } from "@/components/ui/OtpInput";
import { PasswordRules } from "@/components/ui/PasswordRules";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";
import { apiRequest } from "@/lib/api-client";

type ScreenType =
  | "registration-screen"
  | "email-otp-screen"
  | "sms-otp-screen"
  | "mfa-choice-screen"
  | "authenticator-setup-screen"
  | "mfa-verify-screen"
  | "success-screen";

export default function RegistrationPage() {
  const router = useRouter();

  // Screen State
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("registration-screen");
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [userId, setUserId] = useState<string | null>(null);
  const [emailOtp, setEmailOtp] = useState("");
  const [smsOtp, setSmsOtp] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [selectedMfaMethod, setSelectedMfaMethod] = useState<"AUTHENTICATOR" | "SMS" | "EMAIL">("AUTHENTICATOR");

  // MFA Setup State
  const [totpData, setTotpData] = useState<{ qrCodeDataUrl?: string; secret?: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Timers & Resend
  const [resendCooldown, setResendCooldown] = useState(0);

  // Feedback State
  const [feedback, setFeedback] = useState<{ type: "error" | "success" | "warning" | "info"; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Submit Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match." });
      setFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    if (!termsAccepted) {
      setFieldErrors({ termsAccepted: "You must accept the terms." });
      setFeedback({ type: "error", message: "Please accept the Terms of Service." });
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("/register", {
        body: {
          name,
          email,
          password,
          confirmPassword,
          phone,
          termsAccepted: true,
        },
      });

      setUserId(res.userId);
      setFeedback({ type: "success", message: "Verification code sent to your email." });
      setCurrentScreen("email-otp-screen");
      setCurrentStep(2);
      setResendCooldown(60);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
      if (err.details) setFieldErrors(err.details);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Email OTP
  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length !== 6 || !userId) return;
    setFeedback(null);
    setIsLoading(true);

    try {
      await apiRequest("/verify-email-otp", {
        body: { userId, challengeId: "email-challenge", otp: emailOtp },
      });

      setFeedback({ type: "success", message: "Email verified successfully!" });
      
      // Send SMS OTP for phone verification
      await apiRequest("/send-sms-otp", { body: { userId } });
      setCurrentScreen("sms-otp-screen");
      setCurrentStep(3);
      setResendCooldown(60);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Verify SMS OTP
  const handleVerifySmsOtp = async () => {
    if (smsOtp.length !== 6 || !userId) return;
    setFeedback(null);
    setIsLoading(true);

    try {
      await apiRequest("/verify-sms-otp", {
        body: { userId, challengeId: "sms-challenge", otp: smsOtp },
      });

      setFeedback({ type: "success", message: "Phone number verified!" });
      setCurrentScreen("mfa-choice-screen");
      setCurrentStep(4);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: MFA Choice Proceed
  const handleSelectMfa = async () => {
    if (!userId) return;
    setFeedback(null);
    setIsLoading(true);

    try {
      const res = await apiRequest("/mfa/select-method", {
        body: { userId, method: selectedMfaMethod },
      });

      if (selectedMfaMethod === "AUTHENTICATOR") {
        setTotpData(res);
        setCurrentScreen("authenticator-setup-screen");
      } else {
        setCurrentScreen("mfa-verify-screen");
        setResendCooldown(60);
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 5: Verify MFA Final
  const handleVerifyMfaFinal = async () => {
    if (mfaCode.length !== 6 || !userId) return;
    setFeedback(null);
    setIsLoading(true);

    try {
      await apiRequest("/mfa/verify", {
        body: {
          userId,
          method: selectedMfaMethod,
          code: mfaCode,
        },
      });

      setCurrentScreen("success-screen");
      setCurrentStep(5);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Email OTP
  const handleResendEmail = async () => {
    if (resendCooldown > 0 || !userId) return;
    setIsLoading(true);
    try {
      await apiRequest("/send-email-otp", { body: { userId } });
      setFeedback({ type: "info", message: "A new verification code has been dispatched." });
      setResendCooldown(60);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend SMS OTP
  const handleResendSms = async () => {
    if (resendCooldown > 0 || !userId) return;
    setIsLoading(true);
    try {
      await apiRequest("/send-sms-otp", { body: { userId } });
      setFeedback({ type: "info", message: "A new SMS verification code has been sent." });
      setResendCooldown(60);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy TOTP Key
  const handleCopyKey = () => {
    if (!totpData?.secret) return;
    navigator.clipboard.writeText(totpData.secret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <AuthCard maxWidth="max-w-xl">
      <AuthHeader
        title="Create your SecureID"
        subtitle="Zero-trust identity protection with continuous multi-factor verification"
        badge="Enterprise IAM"
      />

      <AuthStepper currentStep={currentStep} />

      <FeedbackBanner
        type={feedback?.type}
        message={feedback?.message || null}
        onDismiss={() => setFeedback(null)}
      />

      <AnimatePresence mode="wait">
        {/* SCREEN 1: REGISTRATION DETAILS */}
        {currentScreen === "registration-screen" && (
          <motion.form
            key="screen-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleRegisterSubmit}
            className="space-y-4"
            data-testid="registration-screen"
          >
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-white text-sm placeholder:text-slate-500"
                />
              </div>
              {fieldErrors.name && <p className="text-xs text-rose-400 mt-1">{fieldErrors.name}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="jane.doe@enterprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-white text-sm placeholder:text-slate-500"
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-rose-400 mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="phone"
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  data-testid="phone"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-white text-sm placeholder:text-slate-500"
                />
              </div>
              {fieldErrors.phone && <p className="text-xs text-rose-400 mt-1">{fieldErrors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-white text-sm placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="password-toggle"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordRules password={password} />
              {fieldErrors.password && <p className="text-xs text-rose-400 mt-1">{fieldErrors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  data-testid="confirm-password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-white text-sm placeholder:text-slate-500"
                />
              </div>
              {fieldErrors.confirmPassword && <p className="text-xs text-rose-400 mt-1">{fieldErrors.confirmPassword}</p>}
            </div>

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  id="termsAccepted"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  data-testid="terms"
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-surface-100 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-400 leading-tight">
                  I agree to the <span className="text-brand-400 hover:underline">Terms of Service</span> and{" "}
                  <span className="text-brand-400 hover:underline">Privacy Policy</span>.
                </span>
              </label>
              {fieldErrors.termsAccepted && <p className="text-xs text-rose-400 mt-1">{fieldErrors.termsAccepted}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              data-testid="submit-button"
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan hover:from-brand-500 hover:to-accent-cyan/90 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Protected Identity</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Already registered?{" "}
                <Link href="/login" className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-2">
                  Sign In
                </Link>
              </p>
            </div>
          </motion.form>
        )}

        {/* SCREEN 2: EMAIL OTP VERIFICATION */}
        {currentScreen === "email-otp-screen" && (
          <motion.div
            key="screen-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center"
            data-testid="email-otp-screen"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Check your email</h2>
              <p className="text-xs text-slate-400 mt-1">
                We sent a 6-digit verification code to{" "}
                <span className="text-slate-200 font-semibold" data-testid="email-target">
                  {email || "your email"}
                </span>
              </p>
            </div>

            <OtpInput
              value={emailOtp}
              onChange={setEmailOtp}
              onComplete={handleVerifyEmailOtp}
              disabled={isLoading}
            />

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleVerifyEmailOtp}
                disabled={emailOtp.length !== 6 || isLoading}
                data-testid="verify-email-btn"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan hover:from-brand-500 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify Email Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentScreen("registration-screen");
                    setCurrentStep(1);
                  }}
                  data-testid="back-to-details-btn"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Change Details
                </button>

                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resendCooldown > 0 || isLoading}
                  data-testid="resend-otp-btn"
                  className="text-brand-400 hover:text-brand-300 disabled:text-slate-600 font-medium"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* SCREEN 3: SMS OTP VERIFICATION */}
        {currentScreen === "sms-otp-screen" && (
          <motion.div
            key="screen-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center"
            data-testid="sms-otp-screen"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Verify mobile device</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter the 6-digit SMS code sent to{" "}
                <span className="text-slate-200 font-semibold" data-testid="sms-target">
                  {phone || "your phone"}
                </span>
              </p>
            </div>

            <OtpInput
              value={smsOtp}
              onChange={setSmsOtp}
              onComplete={handleVerifySmsOtp}
              disabled={isLoading}
            />

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleVerifySmsOtp}
                disabled={smsOtp.length !== 6 || isLoading}
                data-testid="verify-sms-btn"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm Mobile</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-end text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={handleResendSms}
                  disabled={resendCooldown > 0 || isLoading}
                  data-testid="resend-sms-btn"
                  className="text-brand-400 hover:text-brand-300 disabled:text-slate-600 font-medium"
                >
                  {resendCooldown > 0 ? `Resend SMS in ${resendCooldown}s` : "Resend SMS"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* SCREEN 4: MFA CHOICE SELECTION */}
        {currentScreen === "mfa-choice-screen" && (
          <motion.div
            key="screen-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
            data-testid="mfa-choice-screen"
          >
            <div className="text-center mb-5">
              <h2 className="text-lg font-bold text-white">Select Primary 2FA Method</h2>
              <p className="text-xs text-slate-400 mt-1">
                Add an extra layer of security required for every login attempt
              </p>
            </div>

            {/* Authenticator App Option */}
            <div
              onClick={() => setSelectedMfaMethod("AUTHENTICATOR")}
              data-testid="mfa-authenticator"
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                selectedMfaMethod === "AUTHENTICATOR"
                  ? "bg-brand-500/10 border-brand-500/60 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                  : "bg-surface-100 border-white/5 hover:border-white/20"
              }`}
            >
              <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400 mt-0.5">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Authenticator App (TOTP)</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-medium">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Google Authenticator, Authy, or 1Password. Works without mobile cellular connection.
                </p>
              </div>
            </div>

            {/* SMS OTP Option */}
            <div
              onClick={() => setSelectedMfaMethod("SMS")}
              data-testid="mfa-sms"
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                selectedMfaMethod === "SMS"
                  ? "bg-brand-500/10 border-brand-500/60 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                  : "bg-surface-100 border-white/5 hover:border-white/20"
              }`}
            >
              <div className="p-2 rounded-lg bg-accent-cyan/20 text-accent-cyan mt-0.5">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">SMS Passcode</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Receive a one-time 6-digit text message on every login.
                </p>
              </div>
            </div>

            {/* Email OTP Option */}
            <div
              onClick={() => setSelectedMfaMethod("EMAIL")}
              data-testid="mfa-email"
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                selectedMfaMethod === "EMAIL"
                  ? "bg-brand-500/10 border-brand-500/60 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                  : "bg-surface-100 border-white/5 hover:border-white/20"
              }`}
            >
              <div className="p-2 rounded-lg bg-accent-violet/20 text-accent-violet mt-0.5">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">Email Verification Code</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Receive a security token delivered directly to your inbox.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSelectMfa}
              disabled={isLoading}
              data-testid="mfa-continue-btn"
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continue with {selectedMfaMethod === "AUTHENTICATOR" ? "TOTP" : selectedMfaMethod}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* SCREEN 5: AUTHENTICATOR SETUP (QR CODE) */}
        {currentScreen === "authenticator-setup-screen" && (
          <motion.div
            key="screen-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5 text-center"
            data-testid="authenticator-setup-screen"
          >
            <div>
              <h2 className="text-lg font-bold text-white">Scan Authenticator QR</h2>
              <p className="text-xs text-slate-400 mt-1">
                Scan using Google Authenticator, Microsoft Authenticator, or 1Password
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl w-52 h-52 mx-auto flex items-center justify-center shadow-lg border-2 border-brand-500/40">
              {totpData?.qrCodeDataUrl ? (
                <img
                  src={totpData.qrCodeDataUrl}
                  alt="MFA QR Code"
                  className="w-full h-full object-contain"
                  data-testid="qr-code"
                />
              ) : (
                <QrCode className="w-20 h-20 text-slate-800" />
              )}
            </div>

            {/* Secret Manual Key */}
            {totpData?.secret && (
              <div className="bg-surface-100 p-3 rounded-xl border border-white/10 flex items-center justify-between text-left">
                <div className="overflow-hidden mr-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Manual Secret Key
                  </span>
                  <span className="text-xs font-mono text-brand-300 truncate block select-all" data-testid="manual-key">
                    {totpData.secret}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  data-testid="copy-key-btn"
                  className="p-2 rounded-lg bg-surface-50 hover:bg-brand-500/20 text-slate-300 hover:text-white transition-colors"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setCurrentScreen("mfa-verify-screen")}
              data-testid="continue-to-verify-btn"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all"
            >
              <span>Verify 6-Digit Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* SCREEN 6: MFA VERIFY */}
        {currentScreen === "mfa-verify-screen" && (
          <motion.div
            key="screen-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center"
            data-testid="mfa-verify-screen"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Enter 6-Digit MFA Code</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter the one-time authentication code generated by your {selectedMfaMethod.toLowerCase()}
              </p>
            </div>

            <OtpInput
              value={mfaCode}
              onChange={setMfaCode}
              onComplete={handleVerifyMfaFinal}
              disabled={isLoading}
            />

            <button
              type="button"
              onClick={handleVerifyMfaFinal}
              disabled={mfaCode.length !== 6 || isLoading}
              data-testid="verify-mfa-btn"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Activate Identity & Complete</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* SCREEN 7: SUCCESS CARD */}
        {currentScreen === "success-screen" && (
          <motion.div
            key="screen-7"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-4"
            data-testid="success-screen"
          >
            <div className="relative w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Identity Ready
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">Registration Complete</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Your account is verified and protected with military-grade zero-trust MFA.
              </p>
            </div>

            {/* Checklist */}
            <div className="bg-surface-100 p-4 rounded-xl border border-white/10 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Email and mobile identity verified</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Primary MFA security policy bound</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cryptographic credentials safely stored</span>
              </div>
            </div>

            <Link
              href="/login"
              data-testid="login-redirect-btn"
              className="inline-flex w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan text-white font-semibold text-sm shadow-glow items-center justify-center gap-2 transition-all hover:opacity-95"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}
