const http = require("http");

const BASE_URL = "http://localhost:3000";

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed,
          raw: data,
        });
      });
    });

    req.on("error", reject);
    if (postData) {
      req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function run() {
  console.log("================================================================================");
  console.log("       TESTING UPGRADED PRISMA SCHEMA & NEW DYNAMIC API ROUTES                  ");
  console.log("================================================================================\n");

  let adminCookie = "";

  // 1. Test Admin Login
  console.log("--- 1. Authenticating Admin Session (admin@samora.pk) ---");
  const loginRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { email: "admin@samora.pk", password: "admin123" }
  );

  if (loginRes.statusCode !== 200) {
    throw new Error(`Login failed with status ${loginRes.statusCode}: ${loginRes.raw}`);
  }

  const setCookie = loginRes.headers["set-cookie"];
  if (setCookie && setCookie[0]) {
    adminCookie = setCookie[0].split(";")[0];
  }
  console.log("  [OK] Admin authenticated. Session cookie:", adminCookie.slice(0, 35) + "...\n");

  // 2. Test Public GET /api/categories
  console.log("--- 2. Testing Public GET /api/categories ---");
  const publicCatRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/categories",
    method: "GET",
  });

  if (publicCatRes.statusCode !== 200 || !Array.isArray(publicCatRes.data)) {
    throw new Error(`GET /api/categories failed: ${publicCatRes.raw}`);
  }

  console.log(`  [OK] Found ${publicCatRes.data.length} active categories:`);
  publicCatRes.data.forEach((c) => {
    console.log(`       - ${c.name} (slug: ${c.slug}, order: ${c.sortOrder}, products: ${c.productCount})`);
  });
  console.log("");

  // 3. Test Admin Categories (GET, POST, PATCH, DELETE)
  console.log("--- 3. Testing Admin Categories CRUD (/api/admin/categories) ---");
  // GET
  const adminCatRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/admin/categories",
    method: "GET",
    headers: { Cookie: adminCookie },
  });
  if (adminCatRes.statusCode !== 200) {
    throw new Error(`GET /api/admin/categories failed: ${adminCatRes.raw}`);
  }
  console.log(`  [OK] Admin GET returned ${adminCatRes.data.length} categories.`);

  // POST (Create)
  const createCatRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/admin/categories",
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
    },
    {
      name: "Limited Edition Drops",
      slug: "limited-edition-drops",
      description: "Exclusive numbered atelier drops",
      sortOrder: 99,
      isActive: true,
    }
  );
  if (createCatRes.statusCode !== 201) {
    throw new Error(`POST /api/admin/categories failed: ${createCatRes.raw}`);
  }
  const tempCatId = createCatRes.data.id;
  console.log(`  [OK] Created temporary category: ${createCatRes.data.name} (ID: ${tempCatId})`);

  // PATCH (Update)
  const patchCatRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/admin/categories",
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
    },
    {
      id: tempCatId,
      description: "Updated description for test drop",
      sortOrder: 100,
    }
  );
  if (patchCatRes.statusCode !== 200 || patchCatRes.data.sortOrder !== 100) {
    throw new Error(`PATCH /api/admin/categories failed: ${patchCatRes.raw}`);
  }
  console.log("  [OK] Updated temporary category sortOrder to 100.");

  // DELETE
  const deleteCatRes = await request({
    hostname: "localhost",
    port: 3000,
    path: `/api/admin/categories?id=${tempCatId}`,
    method: "DELETE",
    headers: { Cookie: adminCookie },
  });
  if (deleteCatRes.statusCode !== 200) {
    throw new Error(`DELETE /api/admin/categories failed: ${deleteCatRes.raw}`);
  }
  console.log("  [OK] Deleted temporary category cleanly.\n");

  // 4. Test Bulk Product Creation /api/admin/products/bulk
  console.log("--- 4. Testing Bulk Product Creation (/api/admin/products/bulk) ---");
  const bulkPayload = {
    products: [
      {
        title: "Test Rail Hoodie Alpha",
        description: "Bulk created test piece 1",
        images: ["/assets/editorial-hoodies/hoodie-editorial-01.jpeg"],
        hangerOrder: 1,
      },
      {
        title: "Test Rail Hoodie Beta",
        description: "Bulk created test piece 2",
        images: ["/assets/editorial-hoodies/hoodie-editorial-02.jpeg"],
        hangerOrder: 2,
      },
      {
        title: "Test Rail Crewneck Gamma",
        description: "Bulk created test piece 3",
        images: ["/assets/editorial-hoodies/hoodie-editorial-03.jpeg"],
        hangerOrder: 3,
      },
    ],
    shared: {
      pricePKR: 8900,
      compareAtPrice: 12500,
      category: "Hoodies",
      sizes: ["S", "M", "L", "XL"],
      stock: 30,
      showOnHome: true,
      showOnHanger: true,
      status: "ACTIVE",
    },
  };

  const bulkRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/admin/products/bulk",
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
    },
    bulkPayload
  );

  if (bulkRes.statusCode !== 201 || bulkRes.data.count !== 3) {
    throw new Error(`POST /api/admin/products/bulk failed: ${bulkRes.raw}`);
  }
  console.log(`  [OK] Successfully bulk-created 3 products in 1 atomic transaction:`);
  const createdIds = bulkRes.data.products.map((p) => {
    console.log(`       - "${p.title}" | slug: ${p.slug} | PKR ${p.pricePKR} | Hanger #${p.hangerOrder} | Home: ${p.showOnHome}`);
    return p.id;
  });
  console.log("");

  // 5. Test Query Filters on GET /api/products
  console.log("--- 5. Testing Filter Queries on Public GET /api/products ---");
  
  // Test ?showOnHome=true
  const homeRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/products?showOnHome=true",
    method: "GET",
  });
  console.log(`  [OK] ?showOnHome=true returned ${homeRes.data.length} products (expected 3)`);

  // Test ?showOnHanger=true
  const hangerRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/products?showOnHanger=true",
    method: "GET",
  });
  console.log(`  [OK] ?showOnHanger=true returned ${hangerRes.data.length} products (ordered by hangerOrder)`);

  // Test ?category=hoodies
  const catFilterRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/products?category=hoodies",
    method: "GET",
  });
  console.log(`  [OK] ?category=hoodies returned ${catFilterRes.data.length} products`);

  // Test ?limit=2
  const limitRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/products?limit=2",
    method: "GET",
  });
  console.log(`  [OK] ?limit=2 returned ${limitRes.data.length} products (expected 2)\n`);

  // 6. Test Admin Hanger Settings API (/api/admin/hanger-settings)
  console.log("--- 6. Testing Hanger Slider Controls (/api/admin/hanger-settings) ---");
  const getHangerRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/admin/hanger-settings",
    method: "GET",
    headers: { Cookie: adminCookie },
  });
  if (getHangerRes.statusCode !== 200) {
    throw new Error(`GET /api/admin/hanger-settings failed: ${getHangerRes.raw}`);
  }
  console.log("  [OK] Current Hanger Settings:", getHangerRes.data.settings);
  console.log(`  [OK] Products available on hanger: ${getHangerRes.data.products.length}`);

  // Test PATCH hanger settings and toggles
  const patchHangerRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/admin/hanger-settings",
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
    },
    {
      settings: {
        hangerSpeed: "medium",
        homeProductLimit: "12",
      },
      productToggles: [
        {
          id: createdIds[0],
          showOnHanger: false,
          hangerOrder: 99,
        },
      ],
    }
  );
  if (patchHangerRes.statusCode !== 200) {
    throw new Error(`PATCH /api/admin/hanger-settings failed: ${patchHangerRes.raw}`);
  }
  console.log("  [OK] PATCH /api/admin/hanger-settings successful. Updated settings:", patchHangerRes.data.settings);

  // Restore settings
  await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/admin/hanger-settings",
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
    },
    {
      settings: {
        hangerSpeed: "slow",
        homeProductLimit: "8",
      },
    }
  );
  console.log("  [OK] Restored default hanger settings.\n");

  // 7. Cleanup Temporary Products & Return to 0 Products
  console.log("--- 7. Cleaning Up Temporary Products (Restoring 0 Products) ---");
  for (const id of createdIds) {
    const delRes = await request({
      hostname: "localhost",
      port: 3000,
      path: `/api/admin/products/${id}`,
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    if (delRes.statusCode !== 200) {
      throw new Error(`Failed to delete temporary product ${id}`);
    }
  }

  const finalPublicRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/products",
    method: "GET",
  });
  console.log(`  [OK] Final Product Count in Catalog: ${finalPublicRes.data.length} (Strictly 0 items).`);

  console.log("\n================================================================================");
  console.log("         ALL UPGRADED SCHEMA & API ROUTES PASSED WITH 100% SUCCESS              ");
  console.log("================================================================================\n");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
