const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Hoodies", slug: "hoodies", description: "450 GSM Heavyweight French Terry Hoodies", sortOrder: 1, isActive: true },
  { name: "Oversized Tees", slug: "oversized-tees", description: "280 GSM Combed Cotton Heavy Boxy Cut", sortOrder: 2, isActive: true },
  { name: "Jackets", slug: "jackets", description: "Structured Outerwear & Brutalist Bomber Cuts", sortOrder: 3, isActive: true },
  { name: "Sweatshirts", slug: "sweatshirts", description: "Crewnecks & Ribbed Heavy Pullovers", sortOrder: 4, isActive: true },
  { name: "Bottoms", slug: "bottoms", description: "Heavyweight French Terry Sweatpants & Wide Cargo Cuts", sortOrder: 5, isActive: true },
];

const DEFAULT_SETTINGS = [
  { key: "homeProductLimit", value: "8" },
  { key: "hangerEnabled", value: "true" },
  { key: "hangerSpeed", value: "slow" },
  { key: "hangerTitle", value: "Fresh Off The Rail" },
  { key: "hangerSubtitle", value: "Click any piece hanging on the line to inspect details" },
];

async function main() {
  console.log("Upserting default categories...");
  for (const cat of DEFAULT_CATEGORIES) {
    const res = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
      },
      create: cat,
    });
    console.log(`  [OK] Category: ${res.name} (${res.slug})`);
  }

  console.log("Upserting default site settings...");
  for (const s of DEFAULT_SETTINGS) {
    const res = await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {}, // don't overwrite if existing
      create: s,
    });
    console.log(`  [OK] Setting: ${res.key} = ${res.value}`);
  }

  const catCount = await prisma.category.count();
  const prodCount = await prisma.product.count();
  const bannerCount = await prisma.banner.count();
  const adminCount = await prisma.adminUser.count();
  console.log("-----------------------------------------");
  console.log(`Categories count: ${catCount}`);
  console.log(`Products count:   ${prodCount} (remains 0)`);
  console.log(`Banners count:    ${bannerCount}`);
  console.log(`Admins count:     ${adminCount}`);
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
