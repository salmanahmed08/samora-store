const http = require("http");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SESSION_SECRET = process.env.SESSION_SECRET || "samora-luxury-secret-key-2026-pk-streetwear";
const COOKIE_NAME = "samora_admin_session";

function createSessionToken(adminId, email) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const payload = JSON.stringify({ adminId, email, exp });
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64url") + "." + hmac;
}

function request(urlPath, method = "GET", body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: urlPath,
      method,
      headers: {
        ...headers,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTest() {
  console.log("================================================================================");
  console.log("  SAMORA BULK-ADD 3 HOODIES END-TO-END QUALITY & FUNCTIONAL VERIFICATION        ");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  let createdProductIds = [];

  try {
    // 1. Initial State Check
    console.log("--- STEP 1: INITIAL STATE CHECK ---");
    const initialCount = await prisma.product.count();
    assert(initialCount === 0, `Initial product count in DB is 0 (found ${initialCount})`);

    const admin = await prisma.adminUser.findUnique({ where: { email: "admin@samora.pk" } });
    assert(!!admin, "Admin user exists for authentication");

    const adminToken = createSessionToken(admin.id, admin.email);
    const authHeaders = {
      Cookie: `${COOKIE_NAME}=${adminToken}`,
    };

    // 2. Fetch Category for Hoodies
    const hoodieCategory = await prisma.category.findUnique({ where: { slug: "hoodies" } });
    assert(!!hoodieCategory, "Hoodies category exists in DB");

    // 3. Bulk Add 3 Sample Hoodies at Same PKR Rate
    console.log("\n--- STEP 2: BULK ADD 3 SAMPLE HOODIES (SAME RATE PKR 7,500) ---");
    const bulkPayload = {
      commonPricePKR: 7500,
      commonCompareAtPrice: 8900,
      commonCategory: "Hoodies",
      commonCategoryId: hoodieCategory ? hoodieCategory.id : null,
      commonSizes: ["S", "M", "L", "XL", "XXL"],
      commonStock: 15,
      commonDescription: "450 GSM Heavyweight French Terry cotton hoodie with architectural boxy drape.",
      commonShowOnHome: true,
      commonShowOnHanger: true,
      items: [
        {
          title: "Samora Charcoal Oversized Hoodie",
          image: "/assets/editorial-hoodies/hoodie-editorial-01.jpeg",
          hangerOrder: 1,
        },
        {
          title: "Samora Mineral Wash Heavy Pullover",
          image: "/assets/editorial-hoodies/hoodie-editorial-02.jpeg",
          hangerOrder: 2,
        },
        {
          title: "Samora Obsidian Raw-Edge Hoodie",
          image: "/assets/editorial-hoodies/hoodie-editorial-03.jpeg",
          hangerOrder: 3,
        },
      ],
    };

    const bulkRes = await request("/api/admin/products/bulk", "POST", bulkPayload, authHeaders);
    assert(bulkRes.status === 201, `POST /api/admin/products/bulk returned HTTP 201 (got ${bulkRes.status})`);

    const bulkData = JSON.parse(bulkRes.body);
    assert(bulkData.count === 3, `Bulk Add created exactly 3 products (count: ${bulkData.count})`);

    // Verify products in DB
    const dbProducts = await prisma.product.findMany({
      where: { category: "Hoodies" },
      orderBy: { hangerOrder: "asc" },
    });
    createdProductIds = dbProducts.map((p) => p.id);
    assert(dbProducts.length === 3, `Database now holds 3 hoodies (found ${dbProducts.length})`);
    for (const p of dbProducts) {
      assert(p.pricePKR === 7500, `Product "${p.title}" has common price PKR 7500`);
      assert(p.showOnHome === true, `Product "${p.title}" has showOnHome === true`);
      assert(p.showOnHanger === true, `Product "${p.title}" has showOnHanger === true`);
    }

    // 4. Verify Home Page Rope & Hanger Slider
    console.log("\n--- STEP 3: VERIFY HOME PAGE ROPE & HANGER SLIDER ---");
    const homeRes = await request("/");
    assert(homeRes.status === 200, "Home page returned HTTP 200");
    assert(homeRes.body.includes("Fresh Off The Rail"), "Home page includes Rail Slider title");

    for (const p of dbProducts) {
      assert(homeRes.body.includes(p.title), `Home page renders product on rail: "${p.title}"`);
    }

    // Check price format in PKR
    assert(homeRes.body.includes("7,500"), "Home page renders formatted price Rs 7,500");

    // 5. Verify Products API & Filtering
    console.log("\n--- STEP 4: VERIFY PRODUCTS API & CATEGORY FILTERING ---");
    const hangerRes = await request("/api/products?showOnHanger=true");
    assert(hangerRes.status === 200, "GET /api/products?showOnHanger=true returned HTTP 200");
    const hangerProducts = JSON.parse(hangerRes.body);
    assert(hangerProducts.length === 3, `Hanger query returns 3 products (found ${hangerProducts.length})`);

    const hoodiesFilterRes = await request("/api/products?category=Hoodies");
    const filteredHoodies = JSON.parse(hoodiesFilterRes.body);
    assert(filteredHoodies.length === 3, `Category filter Hoodies returns 3 products (found ${filteredHoodies.length})`);

    const jacketsFilterRes = await request("/api/products?category=Jackets");
    const filteredJackets = JSON.parse(jacketsFilterRes.body);
    assert(filteredJackets.length === 0, `Category filter Jackets returns 0 products (found ${filteredJackets.length})`);

    // 6. Verify Home Limit Setting
    console.log("\n--- STEP 5: VERIFY HOME PRODUCT LIMIT SETTING ---");
    const limit2Res = await request("/api/products?showOnHome=true&limit=2");
    const limit2Products = JSON.parse(limit2Res.body);
    assert(limit2Products.length === 2, `API with limit=2 returns exactly 2 products (found ${limit2Products.length})`);

    const limit8Res = await request("/api/products?showOnHome=true&limit=8");
    const limit8Products = JSON.parse(limit8Res.body);
    assert(limit8Products.length === 3, `API with limit=8 returns all 3 products (found ${limit8Products.length})`);

    // 7. Verify WhatsApp Order Link Format
    console.log("\n--- STEP 6: VERIFY WHATSAPP ORDER FORMAT ---");
    for (const p of dbProducts) {
      assert(
        homeRes.body.includes("03344826415") || homeRes.body.includes("923344826415"),
        `WhatsApp phone number 03344826415 is present for order contact`
      );
    }

    // 8. Clean Up Temporary Products
    console.log("\n--- STEP 7: CLEANUP TEMPORARY TEST PRODUCTS ---");
    for (const id of createdProductIds) {
      const delRes = await request(`/api/admin/products/${id}`, "DELETE", null, authHeaders);
      assert(delRes.status === 200, `Deleted temporary product ${id}`);
    }

    const finalCount = await prisma.product.count();
    assert(finalCount === 0, `Database catalog cleanly restored to strictly 0 products (found ${finalCount})`);

    console.log("\n================================================================================");
    console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED                                   `);
    console.log("================================================================================");
  } catch (err) {
    console.error("Test execution failed:", err);
    failed++;
  } finally {
    // Ensure cleanup even if an assertion threw
    if (createdProductIds.length > 0) {
      await prisma.product.deleteMany({
        where: { id: { in: createdProductIds } },
      });
    }
    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTest();
