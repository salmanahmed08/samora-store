const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const EDITORIAL_HOODIE_BANNERS = [
  {
    slotName: "hero_slide_1",
    title: "OBSIDIAN ARCHIVE HOODIE // DROP 01",
    subtitle: "A NEW ERA OF PAKISTANI LUXURY STREETWEAR. UNCOMPROMISING SILHOUETTES, 450 GSM HEAVYWEIGHT FRENCH TERRY.",
    imagePath: "/assets/editorial-hoodies/hoodie-editorial-01.jpeg",
    ctaText: "DISCOVER THE ARCHIVE",
    ctaLink: "/shop",
    isActive: true,
    sortOrder: 1,
  },
  {
    slotName: "hero_slide_2",
    title: "CARBON SHADOW HEAVYWEIGHT CUT",
    subtitle: "ENZYME STONEWASHED // BRUTALIST RUNWAY SILHOUETTE. 100% COMBED RINGSPUN COTTON.",
    imagePath: "/assets/editorial-hoodies/hoodie-editorial-02.jpeg",
    ctaText: "VIEW CAMPAIGN EDITORIAL",
    ctaLink: "/lookbook",
    isActive: true,
    sortOrder: 2,
  },
  {
    slotName: "hero_slide_3",
    title: "RAW INDUSTRIAL BLACKOUT PULLOVER",
    subtitle: "DOUBLE-NEEDLE OVERLOCK // CUSTOM MATTE HARDWARE. WOVEN AND FINISHED IN LAHORE.",
    imagePath: "/assets/editorial-hoodies/hoodie-editorial-03.jpeg",
    ctaText: "BROWSE SILHOUETTES",
    ctaLink: "/shop",
    isActive: true,
    sortOrder: 3,
  },
  {
    slotName: "campaign_feature_1",
    title: "MAGAZINE EDITORIAL FEATURE // LAHORE ATELIER",
    subtitle: "High-fashion asymmetrical spread displaying raw textile draping and export-grade loops.",
    imagePath: "/assets/editorial-hoodies/hoodie-editorial-04.jpeg",
    ctaText: "EXPLORE LOOKBOOK",
    ctaLink: "/lookbook",
    isActive: true,
    sortOrder: 4,
  },
  {
    slotName: "campaign_feature_2",
    title: "STRUCTURAL METALLIC HOOD DETAIL",
    subtitle: "Dense 450 GSM Knit // Zero polyester synthetic fillers. Permanent shape retention.",
    imagePath: "/assets/editorial-hoodies/hoodie-editorial-05.jpeg",
    ctaText: "INSPECT FABRIC SPEC",
    ctaLink: "/about",
    isActive: true,
    sortOrder: 5,
  },
  {
    slotName: "campaign_feature_3",
    title: "WORN ON THE STREETS // KARACHI BRUTALISM",
    subtitle: "Captured across industrial Pakistani brutalist architecture and midnight streets.",
    imagePath: "/assets/editorial-hoodies/hoodie-editorial-06.jpeg",
    ctaText: "DISPATCH CONCIERGE",
    ctaLink: "/contact",
    isActive: true,
    sortOrder: 6,
  },
  {
    slotName: "campaign_feature_4",
    title: "NIGHT RUNNER CAMPAIGN DRAPE",
    subtitle: "Deep structural hood and oversized dropped shoulder tailoring.",
    imagePath: "/assets/editorial-hoodies/hoodie-editorial-07.jpeg",
    ctaText: "VIEW GALLERY",
    ctaLink: "/lookbook",
    isActive: true,
    sortOrder: 7,
  },
  {
    slotName: "street_showcase_1",
    title: "ATELIER COUTURE PROTOTYPE 008",
    subtitle: "Triple-needle reinforced seams and cold water pre-shrunk finish.",
    imagePath: "/assets/editorial-hoodies/hoodie-editorial-08.jpeg",
    ctaText: "CLIENT SERVICES",
    ctaLink: "/contact",
    isActive: true,
    sortOrder: 8,
  },
  {
    slotName: "street_showcase_2",
    title: "PAKISTANI TEXTILE HERITAGE CUT",
    subtitle: "Artisanal pigment dye and heavyweight export cotton.",
    imagePath: "/assets/editorial-hoodies/hoodie-editorial-09.jpeg",
    ctaText: "ATELIER STORY",
    ctaLink: "/about",
    isActive: true,
    sortOrder: 9,
  },
  {
    slotName: "street_showcase_3",
    title: "MONOCHROME OBSIDIAN SILHOUETTE",
    subtitle: "450 GSM Combed Loopback Cotton and matte ribbing.",
    imagePath: "/assets/editorial-hoodies/hoodie-editorial-10.jpeg",
    ctaText: "EXPLORE THE ARCHIVE",
    ctaLink: "/shop",
    isActive: true,
    sortOrder: 10,
  },
  {
    slotName: "marquee_strip_1",
    title: "CATALOG ATMOSPHERE BANNER // EDITION 011",
    subtitle: "Woven in Lahore // International standard tailoring.",
    imagePath: "/assets/editorial-hoodies/hoodie-editorial-11.jpeg",
    ctaText: "VIEW ALL PIECES",
    ctaLink: "/shop",
    isActive: true,
    sortOrder: 11,
  },
  {
    slotName: "marquee_strip_2",
    title: "ATELIER PROVENANCE STORY BANNER",
    subtitle: "Export grade pure cotton // High GSM structure.",
    imagePath: "/assets/editorial-hoodies/hoodie-editorial-12.jpeg",
    ctaText: "READ MANIFESTO",
    ctaLink: "/about",
    isActive: true,
    sortOrder: 12,
  },
  {
    slotName: "secondary_page_shop",
    title: "URBAN MOVEMENT RUNWAY // ARCHIVE 013",
    subtitle: "Heavyweight Terry Loop // Relaxed Boxy Fit.",
    imagePath: "/assets/editorial-hoodies/hoodie-editorial-13.jpeg",
    ctaText: "CURATED CATALOG",
    ctaLink: "/shop",
    isActive: true,
    sortOrder: 13,
  },
  {
    slotName: "secondary_page_contact",
    title: "CONCIERGE & CLIENT DESK HERO // ARCHIVE 014",
    subtitle: "Midnight Obsidian Palette // 450 GSM Heavy French Terry.",
    imagePath: "/assets/editorial-hoodies/hoodie-editorial-14.jpeg",
    ctaText: "CONTACT CONCIERGE",
    ctaLink: "/contact",
    isActive: true,
    sortOrder: 14,
  },
];

async function main() {
  console.log("--------------------------------------------------");
  console.log("⚡ INITIATING DATABASE SEEDING...");
  console.log("STRICT RULE: Product catalog MUST remain at ZERO (0) items.");
  console.log("STRICT RULE: 14 editorial hoodies must be seeded into Banner table ONLY.");
  console.log("--------------------------------------------------");

  // Ensure 0 products
  await prisma.product.deleteMany({});
  console.log("✔ Products table cleared. Current product count: 0.");

  // Seed default Admin User: admin@samora.pk / admin123
  const adminEmail = "admin@samora.pk";
  const defaultPassword = "admin123";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
    },
  });

  console.log(`✔ Admin account verified/created:`);
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: ${defaultPassword}`);
  console.log(`   Access:   http://localhost:3000/admin/login`);

  // Seed Default Site Settings
  const settings = [
    { key: "site_name", value: "SAMORA ARCHIVE" },
    { key: "tagline", value: "LUXURY STREETWEAR HAUTE COUTURE" },
    { key: "phone", value: "+92 300 0000000" },
    { key: "email", value: "concierge@samora.pk" },
    { key: "currency", value: "PKR" },
    { key: "free_shipping_threshold", value: "5000" },
    { key: "shipping_flat_rate", value: "250" },
    { key: "ticker_text", value: "FREE EXPRESS NATIONWIDE DELIVERY ON ORDERS OVER PKR 5,000 // 14 BESPOKE EDITORIAL SILHOUETTES // 100% HEAVYWEIGHT COMBED COTTON // CASH ON DELIVERY AVAILABLE" },
    { key: "homeProductLimit", value: "8" },
    { key: "hangerEnabled", value: "true" },
    { key: "hangerSpeed", value: "slow" },
    { key: "hangerTitle", value: "Fresh Off The Rail" },
    { key: "hangerSubtitle", value: "Click any piece hanging on the line to inspect details" },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✔ Site settings seeded.");

  // Seed Default Categories
  const categories = [
    { name: "Hoodies", slug: "hoodies", description: "450 GSM Heavyweight French Terry Hoodies", sortOrder: 1, isActive: true },
    { name: "Oversized Tees", slug: "oversized-tees", description: "280 GSM Combed Cotton Heavy Boxy Cut", sortOrder: 2, isActive: true },
    { name: "Jackets", slug: "jackets", description: "Structured Outerwear & Brutalist Bomber Cuts", sortOrder: 3, isActive: true },
    { name: "Sweatshirts", slug: "sweatshirts", description: "Crewnecks & Ribbed Heavy Pullovers", sortOrder: 4, isActive: true },
    { name: "Bottoms", slug: "bottoms", description: "Heavyweight French Terry Sweatpants & Wide Cargo Cuts", sortOrder: 5, isActive: true },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
      },
      create: cat,
    });
  }
  console.log("✔ Default categories seeded.");

  // Seed all 14 Editorial Hoodie Banners into the Banner table
  await prisma.banner.deleteMany({});
  for (const banner of EDITORIAL_HOODIE_BANNERS) {
    await prisma.banner.create({
      data: banner,
    });
  }
  console.log(`✔ All 14 editorial hoodie banners seeded into Banner table.`);

  const productCount = await prisma.product.count();
  const bannerCount = await prisma.banner.count();
  console.log("--------------------------------------------------");
  console.log(`FINAL CATALOG AUDIT: ${productCount} PRODUCTS IN DATABASE.`);
  console.log(`FINAL BANNER AUDIT: ${bannerCount} BANNERS IN DATABASE.`);
  console.log("READY FOR PRODUCTION USE.");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
