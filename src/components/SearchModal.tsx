"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, ArrowRight, Loader2, Tag, ArrowUpRight } from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface ProductResult {
  id: string;
  sku?: string | null;
  title: string;
  slug: string;
  pricePKR: number;
  category: string;
  images: string;
}

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-search-modal", handleOpen);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("open-search-modal", handleOpen);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex justify-center items-start animate-fadeIn">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-[#1F1A17]/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Window */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] shadow-2xl p-6 sm:p-7 overflow-hidden z-10">
        <div className="flex items-center justify-between border-b border-[rgba(31,26,23,0.10)] pb-4">
          <div className="flex items-center gap-3 flex-1">
            <Search className="w-5 h-5 text-[#2C3A2F]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, SKU (e.g. SMR-001), or category..."
              autoFocus
              className="w-full bg-transparent text-sm text-[#1F1A17] placeholder-[#6B5E54] focus:outline-none"
            />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-[#EBE4D8] hover:bg-[rgba(31,26,23,0.1)] text-[#1F1A17] flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Popular Category Shortcuts */}
        {!query && (
          <div className="pt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#6B5E54] text-[11px] font-medium mr-1">Popular searches:</span>
            {["Hoodies", "Oversized", "Terry Cotton", "Black", "Haute"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                className="px-3 py-1 rounded-full bg-[#EBE4D8]/60 hover:bg-[#EBE4D8] text-[#1F1A17] text-[11px] font-medium transition"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div className="mt-5 max-h-96 overflow-y-auto space-y-2 scrollbar-thin">
          {loading ? (
            <div className="py-12 flex justify-center items-center text-[#6B5E54]">
              <Loader2 className="w-6 h-6 animate-spin text-[#2C3A2F]" />
            </div>
          ) : query.trim() === "" ? (
            <div className="py-8 text-center text-xs text-[#6B5E54]">
              Start typing above &bull; Instant results appear live &bull; Press <kbd className="px-1.5 py-0.5 rounded bg-[#EBE4D8] text-[10px] font-mono">Esc</kbd> to close
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-semibold text-[#1F1A17]">No pieces found for "{query}"</p>
              <p className="text-xs text-[#6B5E54]">Try searching for "Hoodies", "Terry", or browse our full shop catalog.</p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  prefetch={true}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2C3A2F] hover:underline"
                >
                  <span>Browse Entire Shop Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            results.map((product) => {
              let images: string[] = [];
              try {
                images = JSON.parse(product.images);
              } catch {
                images = [];
              }
              const displayImage = images[0] || "/assets/editorial-hoodies/hoodie-editorial-01.jpeg";

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  prefetch={true}
                  onClick={() => setIsOpen(false)}
                  className="p-3 rounded-2xl bg-white border border-[rgba(31,26,23,0.08)] hover:border-[#1F1A17]/30 hover:bg-[#FAF8F4] flex items-center justify-between gap-4 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-14 rounded-xl bg-[#EBE4D8] overflow-hidden p-1 flex items-center justify-center shrink-0">
                      <img src={displayImage} alt={product.title} className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-serif text-[#1F1A17] group-hover:text-[#B55A38] transition truncate">
                          {product.title}
                        </span>
                        {product.sku && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#EBE4D8] text-[#6B5E54]">
                            {product.sku}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#6B5E54] block mt-0.5">{product.category}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold font-serif text-[#1F1A17]">
                      {formatPKR(product.pricePKR)}
                    </span>
                    <span className="text-[10px] text-[#2C3A2F] block mt-0.5 group-hover:underline">View Piece &rarr;</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
