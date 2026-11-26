"use client";

import React from "react";
import Link from "next/link";
import { formatPKR, buildWhatsAppLink } from "@/lib/utils";
import { ShoppingBag, ArrowRight, MessageSquare, Sparkles } from "lucide-react";
import { useCart } from "./CartContext";
import { BRAND_CONTACT } from "@/lib/brand-assets";

interface Product {
  id: string;
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
}

export default function LiveShopSection({ products }: { products: Product[] }) {
  const { addItem } = useCart();

  const handleQuickAdd = (p: Product) => {
    let sizes = ["M"];
    try {
      sizes = JSON.parse(p.sizes);
    } catch {}

    let images = ["/assets/editorial-hoodies/hoodie-editorial-01.jpeg"];
    try {
      images = JSON.parse(p.images);
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
  };

  const whatsappMessage =
    "Hello SAMORA! I'd like to get notified directly on WhatsApp when your next hoodie collection drops.";
  const whatsappUrl = buildWhatsAppLink(BRAND_CONTACT.whatsAppNumber, whatsappMessage);

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[rgba(31,26,23,0.08)]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-semibold text-[#2C3A2F] uppercase tracking-wider block mb-1">
            Collection Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#1F1A17]">
            Featured Pieces
          </h2>
          <p className="text-sm text-[#6B5E54] mt-1">
            Artisanal streetwear silhouettes tailored from pure 450 GSM French Terry cotton.
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2C3A2F] hover:text-[#B55A38] transition group"
        >
          <span>View All Products</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* When 0 products exist: Warm Editorial Boutique Empty State */}
      {products.length === 0 ? (
        <div className="relative rounded-3xl border border-[rgba(31,26,23,0.10)] bg-[#FAF8F4] p-10 sm:p-16 text-center shadow-sm">
          <div className="max-w-xl mx-auto space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] flex items-center justify-center text-[#2C3A2F] shadow-sm">
              <ShoppingBag className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-[#1F1A17]">
                New Drops Arriving Soon
              </h3>
              <p className="text-sm text-[#6B5E54] leading-relaxed">
                Our latest collection of heavyweight French Terry hoodies and streetwear essentials is
                currently in handcrafted production. Message us on WhatsApp to receive priority drop alerts.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#2C3A2F] hover:bg-[#222D24] text-[#FAF8F4] font-semibold text-sm rounded-full transition shadow-sm flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message for Drop Alerts</span>
              </a>

              <Link
                href="/lookbook"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#FAF8F4] hover:bg-[#EBE4D8] text-[#1F1A17] font-semibold text-sm rounded-full border border-[rgba(31,26,23,0.15)] transition flex items-center justify-center gap-2"
              >
                <span>Browse Hoodie Lookbook</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Real Luxury Product Cards in Warm Linen */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            let images: string[] = [];
            try {
              images = JSON.parse(p.images);
            } catch {}
            const displayImage = images[0] || "/assets/editorial-hoodies/hoodie-editorial-01.jpeg";

            let sizes: string[] = [];
            try {
              sizes = JSON.parse(p.sizes);
            } catch {
              sizes = ["M", "L"];
            }

            return (
              <div
                key={p.id}
                className="group rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] hover:border-[#1F1A17]/30 overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Link
                  href={`/product/${p.slug}`}
                  className="block relative aspect-[3/4] overflow-hidden bg-[#EBE4D8]"
                >
                  <img
                    src={displayImage}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {p.compareAtPrice && p.compareAtPrice > p.pricePKR && (
                    <span className="absolute top-3 left-3 bg-[#B55A38] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      Save {Math.round(((p.compareAtPrice - p.pricePKR) / p.compareAtPrice) * 100)}%
                    </span>
                  )}
                  {p.stock <= 5 && p.stock > 0 && (
                    <span className="absolute top-3 right-3 bg-[#FAF8F4]/90 text-[#B55A38] border border-[#B55A38]/30 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      Only {p.stock} left
                    </span>
                  )}
                </Link>

                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-xs text-[#6B5E54] block">{p.category}</span>
                    <Link
                      href={`/product/${p.slug}`}
                      className="text-base font-bold font-display text-[#1F1A17] group-hover:text-[#2C3A2F] transition line-clamp-1 mt-0.5"
                    >
                      {p.title}
                    </Link>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {sizes.map((s) => (
                      <span
                        key={s}
                        className="text-xs border border-[rgba(31,26,23,0.10)] bg-[#FAF8F4] px-2 py-0.5 rounded-md text-[#6B5E54]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[rgba(31,26,23,0.08)]">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-[#1F1A17]">
                        {formatPKR(p.pricePKR)}
                      </span>
                      {p.compareAtPrice && p.compareAtPrice > p.pricePKR && (
                        <span className="text-xs text-[#6B5E54] line-through">
                          {formatPKR(p.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleQuickAdd(p)}
                      className="px-3 py-1.5 bg-[#2C3A2F] hover:bg-[#222D24] text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
