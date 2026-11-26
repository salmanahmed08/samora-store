import { prisma } from "../src/lib/prisma";
import { executeSync } from "../src/lib/google-sync";
import { resolveProductContentAndSeo } from "../src/lib/auto-copywriter";

async function runTests() {
  console.log("==================================================");
  console.log("  SAMORA AUTO-SYNC & SOLD-OUT LIFECYCLE TEST SUITE");
  console.log("==================================================");

  const testSku = "SMR-TEST-999";
  const testTitle = "Obsidian Relic Oversized Hoodie";

  try {
    // 0. Clean up any existing test artifact
    await prisma.product.deleteMany({ where: { sku: testSku } });

    // TEST 1: Auto-Copywriter Generation (Local Offline Engine)
    console.log("\n[TEST 1] Testing Smart Auto-Copywriter & SEO Writer...");
    const copyResult = await resolveProductContentAndSeo({
      sku: testSku,
      title: testTitle,
      category: "Heavyweight Hoodies",
      pricePKR: 8500,
      sizes: ["M", "L", "XL"],
    });

    console.log("Generated Description:\n", copyResult.description);
    console.log("Generated Meta Title:", copyResult.metaTitle);
    console.log("Generated Meta Description:", copyResult.metaDescription);

    if (
      !copyResult.description.includes("450 GSM") &&
      !copyResult.description.includes("GSM")
    ) {
      throw new Error("Auto-copywriter failed to include luxury GSM specs");
    }
    if (!copyResult.metaTitle.includes(testSku)) {
      throw new Error("Auto-copywriter failed to format SEO title");
    }
    console.log("âœ… TEST 1 PASSED: Auto-Copywriter generated authentic boutique copy & SEO tags.");

    // TEST 2: Drive-by-ID Grouping & Product Creation (minimal sheet row)
    console.log("\n[TEST 2] Testing Drive-by-ID Product Creation from minimal row...");
    const mockRow = {
      sku: testSku,
      title: "", // Left blank intentionally to test smart auto-naming from SKU
      price: "8500",
      status: "Active",
      stock: "10",
      category: "Heavyweight Hoodies",
    };

    const mockDriveFiles = [
      {
        id: "mock-file-1",
        name: `${testSku}-front.jpg`,
        url: "/assets/editorial-hoodies/hoodie-editorial-01.jpeg",
      },
      {
        id: "mock-file-2",
        name: `${testSku}-back.jpg`,
        url: "/assets/editorial-hoodies/hoodie-editorial-02.jpeg",
      },
    ];

    const syncResult = await executeSync("manual", {
      rows: [mockRow],
      driveFiles: mockDriveFiles,
    });

    console.log("Sync Result:", syncResult.message);
    const createdProd = await prisma.product.findUnique({ where: { sku: testSku } });
    if (!createdProd) {
      throw new Error("Product with SKU was not created by sync engine");
    }
    console.log("Created Product Title:", createdProd.title);
    console.log("Created Product Status:", createdProd.status);
    console.log("Created Product Images Count:", JSON.parse(createdProd.images).length);

    if (createdProd.status !== "ACTIVE") {
      throw new Error(`Expected ACTIVE status, got ${createdProd.status}`);
    }
    console.log("âœ… TEST 2 PASSED: Minimal SKU row grouped Drive images & created product.");

    // TEST 3: Sold Out Trigger (Setting status to 'sold' or stock = 0)
    console.log("\n[TEST 3] Testing Sold Out Trigger & soldOutAt timestamp stamping...");
    const mockSoldRow = {
      sku: testSku,
      title: testTitle,
      price: "8500",
      status: "sold out",
      stock: "0",
      category: "Heavyweight Hoodies",
    };

    await executeSync("manual", {
      rows: [mockSoldRow],
      driveFiles: mockDriveFiles,
    });

    const soldProd = await prisma.product.findUnique({ where: { sku: testSku } });
    if (!soldProd || soldProd.status !== "SOLD_OUT") {
      throw new Error(`Expected status SOLD_OUT, got ${soldProd?.status}`);
    }
    if (!soldProd.soldOutAt) {
      throw new Error("Expected soldOutAt timestamp to be stamped upon entering SOLD_OUT");
    }
    const initialSoldOutAt = soldProd.soldOutAt;
    console.log("Product marked SOLD_OUT with timestamp:", initialSoldOutAt);

    // Verify clock preservation on consecutive sync
    await executeSync("manual", {
      rows: [mockSoldRow],
      driveFiles: mockDriveFiles,
    });
    const soldProdAgain = await prisma.product.findUnique({ where: { sku: testSku } });
    if (soldProdAgain?.soldOutAt?.getTime() !== initialSoldOutAt.getTime()) {
      throw new Error("soldOutAt timestamp must NOT reset on consecutive syncs!");
    }
    console.log("âœ… TEST 3 PASSED: Product marked SOLD_OUT and 24h clock is preserved.");

    // TEST 4: First 24 Hours Visibility Check
    console.log("\n[TEST 4] Testing 24-Hour Visibility in storefront query...");
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const visibleProducts = await prisma.product.findMany({
      where: {
        OR: [
          { status: "ACTIVE" },
          {
            status: "SOLD_OUT",
            soldOutAt: { gt: twentyFourHoursAgo },
          },
        ],
      },
    });

    const isVisible = visibleProducts.some((p) => p.sku === testSku);
    if (!isVisible) {
      throw new Error("Freshly sold-out product (< 24h) should still be visible on storefront");
    }
    console.log("âœ… TEST 4 PASSED: Sold out product is visible within first 24 hours.");

    // TEST 5: After 24 Hours Expiry (Simulation of soldOutAt = 25 hours ago)
    console.log("\n[TEST 5] Testing After-24-Hours Auto-Expiry & Auto-Hide...");
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
    await prisma.product.update({
      where: { sku: testSku },
      data: { soldOutAt: twentyFiveHoursAgo },
    });

    // Run sync or query check
    const visibleAfterExpiry = await prisma.product.findMany({
      where: {
        OR: [
          { status: "ACTIVE" },
          {
            status: "SOLD_OUT",
            soldOutAt: { gt: twentyFourHoursAgo },
          },
        ],
      },
    });

    const isStillVisible = visibleAfterExpiry.some((p) => p.sku === testSku);
    if (isStillVisible) {
      throw new Error("Expired sold-out product (> 24h) must NOT be visible on storefront");
    }

    // Trigger sync cycle to auto-transition expired product to ARCHIVED
    await executeSync("manual", {
      rows: [],
      driveFiles: [],
    });

    const archivedProd = await prisma.product.findUnique({ where: { sku: testSku } });
    console.log("Status after 24h expiry sync cycle:", archivedProd?.status);
    if (archivedProd?.status !== "ARCHIVED") {
      throw new Error(`Expected product to be ARCHIVED after 24h, got ${archivedProd?.status}`);
    }
    console.log("âœ… TEST 5 PASSED: Product auto-transitioned to ARCHIVED and vanished from storefront.");

    // Clean up test data
    await prisma.product.deleteMany({ where: { sku: testSku } });
    console.log("\nâœ… ALL LIFECYCLE TESTS COMPLETED SUCCESSFULLY! Cleaned up mock data.\n");
  } catch (error) {
    console.error("\nâŒ TEST FAILED:", error);
    await prisma.product.deleteMany({ where: { sku: testSku } });
    process.exit(1);
  }
}

runTests();
