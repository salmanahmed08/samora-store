"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  MessageCircle,
  ZoomIn,
  Heart,
  Ruler,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";
import { formatPKR, buildWhatsAppLink } from "@/lib/utils";
import { useCart } from "@/components/CartContext";
import { BRAND_CONTACT } from "@/lib/brand-assets";
import SoldOutBanner from "./SoldOutBanner";

interface ProductViewProps {
  product: {
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
    featured: boolean;
    status: string;
  };
  relatedProducts?: any[];
}

export default function ProductView({ product, relatedProducts = [] }: ProductViewProps) {
  const router = useRouter();
  const { addItem } = useCart();

  let images: string[] = [];
  try {
    images = JSON.parse(product.images);
  } catch {}
  if (images.length === 0) {
    images = ["/assets/editorial-hoodies/hoodie-editorial-01.jpeg"];
  }

  let sizes: string[] = [];
  try {
    sizes = JSON.parse(product.sizes);
  } catch {}
  if (!Array.isArray(sizes) || sizes.length === 0) {
    sizes = ["S", "M", "L", "XL"];
  }

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || "M");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "sizing" | "shipping">("specs");
  const [isSaved, setIsSaved] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Check Wishlist
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("samora_wishlist") || "[]");
      setIsSaved(stored.includes(product.id));
    } catch {}
  }, [product.id]);

  const toggleWishlist = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("samora_wishlist") || "[]");
      let updated: string[];
      if (stored.includes(product.id)) {
        updated = stored.filter((id: string) => id !== product.id);
        setIsSaved(false);
      } else {
        updated = [...stored, product.id];
        setIsSaved(true);
      }
      localStorage.setItem("samora_wishlist", JSON.stringify(updated));
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch {}
  };

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.pricePKR
      ? Math.round(((product.compareAtPrice - product.pricePKR) / product.compareAtPrice) * 100)
      : null;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      pricePKR: product.pricePKR,
      size: selectedSize,
      image: images[activeImageIndex] || images[0],
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      pricePKR: product.pricePKR,
      size: selectedSize,
      image: images[activeImageIndex] || images[0],
      quantity,
    });
    router.push("/checkout");
  };

  const whatsappMessage = `Assalam-o-Alaikum SAMORA! I would like to order:
Piece: ${product.title}
SKU: ${product.sku || product.id}
Size: ${selectedSize}
Quantity: ${quantity}
Price: ${formatPKR(product.pricePKR * quantity)}

Please confirm dispatch via Cash on Delivery to my address.`;

  const whatsappOrderUrl = buildWhatsAppLink(BRAND_CONTACT.whatsAppNumber, whatsappMessage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-16">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#6B5E54] flex items-center gap-2">
        <Link href="/" prefetch={true} className="hover:text-[#1F1A17] transition">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/shop?category=${encodeURIComponent(product.category || "")}`}
          prefetch={true}
          className="hover:text-[#1F1A17] transition"
        >
          {product.category || "Shop"}
        </Link>
        <span>/</span>
        <span className="text-[#1F1A17] font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Multi-Image Showcase (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Stage Image (Crisp uncropped 3:4 or 4:5 with contain) */}
          <div className="relative aspect-[4/5] rounded-3xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] overflow-hidden shadow-inner flex items-center justify-center p-6 sm:p-10">
            <img
              src={images[activeImageIndex]}
              alt={product.title}
              className="w-full h-full object-contain drop-shadow-md transition-all duration-300"
            />

            {product.status === "SOLD_OUT" ? (
              <SoldOutBanner size="md" />
            ) : discountPercent ? (
              <span className="absolute top-4 left-4 bg-[#B55A38] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm z-10">
                Save {discountPercent}%
              </span>
            ) : null}

            {/* Save / Wishlist Floating Button */}
            <button
              type="button"
              onClick={toggleWishlist}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-[#FAF8F4]/90 hover:bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] text-[#1F1A17] shadow-sm transition active:scale-90 z-10"
              title={isSaved ? "Saved to Wishlist" : "Save Piece"}
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-[#B55A38] text-[#B55A38]" : ""}`} />
            </button>
          </div>

          {/* Swipeable / Clickable Thumbnails Strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-24 rounded-2xl bg-[#EBE4D8] border overflow-hidden p-1 shrink-0 transition ${
                    activeImageIndex === idx
                      ? "border-[#1F1A17] ring-2 ring-[#2C3A2F]/20 shadow-sm"
                      : "border-[rgba(31,26,23,0.10)] opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Garment Specs, Sizing & Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-[#2C3A2F] uppercase tracking-wider px-3 py-1 rounded-full bg-[#2C3A2F]/10 border border-[#2C3A2F]/20">
                {product.category || "Haute Streetwear"}
              </span>

              {product.sku && (
                <span className="text-[11px] font-mono text-[#6B5E54]">SKU: {product.sku}</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-serif text-[#1F1A17] tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1A17]">
                {formatPKR(product.pricePKR)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.pricePKR && (
                <span className="text-sm sm:text-base text-[#6B5E54] line-through">
                  {formatPKR(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Smart Trust & Urgency Strip */}
            <div className="p-3 rounded-2xl bg-[#EBE4D8]/60 border border-[rgba(31,26,23,0.08)] flex items-center justify-between text-xs text-[#2C3A2F]">
              <span className="flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#B55A38]" />
                <span>Verified 450 GSM French Terry Cotton</span>
              </span>
              <span className="text-[11px] text-[#6B5E54]">Nationwide COD</span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#6B5E54] leading-relaxed pt-1">
              {product.description ||
                "Bespoke heavyweight streetwear silhouette crafted with 450 GSM French Terry combed cotton. Custom drop-shoulder engineering, relaxed boxy drape, and pre-shrunk enzyme wash."}
            </p>
          </div>

          {/* Size Selector + Size Guide Link */}
          <div className="space-y-2.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#1F1A17] font-medium">
                Select Size: <strong className="text-[#1F1A17] font-bold">{selectedSize}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-[#2C3A2F] hover:underline text-xs flex items-center gap-1 font-semibold"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>View Size Guide (Inches)</span>
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {sizes.map((s) => {
                const isSelected = selectedSize === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                      isSelected
                        ? "bg-[#1F1A17] text-white shadow-sm"
                        : "bg-[#FAF8F4] text-[#1F1A17] border border-[rgba(31,26,23,0.12)] hover:border-[#1F1A17]"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs text-[#1F1A17] font-medium">Quantity:</span>
            <div className="flex items-center rounded-xl border border-[rgba(31,26,23,0.12)] bg-[#FAF8F4]">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1.5 text-[#6B5E54] hover:text-[#1F1A17] text-sm"
              >
                -
              </button>
              <span className="px-3 py-1.5 text-xs font-semibold text-[#1F1A17]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1.5 text-[#6B5E54] hover:text-[#1F1A17] text-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            {product.status === "SOLD_OUT" ? (
              <div className="space-y-3">
                <a
                  href={buildWhatsAppLink(
                    BRAND_CONTACT.whatsAppNumber,
                    `Assalam-o-Alaikum SAMORA! I noticed the ${product.title} (SKU: ${product.sku || product.id}) is Sold Out. Could you let me know if similar pieces or restocks are coming soon?`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-full bg-[#1F1A17] hover:bg-[#B55A38] text-white text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-[#1F1A17]/25 active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4 text-[#FAF8F4]" />
                  <span>Sold Out &bull; Ask Similar on WhatsApp</span>
                </a>
                <p className="text-center text-[11px] text-[#6B5E54]">
                  This artisanal edition is fully committed. Message our atelier team to inquire about related releases.
                </p>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full py-4 rounded-full bg-[#2C3A2F] text-white text-sm font-semibold hover:bg-[#1F1A17] transition flex items-center justify-center gap-2 shadow-lg shadow-[#2C3A2F]/20 active:scale-[0.98] disabled:opacity-40"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="w-full py-3 rounded-full bg-[#FAF8F4] hover:bg-[#EBE4D8] border border-[rgba(31,26,23,0.15)] text-[#1F1A17] text-xs font-semibold transition flex items-center justify-center gap-1.5 active:scale-[0.98] shadow-sm disabled:opacity-40"
                  >
                    <Zap className="w-4 h-4 text-[#B55A38]" />
                    <span>Buy Now (COD)</span>
                  </button>

                  <a
                    href={whatsappOrderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-full bg-[#EBE4D8] hover:bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] text-[#1F1A17] text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4 text-[#2C3A2F]" />
                    <span>Order on WhatsApp</span>
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Trust Guarantees & Step-by-Step Order Help */}
          <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] space-y-3 text-xs text-[#1F1A17] shadow-sm">
            <div className="pb-2 border-b border-[rgba(31,26,23,0.08)]">
              <span className="font-bold text-[11px] text-[#2C3A2F] uppercase tracking-wider block mb-1">
                Easy Ordering for Every Customer:
              </span>
              <p className="text-[11px] text-[#6B5E54] leading-relaxed">
                1. Select your size &bull; 2. Click <strong>Add to Cart</strong> or <strong>Buy Now</strong> &bull; 3. Enter your address for Cash on Delivery. You can also order directly via WhatsApp!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#2C3A2F]" />
              <span>Free delivery on orders over PKR 5,000</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2C3A2F]" />
              <span>Cash on Delivery (COD) nationwide</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#2C3A2F]" />
              <span>7-Day doorstep size exchange</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products ("Complete The Fit") */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-[rgba(31,26,23,0.08)] space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold text-[#B55A38] uppercase tracking-wider block mb-1">
                Curated Recommendations
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1A17]">
                Complete The Fit
              </h2>
            </div>
            <Link
              href="/shop"
              prefetch={true}
              className="text-xs font-semibold text-[#2C3A2F] hover:underline flex items-center gap-1"
            >
              <span>View All Pieces</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => {
              let relImgs: string[] = [];
              try {
                relImgs = JSON.parse(rel.images);
              } catch {
                relImgs = [];
              }
              const relCover = relImgs[0] || "/assets/editorial-hoodies/hoodie-editorial-01.jpeg";

              return (
                <Link
                  key={rel.id}
                  href={`/product/${rel.slug}`}
                  prefetch={true}
                  className="group rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="aspect-[4/5] rounded-2xl bg-[#EBE4D8] overflow-hidden p-3 flex items-center justify-center mb-3">
                    <img
                      src={relCover}
                      alt={rel.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-[#2C3A2F] uppercase tracking-wider block">
                      {rel.category}
                    </span>
                    <h3 className="text-sm font-bold font-serif text-[#1F1A17] group-hover:text-[#B55A38] transition truncate">
                      {rel.title}
                    </h3>
                    <span className="text-xs font-bold font-serif text-[#1F1A17] block">
                      {formatPKR(rel.pricePKR)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Sizing Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1F1A17]/60 backdrop-blur-sm"
            onClick={() => setIsSizeGuideOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] p-6 sm:p-8 shadow-2xl z-10 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[rgba(31,26,23,0.08)] pb-4">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-[#2C3A2F]" />
                <h3 className="text-lg font-bold font-serif text-[#1F1A17]">Garment Size Guide</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="text-xs text-[#6B5E54] hover:text-[#1F1A17] font-semibold"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-[#6B5E54] leading-relaxed">
              All measurements are in inches. Our garments feature an intentional boxy streetwear drape with dropped shoulders.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EBE4D8] text-[#1F1A17] font-semibold">
                  <tr>
                    <th className="p-2.5">Size</th>
                    <th className="p-2.5">Chest</th>
                    <th className="p-2.5">Length</th>
                    <th className="p-2.5">Shoulder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(31,26,23,0.08)]">
                  <tr>
                    <td className="p-2.5 font-bold">Small (S)</td>
                    <td className="p-2.5">42"</td>
                    <td className="p-2.5">27"</td>
                    <td className="p-2.5">22"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Medium (M)</td>
                    <td className="p-2.5">45"</td>
                    <td className="p-2.5">28.5"</td>
                    <td className="p-2.5">23.5"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Large (L)</td>
                    <td className="p-2.5">48"</td>
                    <td className="p-2.5">29.5"</td>
                    <td className="p-2.5">25"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">X-Large (XL)</td>
                    <td className="p-2.5">51"</td>
                    <td className="p-2.5">30.5"</td>
                    <td className="p-2.5">26.5"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#EBE4D8]/60 text-[11px] text-[#6B5E54] space-y-1">
              <span className="font-semibold text-[#1F1A17] block">Still unsure of your sizing?</span>
              <p>Message our Lahore atelier on WhatsApp with your height & weight for a personalized fit suggestion.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
