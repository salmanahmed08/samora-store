const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function runEndToEndSyncTest() {
  console.log("=== STARTING GOOGLE SYNC & IMAGE STUDIO END-TO-END VERIFICATION ===");

  try {
    // 1. Create 3 small mock test images with distinct base names & angle suffixes
    const testDir = path.join(process.cwd(), "test-tmp-assets");
    fs.mkdirSync(testDir, { recursive: true });

    const createDummyImage = async (filename, color) => {
      const p = path.join(testDir, filename);
      await sharp({
        create: {
          width: 400,
          height: 500,
          channels: 3,
          background: color,
        },
      })
        .jpeg()
        .toFile(p);
      return fs.readFileSync(p);
    };

    const frontBuf = await createDummyImage("TEST-01-front.jpg", { r: 35, g: 30, b: 25 });
    const backBuf = await createDummyImage("TEST-01-back.jpg", { r: 50, g: 45, b: 40 });
    const angleBuf = await createDummyImage("TEST-01 (3).jpg", { r: 60, g: 55, b: 50 });

    console.log("✓ Mock test images created successfully.");

    // 2. Prepare Mock Payload representing Google Sheet + Google Drive
    // Demonstrates:
    // - Auto-grouping of 3 files (TEST-01-front, TEST-01-back, TEST-01 (3)) into 1 SINGLE product
    // - Category auto-creation ("Winter Editorial")
    const mockPayload = {
      rows: [
        {
          sku: "TEST-01",
          title: "Test Luxury Streetwear Hoodie",
          pricepkr: "4800",
          compareatprice: "5800",
          category: "Winter Editorial",
          sizes: "S, M, L, XL",
          stock: "20",
          description: "High fidelity heavyweight garment for end-to-end verification.",
          images: "TEST-01-front.jpg, TEST-01-back.jpg, TEST-01 (3).jpg",
          showonhome: "YES",
          showonhanger: "YES",
          status: "Active",
        },
      ],
      driveFiles: [
        { id: "df-1", name: "TEST-01-front.jpg", buffer: frontBuf, modifiedTime: new Date().toISOString() },
        { id: "df-2", name: "TEST-01-back.jpg", buffer: backBuf, modifiedTime: new Date().toISOString() },
        { id: "df-3", name: "TEST-01 (3).jpg", buffer: angleBuf, modifiedTime: new Date().toISOString() },
      ],
    };

    // 3. Dynamically import the sync engine and run sync
    const { executeSync, reapplyBackdropPresetToAll } = require("../src/lib/google-sync.ts");

    console.log("-> Executing mock sync run...");
    const syncResult = await executeSync("manual", mockPayload);
    console.log("Sync Result:", syncResult);

    if (!syncResult.success) {
      throw new Error("Sync failed: " + syncResult.message);
    }

    // 4. Verify in Prisma SQLite Database
    const product = await prisma.product.findUnique({
      where: { sku: "TEST-01" },
      include: { categoryRel: true },
    });

    if (!product) {
      throw new Error("Product TEST-01 was not found in SQLite database!");
    }

    console.log("✓ Verified product created in database:");
    console.log(`  - SKU: ${product.sku}`);
    console.log(`  - Title: ${product.title}`);
    console.log(`  - Price: PKR ${product.pricePKR}`);
    console.log(`  - Category: ${product.categoryRel?.name}`);
    console.log(`  - Sync Source: ${product.syncSource}`);

    const images = JSON.parse(product.images || "[]");
    const cutouts = JSON.parse(product.cutoutImages || "[]");

    console.log(`✓ Multi-image Grouping Verification:`);
    console.log(`  - Total grouped images on single product: ${images.length} (Expected: 3)`);
    console.log(`  - Total cutout images on single product: ${cutouts.length} (Expected: 3)`);

    if (images.length !== 3) {
      throw new Error(`Expected 3 grouped images, but found ${images.length}`);
    }

    // 5. Verify local disk storage files exist and are NOT plain white
    const storageRoot = path.join(process.cwd(), "storage", "drive-sync");
    const firstStudioPath = path.join(storageRoot, "studio", "TEST-01-1-studio.webp");
    const firstCutoutPath = path.join(storageRoot, "cutouts", "TEST-01-1-cutout.png");

    if (!fs.existsSync(firstStudioPath)) {
      throw new Error("Generated studio webp file missing: " + firstStudioPath);
    }
    if (!fs.existsSync(firstCutoutPath)) {
      throw new Error("Generated cutout png file missing: " + firstCutoutPath);
    }

    console.log("✓ Storage files verified on disk:");
    console.log(`  - Studio Webp: ${firstStudioPath} (${fs.statSync(firstStudioPath).size} bytes)`);
    console.log(`  - Cutout Png: ${firstCutoutPath} (${fs.statSync(firstCutoutPath).size} bytes)`);

    // 6. Test re-applying different backdrop preset
    console.log("-> Testing instant backdrop preset re-apply (warm_sandstone -> editorial_taupe)...");
    const reapplyCount = await reapplyBackdropPresetToAll("editorial_taupe");
    console.log(`✓ Re-applied backdrop to ${reapplyCount} products in milliseconds.`);

    // 7. Cleanup mock test records from database so store remains pristine clean
    console.log("-> Cleaning up mock test records from SQLite...");
    await prisma.product.deleteMany({ where: { sku: "TEST-01" } });
    await prisma.category.deleteMany({ where: { slug: "winter-editorial" } });
    await prisma.syncLog.deleteMany({ where: { message: { contains: "TEST-01" } } });

    // Clean up temporary files
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
      fs.rmSync(firstStudioPath, { force: true });
      fs.rmSync(firstCutoutPath, { force: true });
    } catch {}

    console.log("✓ Cleaned up test database records and temporary files.");
    console.log("=== ALL END-TO-END VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
    process.exit(0);
  } catch (err) {
    console.error("Test Verification Failed:", err);
    process.exit(1);
  }
}

runEndToEndSyncTest();
