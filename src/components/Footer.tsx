"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  MessageCircle,
  Instagram,
  Facebook,
  Phone,
  ExternalLink,
} from "lucide-react";
import { BRAND_LOGOS, BRAND_CONTACT } from "@/lib/brand-assets";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
    }, 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(BRAND_CONTACT.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  return (
    <footer className="w-full bg-[#1F1A17] text-[#C4B9AA] pb-24 sm:pb-14">
      {/* 1. VALUE PROPOSITIONS BAR */}
      <div className="border-b border-[rgba(245,241,234,0.10)] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#FAF8F4] shrink-0">
              <Truck className="w-5 h-5 text-[#FAF8F4]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#FAF8F4]">Express Delivery</h4>
              <p className="text-xs text-[#A89C8F] mt-0.5">
                Fast courier dispatch to Karachi, Lahore, Islamabad, and across Pakistan.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#FAF8F4] shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#FAF8F4]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#FAF8F4]">Cash on Delivery</h4>
              <p className="text-xs text-[#A89C8F] mt-0.5">
                Pay upon arrival at your doorstep. Zero advance payment required.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#FAF8F4] shrink-0">
              <RotateCcw className="w-5 h-5 text-[#FAF8F4]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#FAF8F4]">7-Day Size Exchange</h4>
              <p className="text-xs text-[#A89C8F] mt-0.5">
                Hassle-free doorstep courier size swaps if you need an exchange.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#FAF8F4] shrink-0">
              <Sparkles className="w-5 h-5 text-[#B55A38]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#FAF8F4]">450 GSM Heavyweight</h4>
              <p className="text-xs text-[#A89C8F] mt-0.5">
                Pure combed French Terry cotton that maintains its shape permanently.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 4-COLUMN FOOTER */}
      <div className="max-w-7xl mx-auto py-14 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Col 1: Brand Info with LOGO 2 */}
        <div className="space-y-4">
          <Link href="/" prefetch={true} className="flex items-center gap-3">
            {/* Logo 2: Rounded seal container */}
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#FAF8F4] border border-white/15 p-1 shrink-0">
              <img
                src={BRAND_LOGOS.footerInvoice.path}
                alt="SAMORA"
                className="w-full h-full object-contain filter contrast-110"
              />
            </div>
            <div>
              <span className="text-xl font-bold font-display text-[#FAF8F4] block leading-none">
                SAMORA
              </span>
              <span className="text-xs text-[#A89C8F] block mt-1">
                Handcrafted Streetwear &bull; Pakistan
              </span>
            </div>
          </Link>

          <p className="text-xs text-[#A89C8F] leading-relaxed">
            Crafting heavy, enduring streetwear silhouettes locally in Pakistan. Designed for effortless
            oversized styling, premium comfort, and lasting shape.
          </p>

          <div className="text-xs text-[#8E8275] pt-1">
            Express courier dispatch nationwide with real-time tracking.
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FAF8F4] mb-4">
            Navigation
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/shop" prefetch={true} className="hover:text-[#FAF8F4] transition">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/lookbook" prefetch={true} className="hover:text-[#FAF8F4] transition text-[#FAF8F4] font-medium">
                Hoodie Lookbook
              </Link>
            </li>
            <li>
              <Link href="/about" prefetch={true} className="hover:text-[#FAF8F4] transition">
                About the Brand
              </Link>
            </li>
            <li>
              <Link href="/track-order" prefetch={true} className="hover:text-[#FAF8F4] transition">
                Track Order
              </Link>
            </li>
            <li>
              <Link href="/policies" prefetch={true} className="hover:text-[#FAF8F4] transition">
                Shipping & Exchange Policy
              </Link>
            </li>
            <li>
              <Link href="/contact" prefetch={true} className="hover:text-[#FAF8F4] transition">
                Contact & Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Newsletter & Updates */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FAF8F4] mb-4">
            Stay Connected
          </h3>
          <p className="text-xs text-[#A89C8F] mb-4">
            Sign up to be the first to know when new drops and limited edition pieces arrive.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-[#FAF8F4] placeholder-[#8E8275] focus:outline-none focus:border-[#FAF8F4]/40 transition"
            />
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#FAF8F4] hover:bg-[#EBE4D8] text-[#1F1A17] font-semibold text-xs transition shadow-sm"
            >
              {subscribed ? "Subscribed!" : "Subscribe"}
            </button>
          </form>
        </div>

        {/* Col 4: Direct Support & Social Media */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FAF8F4]">
            Customer Support
          </h3>
          <p className="text-xs text-[#A89C8F]">
            Need sizing advice or have questions about an order? Reach out anytime.
          </p>

          <div className="space-y-2.5 text-xs">
            {/* WhatsApp Link */}
            <a
              href={BRAND_CONTACT.whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#FAF8F4]/30 text-white transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 block font-semibold leading-none">
                    WhatsApp Chat
                  </span>
                  <span className="text-xs font-medium text-[#FAF8F4]">{BRAND_CONTACT.phone}</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#8E8275] group-hover:text-emerald-400 transition" />
            </a>

            {/* Copyable Phone */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#A89C8F]" />
                <span className="text-xs text-[#FAF8F4] select-all">{BRAND_CONTACT.phone}</span>
              </div>
              <button
                onClick={handleCopyPhone}
                className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[11px] text-[#FAF8F4] transition flex items-center gap-1"
                title="Copy phone number"
              >
                {copiedPhone ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Social Links */}
            <div className="flex gap-2 pt-1">
              <a
                href={BRAND_CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/30 text-[#FAF8F4] transition flex items-center justify-center gap-1.5"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-xs">Instagram</span>
              </a>
              <a
                href={BRAND_CONTACT.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/30 text-[#FAF8F4] transition flex items-center justify-center gap-1.5"
              >
                <Facebook className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs">Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM COPYRIGHT */}
      <div className="border-t border-[rgba(245,241,234,0.10)] py-6 px-4 text-center text-xs text-[#8E8275]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} SAMORA. All rights reserved.</span>
          <span>Crafted in Pakistan &bull; Cash on Delivery Nationwide</span>
        </div>
      </div>
    </footer>
  );
}
