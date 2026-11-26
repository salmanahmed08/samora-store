"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { BRAND_CONTACT } from "@/lib/brand-assets";

export default function PoliciesClient() {
  const [activeTab, setActiveTab] = useState<"shipping" | "exchange" | "privacy" | "care">("shipping");

  return (
    <div className="w-full min-h-screen bg-[#F5F1EA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="border-b border-[rgba(31,26,23,0.10)] pb-6">
          <Link
            href="/"
            prefetch={true}
            className="text-xs text-[#6B5E54] hover:text-[#1F1A17] transition inline-flex items-center gap-1.5 mb-3 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#1F1A17]">
            Policies & Customer Care
          </h1>
          <p className="text-sm text-[#6B5E54] mt-2 max-w-2xl leading-relaxed">
            Transparent policies designed for peace of mind. Every piece is dispatched from our Lahore
            workshop with insured door-to-door express courier logistics across Pakistan.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("shipping")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition flex items-center gap-2 active:scale-[0.98] ${
              activeTab === "shipping"
                ? "bg-[#2C3A2F] text-white shadow-sm"
                : "bg-[#FAF8F4] text-[#1F1A17] border border-[rgba(31,26,23,0.12)] hover:border-[#1F1A17]"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Shipping & Dispatch</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("exchange")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition flex items-center gap-2 active:scale-[0.98] ${
              activeTab === "exchange"
                ? "bg-[#2C3A2F] text-white shadow-sm"
                : "bg-[#FAF8F4] text-[#1F1A17] border border-[rgba(31,26,23,0.12)] hover:border-[#1F1A17]"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>7-Day Exchanges</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("care")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition flex items-center gap-2 active:scale-[0.98] ${
              activeTab === "care"
                ? "bg-[#2C3A2F] text-white shadow-sm"
                : "bg-[#FAF8F4] text-[#1F1A17] border border-[rgba(31,26,23,0.12)] hover:border-[#1F1A17]"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Garment Care Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition flex items-center gap-2 active:scale-[0.98] ${
              activeTab === "privacy"
                ? "bg-[#2C3A2F] text-white shadow-sm"
                : "bg-[#FAF8F4] text-[#1F1A17] border border-[rgba(31,26,23,0.12)] hover:border-[#1F1A17]"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy & Security</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] shadow-sm space-y-6 text-sm text-[#1F1A17] leading-relaxed">
          {activeTab === "shipping" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#1F1A17] mb-2">
                  Nationwide Express Delivery & COD Terms
                </h2>
                <p className="text-xs text-[#6B5E54]">
                  Orders are packed in protective custom luxury mailers and dispatched via Trax, Call Courier,
                  or Leopard Express.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#EBE4D8]/60 border border-[rgba(31,26,23,0.06)] space-y-1">
                  <span className="font-bold text-[#1F1A17] block">Lahore Metropolitan</span>
                  <p className="text-[#6B5E54]">Delivered within 24–48 hours from dispatch.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#EBE4D8]/60 border border-[rgba(31,26,23,0.06)] space-y-1">
                  <span className="font-bold text-[#1F1A17] block">Karachi, Islamabad & Nationwide</span>
                  <p className="text-[#6B5E54]">Delivered within 2–4 business days via air/express logistics.</p>
                </div>
              </div>

              <div className="text-xs text-[#6B5E54] space-y-2 border-t border-[rgba(31,26,23,0.08)] pt-4">
                <p>
                  <strong>Free Shipping:</strong> Automatically applied at checkout for all cart totals above PKR 5,000.
                </p>
                <p>
                  <strong>Standard COD Fee:</strong> Orders below PKR 5,000 incur a flat PKR 250 fee covering courier handling.
                </p>
              </div>
            </div>
          )}

          {activeTab === "exchange" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#1F1A17] mb-2">
                  Hassle-Free 7-Day Size & Style Exchanges
                </h2>
                <p className="text-xs text-[#6B5E54]">
                  We stand 100% behind the cut and quality of our garments. If your size isn't ideal, exchange it seamlessly.
                </p>
              </div>

              <ol className="list-decimal pl-5 space-y-2 text-xs text-[#6B5E54]">
                <li>Reach out to our WhatsApp concierge within 7 days of receiving your package.</li>
                <li>Ensure the garment is unworn, unwashed, with all original tags attached.</li>
                <li>We coordinate the exchange pickup and dispatch your replacement piece promptly.</li>
              </ol>
            </div>
          )}

          {activeTab === "care" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#1F1A17] mb-2">
                  How to Care for 450 GSM French Terry
                </h2>
                <p className="text-xs text-[#6B5E54]">
                  Preserve the architectural drape, deep pigment saturation, and loopback softness over years of wear.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#EBE4D8]/60 space-y-1">
                  <span className="font-bold text-[#1F1A17] block">Cold Machine Wash</span>
                  <p className="text-[#6B5E54]">Wash inside out on gentle cycle (30°C or colder).</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#EBE4D8]/60 space-y-1">
                  <span className="font-bold text-[#1F1A17] block">Flat / Line Dry</span>
                  <p className="text-[#6B5E54]">Air dry naturally away from direct scorching sun.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#EBE4D8]/60 space-y-1">
                  <span className="font-bold text-[#1F1A17] block">Steam or Low Iron</span>
                  <p className="text-[#6B5E54]">Steam lightly to relax fibers and preserve silhouette.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-4 text-xs text-[#6B5E54]">
              <h2 className="text-xl font-bold font-serif text-[#1F1A17] mb-2">
                Client Privacy & Data Security
              </h2>
              <p>
                SAMORA respects your privacy. Customer names, delivery addresses, and phone numbers are utilized strictly for order dispatch, courier tracking notifications, and direct concierge service. We never sell or distribute your data.
              </p>
            </div>
          )}
        </div>

        {/* Support Callout */}
        <div className="p-6 rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-[#2C3A2F]" />
            <span className="text-xs text-[#1F1A17] font-semibold">
              Have questions regarding sizing or an ongoing shipment?
            </span>
          </div>
          <a
            href={BRAND_CONTACT.whatsAppQuickChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full bg-[#2C3A2F] text-white text-xs font-semibold hover:bg-[#1F1A17] transition shrink-0"
          >
            Chat with Concierge
          </a>
        </div>
      </div>
    </div>
  );
}
