"use client";

import React, { useState, useEffect } from "react";
import { BRAND_LOGOS } from "@/lib/brand-assets";

export default function BrandPreloader() {
  const [visible, setVisible] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    // Check if preloader has already run in this session
    try {
      const alreadyLoaded = sessionStorage.getItem("samora_preloaded");
      if (alreadyLoaded) {
        return;
      }
      sessionStorage.setItem("samora_preloaded", "true");
      setVisible(true);

      const timer1 = setTimeout(() => {
        setAnimateOut(true);
      }, 400);

      const timer2 = setTimeout(() => {
        setVisible(false);
      }, 550);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } catch {
      // In case sessionStorage is blocked/private
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F5F1EA] transition-all duration-300 ease-out pointer-events-none select-none ${
        animateOut ? "opacity-0 scale-[1.01]" : "opacity-100"
      }`}
      style={{ pointerEvents: "none" }}
    >
      <div className="relative flex flex-col items-center space-y-4 pointer-events-none">
        {/* Logo 4 Emblem in Warm Rounded Card */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-[rgba(31,26,23,0.12)] bg-[#FAF8F4] p-2.5 shadow-md flex items-center justify-center overflow-hidden">
          <img
            src={BRAND_LOGOS.preloaderFavicon.path}
            alt="SAMORA"
            className="w-full h-full object-contain filter contrast-110"
          />
        </div>

        {/* Clean Luxury Brand Title */}
        <div className="text-center space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#1F1A17]">
            SAMORA
          </h2>
          <p className="text-[11px] text-[#6B5E54]">
            Haute Streetwear &bull; Pakistan
          </p>
        </div>

        {/* Minimal Featherlight Progress Bar */}
        <div className="w-28 h-0.5 rounded-full bg-[#EBE4D8] overflow-hidden">
          <div className="h-full bg-[#2C3A2F] w-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
