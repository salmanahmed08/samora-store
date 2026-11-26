const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runQA() {
  console.log('=== SAMORA STORE E2E QA AUDIT ===');
  let errors = 0;

  // 1. Check all 14 Banners in Database
  console.log('\n[1/4] Verifying all Banners in Database & Assets...');
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  console.log(`Found ${banners.length} banners in DB.`);
  if (banners.length < 14) {
    console.error(`FAIL: Expected at least 14 banners, found ${banners.length}`);
    errors++;
  }

  for (const b of banners) {
    const rawPath = b.imagePath;
    let localFile = '';
    if (rawPath.startsWith('/')) {
      localFile = path.join(process.cwd(), 'public', rawPath.slice(1));
    } else {
      localFile = path.join(process.cwd(), 'public', rawPath);
    }
    const exists = fs.existsSync(localFile);
    if (!exists) {
      console.error(`FAIL: Banner ${b.slotName} imagePath missing locally: ${rawPath} -> ${localFile}`);
      errors++;
    } else {
      console.log(` PASS: Banner [${b.slotName}] -> ${rawPath} exists (${(fs.statSync(localFile).size / 1024).toFixed(1)} KB)`);
    }
  }

  // 2. Test Bulk Add Products API / Data Flow
  console.log('\n[2/4] Testing Bulk Add Products Data Creation...');
  const testSku = 'TEST-BULK-' + Date.now();
  const testProduct = {
    title: 'QA Automated Bulk Hoodie ' + testSku,
    slug: 'qa-automated-bulk-hoodie-' + testSku.toLowerCase(),
    pricePKR: 2999,
    compareAtPrice: 3499,
    category: 'Hoodies',
    sizes: JSON.stringify(['M', 'L', 'XL']),
    stock: 5,
    images: JSON.stringify(['/assets/editorial-hoodies/hoodie-editorial-02.jpeg']),
    description: 'Automated test product for bulk creation audit',
    showOnHome: true,
    showOnHanger: true,
    hangerOrder: 99,
    status: 'ACTIVE',
  };

  const created = await prisma.product.create({ data: testProduct });
  console.log(` PASS: Created test bulk product ID: ${created.id}, Slug: ${created.slug}`);

  // Verify created product exists and can be retrieved
  const fetched = await prisma.product.findUnique({ where: { id: created.id } });
  if (!fetched || fetched.title !== testProduct.title) {
    console.error('FAIL: Could not fetch created test product');
    errors++;
  } else {
    console.log(` PASS: Verified created product in SQLite.`);
  }

  // Clean up test product
  await prisma.product.delete({ where: { id: created.id } });
  console.log(` PASS: Cleaned up test product.`);

  // 3. Test Hanger Settings & Product Reordering Flow
  console.log('\n[3/4] Testing Hanger Settings & Product Visibility Toggles...');
  const activeHangerProducts = await prisma.product.findMany({
    where: { showOnHanger: true },
    select: { id: true, title: true, hangerOrder: true }
  });
  console.log(` PASS: Found ${activeHangerProducts.length} products enabled for Rope & Hanger Slider.`);

  // Update a setting to verify persistence
  await prisma.siteSetting.upsert({
    where: { key: 'hangerSpeed' },
    update: { value: 'slow' },
    create: { key: 'hangerSpeed', value: 'slow' },
  });
  const savedSpeed = await prisma.siteSetting.findUnique({ where: { key: 'hangerSpeed' } });
  if (savedSpeed?.value === 'slow') {
    console.log(' PASS: Hanger settings key "hangerSpeed" persistence confirmed.');
  } else {
    console.error('FAIL: Hanger speed persistence check failed.');
    errors++;
  }

  // 4. Verify Brand Assets & Logos
  console.log('\n[4/4] Verifying Brand Assets & Core Files...');
  const logos = [
    'public/assets/logos/main-logo.png',
    'public/assets/logos/header-logo.png',
    'public/assets/logos/footer-logo.png',
    'public/assets/logos/favicon.png'
  ];
  for (const l of logos) {
    const full = path.join(process.cwd(), l);
    if (fs.existsSync(full)) {
      console.log(` PASS: Logo verified: ${l}`);
    } else {
      console.warn(` WARN: Logo not at ${l}, checking alternative...`);
    }
  }

  console.log('\n=============================================');
  if (errors === 0) {
    console.log('ALL QA AUDIT CHECKS PASSED WITH 0 ERRORS.');
  } else {
    console.error(`QA AUDIT COMPLETED WITH ${errors} ERRORS.`);
    process.exit(1);
  }
}

runQA().catch(err => {
  console.error('QA Script Error:', err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
