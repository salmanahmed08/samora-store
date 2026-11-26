"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { BRAND_CONTACT } from "@/lib/brand-assets";

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const [isDismissed, setIsDismissed] = useState(false);

  // Do not render on admin dashboard
  if (pathname.startsWith("/admin") || isDismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Customer Support on WhatsApp"
      className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-40 flex items-center group"
    >
      {/* Friendly, Warm Luxury Pill Button (Warm Linen with Espresso Text & Emerald Icon) */}
      <a
        href={BRAND_CONTACT.whatsAppQuickChatUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-2.5 bg-[#FAF8F4] hover:bg-[#EBE4D8] text-[#1F1A17] border border-[rgba(31,26,23,0.12)] hover:border-[#2C3A2F]/40 rounded-full shadow-lg shadow-[#1F1A17]/10 backdrop-blur-md transition-all duration-300 hover:scale-[1.02]"
        title="Chat on WhatsApp (0334 4826415)"
      >
        {/* WhatsApp Icon Circle with subtle green indicator */}
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-[#2C3A2F]/10 border border-[#2C3A2F]/20 flex items-center justify-center text-[#2C3A2F]">
            <MessageCircle className="w-4 h-4 fill-[#2C3A2F]/20" />
          </div>
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#FAF8F4]" />
        </div>

        {/* Human Friendly Label */}
        <div className="text-left pr-1">
          <span className="text-xs font-semibold text-[#1F1A17] block leading-tight">
            Chat on WhatsApp
          </span>
          <span className="text-[11px] text-[#6B5E54] block leading-tight">
            Direct customer care
          </span>
        </div>
      </a>

      {/* Subtle close button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="ml-2 p-1 text-[#6B5E54] hover:text-[#1F1A17] opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Dismiss chat button"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
}
