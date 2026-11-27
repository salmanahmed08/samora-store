"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatPKR, buildWhatsAppLink } from "@/lib/utils";
import {
  Filter,
  ArrowUpDown,
  ShoppingBag,
  MessageSquare,
  Sparkles,
  Check,
} from "lucide-react";
import { useCart } from "@/components/CartContext";
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
  createdAt: string;
}

export default function ShopCatalogClient({ initialProducts }: { initialProducts: Product[] }) {
  const { addItem } = useCart();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(searchParams.get("category") || "ALL");
  const [selectedSize, setSelectedSize] = useState("ALL");
  const [priceRange, setPriceRange] = useState("ALL");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    setCategory(searchParams.get("category") || "ALL");
  }, [searchParams]);

  const categories = [
    { label: "All Items", value: "ALL" },
    { label: "Hoodies", value: "Hoodies" },
    { label: "T-Shirts", value: "Tees" },
    { label: "Pants & Cargos", value: "Pants" },
    { label: "Outerwear", value: "Outerwear" },
    { label: "Accessories", value: "Accessories" },
  ];

  const sizeOptions = ["ALL", "XS", "S", "M", "L", "XL", "XXL"];

  // Filtering logic
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        // Category filter
        if (category !== "ALL" && p.category.toLowerCase() !== category.toLowerCase()) {
          return false;
        }

        // Size filter
        if (selectedSize !== "ALL") {
          try {
            const pSizes: string[] = JSON.parse(p.sizes);
            if (!pSizes.includes(selectedSize)) return false;
          } catch {
            return false;
          }
        }

        // Price range filter
        if (priceRange === "under-5000" && p.pricePKR >= 5000) return false;
        if (priceRange === "5000-10000" && (p.pricePKR < 5000 || p.pricePKR > 10000)) return false;
        if (priceRange === "over-10000" && p.pricePKR <= 10000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "price-asc") return a.pricePKR - b.pricePKR;
        if (sortOption === "price-desc") return b.pricePKR - a.pricePKR;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [initialProducts, category, selectedSize, priceRange, sortOption]);

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

  const whatsappDropLink = buildWhatsAppLink(
    BRAND_CONTACT.whatsAppNumber,
    "Hello SAMORA! Please notify me on WhatsApp (0334 4826415) as soon as your new collection arrives in the shop."
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Warm Split Header Banner */}
      <div className="relative rounded-3xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] overflow-hidden p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <span className="text-xs font-semibold text-[#B55A38] uppercase tracking-wider block">
            Online Store &bull; New Season
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold font-display text-[#1F1A17]">
            Shop Collection
          </h1>
          <p className="text-sm text-[#6B5E54]">
            Artisanal streetwear tailored in Pakistan. 450 GSM French Terry cotton, structured boxy cuts, and enduring comfort.
          </p>
        </div>

        <div className="w-48 sm:w-60 h-40 rounded-2xl bg-[#FAF8F4] overflow-hidden p-2 border border-[rgba(31,26,23,0.10)] flex items-center justify-center shrink-0">
          <img
            src="/assets/editorial-hoodies/hoodie-editorial-13.jpeg"
            alt="SAMORA Collection"
            className="w-full h-full object-contain drop-shadow"
          />
        </div>
      </div>

      {/* Filter and Sorting Controls */}
      <div id="categories" className="p-5 rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] space-y-4 shadow-sm">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-[#1F1A17] shrink-0 mr-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#2C3A2F]" />
            <span>Category:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat.value
                  ? "bg-[#2C3A2F] text-[#FAF8F4] shadow-sm"
                  : "bg-[#EBE4D8] text-[#1F1A17] hover:bg-[#EBE4D8]/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Size & Sorting Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[rgba(31,26,23,0.08)] text-xs">
          {/* Sizes */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#6B5E54] font-medium mr-1">Size:</span>
            {sizeOptions.map((sz) => (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  selectedSize === sz
                    ? "bg-[#2C3A2F] text-[#FAF8F4]"
                    : "bg-[#EBE4D8] text-[#1F1A17] hover:bg-[#EBE4D8]/80"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[#6B5E54]">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] text-[#1F1A17] text-xs px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid or Clean Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-[rgba(31,26,23,0.10)] bg-[#FAF8F4] p-12 sm:p-20 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] flex items-center justify-center text-[#2C3A2F]">
            <ShoppingBag className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-[#1F1A17]">
              Collection Dropping Soon
            </h3>
            <p className="text-sm text-[#6B5E54] leading-relaxed">
              Our upcoming drop of heavyweight hoodies, tees, and bottoms is currently in production.
              Connect directly on WhatsApp to receive priority drop alerts.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={whatsappDropLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#2C3A2F] hover:bg-[#222D24] text-[#FAF8F4] font-semibold text-xs rounded-full transition flex items-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Get WhatsApp Alerts</span>
            </a>

            <Link
              href="/lookbook"
              className="px-6 py-3 bg-[#FAF8F4] hover:bg-[#EBE4D8] text-[#1F1A17] font-semibold text-xs rounded-full border border-[rgba(31,26,23,0.15)] transition"
            >
              Explore Hoodie Lookbook
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
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
                    <span className="absolute top-3 left-3 bg-[#B55A38] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
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
                      className="px-3 py-1.5 bg-[#2C3A2F] hover:bg-[#222D24] text-[#FAF8F4] rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-sm"
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
    </div>
  );
}
