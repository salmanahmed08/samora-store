"use client";

import React from "react";

export default function BrandTicker() {
  const tickerItems = [
    "Free Delivery on Orders Over PKR 5,000",
    "100% Cash on Delivery Nationwide",
    "450 GSM Heavyweight French Terry",
    "100% Combed Natural Cotton",
    "7-Day Doorstep Size Exchanges",
    "Handcrafted in Pakistan",
    "Artisanal Boxy Silhouettes",
  ];

  return (
    <div className="w-full bg-[#EBE4D8] border-y border-[rgba(31,26,23,0.08)] py-3 overflow-hidden select-none">
      <div className="flex animate-marquee whitespace-nowrap text-xs text-[#1F1A17]">
        {tickerItems.concat(tickerItems).map((text, idx) => (
          <span key={idx} className="flex items-center mx-5">
            <span className="text-[#1F1A17] font-semibold">{text}</span>
            <span className="mx-5 text-[#B55A38] text-sm">&bull;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
