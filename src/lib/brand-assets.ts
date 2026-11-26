/**
 * Centralized Brand Assets Configuration
 * Maps all 4 local logos and 14 editorial hoodie visuals without omission.
 * STRICT RULE: Editorial hoodies are for visual art, banners, and lookbooks ONLY.
 * They are NEVER added to the buyable Product catalog table.
 */

export interface BrandLogoConfig {
  id: string;
  name: string;
  path: string;
  usage: string;
  description: string;
}

export interface EditorialHoodieConfig {
  id: string;
  filename: string;
  path: string;
  title: string;
  edition: string;
  specs: string;
  primarySlot: string;
}

export const BRAND_CONTACT = {
  phone: "03344826415",
  phoneDisplay: "0334 4826415",
  phoneInternational: "+92 334 4826415",
  whatsAppNumber: "923344826415",
  whatsAppLink: "https://wa.me/923344826415",
  whatsAppDefaultMessage: "Assalam-o-Alaikum! I visited your store and want more details.",
  whatsAppQuickChatUrl:
    "https://wa.me/923344826415?text=Assalam-o-Alaikum!%20I%20visited%20your%20store%20and%20want%20more%20details.",
  instagram: "https://www.instagram.com/samorapk2008/",
  instagramHandle: "@samorapk2008",
  facebook: "https://www.facebook.com/profile.php?id=61593252326408",
  facebookName: "SAMORA PK",
  email: "contact@samora.pk",
  atelierAddress: "Gulberg III, Industrial Design Zone, Lahore, Pakistan",
};

export const BRAND_LOGOS = {
  // Logo 1: Main Storefront sticky top navigation bar
  storefrontNav: {
    id: "logo-1",
    name: "Storefront Navigation Emblem",
    path: "/assets/logos/logo-1.jpeg",
    usage: "Main Storefront sticky top navigation bar (crisp sizing, transparent/blended dark framing)",
  },
  // Logo 2: Full-width luxury dark Footer & Order Invoice/Receipt header
  footerInvoice: {
    id: "logo-2",
    name: "Atelier Signature Seal",
    path: "/assets/logos/logo-2.jpeg",
    usage: "Full-width luxury dark Footer & Order Invoice/Receipt header",
  },
  // Logo 3: Admin Dashboard sidebar header, Admin Login screen, and subtle background watermark
  adminPortal: {
    id: "logo-3",
    name: "Security & Control Monogram",
    path: "/assets/logos/logo-3.jpeg",
    usage: "Admin Dashboard sidebar header, Admin Login screen, and subtle background watermark",
  },
  // Logo 4: Full-screen animated brand preloader on initial load, mobile slide-out drawer badge, and browser favicon/tab icon
  preloaderFavicon: {
    id: "logo-4",
    name: "Geometric Atelier Crest",
    path: "/assets/logos/logo-4.jpeg",
    usage: "Full-screen animated brand preloader on initial load, mobile slide-out drawer badge, and browser favicon/tab icon",
  },
  all: [
    {
      id: "logo-1",
      name: "Storefront Navigation Emblem",
      path: "/assets/logos/logo-1.jpeg",
      usage: "Main Storefront sticky top navigation bar",
      description: "Optimized for header bar with dark luxury contrast.",
    },
    {
      id: "logo-2",
      name: "Atelier Signature Seal",
      path: "/assets/logos/logo-2.jpeg",
      usage: "Luxury Footer & Order Invoice/Receipt header",
      description: "High-contrast stamp for official receipts and footer signature.",
    },
    {
      id: "logo-3",
      name: "Security & Control Monogram",
      path: "/assets/logos/logo-3.jpeg",
      usage: "Admin Dashboard sidebar, Login screen, and background watermark",
      description: "Precision-etched mark for admin authority touchpoints.",
    },
    {
      id: "logo-4",
      name: "Geometric Atelier Crest",
      path: "/assets/logos/logo-4.jpeg",
      usage: "Preloader animation, mobile drawer badge, and favicon",
      description: "Iconic square crest for initial load splash and browser tab.",
    },
  ],
};

export const EDITORIAL_HOODIES: EditorialHoodieConfig[] = [
  {
    id: "hoodie-01",
    filename: "WhatsApp Image 2026-11-19 at 19.39.59.jpeg",
    path: "/assets/editorial-hoodies/hoodie-editorial-01.jpeg",
    title: "Obsidian Heavyweight Hoodie",
    edition: "Signature Drop",
    specs: "450 GSM French Terry • Boxy Fit",
    primarySlot: "hero_slide_1",
  },
  {
    id: "hoodie-02",
    filename: "WhatsApp Image 2026-11-19 at 19.39.59 (1).jpeg",
    path: "/assets/editorial-hoodies/hoodie-editorial-02.jpeg",
    title: "Carbon Shadow Pullover",
    edition: "Runway Collection",
    specs: "100% Combed Ringspun Cotton • Double Seams",
    primarySlot: "hero_slide_2",
  },
  {
    id: "hoodie-03",
    filename: "WhatsApp Image 2026-11-19 at 19.40.00.jpeg",
    path: "/assets/editorial-hoodies/hoodie-editorial-03.jpeg",
    title: "Vintage Stone Wash Hoodie",
    edition: "Classic Cut",
    specs: "Enzyme Stone Wash • Custom Matte Eyelets",
    primarySlot: "hero_slide_3",
  },
  {
    id: "hoodie-04",
    filename: "WhatsApp Image 2026-11-19 at 19.40.00 (1).jpeg",
    path: "/assets/editorial-hoodies/hoodie-editorial-04.jpeg",
    title: "Oversized Drop-Shoulder Hoodie",
    edition: "Campaign Feature",
    specs: "450 GSM Dense French Terry • Relaxed Shoulders",
    primarySlot: "campaign_feature_1",
  },
  {
    id: "hoodie-05",
    filename: "WhatsApp Image 2026-11-19 at 19.40.00 (2).jpeg",
    path: "/assets/editorial-hoodies/hoodie-editorial-05.jpeg",
    title: "Structured Double-Layer Hood",
    edition: "Material Study",
    specs: "Dense 450 GSM Knit • Zero Synthetic Fillers",
    primarySlot: "campaign_feature_2",
  },
  {
    id: "hoodie-06",
    filename: "WhatsApp Image 2026-11-19 at 19.40.00 (3).jpeg",
    path: "/assets/editorial-hoodies/hoodie-editorial-06.jpeg",
    title: "Streetwear Boxy Fit Hoodie",
    edition: "Street Edition",
    specs: "Pre-Shrunk Cold Water Wash • Ribbed Cuffs",
    primarySlot: "campaign_feature_3",
  },
  {
    id: "hoodie-07",
    filename: "WhatsApp Image 2026-11-19 at 19.40.00 (4).jpeg",
    path: "/assets/editorial-hoodies/hoodie-editorial-07.jpeg",
    title: "Night Runner Relaxed Cut",
    edition: "Essential Silhouette",
    specs: "Heavyweight French Terry • Deep Hood Construction",
    primarySlot: "campaign_feature_4",
  },
  {
    id: "hoodie-08",
    filename: "WhatsApp Image 2026-11-19 at 19.40.00 (5).jpeg",
    path: "/assets/editorial-hoodies/hoodie-editorial-08.jpeg",
    title: "Essential Black Pullover",
    edition: "Daily Luxury",
    specs: "Architectural Drape • Triple Needle Reinforced Seams",
    primarySlot: "street_showcase_1",
  },
  {
    id: "hoodie-09",
    filename: "WhatsApp Image 2026-11-19 at 19.40.00 (6).jpeg",
    path: "/assets/editorial-hoodies/hoodie-editorial-09.jpeg",
    title: "Heritage Combed Cotton Hoodie",
    edition: "Textile Series",
    specs: "Artisanal Pigment Dye • Uncompromising Weight",
    primarySlot: "street_showcase_2",
  },
  {
    id: "hoodie-10",
    filename: "WhatsApp Image 2026-11-19 at 19.40.00 (7).jpeg",
    path: "/assets/editorial-hoodies/hoodie-editorial-10.jpeg",
    title: "Monochrome Boxy Silhouette",
    edition: "Minimalist Cut",
    specs: "450 GSM Combed Loopback Cotton • Matte Ribbing",
    primarySlot: "street_showcase_3",
  },
  {
    id: "hoodie-11",
    filename: "WhatsApp Image 2026-11-19 at 19.40.00 (8).jpeg",
    path: "/assets/editorial-hoodies/hoodie-editorial-11.jpeg",
    title: "Classic Heavyweight Essential",
    edition: "Signature Look",
    specs: "Woven in Lahore • International Standard Tailoring",
    primarySlot: "marquee_strip_1",
  },
  {
    id: "hoodie-12",
    filename: "WhatsApp Image 2026-11-19 at 19.40.00 (9).jpeg",
    path: "/assets/editorial-hoodies/hoodie-editorial-12.jpeg",
    title: "Raw Edge Finished Hoodie",
    edition: "Atelier Story",
    specs: "Export Grade Pure Cotton • High GSM Structure",
    primarySlot: "marquee_strip_2",
  },
  {
    id: "hoodie-13",
    filename: "WhatsApp Image 2026-11-19 at 19.40.00 (10).jpeg",
    path: "/assets/editorial-hoodies/hoodie-editorial-13.jpeg",
    title: "Urban Movement Street Cut",
    edition: "Shop Showcase",
    specs: "Heavyweight Terry Loop • Relaxed Boxy Fit",
    primarySlot: "secondary_page_shop",
  },
  {
    id: "hoodie-14",
    filename: "WhatsApp Image 2026-11-19 at 19.40.00 (11).jpeg",
    path: "/assets/editorial-hoodies/hoodie-editorial-14.jpeg",
    title: "Signature Minimalist Pullover",
    edition: "Concierge Feature",
    specs: "Midnight Obsidian Palette • 450 GSM Heavy French Terry",
    primarySlot: "secondary_page_contact",
  },
];
