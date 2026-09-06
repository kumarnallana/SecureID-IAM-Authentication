import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SecureID IAM — Enterprise Authentication & Identity Access Management",
  description: "Bank-grade Identity and Access Management platform featuring Multi-Factor Authentication (MFA/TOTP), rate limiting, automated challenge flows, and session protection.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-background text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
        <AppProviders>
          <div className="relative min-h-screen flex flex-col">
            {/* Ambient Lighting Accents */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
              <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[120px] animate-pulse-slow" />
              <div className="absolute top-[20%] right-[-10%] w-[450px] h-[450px] bg-accent-cyan/10 rounded-full blur-[140px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
              <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] bg-accent-violet/10 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: "4s" }} />
            </div>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
              {children}
            </main>

            <footer className="relative z-10 py-6 text-center text-xs text-slate-500 border-t border-white/[0.04]">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p>&copy; {new Date().getFullYear()} SecureID IAM Platform. Enterprise Identity & Access Management.</p>
                <div className="flex items-center gap-4 text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Systems Operational
                  </span>
                  <span>TLS 1.3 / AES-256-GCM</span>
                </div>
              </div>
            </footer>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
