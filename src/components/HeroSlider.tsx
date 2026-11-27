"use client";

import Link from "next/link";
import { ArrowRight, MoveUpRight } from "lucide-react";

interface HeroCategory {
  id: string;
  name: string;
  slug?: string;
  shopValue?: string;
}

interface HeroSliderProps {
  categories?: HeroCategory[];
}

const CATEGORY_VISUALS = [
  "/assets/editorial-hoodies/hoodie-editorial-02.jpeg",
  "/assets/editorial-hoodies/hoodie-editorial-03.jpeg",
  "/assets/editorial-hoodies/hoodie-editorial-04.jpeg",
  "/assets/editorial-hoodies/hoodie-editorial-05.jpeg",
];

const FALLBACK_CATEGORIES: HeroCategory[] = [
  { id: "hoodies", name: "Hoodies", shopValue: "Hoodies" },
  { id: "tees", name: "T-Shirts", shopValue: "Tees" },
  { id: "pants", name: "Pants & Cargos", shopValue: "Pants" },
  { id: "accessories", name: "Accessories", shopValue: "Accessories" },
];

export default function HeroSlider({ categories = [] }: HeroSliderProps) {
  const featuredCategories = (categories.length > 0 ? categories : FALLBACK_CATEGORIES).slice(0, 4);

  return (
    <section className="samora-home-hero" aria-labelledby="samora-hero-title">
      <div className="samora-hero-shell">
        <div className="samora-hero-copy">
          <span className="samora-hero-eyebrow">
            <span aria-hidden="true" />
            THE SAMORA COLLECTION
          </span>

          <h1 id="samora-hero-title">
            OWN YOUR
            <span>STYLE.</span>
          </h1>

          <p className="samora-hero-description">
            Modern essentials. Elevated streetwear. Made to stand apart.
          </p>

          <div className="samora-hero-actions">
            <Link href="/shop" className="samora-hero-primary">
              EXPLORE COLLECTION
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/lookbook" className="samora-hero-secondary">
              DISCOVER THE LOOKBOOK
              <MoveUpRight aria-hidden="true" />
            </Link>
          </div>

          <div className="samora-hero-footnote">
            <span>01</span>
            <span className="samora-hero-footnote-rule" />
            <span>FORM MEETS FUNCTION</span>
          </div>
        </div>

        <div className="samora-hero-visual">
          <img
            src="/assets/editorial-hoodies/hoodie-editorial-01.jpeg"
            alt="SAMORA heavyweight streetwear editorial look"
            className="samora-hero-image"
            fetchPriority="high"
          />
          <div className="samora-hero-image-caption">
            <span>THE SIGNATURE EDIT</span>
            <span>LAHORE · PAKISTAN</span>
          </div>
          <div className="samora-hero-index" aria-hidden="true">
            SAMORA
            <span>01 / 04</span>
          </div>
        </div>
      </div>

      {featuredCategories.length > 0 && (
        <div className="samora-category-row" aria-label="Shop by category">
          <div className="samora-category-heading">
            <span>CURATED FOR EVERYDAY</span>
            <h2>Shop by category</h2>
          </div>

          <div className="samora-category-grid">
            {featuredCategories.map((category, index) => (
              <Link
                key={category.id}
                href={`/shop?category=${encodeURIComponent(category.shopValue || category.name)}`}
                className="samora-category-card"
              >
                <img
                  src={CATEGORY_VISUALS[index % CATEGORY_VISUALS.length]}
                  alt=""
                  loading="lazy"
                />
                <span className="samora-category-shade" />
                <span className="samora-category-name">{category.name}</span>
                <span className="samora-category-arrow" aria-hidden="true">
                  <ArrowRight />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
