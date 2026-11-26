"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { EditorialHoodieConfig } from "@/lib/brand-assets";

interface LightboxProps {
  image: EditorialHoodieConfig | null;
  onClose: () => void;
}

export default function EditorialLightbox({ image, onClose }: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#1F1A17]/80 backdrop-blur-md animate-fadeIn">
      {/* Background dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Lightbox Frame */}
      <div className="relative z-10 w-full max-w-5xl max-h-[92vh] rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#EBE4D8] border border-[rgba(31,26,23,0.12)] text-[#1F1A17] hover:bg-[#1F1A17] hover:text-[#FAF8F4] flex items-center justify-center transition shadow-sm"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* High-Resolution Uncropped Visual Stage */}
        <div className="relative flex-1 bg-[#EBE4D8] flex items-center justify-center overflow-hidden min-h-[320px] md:min-h-[560px] p-6">
          <img
            src={image.path}
            alt={image.title}
            className="w-full h-full object-contain max-h-[80vh] transition-transform duration-700 hover:scale-105 drop-shadow-md"
          />
        </div>

        {/* Specification Sidebar */}
        <div className="w-full md:w-80 bg-[#FAF8F4] p-6 sm:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[rgba(31,26,23,0.10)]">
          <div className="space-y-4">
            <span className="text-xs font-semibold text-[#B55A38] block uppercase">
              {image.edition}
            </span>

            <h3 className="text-2xl font-bold font-display text-[#1F1A17] leading-tight">
              {image.title}
            </h3>

            <div className="pt-3 text-xs text-[#6B5E54] space-y-3 border-t border-[rgba(31,26,23,0.10)]">
              <div>
                <span className="text-[#6B5E54] text-xs block font-medium">Fabric & Construction</span>
                <span className="text-[#1F1A17] font-semibold text-sm mt-0.5 block">{image.specs}</span>
              </div>

              <div>
                <span className="text-[#6B5E54] text-xs block font-medium">Origin</span>
                <span className="text-[#1F1A17] mt-0.5 block">
                  100% natural Pakistani combed French Terry, tailored in Lahore.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[rgba(31,26,23,0.10)] space-y-2">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full bg-[#2C3A2F] hover:bg-[#222D24] text-[#FAF8F4] text-xs font-semibold transition text-center shadow-sm"
            >
              Close Photo
            </button>
            <div className="text-[11px] text-center text-[#6B5E54]">
              Press Esc to dismiss
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
