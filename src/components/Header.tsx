"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Heart,
} from "lucide-react";
import { useCart } from "./CartContext";
import { BRAND_CONTACT } from "@/lib/brand-assets";

interface NavCategory {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

const COLLECTIONS = ["Clothing", "Bags", "Footwear", "Accessories"];

export default function Header() {
  const pathname = usePathname();
  const { totalCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});

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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setCatDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setCatDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const navLinks = [
    { label: "NEW IN", href: "/shop" },
    { label: "MEN", href: "/shop" },
    { label: "WOMEN", href: "/shop" },
    { label: "SHOP", href: "/shop" },
    { label: "ABOUT", href: "/about" },
    { label: "CONTACT", href: "/contact" },
  ];

  const openSearch = () => window.dispatchEvent(new CustomEvent("open-search-modal"));
  const extraCategories = categories.filter((cat) => !COLLECTIONS.includes(cat.name));

  return (
    <header className="samora-header sticky top-0 z-40 w-full">
      <div className="samora-announcement">
        <span>COMPLIMENTARY SHIPPING ON SELECT ORDERS</span>
      </div>

      <nav
        aria-label="Main navigation"
        className={isScrolled ? "samora-nav is-scrolled" : "samora-nav"}
      >
        <div className="samora-nav-inner">
          <div className="samora-mobile-left">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="samora-icon-button lg:hidden"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="samora-mobile-menu"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          <Link href="/" prefetch className="samora-wordmark" aria-label="SAMORA home">
            SAMORA
          </Link>

          <div className="samora-desktop-links">
            {navLinks.map((link, index) => {
              const isShopItem = link.label === "SHOP";
              const isActive = isShopItem
                ? pathname.startsWith("/shop")
                : link.href !== "/shop" &&
                  (pathname === link.href || pathname.startsWith(link.href + "/"));

              if (isShopItem) {
                return (
                  <div
                    key={link.label}
                    className="samora-shop-menu"
                    onMouseEnter={() => setCatDropdownOpen(true)}
                    onMouseLeave={() => setCatDropdownOpen(false)}
                    onFocus={() => setCatDropdownOpen(true)}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setCatDropdownOpen(false);
                      }
                    }}
                  >
                    <Link
                      href="/shop"
                      className={isActive ? "samora-nav-link is-active" : "samora-nav-link"}
                      aria-haspopup="true"
                      aria-expanded={catDropdownOpen}
                    >
                      SHOP <ChevronDown aria-hidden="true" />
                    </Link>
                    {catDropdownOpen && (
                      <div className="samora-dropdown">
                        <Link href="/shop">All Pieces</Link>
                        {COLLECTIONS.map((name) => (
                          <Link
                            key={name}
                            href={`/shop?category=${encodeURIComponent(name)}`}
                          >
                            {name}
                          </Link>
                        ))}
                        {extraCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/shop?category=${encodeURIComponent(cat.name)}`}
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={`${link.label}-${index}`}
                  href={link.href}
                  prefetch
                  className={isActive ? "samora-nav-link is-active" : "samora-nav-link"}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="samora-actions">
            <button
              type="button"
              onClick={openSearch}
              className="samora-icon-button samora-search"
              aria-label="Search collection"
              title="Search collection"
            >
              <Search />
              <span className="samora-action-label">SEARCH</span>
            </button>
            <Link
              href="/shop?filter=saved"
              className="samora-icon-button samora-wishlist"
              aria-label={`Saved items, ${wishlistCount} items`}
              title="Saved items"
            >
              <Heart />
              {wishlistCount > 0 && <span className="samora-count">{wishlistCount}</span>}
            </Link>
            <button
              type="button"
              onClick={openCart}
              className="samora-icon-button samora-bag"
              aria-label={`Shopping bag, ${totalCount} items`}
              title="Shopping bag"
            >
              <ShoppingBag />
              {totalCount > 0 && <span className="samora-count">{totalCount}</span>}
              <span className="samora-action-label">BAG</span>
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div id="samora-mobile-menu" className="samora-mobile-menu lg:hidden">
          <nav aria-label="Mobile navigation">
            <button
              type="button"
              className="samora-mobile-search"
              onClick={() => {
                setMobileMenuOpen(false);
                openSearch();
              }}
            >
              <Search aria-hidden="true" /> SEARCH COLLECTION
            </button>
            {navLinks.map((link, index) => (
              <Link
                key={`${link.label}-${index}`}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
            <Link href="/shop?filter=saved" onClick={() => setMobileMenuOpen(false)}>
              SAVED ITEMS <Heart aria-hidden="true" />
            </Link>
            <Link href="/track-order" onClick={() => setMobileMenuOpen(false)}>
              TRACK ORDER <ArrowRight aria-hidden="true" />
            </Link>
            <div className="samora-mobile-collections">
              <span>COLLECTIONS</span>
              {COLLECTIONS.map((name) => (
                <Link
                  key={name}
                  href={`/shop?category=${encodeURIComponent(name)}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {name}
                </Link>
              ))}
              {extraCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </nav>
          <div className="samora-mobile-contact">
            <a
              href={BRAND_CONTACT.whatsAppQuickChatUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              CUSTOMER CARE · {BRAND_CONTACT.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
