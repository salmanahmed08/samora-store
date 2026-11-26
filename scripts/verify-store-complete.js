const http = require("http");
const fs = require("fs");
const path = require("path");
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

function fetchUrl(urlPath, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: urlPath,
      method: "GET",
      headers,
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
    req.end();
  });
}

async function verifyAll() {
  console.log("==========================================");
  console.log("SAMORA BOUTIQUE END-TO-END VERIFICATION");
  console.log("==========================================\n");

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

  try {
    // 1. Verify Database State
    console.log("--- 1. DATABASE AUDIT ---");
    const productCount = await prisma.product.count();
    assert(productCount === 0, `Buyable product count is strictly 0 (found ${productCount})`);

    const categoryCount = await prisma.category.count();
    assert(categoryCount >= 5, `Categories count >= 5 (found ${categoryCount})`);

    const bannerCount = await prisma.banner.count();
    assert(bannerCount === 14, `Campaign banners count === 14 (found ${bannerCount})`);

    const adminUser = await prisma.adminUser.findUnique({ where: { email: "admin@samora.pk" } });
    assert(!!adminUser, "Admin user exists (admin@samora.pk)");

    const settings = await prisma.siteSetting.findMany();
    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    assert(settingsMap["whatsapp"] === "03344826415", "Settings WhatsApp phone is 03344826415");
    assert(settingsMap["hangerEnabled"] === "true", "Settings hangerEnabled is true");

    // 2. Physical Asset Verification
    console.log("\n--- 2. PHYSICAL ASSET AUDIT ---");
    const logos = [
      "public/assets/logos/logo-1.jpeg",
      "public/assets/logos/logo-2.jpeg",
      "public/assets/logos/logo-3.jpeg",
      "public/assets/logos/logo-4.jpeg",
    ];
    for (const logo of logos) {
      const fullPath = path.join(process.cwd(), logo);
      assert(fs.existsSync(fullPath), `Logo file exists: ${logo}`);
    }

    const hoodiesDir = path.join(process.cwd(), "public/assets/editorial-hoodies");
    const hoodieFiles = fs.readdirSync(hoodiesDir).filter((f) => f.startsWith("hoodie-editorial-") && f.endsWith(".jpeg"));
    assert(hoodieFiles.length === 14, `14 editorial hoodie files exist (found ${hoodieFiles.length})`);

    // 3. Storefront Pages HTTP Verification
    console.log("\n--- 3. STOREFRONT ROUTES HTTP 200 ---");
    const publicRoutes = [
      "/",
      "/shop",
      "/lookbook",
      "/about",
      "/contact",
      "/track-order",
      "/cart",
    ];

    for (const route of publicRoutes) {
      const res = await fetchUrl(route);
      assert(res.status === 200, `Public route ${route} returned HTTP 200`);
    }

    // 4. Admin Pages Verification
    console.log("\n--- 4. ADMIN ROUTES HTTP 200 ---");
    const adminRoutes = [
      "/admin/login",
      "/admin",
      "/admin/products",
      "/admin/products/bulk",
      "/admin/products/new",
      "/admin/categories",
      "/admin/storefront",
      "/admin/orders",
      "/admin/banners",
      "/admin/messages",
      "/admin/settings",
    ];

    for (const route of adminRoutes) {
      const res = await fetchUrl(route);
      assert(res.status === 200, `Admin route ${route} returned HTTP 200`);
    }

    // 5. Public & Authenticated Admin APIs Verification
    console.log("\n--- 5. PUBLIC & AUTHENTICATED ADMIN APIS ---");
    const adminToken = createSessionToken(adminUser.id, adminUser.email);
    const authHeaders = {
      Cookie: `${COOKIE_NAME}=${adminToken}`,
    };

    const publicApis = [
      "/api/categories",
      "/api/products",
      "/api/banners",
    ];

    for (const api of publicApis) {
      const res = await fetchUrl(api);
      assert(res.status === 200, `Public API ${api} returned HTTP 200`);
      try {
        const json = JSON.parse(res.body);
        assert(typeof json === "object", `API ${api} returned valid JSON`);
      } catch (e) {
        assert(false, `API ${api} response is not JSON`);
      }
    }

    const adminApis = [
      "/api/admin/categories",
      "/api/admin/hanger-settings",
      "/api/admin/settings",
    ];

    for (const api of adminApis) {
      const res = await fetchUrl(api, authHeaders);
      assert(res.status === 200, `Admin API ${api} (Authenticated) returned HTTP 200`);
      try {
        const json = JSON.parse(res.body);
        assert(typeof json === "object", `Admin API ${api} returned valid JSON`);
      } catch (e) {
        assert(false, `Admin API ${api} response is not JSON`);
      }
    }

    // 6. Home Page Content Checks
    console.log("\n--- 6. HOME PAGE CONTENT CHECKS ---");
    const homeRes = await fetchUrl("/");
    assert(homeRes.body.includes("Fresh Off The Rail") || homeRes.body.includes("Fresh Off"), "Home includes Rail slider title");
    assert(homeRes.body.includes("03344826415"), "Home includes official WhatsApp number 03344826415");
    assert(homeRes.body.includes("instagram.com/samorapk2008"), "Home includes official Instagram link");
    assert(homeRes.body.includes("facebook.com/profile.php?id=61593252326408"), "Home includes official Facebook link");

    // 7. Verify Zero Monospace Fonts in public layout & typography
    console.log("\n--- 7. TYPOGRAPHY AUDIT ---");
    const layoutPath = path.join(process.cwd(), "src/app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");
    assert(!layoutContent.includes("JetBrains_Mono"), "No JetBrains_Mono font loaded in layout");
    assert(!layoutContent.includes("font-mono"), "No font-mono class in global layout");

    console.log("\n==========================================");
    console.log(`TOTAL: ${passed} PASSED, ${failed} FAILED`);
    console.log("==========================================");
  } catch (err) {
    console.error("Verification failed with exception:", err);
    failed++;
  } finally {
    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

verifyAll();
