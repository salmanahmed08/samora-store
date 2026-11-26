"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag, Eye, MessageCircle, Sparkles } from "lucide-react";
import { formatPKR, buildWhatsAppLink } from "@/lib/utils";
import { BRAND_CONTACT } from "@/lib/brand-assets";
import ProductQuickViewModal, { QuickViewProduct } from "./ProductQuickViewModal";
import SoldOutBanner from "./SoldOutBanner";

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder?: number;
}

interface RopeHangerSliderProps {
  products: QuickViewProduct[];
  categories: Category[];
  settings?: {
    hangerEnabled?: string;
    hangerSpeed?: string;
    hangerTitle?: string;
    hangerSubtitle?: string;
  };
}

// Realistic Wooden Hanger SVG with Metallic Swivel Hook
function WoodenHangerSVG({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="w-full flex justify-center items-end -mb-1 select-none pointer-events-none relative z-10">
      <svg
        viewBox="0 0 280 90"
        className="w-56 sm:w-64 h-auto drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Metallic Hook that loops over the rail */}
        <path
          d="M 140 38 C 140 22 144 10 152 10 C 159 10 162 17 160 25 C 158 31 150 33 148 38 C 147 40 147 44 147 48"
          stroke="url(#brassHookGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Swivel Rivet */}
        <ellipse cx="147" cy="48" rx="3.5" ry="2.5" fill="#C5A059" stroke="#7A5826" strokeWidth="1" />

        {/* Sculpted Wooden Shoulder Bar */}
        <path
          d="M 147 48 C 165 52 225 64 265 72 C 272 73 273 78 268 81 C 255 83 205 73 147 62 C 89 73 39 83 26 81 C 21 78 22 73 29 72 C 69 64 129 52 147 48 Z"
          fill="url(#woodBarGrad)"
          stroke="#3B2618"
          strokeWidth="1.2"
        />

        {/* Wooden Highlights & Grain Sheen */}
        <path
          d="M 35 73 C 75 66 130 55 147 51 C 164 55 219 66 259 73"
          stroke="rgba(245, 230, 210, 0.35)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Lower Trouser Crossbar */}
        <rect
          x="48"
          y="76"
          width="198"
          height="3"
          rx="1.5"
          fill="url(#woodBarGradDark)"
          stroke="#2C1B10"
          strokeWidth="0.8"
        />

        {/* Hanging Ribbon Straps leading to the Garment */}
        <line x1="72" y1="78" x2="72" y2="90" stroke="rgba(31, 26, 23, 0.4)" strokeWidth="1.5" strokeDasharray="2 2" />
        <line x1="222" y1="78" x2="222" y2="90" stroke="rgba(31, 26, 23, 0.4)" strokeWidth="1.5" strokeDasharray="2 2" />

        <defs>
          {/* Metallic Antique Brass Hook Gradient */}
          <linearGradient id="brassHookGrad" x1="140" y1="10" x2="162" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E2C178" />
            <stop offset="0.4" stopColor="#B88A3B" />
            <stop offset="0.8" stopColor="#876024" />
            <stop offset="1" stopColor="#5C3E14" />
          </linearGradient>

          {/* Luxury Espresso-Stained Beechwood Bar Gradient */}
          <linearGradient id="woodBarGrad" x1="26" y1="50" x2="268" y2="82" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4A3222" />
            <stop offset="0.3" stopColor="#69462F" />
            <stop offset="0.5" stopColor="#533725" />
            <stop offset="0.7" stopColor="#69462F" />
            <stop offset="1" stopColor="#3E281A" />
          </linearGradient>

          <linearGradient id="woodBarGradDark" x1="48" y1="76" x2="246" y2="79" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2E1C12" />
            <stop offset="0.5" stopColor="#4A3222" />
            <stop offset="1" stopColor="#2E1C12" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function RopeHangerSlider({
  products = [],
  categories = [],
  settings = {},
}: RopeHangerSliderProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeModalProduct, setActiveModalProduct] = useState<QuickViewProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const hangerTitle = settings.hangerTitle || "Fresh Off The Rail";
  const hangerSubtitle =
    settings.hangerSubtitle || "Click any piece hanging on the line to inspect details";
  const hangerSpeed = settings.hangerSpeed || "slow";

  // Filter products by selected category
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === "all") return true;
    const catMatch =
      p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      p.category?.toLowerCase().replace(/\s+/g, "-") === selectedCategory.toLowerCase();
    return catMatch;
  });

  // Calculate marquee speed in seconds
  const animationDuration =
    hangerSpeed === "gentle" ? 65 : hangerSpeed === "medium" ? 35 : 48;

  const handleOpenQuickView = (p: QuickViewProduct) => {
    setActiveModalProduct(p);
    setIsModalOpen(true);
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const whatsappInquiryUrl = buildWhatsAppLink(
    BRAND_CONTACT.whatsAppNumber,
    "Assalam-o-Alaikum SAMORA! I'm browsing the clothes rail and would like to know when new pieces drop."
  );

  return (
    <section className="relative w-full py-16 sm:py-24 bg-[#F5F1EA] overflow-hidden border-b border-[rgba(31,26,23,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        {/* Header Strip: Title, Subtitle & Manual Glide Arrows */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C3A2F]/10 border border-[#2C3A2F]/20 text-[#2C3A2F] text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Wardrobe Rail</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#1F1A17] tracking-tight">
              {hangerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5E54] mt-1.5 max-w-xl">
              {hangerSubtitle}
            </p>
          </div>

          {/* Glide Arrows & Category Indicator */}
          <div className="flex items-center gap-3 self-start md:self-end">
            <button
              onClick={() => handleScroll("left")}
              aria-label="Scroll left"
              className="w-10 h-10 rounded-full bg-[#FAF8F4] hover:bg-[#EBE4D8] border border-[rgba(31,26,23,0.15)] text-[#1F1A17] flex items-center justify-center transition shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              aria-label="Scroll right"
              className="w-10 h-10 rounded-full bg-[#FAF8F4] hover:bg-[#EBE4D8] border border-[rgba(31,26,23,0.15)] text-[#1F1A17] flex items-center justify-center transition shadow-sm active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs Above the Clothesline */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition shrink-0 ${
              selectedCategory === "all"
                ? "bg-[#2C3A2F] text-white shadow-sm"
                : "bg-[#FAF8F4] text-[#1F1A17] border border-[rgba(31,26,23,0.12)] hover:border-[#1F1A17]"
            }`}
          >
            All Pieces ({products.length})
          </button>

          {categories.map((cat) => {
            const isSelected =
              selectedCategory.toLowerCase() === cat.slug.toLowerCase() ||
              selectedCategory.toLowerCase() === cat.name.toLowerCase();

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition shrink-0 ${
                  isSelected
                    ? "bg-[#2C3A2F] text-white shadow-sm"
                    : "bg-[#FAF8F4] text-[#1F1A17] border border-[rgba(31,26,23,0.12)] hover:border-[#1F1A17]"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          THE FULL-WIDTH CLOTHESLINE ROPE & SUSPENDED HANGERS STAGE
          ========================================================================= */}
      <div
        className="relative w-full pt-8 pb-10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          setHoveredIndex(null);
        }}
        onTouchStart={() => setIsPaused(true)}
      >
        {/* Realistic Clothesline Rope / Boutique Suspension Rail */}
        <div className="absolute top-12 left-0 right-0 w-full z-0 pointer-events-none flex items-center">
          {/* Left Wall Mounting Bracket */}
          <div className="w-5 h-8 bg-[#3E281A] border-r-2 border-[#8C6239] rounded-r-md shadow-md shrink-0" />

          {/* Dual-Tone Braided Suspended Clothesline Wire/Rope */}
          <div className="relative flex-1 h-[6px] bg-gradient-to-r from-[#5C3E14] via-[#B88A3B] to-[#5C3E14] shadow-sm">
            {/* Subtle Braided Weave Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #1F1A17 0, #1F1A17 2px, transparent 0, transparent 4px)",
              }}
            />
          </div>

          {/* Right Wall Mounting Bracket */}
          <div className="w-5 h-8 bg-[#3E281A] border-l-2 border-[#8C6239] rounded-l-md shadow-md shrink-0" />
        </div>

        {/* Scroll Container / Marquee Stage */}
        <div
          ref={scrollContainerRef}
          className="relative w-full overflow-x-auto scrollbar-none px-4 sm:px-8 z-10 flex items-start"
          style={{ scrollBehavior: "smooth" }}
        >
          {/* CASE A: LIVE PRODUCTS EXIST ON THE HANGER */}
          {filteredProducts.length > 0 ? (
            <div className="flex gap-8 sm:gap-12 py-2">
              {filteredProducts.map((product, idx) => {
                let images: string[] = [];
                let cutouts: string[] = [];
                try {
                  images = typeof product.images === "string" ? JSON.parse(product.images) : product.images;
                } catch {
                  images = [];
                }
                try {
                  cutouts = typeof (product as any).cutoutImages === "string" ? JSON.parse((product as any).cutoutImages) : (product as any).cutoutImages || [];
                } catch {
                  cutouts = [];
                }

                // If cutout image is available, use transparent cutout on the wooden hanger!
                const displayImage =
                  cutouts[0] ||
                  images[0] ||
                  "/assets/editorial-hoodies/hoodie-editorial-01.jpeg";

                const isCardHovered = hoveredIndex === idx;

                return (
                  <motion.div
                    key={product.id}
                    className="relative shrink-0 flex flex-col items-center cursor-pointer group"
                    style={{ transformOrigin: "top center" }}
                    animate={
                      isCardHovered
                        ? { rotate: [-2.5, 2, -1, 0] }
                        : isPaused
                        ? { rotate: 0 }
                        : {
                            rotate: [
                              -0.8 - (idx % 2) * 0.4,
                              0.8 + (idx % 2) * 0.4,
                              -0.8 - (idx % 2) * 0.4,
                            ],
                          }
                    }
                    transition={
                      isCardHovered
                        ? { type: "spring", stiffness: 140, damping: 10 }
                        : {
                            duration: 3.8 + (idx % 3) * 0.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                    }
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => handleOpenQuickView(product)}
                  >
                    {/* Realistic Wooden Hanger SVG */}
                    <WoodenHangerSVG isHovered={isCardHovered} />

                    {/* Suspended Garment Showcase Card */}
                    <div className="relative w-64 sm:w-72 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] p-4 shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1">
                      {/* Swing-Tag Style Luxury Price Tag (Hanging from top corner) */}
                      <div className="absolute -top-3 -right-2 z-20 flex flex-col items-center">
                        {/* Hanging tag string */}
                        <div className="w-[1.5px] h-3 bg-[#6B5E54]/60" />
                        {/* Paper Price Tag */}
                        <div className="bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-lg px-2.5 py-1 shadow-md text-center transform rotate-6 group-hover:rotate-0 transition-transform">
                          <span className="text-[10px] text-[#6B5E54] block leading-none uppercase tracking-wider">
                            PKR
                          </span>
                          <span className="text-xs font-bold text-[#1F1A17] font-serif">
                            {formatPKR(product.pricePKR).replace("PKR ", "")}
                          </span>
                        </div>
                      </div>

                      {/* Garment Image Stage */}
                      <div className="relative aspect-[3/4] rounded-2xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.08)] overflow-hidden flex items-center justify-center p-3 mb-3">
                        <img
                          src={displayImage}
                          alt={product.title}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />

                        {product.status === "SOLD_OUT" && <SoldOutBanner size="sm" />}

                        {/* Hover Quick-View Pill Overlay */}
                        <div className="absolute inset-0 bg-[#1F1A17]/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-4 py-2 rounded-full bg-[#FAF8F4] text-[#1F1A17] text-xs font-semibold shadow-md flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform">
                            <Eye className="w-3.5 h-3.5 text-[#2C3A2F]" />
                            <span>Quick View</span>
                          </span>
                        </div>
                      </div>

                      {/* Product Header & Meta */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-[#2C3A2F] uppercase tracking-wider block">
                          {product.category}
                        </span>
                        <h4 className="text-sm font-semibold font-serif text-[#1F1A17] line-clamp-1 group-hover:text-[#B55A38] transition-colors">
                          {product.title}
                        </h4>
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-[#1F1A17] font-bold">
                            {formatPKR(product.pricePKR)}
                          </span>
                          <span className="text-[11px] text-[#2C3A2F] font-medium">
                            Cash on Delivery
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* CASE B: ZERO PRODUCTS YET (CHARMING BOUTIQUE EMPTY-RAIL STATE) */
            <div className="w-full flex flex-col items-center py-6 px-4">
              {/* 4 Gently Swaying Empty Wooden Hangers */}
              <div className="flex justify-center gap-10 sm:gap-16 opacity-85 select-none mb-6">
                {[0, 1, 2, 3].map((hangerIdx) => (
                  <motion.div
                    key={hangerIdx}
                    className="flex flex-col items-center"
                    style={{ transformOrigin: "top center" }}
                    animate={{
                      rotate: [-1.2 + hangerIdx * 0.4, 1.2 - hangerIdx * 0.4, -1.2 + hangerIdx * 0.4],
                    }}
                    transition={{
                      duration: 3.5 + hangerIdx * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <WoodenHangerSVG />
                    {/* Ghost Garment Silhouette */}
                    <div className="w-48 sm:w-56 h-60 rounded-3xl border border-dashed border-[rgba(31,26,23,0.18)] bg-[#EBE4D8]/20 flex flex-col items-center justify-center p-4 text-center mt-[-6px]">
                      <div className="w-10 h-10 rounded-full bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] flex items-center justify-center text-[#6B5E54] mb-2">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-serif font-semibold text-[#1F1A17]">
                        Bespoke Drop #{hangerIdx + 1}
                      </span>
                      <span className="text-[10px] text-[#6B5E54] mt-0.5">
                        In Handcrafted Production
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Hanging Note Card */}
              <div className="max-w-md w-full rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] p-6 text-center shadow-md space-y-3">
                <span className="text-xs font-semibold text-[#2C3A2F] uppercase tracking-wider block">
                  Atelier Status &bull; 0 Pieces Live
                </span>
                <h3 className="text-xl font-bold font-serif text-[#1F1A17]">
                  New Pieces Hitting the Rail Soon
                </h3>
                <p className="text-xs text-[#6B5E54] leading-relaxed">
                  Our bespoke heavyweight silhouettes are being cut and tailored in Lahore. Add products via your Admin Dashboard or connect with us directly on WhatsApp.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={whatsappInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#2C3A2F] text-white text-xs font-semibold hover:bg-[#1F1A17] transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Priority Drop Alerts</span>
                  </a>
                  <a
                    href="/admin/products"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#FAF8F4] text-[#1F1A17] text-xs font-semibold border border-[rgba(31,26,23,0.15)] hover:bg-[#EBE4D8] transition"
                  >
                    + Manage Catalog
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Quick-View Modal */}
      <ProductQuickViewModal
        product={activeModalProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActiveModalProduct(null);
        }}
      />
    </section>
  );
}
