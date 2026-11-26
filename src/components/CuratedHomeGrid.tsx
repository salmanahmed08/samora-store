"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Eye, Check, Sparkles, MessageCircle } from "lucide-react";
import { formatPKR, buildWhatsAppLink } from "@/lib/utils";
import { BRAND_CONTACT } from "@/lib/brand-assets";
import { useCart } from "./CartContext";
import ProductQuickViewModal, { QuickViewProduct } from "./ProductQuickViewModal";
import SoldOutBanner from "./SoldOutBanner";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CuratedHomeGridProps {
  products: QuickViewProduct[];
  categories: Category[];
  homeLimit?: number;
}

export default function CuratedHomeGrid({
  products = [],
  categories = [],
  homeLimit = 8,
}: CuratedHomeGridProps) {
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeModalProduct, setActiveModalProduct] = useState<QuickViewProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Filter products by category and restrict to homeLimit
  const filteredProducts = products
    .filter((p) => {
      if (selectedCategory === "all") return true;
      const catMatch =
        p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        p.category?.toLowerCase().replace(/\s+/g, "-") === selectedCategory.toLowerCase();
      return catMatch;
    })
    .slice(0, homeLimit);

  const handleQuickAdd = (p: QuickViewProduct, e: React.MouseEvent) => {
    e.stopPropagation();

    let sizes = ["M"];
    try {
      sizes = typeof p.sizes === "string" ? JSON.parse(p.sizes) : p.sizes;
    } catch {}

    let images = ["/assets/editorial-hoodies/hoodie-editorial-01.jpeg"];
    try {
      images = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
    } catch {}

    addItem({
      productId: p.id,
      title: p.title,
      slug: p.slug,
      pricePKR: p.pricePKR,
      size: sizes[0] || "M",
      image: images[0] || "/assets/editorial-hoodies/hoodie-editorial-01.jpeg",
      quantity: 1,
    });

    setAddedIds((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [p.id]: false }));
    }, 2000);
  };

  const whatsappInquiryUrl = buildWhatsAppLink(
    BRAND_CONTACT.whatsAppNumber,
    "Assalam-o-Alaikum SAMORA! I'm interested in your upcoming drop and want to pre-order."
  );

  return (
    <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[rgba(31,26,23,0.08)]">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C3A2F]/10 border border-[#2C3A2F]/20 text-[#2C3A2F] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Collection</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#1F1A17] tracking-tight">
            Featured Drops
          </h2>
          <p className="text-xs sm:text-sm text-[#6B5E54] mt-1.5 max-w-xl">
            Heavyweight 450 GSM French Terry combed cotton silhouettes, crafted for everyday boxy comfort and timeless durability.
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#2C3A2F] hover:text-[#B55A38] transition group self-start md:self-end"
        >
          <span>View All Products</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition shrink-0 ${
            selectedCategory === "all"
              ? "bg-[#2C3A2F] text-white shadow-sm"
              : "bg-[#FAF8F4] text-[#1F1A17] border border-[rgba(31,26,23,0.12)] hover:border-[#1F1A17]"
          }`}
        >
          All Items ({products.length})
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

      {/* Product Grid or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            let images: string[] = [];
            try {
              images = typeof product.images === "string" ? JSON.parse(product.images) : product.images;
            } catch {
              images = [];
            }
            const displayImage =
              images[0] || "/assets/editorial-hoodies/hoodie-editorial-01.jpeg";
            const secondaryImage = images[1] || null;

            const discountPercent =
              product.compareAtPrice && product.compareAtPrice > product.pricePKR
                ? Math.round(
                    ((product.compareAtPrice - product.pricePKR) / product.compareAtPrice) * 100
                  )
                : null;

            const isAdded = addedIds[product.id];

            return (
              <div
                key={product.id}
                onClick={() => {
                  setActiveModalProduct(product);
                  setIsModalOpen(true);
                }}
                className="group rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Image Container with smooth hover swap if 2nd angle exists */}
                  <div className="relative aspect-[3/4] rounded-2xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.08)] overflow-hidden flex items-center justify-center p-3 mb-4">
                    <img
                      src={displayImage}
                      alt={product.title}
                      className={`w-full h-full object-contain transition-all duration-500 ${
                        secondaryImage ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"
                      }`}
                    />
                    {secondaryImage && (
                      <img
                        src={secondaryImage}
                        alt={`${product.title} back / alternate`}
                        className="w-full h-full object-contain absolute inset-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                      />
                    )}

                    {product.status === "SOLD_OUT" ? (
                      <SoldOutBanner size="sm" />
                    ) : discountPercent ? (
                      <span className="absolute top-3 left-3 bg-[#B55A38] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm z-10">
                        Save {discountPercent}%
                      </span>
                    ) : null}

                    {/* Multi-image thumbnail count pill */}
                    {images.length > 1 && (
                      <span className="absolute bottom-3 right-3 bg-[#1F1A17]/70 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded-full shadow-sm z-10">
                        {images.length} Photos
                      </span>
                    )}

                    {/* Quick View Hover Button */}
                    <div className="absolute inset-0 bg-[#1F1A17]/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 rounded-full bg-[#FAF8F4] text-[#1F1A17] text-xs font-semibold shadow-md flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform">
                        <Eye className="w-3.5 h-3.5 text-[#2C3A2F]" />
                        <span>Quick View</span>
                      </span>
                    </div>
                  </div>

                  {/* Category & Title */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#2C3A2F] uppercase tracking-wider block">
                      {product.category}
                    </span>
                    <h3 className="text-base font-semibold font-serif text-[#1F1A17] group-hover:text-[#B55A38] transition line-clamp-1">
                      {product.title}
                    </h3>
                  </div>
                </div>

                {/* Price & Quick Add Button */}
                <div className="pt-4 border-t border-[rgba(31,26,23,0.08)] mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#1F1A17]">
                      {formatPKR(product.pricePKR)}
                    </div>
                    {product.compareAtPrice && product.compareAtPrice > product.pricePKR && (
                      <div className="text-[11px] text-[#6B5E54] line-through">
                        {formatPKR(product.compareAtPrice)}
                      </div>
                    )}
                  </div>

                  {product.status === "SOLD_OUT" ? (
                    <a
                      href={buildWhatsAppLink(
                        BRAND_CONTACT.whatsAppNumber,
                        `Assalam-o-Alaikum SAMORA! I noticed the ${product.title} (SKU: ${product.sku || product.id}) is Sold Out. Could you let me know if similar pieces or restocks are coming soon?`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 rounded-full bg-[#1F1A17] hover:bg-[#B55A38] text-white text-[10px] font-semibold transition shadow-sm flex items-center gap-1 active:scale-95"
                      title="Ask Similar on WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Ask Similar</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(product, e)}
                      className="p-2.5 rounded-full bg-[#FAF8F4] hover:bg-[#2C3A2F] border border-[rgba(31,26,23,0.15)] text-[#1F1A17] hover:text-white transition shadow-sm active:scale-95"
                      title="Quick Add to Cart"
                    >
                      {isAdded ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="relative rounded-3xl border border-[rgba(31,26,23,0.10)] bg-[#FAF8F4] p-10 sm:p-16 text-center shadow-sm">
          <div className="max-w-xl mx-auto space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] flex items-center justify-center text-[#2C3A2F] shadow-sm">
              <ShoppingBag className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1A17]">
                First Drop in Handcrafted Production
              </h3>
              <p className="text-xs sm:text-sm text-[#6B5E54] leading-relaxed">
                Our bespoke heavyweight hoodies and streetwear silhouettes are currently being milled and finished in Lahore. The moment pieces are published via your Admin Dashboard, they will automatically appear here.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#2C3A2F] text-white text-xs font-semibold hover:bg-[#1F1A17] transition flex items-center justify-center gap-2 shadow-md shadow-[#2C3A2F]/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Notify on WhatsApp (0334 4826415)</span>
              </a>

              <Link
                href="/lookbook"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#FAF8F4] text-[#1F1A17] text-xs font-semibold border border-[rgba(31,26,23,0.15)] hover:bg-[#EBE4D8] transition"
              >
                View 14 Editorial Looks
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Prominent Bottom "View All Products" Button */}
      <div className="mt-12 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#2C3A2F] text-white text-xs sm:text-sm font-semibold hover:bg-[#1F1A17] transition shadow-md shadow-[#2C3A2F]/20"
        >
          <span>Explore Complete Collection</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick View Modal */}
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
