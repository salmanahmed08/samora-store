"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Truck,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface HeroCategory {
  id: string;
  name: string;
  slug?: string;
  shopValue?: string;
}

interface HeroSliderProps {
  categories?: HeroCategory[];
}

const MODEL_IMAGE =
  "https://images.unsplash.com/photo-1763618252006-cd7f54dc603b?auto=format&fit=crop&w=1400&q=88";

const COLLECTIONS: Array<{
  id: string;
  name: string;
  note: string;
  image: string;
  href: string;
}> = [
  {
    id: "hoodies",
    name: "THE HOODIE EDIT",
    note: "Explore now",
    image: "/assets/editorial-hoodies/hoodie-editorial-10.jpeg",
    href: "/shop?category=Hoodies",
  },
  {
    id: "essentials",
    name: "TONAL ESSENTIALS",
    note: "Quietly considered",
    image: "/assets/editorial-hoodies/hoodie-editorial-03.jpeg",
    href: "/shop?category=Hoodies",
  },
  {
    id: "layers",
    name: "ZIP LAYERS",
    note: "Built for everyday",
    image: "/assets/editorial-hoodies/hoodie-editorial-09.jpeg",
    href: "/shop?category=Hoodies",
  },
  {
    id: "lookbook",
    name: "THE LOOKBOOK",
    note: "Discover the edit",
    image: MODEL_IMAGE,
    href: "/lookbook",
  },
];

const FALLBACK_CATEGORIES: HeroCategory[] = [
  { id: "hoodies", name: "Hoodies", shopValue: "Hoodies" },
  { id: "tees", name: "T-Shirts", shopValue: "Tees" },
  { id: "pants", name: "Pants & Cargos", shopValue: "Pants" },
  { id: "accessories", name: "Accessories", shopValue: "Accessories" },
];

export default function HeroSlider({ categories = [] }: HeroSliderProps) {
  const featuredCategories =
    (categories.length > 0 ? categories : FALLBACK_CATEGORIES).slice(0, 4);

  return (
    <section className="samora-forest-hero" aria-labelledby="samora-forest-title" data-active-category-count={categories.length}>
      <div className="samora-forest-hero-main">
        <div className="samora-forest-atmosphere" aria-hidden="true" />
        <div className="samora-forest-wordmark-bg" aria-hidden="true">
          SAMORA
        </div>

        <div className="samora-forest-hero-copy">
          <div className="samora-forest-eyebrow">
            <span />
            THE SAMORA COLLECTION
            <i />
          </div>

          <h1 id="samora-forest-title">
            OWN YOUR
            <em>STYLE.</em>
          </h1>

          <p className="samora-forest-description">
            Modern essentials. Elevated streetwear.
            <br />
            Made to stand apart.
          </p>

          <div className="samora-forest-hero-actions">
            <Link href="/shop" className="samora-forest-primary-cta">
              EXPLORE COLLECTION
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/lookbook" className="samora-forest-outline-cta">
              DISCOVER SAMORA
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>

          <div className="samora-forest-benefits" aria-label="Shopping benefits">
            <div>
              <Truck aria-hidden="true" />
              <span>Nationwide<br />delivery</span>
            </div>
            <i />
            <div>
              <ShieldCheck aria-hidden="true" />
              <span>Cash on<br />delivery</span>
            </div>
            <i />
            <div>
              <RefreshCw aria-hidden="true" />
              <span>Easy size<br />exchanges</span>
            </div>
          </div>
        </div>

        <div className="samora-forest-model-stage">
          <div className="samora-forest-model-glow" aria-hidden="true" />
          <img
            src={MODEL_IMAGE}
            alt="Model wearing a forest-green hooded streetwear look"
            className="samora-forest-model"
            fetchPriority="high"
            loading="eager"
          />
          <div className="samora-forest-editorial-index">
            <span>01</span>
            <i />
            <span>THE NEW SEASON</span>
          </div>
        </div>

        <div className="samora-forest-product-card" aria-label="Featured olive zip layer">
          <div className="samora-forest-product-card-image">
            <img
              src="/assets/editorial-hoodies/hoodie-editorial-10.jpeg"
              alt="Olive green zip-up layer"
              loading="eager"
            />
          </div>
          <span className="samora-forest-new-badge">NEW</span>
          <span className="samora-forest-product-card-label">THE SIGNATURE LAYER</span>
        </div>

        <div className="samora-forest-side-note" aria-hidden="true">
          DESIGNED TO MOVE · MADE TO LAST
        </div>
      </div>

      <div className="samora-forest-collections">
        <div className="samora-forest-collections-heading">
          <div>
            <span>EXPLORE SAMORA</span>
            <h2>THE COLLECTIONS</h2>
          </div>
          <Link href="/shop">
            VIEW ALL <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>

        <div className="samora-forest-collection-grid">
          {COLLECTIONS.map((item, index) => (
            <Link
              key={item.id}
              href={item.href}
              className="samora-forest-collection-card"
            >
              <img src={item.image} alt="" loading="lazy" />
              <span className="samora-forest-collection-shade" />
              <span className="samora-forest-collection-number">0{index + 1}</span>
              <span className="samora-forest-collection-copy">
                <strong>{item.name}</strong>
                <small>{item.note} <ArrowRight aria-hidden="true" /></small>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
