# SAMORA ARCHIVE // Haute Streetwear Pakistan

A production-grade, dark luxury streetwear editorial e-commerce platform & bespoke Admin Atelier built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Prisma ORM**, and a local **SQLite** database (100% localhost, zero external cloud database dependencies).

---

## ⚡ Strict Assets & Catalog Compliance

1. **Multi-Logo Integration ([`/lib/brand-assets.ts`](file:///d:/Salman%20Store/src/lib/brand-assets.ts)):**
   All 4 brand logos scanned and integrated across distinct platform touchpoints:
   - **Logo 1 (`/assets/logos/logo-1.jpeg`)**: Main Storefront sticky top navigation bar (crisp sizing, transparent/blended dark luxury framing).
   - **Logo 2 (`/assets/logos/logo-2.jpeg`)**: Full-width luxury dark Footer header signature and Order Invoice / Receipt official dispatch header.
   - **Logo 3 (`/assets/logos/logo-3.jpeg`)**: Admin Dashboard sidebar header, Admin Login security seal, and subtle background watermark.
   - **Logo 4 (`/assets/logos/logo-4.jpeg`)**: Full-screen animated brand preloader on initial load, mobile slide-out drawer crest, and browser tab favicon (`<link rel="icon">`).

2. **Editorial Hoodie Banners & Lookbook Showcase ([`/public/assets/editorial-hoodies/`](file:///d:/Salman%20Store/public/assets/editorial-hoodies/)):**
   - **STRICT RULE ENFORCED:** Zero (0) hoodies are listed as buyable items in `/shop` or in the `Product` table.
   - All 14 hoodie images are deployed strictly as high-impact visual banners, campaign showcases, and streetwear editorial art:
     - **Hero Section (Hoodies 01, 02, 03)**: Full-viewport 4K HD cinematic slider with editorial typography overlays, dark vignette gradients, and smooth slide controls.
     - **Magazine Lookbook Spread (Hoodies 04, 05, 06, 07)**: High-fashion asymmetrical editorial spread with interactive 4K Lightbox zoom.
     - **"Worn on the Streets" (Hoodies 08, 09, 10)**: Streetwear compositions on industrial brutalist backdrops.
     - **Continuous Runway Marquee (Hoodies 11, 12, 13, 14, 01, 02)**: Smooth infinite marquee strip with clickable lightbox trigger.
     - **Atmosphere Banners on Secondary Pages**:
       - `/shop` atmosphere header (Hoodie 13)
       - `/about` provenance story hero (Hoodie 12)
       - `/contact` concierge hero (Hoodie 14)
       - `/lookbook` full 14-piece runway gallery with full-screen Lightbox
     - **Database Seeding**: All 14 editorial hoodies are seeded into the Prisma `Banner` table (NOT the `Product` table) for management in the Admin Dashboard.

3. **Product Catalog State:**
   - Database starts with **ZERO (0)** products in the catalog.
   - The storefront displays an editorial drop announcement (*"PRISTINE CATALOG INITIALIZATION // DROP 01 IN ACTIVE PRODUCTION"*), prompting the admin to ingest real items via the Admin Atelier.

---

## 🔑 Default Seeded Admin Credentials

| Credential | Value |
| :--- | :--- |
| **Portal URL** | [http://localhost:3000/admin/login](http://localhost:3000/admin/login) |
| **Email** | `admin@samora.pk` |
| **Password** | `admin123` |
| **Database** | `prisma/dev.db` (SQLite local) |

---

## 🎨 Visual Direction & Multi-Font Typography

* **Palette:** Deep Obsidian (`#08080A`), Charcoal (`#121216`), Charcoal Elevated (`#1A1A22`), Stark White (`#F5F5F5`), Metallic Borders (`#26262F`).
* **Typography:**
  * **Display / Hero Headlines:** `"Syne"` (700/800) &mdash; `font-display`
  * **Luxury Editorial Accents:** `"Playfair Display"` (italic) &mdash; `font-editorial italic`
  * **Body / UI Navigation:** `"Plus Jakarta Sans"` &mdash; `font-sans`
  * **Prices, Sizes, Specs & Tags:** `"JetBrains Mono"` &mdash; `font-mono`

---

## 🚀 Development Commands

```bash
# Push schema to local SQLite database
npx prisma db push

# Seed 14 banners, site settings, and default admin (0 products)
npm run db:seed

# Start development server
npm run dev

# URLs:
# Storefront:          http://localhost:3000
# 14-Piece Lookbook:   http://localhost:3000/lookbook
# Atelier Story:       http://localhost:3000/about
# Admin Portal:        http://localhost:3000/admin/login
```
