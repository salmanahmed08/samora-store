"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Eye, Sparkles, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { EDITORIAL_HOODIES, EditorialHoodieConfig } from "@/lib/brand-assets";
import EditorialLightbox from "./EditorialLightbox";

export default function HeroSlider() {
  // Use all 14 editorial hoodie looks so the entire series is accessible
  const slides = EDITORIAL_HOODIES;
  const [current, setCurrent] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<EditorialHoodieConfig | null>(null);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[current];

  // Editorial enriched details for slides
  const slideStories: Record<string, { desc: string; highlight: string }> = {
    "hoodie-01": {
      desc: "Engineered with 450 GSM pure French Terry cotton, featuring an architectural boxy drape, dropped shoulders, and double-needle construction.",
      highlight: "PKR 7,490 • Free Nationwide Delivery",
    },
    "hoodie-02": {
      desc: "Cut from dense combed ringspun cotton with preshrunk cold-water treatment, designed for natural stacking and an effortless street posture.",
      highlight: "PKR 7,990 • Cash on Delivery",
    },
    "hoodie-03": {
      desc: "Hand-finished with an enzyme mineral bath for a rich lived-in patina, featuring deep double-layer hood construction and matte eyelets.",
      highlight: "PKR 8,290 • Limited Edition",
    },
    "hoodie-04": {
      desc: "High-density weave tailored in Lahore with dropped shoulder seams and relaxed ribbed cuffs that hold their structured silhouette permanently.",
      highlight: "PKR 7,890 • In Stock",
    },
    "hoodie-05": {
      desc: "Engineered with a weighted two-ply crossover hood that stands proudly without drawstrings, paired with a seamless kangaroo pocket.",
      highlight: "PKR 7,490 • Free Delivery",
    },
    "hoodie-06": {
      desc: "A modern homage to vintage streetwear proportions—custom body length with extended chest width for the quintessential contemporary drape.",
      highlight: "PKR 7,490 • Cash on Delivery",
    },
    "hoodie-07": {
      desc: "Obsidian dark cotton dyed with reactive pigments for deep color longevity and zero shrinkage under cold wash cycles.",
      highlight: "PKR 7,990 • Standard Fit",
    },
  };

  const currentStory = slideStories[activeSlide.id] || {
    desc: "Crafted from 450 GSM pure French Terry in Lahore. Engineered for structural weight, timeless comfort, and effortless layering.",
    highlight: "PKR 7,490 • Cash on Delivery Available",
  };

  const handleNext = () => setCurrent((prev) => (prev + 1) % slides.length);
  const handlePrev = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <>
      <section className="relative w-full bg-[#F5F1EA] pt-6 sm:pt-10 pb-12 sm:pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main 2-Column Balanced Split Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Text, Story, Specifications & CTAs (6 cols on lg) */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6 text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="space-y-5"
                >
                  {/* Category Pill / Edition Tag */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2C3A2F]/10 border border-[#2C3A2F]/20 text-xs font-semibold text-[#2C3A2F]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2C3A2F]" />
                      <span>{activeSlide.edition}</span>
                    </span>

                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#EBE4D8] text-xs font-medium text-[#6B5E54]">
                      Look {current + 1} of {slides.length}
                    </span>
                  </div>

                  {/* Bold Editorial Title in Fraunces / Cormorant Garamond */}
                  <div className="space-y-1">
                    <h1 className="text-3xl sm:text-5xl lg:text-5xl font-bold font-display text-[#1F1A17] tracking-tight leading-[1.12]">
                      {activeSlide.title}
                    </h1>
                    <span className="font-editorial italic text-2xl sm:text-3xl text-[#6B5E54] block font-normal">
                      Handcrafted Heavyweight Essential
                    </span>
                  </div>

                  {/* 2-line Rich Description */}
                  <p className="text-sm sm:text-base text-[#6B5E54] font-normal leading-relaxed max-w-xl">
                    {currentStory.desc}
                  </p>

                  {/* Fabric & Price Spec Highlight */}
                  <div className="p-3.5 rounded-2xl bg-[#EBE4D8]/70 border border-[rgba(31,26,23,0.08)] flex flex-wrap items-center justify-between gap-3 text-xs max-w-lg">
                    <div className="flex items-center gap-2 text-[#1F1A17]">
                      <Sparkles className="w-4 h-4 text-[#B55A38]" />
                      <span className="font-semibold">{activeSlide.specs}</span>
                    </div>
                    <span className="text-[#6B5E54] font-medium">
                      {currentStory.highlight}
                    </span>
                  </div>

                  {/* Primary CTA Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-3.5">
                    <Link
                      href="/shop"
                      prefetch={true}
                      className="px-6 sm:px-7 py-3.5 rounded-full bg-[#2C3A2F] hover:bg-[#222D24] text-[#FAF8F4] font-semibold text-sm transition shadow-sm hover:shadow flex items-center gap-2 active:scale-[0.98] duration-150"
                    >
                      <span>Shop Collection</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href="/lookbook"
                      prefetch={true}
                      className="px-6 py-3.5 rounded-full bg-[#FAF8F4] hover:bg-[#EBE4D8] text-[#1F1A17] border border-[rgba(31,26,23,0.15)] hover:border-[#1F1A17] font-semibold text-sm transition flex items-center gap-2 active:scale-[0.98] duration-150"
                    >
                      <span>View Lookbook</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setLightboxImage(activeSlide)}
                      className="p-3.5 rounded-full bg-[#FAF8F4] hover:bg-[#EBE4D8] text-[#1F1A17] border border-[rgba(31,26,23,0.15)] transition active:scale-[0.96] duration-150"
                      title="Inspect Full Uncropped Photo"
                      aria-label="Inspect Full Uncropped Photo"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Navigation & Indicators */}
              <div className="pt-4 flex items-center gap-4 text-xs text-[#6B5E54]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="w-9 h-9 rounded-full border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] hover:bg-[#EBE4D8] text-[#1F1A17] flex items-center justify-center transition shadow-sm"
                    aria-label="Previous hoodie look"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="w-9 h-9 rounded-full border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] hover:bg-[#EBE4D8] text-[#1F1A17] flex items-center justify-center transition shadow-sm"
                    aria-label="Next hoodie look"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Dots */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[200px] sm:max-w-none">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === current ? "w-6 bg-[#2C3A2F]" : "w-1.5 bg-[rgba(31,26,23,0.2)]"
                      }`}
                      aria-label={`Jump to look ${i + 1}`}
                    />
                  ))}
                </div>

                <span className="text-[11px] font-medium text-[#6B5E54] shrink-0">
                  {current + 1} / {slides.length}
                </span>
              </div>

              {/* Value Badges (Inside Left Column with Zero Overlap) */}
              <div className="pt-2 grid grid-cols-3 gap-2.5 max-w-lg border-t border-[rgba(31,26,23,0.08)]">
                <div className="text-left">
                  <span className="block text-xs font-semibold text-[#1F1A17]">450 GSM Terry</span>
                  <span className="text-[11px] text-[#6B5E54]">Pure combed cotton</span>
                </div>
                <div className="text-left border-l border-[rgba(31,26,23,0.10)] pl-2.5">
                  <span className="block text-xs font-semibold text-[#1F1A17]">COD Nationwide</span>
                  <span className="text-[11px] text-[#6B5E54]">Pay at doorstep</span>
                </div>
                <div className="text-left border-l border-[rgba(31,26,23,0.10)] pl-2.5">
                  <span className="block text-xs font-semibold text-[#1F1A17]">7-Day Exchanges</span>
                  <span className="text-[11px] text-[#6B5E54]">Easy courier swap</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sculpted Rounded Arch with FULL Uncropped Visual Frame (6 cols on lg) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              {/* Sculpted Editorial Frame with Warm Sandstone Backdrop */}
              <div className="relative w-full max-w-md lg:max-w-none aspect-[4/5] sm:aspect-[3/4] max-h-[620px] rounded-3xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.12)] p-4 sm:p-6 shadow-md overflow-hidden flex items-center justify-center">
                
                {/* Subtle Arch Ambient Accent */}
                <div className="absolute inset-x-8 top-0 h-40 bg-gradient-to-b from-[#FAF8F4]/50 to-transparent rounded-t-3xl pointer-events-none" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative w-full h-full flex items-center justify-center"
                  >
                    {/* FULL Uncropped Image with object-contain — zero cut off prints or heads */}
                    <img
                      src={activeSlide.path}
                      alt={activeSlide.title}
                      className="w-full h-full object-contain object-center drop-shadow-xl"
                    />

                    {/* Subtle Overlay Pill on the Image Frame */}
                    <div className="absolute top-2 left-2 bg-[#FAF8F4]/90 backdrop-blur-md border border-[rgba(31,26,23,0.10)] px-3 py-1 rounded-full shadow-sm text-[11px] font-semibold text-[#1F1A17] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B55A38]" />
                      <span>{activeSlide.title}</span>
                    </div>

                    <div className="absolute bottom-2 right-2 bg-[#1F1A17]/85 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-medium text-[#FAF8F4] shadow-sm">
                      Full Editorial Cut
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Fullscreen Lightbox for Inspection */}
      <EditorialLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </>
  );
}
