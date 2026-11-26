"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, AlertCircle, KeyRound, ArrowLeft } from "lucide-react";
import { BRAND_LOGOS } from "@/lib/brand-assets";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@samora.pk");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col justify-center items-center p-4 sm:p-6 text-[#1F1A17] font-sans selection:bg-[#2C3A2F] selection:text-white">
      <div className="w-full max-w-sm bg-white border border-[#1F1A17]/10 rounded-2xl p-7 sm:p-8 shadow-xl relative">
        {/* Brand Logo 3 */}
        <div className="text-center space-y-3 mb-6">
          <div className="w-14 h-14 mx-auto rounded-xl bg-[#FAF8F4] border border-[#1F1A17]/10 p-2 flex items-center justify-center shadow-xs overflow-hidden">
            <img
              src={BRAND_LOGOS.adminPortal.path}
              alt={BRAND_LOGOS.adminPortal.name}
              className="w-full h-full object-contain filter contrast-125"
            />
          </div>

          <div>
            <h1 className="text-xl font-bold text-[#1F1A17] tracking-tight">
              Admin Login
            </h1>
            <p className="text-xs text-[#6B5E54] mt-1">
              Sign in to manage products, categories, orders, and storefront rails
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@samora.pk"
              className="w-full bg-white border border-[#1F1A17]/15 rounded-lg px-3.5 py-2.5 text-sm text-[#1F1A17] placeholder-[#6B5E54]/50 focus:outline-none focus:border-[#2C3A2F] transition shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-[#1F1A17]/15 rounded-lg px-3.5 py-2.5 text-sm text-[#1F1A17] placeholder-[#6B5E54]/50 focus:outline-none focus:border-[#2C3A2F] transition shadow-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-[#2C3A2F] text-white hover:bg-[#202B23] font-semibold text-sm rounded-lg shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Credentials Reminder */}
        <div className="mt-6 pt-5 border-t border-[#1F1A17]/10 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF8F4] border border-[#1F1A17]/10 text-[11px] text-[#6B5E54]">
            <KeyRound className="w-3 h-3 text-[#2C3A2F]" />
            <span>Default: admin@samora.pk / admin123</span>
          </div>

          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#6B5E54] hover:text-[#1F1A17] font-semibold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
