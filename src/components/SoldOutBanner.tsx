import React from "react";

interface SoldOutBannerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Luxury Sold Out banner overlay for SAMORA
 * Styled in Deep Espresso (#1F1A17) & Warm Terracotta (#B55A38) with subtle gold foil border
 */
export default function SoldOutBanner({ className = "", size = "md" }: SoldOutBannerProps) {
  const sizeClasses = {
    sm: "py-1 px-3 text-[10px] tracking-wider",
    md: "py-1.5 px-4 text-xs tracking-widest",
    lg: "py-2 px-6 text-sm tracking-widest",
  };

  return (
    <div
      className={`absolute top-3 left-3 z-20 pointer-events-none select-none flex items-center gap-1.5 rounded-full bg-[#1F1A17]/95 border border-[#B55A38]/50 shadow-lg backdrop-blur-sm ${sizeClasses[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#B55A38] animate-pulse" />
      <span className="font-serif font-bold uppercase text-[#FAF8F4] drop-shadow-sm">
        Sold Out
      </span>
    </div>
  );
}
