"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  PackageCheck,
  ChevronDown,
  ArrowRight,
  Instagram,
  Facebook,
  Heart,
  Tag,
} from "lucide-react";
import { useCart } from "./CartContext";
import { BRAND_LOGOS, BRAND_CONTACT } from "@/lib/brand-assets";

interface NavCategory {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

export default function Header() {
  const pathname = usePathname();
  const { totalCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Load live categories for dropdown
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});

    // Read wishlist from localStorage
    const updateWishlist = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("samora_wishlist") || "[]");
        setWishlistCount(Array.isArray(stored) ? stored.length : 0);
      } catch {
        setWishlistCount(0);
      }
    };
    updateWishlist();
    window.addEventListener("storage", updateWishlist);
    window.addEventListener("wishlist-updated", updateWishlist);

    return () => {
      window.removeEventListener("storage", updateWishlist);
      window.removeEventListener("wishlist-updated", updateWishlist);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setCatDropdownOpen(false);
  }, [pathname]);

  // Isolate admin routes completely
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Lookbook", href: "/lookbook" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* 1. TOP ANNOUNCEMENT BAR (Warm Sandstone & Espresso) */}
      <div className="bg-[#EBE4D8] border-b border-[rgba(31,26,23,0.08)] text-[#1F1A17] text-xs py-2 px-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="w-full text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2C3A2F]" />
            <span className="font-medium text-[#1F1A17]">
              Free Delivery Over PKR 5,000 • Nationwide Cash on Delivery • 7-Day Easy Exchanges
            </span>
          </div>

          {/* Socials & Help link in top bar */}
          <div className="hidden sm:flex items-center space-x-4 shrink-0 text-xs text-[#6B5E54]">
            <a
              href={BRAND_CONTACT.whatsAppQuickChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1F1A17] transition flex items-center gap-1 font-semibold text-[#2C3A2F]"
            >
              <span>Concierge WhatsApp:</span>
              <span className="underline">{BRAND_CONTACT.phone}</span>
            </a>

            <div className="flex items-center space-x-2 pl-2 border-l border-[rgba(31,26,23,0.15)]">
              <a
                href={BRAND_CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#B55A38] transition"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href={BRAND_CONTACT.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#2C3A2F] transition"
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR with smooth shrink on scroll */}
      <nav
        className={`w-full transition-all duration-300 border-b border-[rgba(31,26,23,0.10)] ${
          isScrolled
            ? "h-[64px] bg-[#F5F1EA]/95 backdrop-blur-md shadow-sm shadow-[#1F1A17]/5"
            : "h-[74px] bg-[#F5F1EA]/90 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* LEFT: Logo 1 + SAMORA Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-[#1F1A17] hover:text-[#B55A38] lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" prefetch={true} className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] flex items-center justify-center p-1 group-hover:border-[#2C3A2F]/40 transition-all shadow-sm">
                <img
                  src={BRAND_LOGOS.storefrontNav.path}
                  alt="SAMORA Store"
                  className="w-full h-full object-contain filter contrast-110"
                />
              </div>
              <span className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#1F1A17] group-hover:text-[#2C3A2F] transition">
                SAMORA
              </span>
            </Link>
          </div>

          {/* CENTER: Navigation Links + Interactive Categories Dropdown */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  prefetch={true}
                  className={`text-sm font-medium tracking-normal transition-colors py-1 ${
                    isActive
                      ? "text-[#1F1A17] font-bold border-b-2 border-[#2C3A2F]"
                      : "text-[#6B5E54] hover:text-[#1F1A17]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Interactive Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCatDropdownOpen(true)}
              onMouseLeave={() => setCatDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                className="text-sm font-medium text-[#6B5E54] hover:text-[#1F1A17] transition-colors py-1 flex items-center gap-1"
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${catDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {catDropdownOpen && (
                <div className="absolute top-full left-0 w-64 pt-2 z-50 animate-fadeIn">
                  <div className="rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] shadow-xl p-3 space-y-1">
                    <Link
                      href="/shop"
                      prefetch={true}
                      className="p-2.5 rounded-xl hover:bg-[#EBE4D8] flex items-center justify-between text-xs font-semibold text-[#1F1A17] transition"
                    >
                      <span>All Pieces (Shop)</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#6B5E54]" />
                    </Link>

                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop?category=${encodeURIComponent(cat.name)}`}
                        prefetch={true}
                        className="p-2.5 rounded-xl hover:bg-[#EBE4D8] flex items-center justify-between text-xs text-[#1F1A17] transition"
                      >
                        <span>{cat.name}</span>
                        <Tag className="w-3 h-3 text-[#B55A38]" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Live Search, Wishlist, Track Order, Cart Button */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Search Trigger with visible label on desktop */}
            <button
              onClick={() => {
                const event = new CustomEvent("open-search-modal");
                window.dispatchEvent(event);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1F1A17] hover:text-[#B55A38] transition rounded-full hover:bg-[rgba(31,26,23,0.06)] active:scale-95"
              aria-label="Search Collection"
              title="Search pieces (Ctrl + K)"
            >
              <Search className="w-4 h-4 text-[#6B5E54]" />
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* Wishlist Link with Saved Count */}
            <Link
              href="/shop?filter=saved"
              prefetch={true}
              className="p-2 text-[#1F1A17] hover:text-[#B55A38] transition rounded-full hover:bg-[rgba(31,26,23,0.05)] relative active:scale-95"
              aria-label="View Saved Items"
              title="Saved Items"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#B55A38] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Track Order */}
            <Link
              href="/track-order"
              prefetch={true}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-[#2C3A2F] hover:text-[#1F1A17] transition px-3 py-1.5 rounded-full bg-[#EBE4D8]/50 hover:bg-[#EBE4D8] border border-[rgba(31,26,23,0.08)]"
            >
              <PackageCheck className="w-3.5 h-3.5 text-[#2C3A2F]" />
              <span>Track Order</span>
            </Link>

            {/* Cart Bag in Deep Forest Olive Pill */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2C3A2F] hover:bg-[#202B23] text-[#FAF8F4] transition-all shadow-sm active:scale-95 group"
              aria-label="View Shopping Cart"
            >
              <div className="relative flex items-center">
                <ShoppingBag className="w-4 h-4 group-hover:scale-105 transition-transform" />
                {totalCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#B55A38] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {totalCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold">Cart</span>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[110px] bg-[#FAF8F4] border-b border-[rgba(31,26,23,0.12)] p-6 shadow-2xl z-50 animate-fadeIn space-y-6 max-h-[85vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[rgba(31,26,23,0.08)]">
              <div className="w-10 h-10 rounded-xl bg-[#EBE4D8] overflow-hidden p-1 flex items-center justify-center">
                <img
                  src={BRAND_LOGOS.preloaderFavicon.path}
                  alt="SAMORA"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-base font-bold text-[#1F1A17] font-display block">SAMORA</span>
                <span className="text-xs text-[#6B5E54] block">Haute Streetwear &bull; Pakistan</span>
              </div>
            </div>

            <nav className="flex flex-col space-y-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-[#1F1A17] hover:text-[#B55A38] py-2.5 px-3 rounded-xl hover:bg-[#EBE4D8]/60 flex items-center justify-between transition"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-[#6B5E54]" />
                </Link>
              ))}

              {/* Collections breakdown in mobile */}
              <div className="pt-2 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-[#6B5E54]">
                Collections
              </div>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?category=${encodeURIComponent(c.name)}`}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-medium text-[#6B5E54] hover:text-[#1F1A17] py-2 px-3 rounded-lg hover:bg-[#EBE4D8]/40 flex items-center justify-between"
                >
                  <span>{c.name}</span>
                  <Tag className="w-3 h-3 text-[#B55A38]" />
                </Link>
              ))}

              <Link
                href="/track-order"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#1F1A17] hover:text-[#B55A38] py-2.5 px-3 rounded-xl hover:bg-[#EBE4D8]/60 flex items-center justify-between transition pt-3 border-t border-[rgba(31,26,23,0.08)]"
              >
                <span>Track Order</span>
                <ArrowRight className="w-4 h-4 text-[#6B5E54]" />
              </Link>
            </nav>
          </div>

          <div className="pt-4 border-t border-[rgba(31,26,23,0.10)] space-y-3 text-xs text-[#6B5E54]">
            <div className="flex justify-between items-center text-[#1F1A17]">
              <span>Customer Care</span>
              <a
                href={BRAND_CONTACT.whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2C3A2F] font-semibold"
              >
                {BRAND_CONTACT.phone}
              </a>
            </div>
            <div className="flex gap-4 pt-1">
              <a
                href={BRAND_CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6B5E54] hover:text-[#B55A38] text-xs underline"
              >
                Instagram
              </a>
              <a
                href={BRAND_CONTACT.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6B5E54] hover:text-[#2C3A2F] text-xs underline"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
