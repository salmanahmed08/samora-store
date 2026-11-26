"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Check,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { formatPKR, buildWhatsAppLink } from "@/lib/utils";
import { BRAND_CONTACT } from "@/lib/brand-assets";
import { useCart } from "./CartContext";
import SoldOutBanner from "./SoldOutBanner";

export interface QuickViewProduct {
  id: string;
  sku?: string | null;
  title: string;
  slug: string;
  description: string;
  pricePKR: number;
  compareAtPrice: number | null;
  category: string;
  sizes: string;
  stock: number;
  images: string;
  cutoutImages?: string | null;
  syncSource?: string;
  featured?: boolean;
  status?: string;
  soldOutAt?: string | Date | null;
}

interface ProductQuickViewModalProps {
  product: QuickViewProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickViewModal({
  product,
  isOpen,
  onClose,
}: ProductQuickViewModalProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [added, setAdded] = useState(false);

  // Parse images & sizes safely
  let images: string[] = [];
  let sizes: string[] = ["S", "M", "L", "XL"];

  if (product) {
    try {
      images = typeof product.images === "string" ? JSON.parse(product.images) : product.images;
    } catch {
      images = [];
    }
    if (!images || images.length === 0) {
      images = ["/assets/editorial-hoodies/hoodie-editorial-01.jpeg"];
    }

    try {
      sizes = typeof product.sizes === "string" ? JSON.parse(product.sizes) : product.sizes;
    } catch {
      sizes = ["S", "M", "L", "XL"];
    }
  }

  // Reset states when a new product is opened
  useEffect(() => {
    if (product) {
      setSelectedSize(sizes[0] || "M");
      setQuantity(1);
      setActiveImageIndex(0);
      setAdded(false);
    }
  }, [product]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      pricePKR: product.pricePKR,
      size: selectedSize,
      image: images[0] || "/assets/editorial-hoodies/hoodie-editorial-01.jpeg",
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const whatsappMessage = `Assalam-o-Alaikum SAMORA! I would like to order:
Piece: ${product.title}
Size: ${selectedSize}
Quantity: ${quantity}
Price: ${formatPKR(product.pricePKR * quantity)}

Please confirm dispatch to my address via Cash on Delivery.`;

  const whatsappOrderUrl = buildWhatsAppLink(BRAND_CONTACT.whatsAppNumber, whatsappMessage);

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.pricePKR
      ? Math.round(((product.compareAtPrice - product.pricePKR) / product.compareAtPrice) * 100)
      : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Warm Blurred Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1F1A17]/60 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 scrollbar-thin"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 p-2 rounded-full bg-[#EBE4D8] hover:bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] text-[#1F1A17] transition shadow-sm z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Image Stage */}
            <div className="md:col-span-6 space-y-3">
              <div className="relative aspect-[3/4] rounded-2xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] overflow-hidden shadow-inner flex items-center justify-center p-3">
                <img
                  src={images[activeImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                />

                {product.status === "SOLD_OUT" ? (
                  <SoldOutBanner size="sm" />
                ) : discountPercent ? (
                  <span className="absolute top-3 left-3 bg-[#B55A38] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                    Save {discountPercent}%
                  </span>
                ) : null}
              </div>

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-16 rounded-xl bg-[#EBE4D8] border overflow-hidden shrink-0 transition ${
                        activeImageIndex === idx
                          ? "border-[#1F1A17] ring-2 ring-[#2C3A2F]/20"
                          : "border-[rgba(31,26,23,0.12)] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Details & Actions */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between pr-8">
                  <span className="text-[11px] font-semibold text-[#2C3A2F] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#2C3A2F]/10 border border-[#2C3A2F]/20">
                    {product.category}
                  </span>
                  <span className="text-xs text-[#2C3A2F] font-medium">
                    {product.stock > 0 ? "In Stock • Ships in 24h" : "Sold Out"}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1A17] tracking-tight leading-snug">
                  {product.title}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-[#1F1A17]">
                    {formatPKR(product.pricePKR)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.pricePKR && (
                    <span className="text-sm text-[#6B5E54] line-through">
                      {formatPKR(product.compareAtPrice)}
                    </span>
                  )}
                  <span className="text-xs text-[#6B5E54] font-medium">
                    Cash on Delivery
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#6B5E54] leading-relaxed border-t border-[rgba(31,26,23,0.10)] pt-3">
                  {product.description ||
                    "Bespoke heavyweight streetwear silhouette crafted with 450 GSM French Terry combed cotton. Custom drop-shoulder engineering, relaxed boxy drape, and pre-shrunk enzyme wash."}
                </p>

                {/* Size Selection */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs text-[#1F1A17] font-medium block">
                    Select Size: <strong className="font-bold">{selectedSize}</strong>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => {
                      const isSelected = selectedSize === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`w-11 h-9 rounded-xl text-xs font-semibold transition ${
                            isSelected
                              ? "bg-[#1F1A17] text-white shadow-sm"
                              : "bg-[#FAF8F4] text-[#1F1A17] border border-[rgba(31,26,23,0.15)] hover:border-[#1F1A17]"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-[#1F1A17] font-medium">Quantity:</span>
                  <div className="flex items-center rounded-xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4]">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1 text-sm text-[#6B5E54] hover:text-[#1F1A17]"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-semibold text-[#1F1A17]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-1 text-sm text-[#6B5E54] hover:text-[#1F1A17]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5 pt-3 border-t border-[rgba(31,26,23,0.10)]">
                {product.status === "SOLD_OUT" ? (
                  <a
                    href={buildWhatsAppLink(
                      BRAND_CONTACT.whatsAppNumber,
                      `Assalam-o-Alaikum SAMORA! I noticed the ${product.title} (SKU: ${product.sku || product.id}) is Sold Out. Could you let me know if similar pieces or restocks are coming soon?`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-full bg-[#1F1A17] hover:bg-[#B55A38] text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-md shadow-[#1F1A17]/20 active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4 text-[#FAF8F4]" />
                    <span>Sold Out &bull; Ask Similar on WhatsApp</span>
                  </a>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="w-full py-3.5 rounded-full bg-[#2C3A2F] text-white text-xs font-semibold hover:bg-[#1F1A17] transition flex items-center justify-center gap-2 shadow-md shadow-[#2C3A2F]/20 disabled:opacity-40"
                    >
                      {added ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Cart &bull; {formatPKR(product.pricePKR * quantity)}</span>
                        </>
                      )}
                    </button>

                    <a
                      href={whatsappOrderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-full bg-[#EBE4D8] hover:bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] text-[#1F1A17] text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4 text-[#2C3A2F]" />
                      <span>Order Directly on WhatsApp</span>
                    </a>
                  </>
                )}

                {/* How To Order Guidance Strip for First-Time Shoppers */}
                <div className="p-3 rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.08)] space-y-1 text-xs text-[#1F1A17]">
                  <span className="font-semibold text-[11px] text-[#2C3A2F] uppercase tracking-wider block">
                    How to Order in 3 Simple Steps:
                  </span>
                  <p className="text-[11px] text-[#6B5E54] leading-relaxed">
                    1. Pick your size above &bull; 2. Tap <strong>Add to Cart</strong> or <strong>Order on WhatsApp</strong> &bull; 3. Pay Cash upon delivery at your doorstep anywhere in Pakistan!
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-[#6B5E54]">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#2C3A2F]" />
                    <span>Express COD Delivery</span>
                  </div>

                  <Link
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 font-semibold text-[#2C3A2F] hover:text-[#B55A38] transition"
                  >
                    <span>Full Product Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
