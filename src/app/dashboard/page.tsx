"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Key, 
  Terminal, 
  LogOut, 
  Copy, 
  Check, 
  CheckCircle2, 
  ShieldAlert, 
  RefreshCw,
  ExternalLink,
  Lock,
  Cpu,
  Zap
} from "lucide-react";
import { apiRequest } from "@/lib/api-client";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  mfaEnabled: boolean;
}

export default function DashboardPage() {
  const router = useRouter();

  // State
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenMeta, setTokenMeta] = useState<any>(null);
  const [resultLog, setResultLog] = useState<string>("Ready to issue access tokens.");
  const [copiedToken, setCopiedToken] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [isCallingProtected, setIsCallingProtected] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // TanStack Query for Profile
  const { data, isLoading, error, refetch } = useQuery<{ authenticated: boolean; user: UserProfile }>({
    queryKey: ["currentUser"],
    queryFn: () => apiRequest("/me", { method: "GET", csrf: false }),
    retry: false,
  });

  // Redirect if unauthorized
  useEffect(() => {
    if (error) {
      router.replace("/login");
    }
  }, [error, router]);

  const user = data?.user;

  // Issue Access Token
  const handleIssueToken = async () => {
    setIsIssuing(true);
    setResultLog("Negotiating cryptographic token with IAM authorization server…");

    try {
      const res = await apiRequest("/token", { method: "POST" });
      setAccessToken(res.accessToken);
      setTokenMeta(res);
      setResultLog(
        `Token issued in memory only. Type: ${res.tokenType}. Expires in ${res.expiresIn} seconds.`
      );
    } catch (err: any) {
      setResultLog(`Failed to issue token: ${err.message}`);
    } finally {
      setIsIssuing(false);
    }
  };

  // Call Protected Resource
  const handleCallProtected = async () => {
    if (!accessToken) return;
    setIsCallingProtected(true);
    setResultLog("Querying /api/protected with Bearer access token…");

    try {
      const res = await apiRequest("/protected", {
        method: "GET",
        csrf: false,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setResultLog(
        `${res.message}\nAudience: ${res.token?.audience}\nExpires: ${res.token?.expiresAt}\nJTI: ${res.token?.jti}`
      );
    } catch (err: any) {
      setAccessToken(null);
      setResultLog(`Protected access rejected: ${err.message}`);
    } finally {
      setIsCallingProtected(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiRequest("/logout", { method: "POST" });
    } finally {
      setAccessToken(null);
      router.replace("/login");
    }
  };

  const handleCopyToken = () => {
    if (!accessToken) return;
    navigator.clipboard.writeText(accessToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Verifying Zero-Trust Session…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-4">
      {/* TOP NAV BAR */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-glow">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">SecureID IAM Platform</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Active Session
              </span>
            </div>
            <p className="text-xs text-slate-400">Continuous Multi-Factor Security Perimeter</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            data-testid="logout-btn"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-100 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PROFILE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="md:col-span-1 rounded-2xl glass-panel p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Identity Profile
            </h2>
            <span className="p-1.5 rounded-lg bg-surface-50 text-slate-400">
              <User className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Display Name</span>
              <p className="text-base font-semibold text-white tracking-tight" data-testid="dashboard-name">
                {user?.name || "Verified User"}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Primary Email</span>
              <p className="text-sm font-mono text-slate-300 truncate" data-testid="dashboard-email">
                {user?.email || "—"}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Multi-Factor Status</span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  data-testid="dashboard-mfa"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    user?.mfaEnabled
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {user?.mfaEnabled ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Not enabled
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Encryption</span>
                <span className="text-slate-300 font-mono">AES-256-GCM</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Key Algorithm</span>
                <span className="text-slate-300 font-mono">HMAC-SHA256</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Session Policy</span>
                <span className="text-emerald-400 font-semibold">Protected</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* API ACCESS TOKEN & PLAYGROUND */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="md:col-span-2 rounded-2xl glass-panel p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                JWT Scoped Token Playground
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Issue cryptographic tokens from your authenticated session to access protected endpoints
              </p>
            </div>
            <span className="p-1.5 rounded-lg bg-surface-50 text-slate-400">
              <Terminal className="w-4 h-4" />
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleIssueToken}
              disabled={isIssuing}
              data-testid="issue-token-btn"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan hover:from-brand-500 text-white text-xs font-semibold shadow-glow flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isIssuing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Key className="w-3.5 h-3.5" />
                  <span>Issue Access Token</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCallProtected}
              disabled={!accessToken || isCallingProtected}
              data-testid="call-protected-btn"
              className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 text-white text-xs font-semibold border border-white/10 flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isCallingProtected ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Call Protected API (/api/protected)</span>
                </>
              )}
            </button>
          </div>

          {/* Active Token Preview */}
          {accessToken && (
            <div className="p-3 bg-surface-100/90 rounded-xl border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-300">
                  Active Bearer JWT Token
                </span>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copiedToken ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedToken ? "Copied" : "Copy Token"}
                </button>
              </div>
              <p className="font-mono text-xs text-slate-300 break-all select-all line-clamp-2">
                {accessToken}
              </p>
            </div>
          )}

          {/* Terminal Console Output */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Response Console
            </span>
            <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-emerald-400 whitespace-pre-wrap min-h-[110px] select-text">
              <span data-testid="dashboard-result">{resultLog}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
