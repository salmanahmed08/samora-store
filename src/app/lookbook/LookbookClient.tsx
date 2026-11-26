"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { EDITORIAL_HOODIES, EditorialHoodieConfig } from "@/lib/brand-assets";
import EditorialLightbox from "@/components/EditorialLightbox";

export default function LookbookClient() {
  const [selectedImage, setSelectedImage] = useState<EditorialHoodieConfig | null>(null);

  return (
    <div className="w-full min-h-screen bg-[#F5F1EA] py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Page Header */}
        <div className="border-b border-[rgba(31,26,23,0.10)] pb-8">
          <Link
            href="/"
            prefetch={true}
            className="text-xs text-[#6B5E54] hover:text-[#1F1A17] transition inline-flex items-center gap-1.5 mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#B55A38] uppercase tracking-wider block mb-1">
                Campaign Gallery &bull; All 14 Looks
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold font-display text-[#1F1A17]">
                Hoodie Lookbook
              </h1>
              <p className="text-sm text-[#6B5E54] mt-2 max-w-2xl leading-relaxed">
                Explore all 14 signature hoodie compositions. High-resolution visuals showcasing
                the dense 450 GSM French Terry fabric, relaxed boxy drape, and precision tailoring.
              </p>
            </div>

            <div className="text-xs text-[#6B5E54]">
              Click any photo to view full uncropped frame
            </div>
          </div>
        </div>

        {/* 14-Piece Gallery Grid with Warm Sculpted Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {EDITORIAL_HOODIES.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] hover:border-[#1F1A17]/30 p-4 transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer flex flex-col justify-between"
            >
              {/* Image Frame with object-contain (Uncropped Full View) */}
              <div className="w-full aspect-[4/5] rounded-2xl bg-[#EBE4D8] overflow-hidden flex items-center justify-center p-4 relative mb-4">
                <img
                  src={item.path}
                  alt={`SAMORA Look 0${idx + 1} - ${item.title}`}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                />

                {/* Floating pill index */}
                <div className="absolute top-3 left-3 bg-[#FAF8F4]/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-[#1F1A17] shadow-sm">
                  Look #{idx + 1}
                </div>

                <div className="absolute bottom-3 right-3 bg-[#1F1A17]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-medium text-white flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-3 h-3" />
                  <span>Inspect</span>
                </div>
              </div>

              {/* Title & specs */}
              <div className="space-y-1">
                <h2 className="text-base font-bold font-display text-[#1F1A17]">
                  {item.title}
                </h2>
                <p className="text-xs text-[#6B5E54]">
                  {item.specs}
                </p>
                <div className="pt-2 flex items-center justify-between text-xs border-t border-[rgba(31,26,23,0.06)] mt-2">
                  <span className="font-semibold text-[#2C3A2F]">HAUTE STREETWEAR</span>
                  <span className="text-[#6B5E54] text-[11px]">Editorial Series</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox for complete uncropped inspection */}
      <EditorialLightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}
