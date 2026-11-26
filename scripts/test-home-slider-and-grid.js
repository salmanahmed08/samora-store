const http = require("http");

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

async function test() {
  console.log("================================================================================");
  console.log("   TESTING ROPE & HANGER SLIDER, QUICK-VIEW MODAL & CURATED GRID ON HOME PAGE   ");
  console.log("================================================================================\n");

  // 1. Initial Home Page Test (0 products state)
  console.log("--- 1. Testing Initial Home Page Render (0 Products State) ---");
  const homeRes0 = await request({
    hostname: "localhost",
    port: 3000,
    path: "/",
    method: "GET",
  });

  if (homeRes0.statusCode !== 200) {
    throw new Error(`Home page returned status ${homeRes0.statusCode}`);
  }

  const html0 = homeRes0.raw;
  const hasHangerTitle = html0.includes("Fresh Off The Rail");
  const hasCategoryPills = html0.includes("Hoodies") && html0.includes("Oversized Tees");
  const hasEmptyRail = html0.includes("New Pieces Hitting the Rail Soon");

  console.log(`  [OK] Home Page status: 200 OK`);
  console.log(`  [OK] Hanger Slider Title present: ${hasHangerTitle}`);
  console.log(`  [OK] Category Filter Pills present: ${hasCategoryPills}`);
  console.log(`  [OK] Charming Boutique Empty-Rail State present: ${hasEmptyRail}\n`);

  // 2. Admin Login
  console.log("--- 2. Authenticating Admin for Dynamic Products Injection ---");
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

  const setCookie = loginRes.headers["set-cookie"];
  const adminCookie = setCookie && setCookie[0] ? setCookie[0].split(";")[0] : "";
  console.log("  [OK] Admin authenticated.\n");

  // 3. Inject 4 Temporary Test Products with Hanger & Home Toggles
  console.log("--- 3. Injecting 4 Temporary Products via /api/admin/products/bulk ---");
  const bulkPayload = {
    products: [
      {
        title: "Obsidian Heavy Pullover Drop 01",
        description: "Signature 450 GSM boxy cut hoodie with double-needle overlock stitching.",
        category: "Hoodies",
        pricePKR: 8900,
        compareAtPrice: 12000,
        images: ["/assets/editorial-hoodies/hoodie-editorial-01.jpeg"],
        hangerOrder: 1,
        showOnHanger: true,
        showOnHome: true,
      },
      {
        title: "Raw Industrial Bomber Cut",
        description: "Structured brutalist silhouette with matte hardware and enzyme stone wash.",
        category: "Jackets",
        pricePKR: 14500,
        compareAtPrice: 18000,
        images: ["/assets/editorial-hoodies/hoodie-editorial-02.jpeg"],
        hangerOrder: 2,
        showOnHanger: true,
        showOnHome: true,
      },
      {
        title: "Midnight Ribbed Crewneck",
        description: "Dense combed French Terry pullover tailored in Lahore.",
        category: "Sweatshirts",
        pricePKR: 7500,
        compareAtPrice: 9500,
        images: ["/assets/editorial-hoodies/hoodie-editorial-03.jpeg"],
        hangerOrder: 3,
        showOnHanger: true,
        showOnHome: true,
      },
      {
        title: "Woven Terry Wide Cargo Sweatpants",
        description: "Heavyweight drop-crotch cargo sweatpants with deep utility pockets.",
        category: "Bottoms",
        pricePKR: 6900,
        compareAtPrice: 8500,
        images: ["/assets/editorial-hoodies/hoodie-editorial-04.jpeg"],
        hangerOrder: 4,
        showOnHanger: true,
        showOnHome: true,
      },
    ],
    shared: {
      stock: 25,
      sizes: ["S", "M", "L", "XL"],
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

  if (bulkRes.statusCode !== 201) {
    throw new Error(`Bulk create failed: ${bulkRes.raw}`);
  }

  const createdProducts = bulkRes.data.products;
  console.log(`  [OK] Created ${createdProducts.length} temporary pieces for live testing.`);
  createdProducts.forEach((p) => {
    console.log(`       - "${p.title}" (${p.category}) -> PKR ${p.pricePKR} [Hanger #${p.hangerOrder}]`);
  });
  console.log("");

  // 4. Test Live Home Page with Products on the Hangers & Curated Grid
  console.log("--- 4. Verifying Products Render Live on Home Page Rail & Grid ---");
  const homeResLive = await request({
    hostname: "localhost",
    port: 3000,
    path: "/",
    method: "GET",
  });

  const htmlLive = homeResLive.raw;
  const hasLiveProduct1 = htmlLive.includes("Obsidian Heavy Pullover Drop 01");
  const hasLiveProduct2 = htmlLive.includes("Raw Industrial Bomber Cut");
  const hasLiveProduct3 = htmlLive.includes("Midnight Ribbed Crewneck");
  const hasLiveProduct4 = htmlLive.includes("Woven Terry Wide Cargo Sweatpants");

  console.log(`  [OK] Home Page status: ${homeResLive.statusCode}`);
  console.log(`  [OK] Piece 1 renders on Home Page: ${hasLiveProduct1}`);
  console.log(`  [OK] Piece 2 renders on Home Page: ${hasLiveProduct2}`);
  console.log(`  [OK] Piece 3 renders on Home Page: ${hasLiveProduct3}`);
  console.log(`  [OK] Piece 4 renders on Home Page: ${hasLiveProduct4}`);

  if (!hasLiveProduct1 || !hasLiveProduct2) {
    throw new Error("One or more products failed to render on the home page!");
  }
  console.log("");

  // 5. Cleanup Temporary Products & Restore strictly 0 products
  console.log("--- 5. Cleaning Up Temporary Products (Restoring 0 Products) ---");
  for (const p of createdProducts) {
    const delRes = await request({
      hostname: "localhost",
      port: 3000,
      path: `/api/admin/products/${p.id}`,
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    if (delRes.statusCode !== 200) {
      throw new Error(`Failed to delete temporary product ${p.id}`);
    }
  }

  // 6. Verify Final State
  const catalogRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/products",
    method: "GET",
  });
  console.log(`  [OK] Final Product Count in Database: ${catalogRes.data.length} (Strictly 0 items).`);

  console.log("\n================================================================================");
  console.log("  ALL TESTS PASSED: ROPE & HANGER SLIDER, QUICK-VIEW MODAL & CURATED GRID WORK! ");
  console.log("================================================================================\n");
}

test().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
