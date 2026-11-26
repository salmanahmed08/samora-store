"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, Sparkles } from "lucide-react";
import { EDITORIAL_HOODIES, EditorialHoodieConfig } from "@/lib/brand-assets";
import EditorialLightbox from "./EditorialLightbox";

export default function EditorialCampaignSections() {
  const [lightboxImage, setLightboxImage] = useState<EditorialHoodieConfig | null>(null);

  // Featured hoodies: 04, 05, 06, 07
  const magItems = EDITORIAL_HOODIES.slice(3, 7);

  // Street showcase hoodies: 08, 09, 10
  const streetItems = EDITORIAL_HOODIES.slice(7, 10);

  return (
    <>
      {/* 1. FEATURED CAMPAIGN SPREAD */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[rgba(31,26,23,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold text-[#B55A38] uppercase tracking-wider block mb-1">
              Campaign Lookbook
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#1F1A17]">
              The Hoodie Collection
            </h2>
            <p className="text-sm text-[#6B5E54] mt-1 max-w-xl">
              Engineered with relaxed shoulders, architectural drape, and dense 450 GSM French Terry cotton.
            </p>
          </div>
          <Link
            href="/lookbook"
            prefetch={true}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2C3A2F] hover:text-[#1F1A17] transition group"
          >
            <span>View Full Lookbook</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Asymmetrical Grid with Warm Sculpted Frames */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Large Feature Card */}
          <div
            onClick={() => setLightboxImage(magItems[0])}
            className="lg:col-span-7 relative min-h-[460px] sm:min-h-[520px] rounded-3xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] overflow-hidden cursor-pointer group hover:border-[#1F1A17]/30 transition-all duration-300 shadow-sm flex flex-col justify-between p-6 sm:p-8"
          >
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <img
                src={magItems[0].path}
                alt={magItems[0].title}
                className="w-full h-full object-contain group-hover:scale-105 transition-all duration-700 drop-shadow-lg"
              />
            </div>

            {/* Top Pill */}
            <div className="relative z-10 flex justify-between items-center">
              <span className="bg-[#FAF8F4]/90 backdrop-blur-md border border-[rgba(31,26,23,0.10)] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1F1A17] shadow-sm">
                Flagship Silhouette
              </span>
              <span className="bg-[#2C3A2F] text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
                Look 04
              </span>
            </div>

            {/* Bottom Details Card */}
            <div className="relative z-10 p-5 rounded-2xl bg-[#FAF8F4]/95 backdrop-blur-md border border-[rgba(31,26,23,0.10)] space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-[#B55A38] block">
                450 GSM Pure French Terry Cotton
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-[#1F1A17]">
                {magItems[0].title}
              </h3>
              <p className="text-xs sm:text-sm text-[#6B5E54] line-clamp-2">
                Heavyweight combed cotton designed for an oversized relaxed drape without synthetic fillers.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold text-[#2C3A2F]">
                <Eye className="w-3.5 h-3.5" />
                <span>Click to view full uncropped photo</span>
              </div>
            </div>
          </div>

          {/* Stacked Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
            {magItems.slice(1, 4).map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setLightboxImage(item)}
                className="relative rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] overflow-hidden cursor-pointer group hover:border-[#1F1A17]/30 transition-all duration-300 flex items-center p-4 gap-4 shadow-sm"
              >
                <div className="w-24 h-28 rounded-xl bg-[#EBE4D8] overflow-hidden shrink-0 flex items-center justify-center p-1.5 border border-[rgba(31,26,23,0.06)]">
                  <img
                    src={item.path}
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-all duration-500"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold text-[#B55A38] uppercase">
                    Look 0{idx + 5} &bull; {item.edition}
                  </span>
                  <h4 className="text-base font-bold text-[#1F1A17] font-display line-clamp-1 mt-0.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#6B5E54] line-clamp-1 mt-0.5">
                    {item.specs}
                  </p>
                  <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-[#2C3A2F]">
                    <Eye className="w-3 h-3" />
                    <span>View photo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. "WORN ON THE STREETS" SHOWCASE */}
      <section className="py-16 sm:py-20 bg-[#EBE4D8]/60 border-b border-[rgba(31,26,23,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-semibold text-[#2C3A2F] uppercase tracking-wider block">
              Street & Lifestyle
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#1F1A17]">
              Worn on the Streets
            </h2>
            <p className="text-sm text-[#6B5E54]">
              Clean proportions, effortless drape, and artisanal streetwear aesthetics tailored for daily longevity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {streetItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setLightboxImage(item)}
                className="group relative rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] overflow-hidden cursor-pointer hover:border-[#1F1A17]/30 transition-all duration-300 flex flex-col justify-between p-5 shadow-sm"
              >
                {/* Visual Frame */}
                <div className="w-full aspect-[4/5] rounded-2xl bg-[#EBE4D8] overflow-hidden flex items-center justify-center p-4 relative mb-4">
                  <img
                    src={item.path}
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-all duration-500 drop-shadow-md"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-[#FAF8F4]/90 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-[#1F1A17]">
                    Look 0{idx + 8}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-display text-[#1F1A17]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#6B5E54]">
                    {item.specs}
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#2C3A2F]">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View full uncropped photo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <EditorialLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </>
  );
}
