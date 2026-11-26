"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Layers, RefreshCw } from "lucide-react";

export default function BrandEthosSplit() {
  return (
    <section className="py-16 sm:py-20 bg-[#FAF8F4] border-b border-[rgba(31,26,23,0.08)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Full Uncropped Craftsmanship Stage */}
          <div className="lg:col-span-6 relative aspect-[4/5] rounded-3xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] overflow-hidden shadow-sm flex flex-col justify-between p-6 sm:p-8">
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <img
                src="/assets/editorial-hoodies/hoodie-editorial-05.jpeg"
                alt="450 GSM Cotton Construction"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>

            <div className="relative z-10 flex justify-between items-center">
              <span className="bg-[#FAF8F4]/90 backdrop-blur-md border border-[rgba(31,26,23,0.10)] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1F1A17] shadow-sm">
                Material Focus
              </span>
              <span className="bg-[#2C3A2F] text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
                Artisanal Terry
              </span>
            </div>

            <div className="relative z-10 p-4 rounded-2xl bg-[#FAF8F4]/95 border border-[rgba(31,26,23,0.10)] backdrop-blur-md shadow-sm">
              <span className="text-xs font-bold text-[#B55A38] block mb-0.5">
                Permanent Shape Retention
              </span>
              <p className="text-xs text-[#6B5E54]">
                Crafted with dense loopback French Terry that maintains its structured boxy silhouette wash after wash.
              </p>
            </div>
          </div>

          {/* Right Column: Narrative & Specifications */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-semibold text-[#2C3A2F] uppercase tracking-wider block mb-1">
                Our Craft & Standard
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[#1F1A17] leading-tight">
                The Beauty of <br />
                <span className="font-editorial italic font-normal text-[#6B5E54]">
                  heavyweight cotton
                </span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#6B5E54] leading-relaxed">
                True luxury begins with uncompromised integrity in materials. We spin 100% natural Pakistani
                combed cotton to a substantial 450 GSM weight that drapes effortlessly without synthetic fillers.
                Every piece is tailored for relaxed, daily comfort and longevity.
              </p>
            </div>

            {/* Quality Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-4 rounded-2xl bg-[#EBE4D8]/60 border border-[rgba(31,26,23,0.08)] space-y-1">
                <div className="flex items-center gap-2 text-[#1F1A17] text-sm font-semibold">
                  <Zap className="w-4 h-4 text-[#B55A38]" />
                  <span>450 GSM Weight</span>
                </div>
                <p className="text-xs text-[#6B5E54]">
                  Substantial hand-feel with a clean, structured drop-shoulder drape.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#EBE4D8]/60 border border-[rgba(31,26,23,0.08)] space-y-1">
                <div className="flex items-center gap-2 text-[#1F1A17] text-sm font-semibold">
                  <Layers className="w-4 h-4 text-[#2C3A2F]" />
                  <span>100% Combed Cotton</span>
                </div>
                <p className="text-xs text-[#6B5E54]">
                  Pure natural loopback fibers for superior breathability and zero pilling.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#EBE4D8]/60 border border-[rgba(31,26,23,0.08)] space-y-1">
                <div className="flex items-center gap-2 text-[#1F1A17] text-sm font-semibold">
                  <RefreshCw className="w-4 h-4 text-[#2C3A2F]" />
                  <span>Enzyme Pre-Washed</span>
                </div>
                <p className="text-xs text-[#6B5E54]">
                  Pre-shrunk cold water wash for an ultra-soft touch from day one.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#EBE4D8]/60 border border-[rgba(31,26,23,0.08)] space-y-1">
                <div className="flex items-center gap-2 text-[#1F1A17] text-sm font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#B55A38]" />
                  <span>Reinforced Seams</span>
                </div>
                <p className="text-xs text-[#6B5E54]">
                  Double-needle overlock stitching across all major stress points.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                href="/about"
                prefetch={true}
                className="px-6 py-3.5 bg-[#2C3A2F] hover:bg-[#222D24] text-[#FAF8F4] text-sm font-semibold rounded-full transition shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>About Our Craft</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/lookbook"
                prefetch={true}
                className="px-6 py-3.5 bg-[#FAF8F4] hover:bg-[#EBE4D8] text-[#1F1A17] text-sm font-semibold rounded-full border border-[rgba(31,26,23,0.15)] transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>View Lookbook</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
