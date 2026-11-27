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
  ArrowUpRight,
  Heart,
  Instagram,
  Facebook,
  MessageCircle,
  PackageSearch,
} from "lucide-react";
import { useCart } from "./CartContext";
import { BRAND_CONTACT } from "@/lib/brand-assets";

interface NavCategory {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

const COLLECTIONS = ["Hoodies", "Tees", "Pants", "Outerwear", "Accessories"];

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
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
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

  const openSearch = () => window.dispatchEvent(new CustomEvent("open-search-modal"));
  const extraCategories = categories.filter((cat) => !COLLECTIONS.includes(cat.name));
  const isShopActive = pathname.startsWith("/shop");

  const shopDropdown = (
    <div
      className="samora-forest-shop"
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
        className={isShopActive ? "samora-forest-link is-active" : "samora-forest-link"}
        aria-haspopup="true"
        aria-expanded={catDropdownOpen}
      >
        SHOP <ChevronDown aria-hidden="true" />
      </Link>
      {catDropdownOpen && (
        <div className="samora-forest-dropdown">
          <Link href="/shop">All Pieces</Link>
          {COLLECTIONS.map((name) => (
            <Link key={name} href={`/shop?category=${encodeURIComponent(name)}`}>
              {name}
            </Link>
          ))}
          {extraCategories.map((cat) => (
            <Link key={cat.id} href={`/shop?category=${encodeURIComponent(cat.name)}`}>
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <header className={`samora-header samora-forest-header sticky top-0 z-50 w-full ${isScrolled ? "is-scrolled" : ""}`}>
      <div className="samora-forest-topbar">
        <div className="samora-forest-top-social" aria-label="SAMORA social channels">
          <a href={BRAND_CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
            <Instagram aria-hidden="true" />
          </a>
          <a href={BRAND_CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook">
            <Facebook aria-hidden="true" />
          </a>
          <a href={BRAND_CONTACT.whatsAppLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp">
            <MessageCircle aria-hidden="true" />
          </a>
          <span className="samora-forest-top-divider" />
          <a className="samora-forest-phone" href={BRAND_CONTACT.whatsAppLink} target="_blank" rel="noopener noreferrer">
            +92 334 482 6415
          </a>
        </div>

        <span className="samora-forest-shipping">
          COMPLIMENTARY SHIPPING ON SELECT ORDERS
        </span>

        <a className="samora-forest-follow" href={BRAND_CONTACT.instagram} target="_blank" rel="noopener noreferrer">
          FOLLOW SAMORA <ArrowUpRight aria-hidden="true" />
        </a>
      </div>

      <nav aria-label="Main navigation" className="samora-forest-nav">
        <div className="samora-forest-nav-inner">
          <div className="samora-forest-mobile-left">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="samora-forest-icon-button"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="samora-forest-mobile-menu"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          <div className="samora-forest-nav-left">
            <Link href="/" className={pathname === "/" ? "samora-forest-link is-active" : "samora-forest-link"}>HOME</Link>
            <Link href="/shop?sort=newest" className="samora-forest-link">NEW IN</Link>
            <Link href="/shop?category=Hoodies" className="samora-forest-link">MEN</Link>
            <Link href="/shop?category=Tees" className="samora-forest-link">WOMEN</Link>
            {shopDropdown}
          </div>

          <Link href="/" prefetch className="samora-forest-wordmark" aria-label="SAMORA home">
            SAMORA
          </Link>

          <div className="samora-forest-nav-right">
            <Link href="/about" className={pathname === "/about" ? "samora-forest-link is-active" : "samora-forest-link"}>ABOUT</Link>
            <Link href="/contact" className={pathname === "/contact" ? "samora-forest-link is-active" : "samora-forest-link"}>CONTACT</Link>
            <span className="samora-forest-action-divider" />
            <button type="button" onClick={openSearch} className="samora-forest-icon-button" aria-label="Search collection" title="Search collection">
              <Search />
            </button>
            <Link href="/shop?filter=saved" className="samora-forest-icon-button" aria-label={`Saved items, ${wishlistCount} items`} title="Saved items">
              <Heart />
              {wishlistCount > 0 && <span className="samora-forest-count">{wishlistCount}</span>}
            </Link>
            <Link href="/track-order" className="samora-forest-icon-button" aria-label="Track order" title="Track order">
              <PackageSearch />
            </Link>
            <button type="button" onClick={openCart} className="samora-forest-icon-button" aria-label={`Shopping bag, ${totalCount} items`} title="Shopping bag">
              <ShoppingBag />
              <span className="samora-forest-bag-count">{totalCount}</span>
            </button>
          </div>

          <div className="samora-forest-mobile-actions">
            <button type="button" onClick={openCart} className="samora-forest-icon-button" aria-label={`Shopping bag, ${totalCount} items`}>
              <ShoppingBag />
              <span className="samora-forest-bag-count">{totalCount}</span>
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div id="samora-forest-mobile-menu" className="samora-forest-mobile-menu">
          <button
            type="button"
            className="samora-forest-mobile-search"
            onClick={() => {
              setMobileMenuOpen(false);
              openSearch();
            }}
          >
            <Search aria-hidden="true" /> SEARCH COLLECTION
          </button>
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>HOME <ArrowRight aria-hidden="true" /></Link>
          <Link href="/shop?sort=newest" onClick={() => setMobileMenuOpen(false)}>NEW IN <ArrowRight aria-hidden="true" /></Link>
          <Link href="/shop?category=Hoodies" onClick={() => setMobileMenuOpen(false)}>MEN <ArrowRight aria-hidden="true" /></Link>
          <Link href="/shop?category=Tees" onClick={() => setMobileMenuOpen(false)}>WOMEN <ArrowRight aria-hidden="true" /></Link>
          <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>SHOP <ArrowRight aria-hidden="true" /></Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)}>ABOUT <ArrowRight aria-hidden="true" /></Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>CONTACT <ArrowRight aria-hidden="true" /></Link>
          <Link href="/track-order" onClick={() => setMobileMenuOpen(false)}>TRACK ORDER <ArrowRight aria-hidden="true" /></Link>
          <div className="samora-forest-mobile-collections">
            <span>SHOP COLLECTIONS</span>
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
          <div className="samora-forest-mobile-social">
            <a href={BRAND_CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram /></a>
            <a href={BRAND_CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook /></a>
            <a href={BRAND_CONTACT.whatsAppLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle /></a>
          </div>
        </div>
      )}
    </header>
  );
}
