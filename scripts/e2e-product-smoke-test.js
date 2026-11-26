const http = require("http");

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path,
        method: options.method || "GET",
        headers: options.headers || {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        });
      }
    );
    req.on("error", reject);
    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runSmokeTest() {
  console.log("=== STARTING ADMIN PRODUCT INGESTION & STOREFRONT SMOKE TEST ===");

  // 1. Initial public storefront catalog check
  const initialRes = await request("/api/products");
  console.log(`1. Initial /api/products count: ${initialRes.body?.length || 0}`);
  if (initialRes.body?.length !== 0) {
    console.warn(`WARNING: Initial product count was ${initialRes.body?.length}, expected 0.`);
  }

  // 2. Authenticate as Admin (admin@samora.pk / admin123)
  console.log("2. Authenticating as admin@samora.pk...");
  const loginRes = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      email: "admin@samora.pk",
      password: "admin123",
    },
  });

  console.log(`   Login status: ${loginRes.statusCode}`);
  if (loginRes.statusCode !== 200 || !loginRes.body?.success) {
    throw new Error("Admin login failed: " + JSON.stringify(loginRes.body));
  }

  const setCookie = loginRes.headers["set-cookie"];
  if (!setCookie || setCookie.length === 0) {
    throw new Error("No Set-Cookie returned from /api/auth/login!");
  }

  const cookieHeader = Array.isArray(setCookie)
    ? setCookie.map((c) => c.split(";")[0]).join("; ")
    : setCookie.split(";")[0];
  console.log("   Admin session acquired:", cookieHeader.substring(0, 35) + "...");

  const authHeaders = {
    "Content-Type": "application/json",
    Cookie: cookieHeader,
  };

  // 3. Ingest a test luxury streetwear piece via /api/admin/products
  console.log("3. Ingesting test product via /api/admin/products...");
  const newProductPayload = {
    title: "TEST HEAVYWEIGHT OVERSHIRT - OBSIDIAN BLACK",
    description: "Architectural 480GSM loopback cotton overshirt with raw metal hardware.",
    pricePKR: 12500,
    compareAtPrice: 15000,
    category: "Overshirts",
    sizes: ["M", "L", "XL"],
    stock: 12,
    images: ["/uploads/test-sample.jpg"],
    measurements: { chest: "24.5 in", length: "29.0 in" },
    featured: true,
    status: "ACTIVE",
  };

  const createRes = await request("/api/admin/products", {
    method: "POST",
    headers: authHeaders,
    body: newProductPayload,
  });

  console.log(`   POST /api/admin/products status: ${createRes.statusCode}`);
  const createdProduct = createRes.body;
  if (!createdProduct?.id) {
    throw new Error("Failed to create product via /api/admin/products: " + JSON.stringify(createRes.body));
  }
  console.log("   Successfully created product:", createdProduct.id, "Slug:", createdProduct.slug);

  // 4. Verify it immediately appears in public storefront catalog (/api/products)
  console.log("4. Verifying dynamic update in public storefront /api/products...");
  const storefrontRes = await request("/api/products");
  console.log(`   Storefront product count: ${storefrontRes.body?.length}`);
  const found = storefrontRes.body.find((p) => p.id === createdProduct.id);
  if (!found) {
    throw new Error("Created product was not found in public storefront /api/products!");
  }
  console.log("   SUCCESS: Storefront dynamically received piece:", found.title, "Price:", found.pricePKR, "PKR");

  // 5. Verify single product detail endpoint
  console.log("5. Testing GET /api/products/" + found.slug + "...");
  const singleRes = await request(`/api/products/${found.slug}`);
  console.log(`   GET /api/products/${found.slug} status: ${singleRes.statusCode}`);
  if (singleRes.statusCode !== 200 || singleRes.body.slug !== found.slug) {
    throw new Error("Failed to fetch product by slug!");
  }
  console.log("   SUCCESS: Single product detail resolved with measurements:", singleRes.body.measurements);

  // 6. Test updating product price and stock
  console.log("6. Testing PATCH /api/admin/products/" + createdProduct.id + "...");
  const updateRes = await request(`/api/admin/products/${createdProduct.id}`, {
    method: "PATCH",
    headers: authHeaders,
    body: {
      pricePKR: 13500,
      stock: 8,
    },
  });
  console.log(`   PATCH status: ${updateRes.statusCode}, new price: ${updateRes.body.pricePKR}, new stock: ${updateRes.body.stock}`);

  // 7. Delete the test piece to maintain clean 0 initial products requirement
  console.log("7. Deleting test product to restore catalog to strictly 0 items...");
  const deleteRes = await request(`/api/admin/products/${createdProduct.id}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  console.log(`   DELETE status: ${deleteRes.statusCode}`);

  // 8. Final verification
  console.log("8. Verifying final catalog state...");
  const finalRes = await request("/api/products");
  console.log(`   Final storefront product count: ${finalRes.body?.length}`);
  if (finalRes.body?.length === 0) {
    console.log("   SUCCESS: Catalog cleanly returned to ZERO (0) initial state as strictly required!");
  } else {
    throw new Error(`Catalog count is ${finalRes.body?.length}, expected 0!`);
  }

  console.log("=== ALL E2E PRODUCT SMOKE TESTS PASSED CLEANLY ===");
}

runSmokeTest().catch((err) => {
  console.error("SMOKE TEST FAILED:", err);
  process.exit(1);
});
