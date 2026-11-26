"use client";

import React, { useState } from "react";
import { EDITORIAL_HOODIES, EditorialHoodieConfig } from "@/lib/brand-assets";
import EditorialLightbox from "./EditorialLightbox";
import { Eye } from "lucide-react";

export default function LookbookMarquee() {
  const [selectedImage, setSelectedImage] = useState<EditorialHoodieConfig | null>(null);

  const marqueeItems = [
    EDITORIAL_HOODIES[10],
    EDITORIAL_HOODIES[11],
    EDITORIAL_HOODIES[12],
    EDITORIAL_HOODIES[13],
    EDITORIAL_HOODIES[0],
    EDITORIAL_HOODIES[1],
  ];

  return (
    <>
      <section className="py-16 bg-[#EBE4D8]/60 border-b border-[rgba(31,26,23,0.08)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-[#B55A38] uppercase tracking-wider block mb-1">
              Visual Gallery
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#1F1A17]">
              Signature Silhouettes
            </h2>
          </div>
          <span className="text-xs text-[#6B5E54]">
            Click any photo to view full uncropped frame
          </span>
        </div>

        {/* Marquee Carousel */}
        <div className="relative w-full overflow-hidden flex items-center">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#F5F1EA] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#F5F1EA] to-transparent z-10 pointer-events-none" />

          <div className="flex gap-5 animate-marquee whitespace-nowrap py-3">
            {marqueeItems.concat(marqueeItems).map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => setSelectedImage(item)}
                className="relative inline-block w-64 sm:w-72 h-96 rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] shrink-0 cursor-pointer group overflow-hidden transition-all duration-300 hover:border-[#1F1A17]/30 shadow-sm hover:shadow-md p-3"
              >
                <div className="w-full h-3/4 rounded-xl bg-[#EBE4D8] overflow-hidden flex items-center justify-center p-2 mb-3">
                  <img
                    src={item.path}
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-all duration-500 drop-shadow-sm"
                  />
                </div>

                <div className="px-1">
                  <h4 className="text-sm font-bold font-display text-[#1F1A17] truncate">
                    {item.title}
                  </h4>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#2C3A2F]">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View photo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <EditorialLightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
    </>
  );
}
