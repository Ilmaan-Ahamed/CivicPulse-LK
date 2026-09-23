"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
} from "lucide-react";
import { SignIn } from "@clerk/nextjs";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDF6E3] via-[#FDEEDC] to-[#FFE4C4] dark:from-black dark:via-black dark:to-black" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-400/10 dark:bg-[#FF8C00]/8 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-400/8 dark:bg-[#FF8C00]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 opacity-5 dark:opacity-10 bg-[radial-gradient(#F97316_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* Forgot Password Card */}
      <div className="relative w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F97316] dark:bg-[#FF8C00] text-white flex items-center justify-center shadow-xl shadow-orange-600/25 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            CivicPulse <span className="text-[#F97316] dark:text-[#FF8C00] font-mono text-lg">LK</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#B0B0B0] mt-1">
            Reset your password
          </p>
        </div>

        {/* Glass Card */}
        <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-[#E8D5B5]/80 dark:border-[#333333]/80 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 overflow-hidden p-6 sm:p-8">
          {/* Back to login */}
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-[#F97316] dark:hover:text-orange-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Sign In</span>
          </Link>

          {/* Clerk's SignIn component - users can click "Forgot password" link */}
          <SignIn 
            forceRedirectUrl="/dashboard"
            signUpUrl="/login"
            routing="hash"
          />
        </div>
      </div>
    </div>
  );
}
