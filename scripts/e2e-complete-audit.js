const http = require("http");
const fs = require("fs");
const path = require("path");

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        ...options,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          let parsed;
          try {
            parsed = JSON.parse(buffer.toString("utf8"));
          } catch {
            parsed = buffer.toString("utf8");
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed,
            raw: buffer,
          });
        });
      }
    );
    req.on("error", reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function buildMultipartFormData(fields, files, boundary) {
  const parts = [];

  for (const [key, value] of Object.entries(fields)) {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`
      )
    );
  }

  for (const { fieldName, fileName, contentType, buffer } of files) {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\nContent-Type: ${contentType}\r\n\r\n`
      )
    );
    parts.push(buffer);
    parts.push(Buffer.from("\r\n"));
  }

  parts.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(parts);
}

async function runCompleteAudit() {
  console.log("================================================================================");
  console.log("          SAMORA ARCHIVE // COMPREHENSIVE PRE-LAUNCH AUDIT & VERIFICATION       ");
  console.log("================================================================================\n");

  // 1. ASSET INTEGRITY AUDIT
  console.log("--- 1. VERIFYING 4 BRAND LOGOS AND 14 HOODIE EDITORIAL ASSETS ---");
  const logos = [
    { id: "logo-1", file: "public/assets/logos/logo-1.jpeg", touchpoint: "Storefront Sticky Top Bar" },
    { id: "logo-2", file: "public/assets/logos/logo-2.jpeg", touchpoint: "Luxury Footer & Order Invoice" },
    { id: "logo-3", file: "public/assets/logos/logo-3.jpeg", touchpoint: "Admin Dashboard Sidebar & Watermark" },
    { id: "logo-4", file: "public/assets/logos/logo-4.jpeg", touchpoint: "Animated Preloader & Favicon" },
  ];

  for (const logo of logos) {
    const fullPath = path.join(process.cwd(), logo.file);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`CRITICAL: Logo file missing at ${logo.file}`);
    }
    const stat = fs.statSync(fullPath);
    console.log(`  [OK] ${logo.id} -> ${logo.file} (${(stat.size / 1024).toFixed(1)} KB) -> Assigned: ${logo.touchpoint}`);
  }

  console.log("\nVerifying 14 Editorial Hoodie Visuals:");
  for (let i = 1; i <= 14; i++) {
    const num = String(i).padStart(2, "0");
    const hPath = `public/assets/editorial-hoodies/hoodie-editorial-${num}.jpeg`;
    const fullPath = path.join(process.cwd(), hPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`CRITICAL: Editorial hoodie visual missing at ${hPath}`);
    }
    const stat = fs.statSync(fullPath);
    console.log(`  [OK] Look #${num}: ${hPath} (${(stat.size / 1024).toFixed(1)} KB)`);
  }

  // 2. CONTACT AND SOCIAL DETAILS VERIFICATION
  console.log("\n--- 2. VERIFYING OFFICIAL BRAND CONTACT & SOCIAL CREDENTIALS ---");
  const brandAssetsCode = fs.readFileSync(path.join(process.cwd(), "src/lib/brand-assets.ts"), "utf8");
  if (!brandAssetsCode.includes("03344826415") || !brandAssetsCode.includes("https://wa.me/923344826415")) {
    throw new Error("CRITICAL: WhatsApp 03344826415 not found in src/lib/brand-assets.ts!");
  }
  if (!brandAssetsCode.includes("https://www.instagram.com/samorapk2008/")) {
    throw new Error("CRITICAL: Instagram https://www.instagram.com/samorapk2008/ not found!");
  }
  if (!brandAssetsCode.includes("https://www.facebook.com/profile.php?id=61593252326408")) {
    throw new Error("CRITICAL: Facebook https://www.facebook.com/profile.php?id=61593252326408 not found!");
  }
  console.log("  [OK] WhatsApp: 03344826415 (https://wa.me/923344826415)");
  console.log("  [OK] Instagram: https://www.instagram.com/samorapk2008/");
  console.log("  [OK] Facebook:  https://www.facebook.com/profile.php?id=61593252326408");

  // 3. CATALOG INITIAL STATE AUDIT (MUST BE STRICTLY 0 PRODUCTS)
  console.log("\n--- 3. VERIFYING ZERO DUMMY PRODUCTS IN DATABASE ---");
  const initialCatRes = await request({ path: "/api/products", method: "GET" });
  if (initialCatRes.statusCode !== 200 || !Array.isArray(initialCatRes.body)) {
    throw new Error("Failed to query /api/products: " + JSON.stringify(initialCatRes.body));
  }
  console.log(`  [OK] Current Product Count in Catalog: ${initialCatRes.body.length}`);
  if (initialCatRes.body.length !== 0) {
    throw new Error(`CRITICAL: Catalog has ${initialCatRes.body.length} products, expected strictly 0!`);
  }

  // 4. AUTHENTICATION & SESSION TEST
  console.log("\n--- 4. TESTING ADMIN AUTHENTICATION (admin@samora.pk / admin123) ---");
  const loginRes = await request(
    {
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    JSON.stringify({ email: "admin@samora.pk", password: "admin123" })
  );

  if (loginRes.statusCode !== 200 || !loginRes.body?.success) {
    throw new Error("Admin login failed! " + JSON.stringify(loginRes.body));
  }
  const setCookie = loginRes.headers["set-cookie"];
  const cookieHeader = Array.isArray(setCookie)
    ? setCookie.map((c) => c.split(";")[0]).join("; ")
    : setCookie.split(";")[0];
  console.log(`  [OK] Admin Session Token generated: ${cookieHeader.substring(0, 40)}...`);

  // 5. LOCAL IMAGE UPLOAD AUDIT (/api/admin/upload -> /public/uploads/)
  console.log("\n--- 5. TESTING LOCAL IMAGE UPLOAD (Offline Localhost Multipart) ---");
  const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
  const sampleImagePath = path.join(process.cwd(), "public/assets/logos/logo-1.jpeg");
  const sampleBuffer = fs.readFileSync(sampleImagePath);

  const multipartPayload = buildMultipartFormData(
    {},
    [
      {
        fieldName: "file",
        fileName: "audit-test-swatch.jpg",
        contentType: "image/jpeg",
        buffer: sampleBuffer,
      },
    ],
    boundary
  );

  const uploadRes = await request(
    {
      path: "/api/admin/upload",
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": multipartPayload.length,
        Cookie: cookieHeader,
      },
    },
    multipartPayload
  );

  console.log(`  [OK] Upload HTTP Status: ${uploadRes.statusCode}`);
  if (uploadRes.statusCode !== 200 || !uploadRes.body?.url) {
    throw new Error("Upload failed: " + JSON.stringify(uploadRes.body));
  }
  const uploadedUrl = uploadRes.body.url;
  console.log(`  [OK] Uploaded file saved locally at: ${uploadedUrl}`);

  const localUploadedFileOnDisk = path.join(process.cwd(), "public", uploadedUrl.replace(/^\//, ""));
  if (!fs.existsSync(localUploadedFileOnDisk)) {
    throw new Error(`CRITICAL: Uploaded file does not exist on disk at ${localUploadedFileOnDisk}`);
  }
  console.log(`  [OK] Verified physical file on disk (${fs.statSync(localUploadedFileOnDisk).size} bytes)`);

  // 6. PRODUCT CREATION E2E (Admin -> Live Storefront -> PDP)
  console.log("\n--- 6. CREATING TEMPORARY LUXURY PIECE VIA /admin/products/new ---");
  const tempPiece = {
    title: "AUDIT HEAVYWEIGHT OBSIDIAN CREWNECK",
    description: "480 GSM French Terry with double-needle ribbed collar and drop-shoulder drape.",
    pricePKR: 8500,
    compareAtPrice: 11000,
    category: "Hoodies",
    sizes: ["S", "M", "L", "XL"],
    stock: 25,
    images: [uploadedUrl],
    featured: true,
    status: "ACTIVE",
  };

  const createRes = await request(
    {
      path: "/api/admin/products",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    },
    JSON.stringify(tempPiece)
  );

  console.log(`  [OK] Create Product HTTP Status: ${createRes.statusCode}`);
  const created = createRes.body;
  if (!created?.id) {
    throw new Error("Failed to create temporary product: " + JSON.stringify(createRes.body));
  }
  console.log(`  [OK] Created Product ID: ${created.id}`);
  console.log(`  [OK] Generated Unique Slug: ${created.slug}`);
  console.log(`  [OK] Price: ${created.pricePKR} PKR`);

  // 7. VERIFY IMMEDIATE STOREFRONT PROPAGATION
  console.log("\n--- 7. VERIFYING DYNAMIC VISIBILITY ON STOREFRONT & PRODUCT DETAIL PAGE ---");
  const shopCheck = await request({ path: "/api/products", method: "GET" });
  if (shopCheck.body.length !== 1 || shopCheck.body[0].id !== created.id) {
    throw new Error("Storefront catalog did not immediately reflect the created piece!");
  }
  console.log(`  [OK] Live /api/products returns: 1 item -> "${shopCheck.body[0].title}" (${shopCheck.body[0].pricePKR} PKR)`);

  // Fetch Product Detail Page API
  const pdpApiCheck = await request({ path: `/api/products/${created.slug}`, method: "GET" });
  if (pdpApiCheck.statusCode !== 200 || pdpApiCheck.body.slug !== created.slug) {
    throw new Error("PDP API failed to resolve product by slug!");
  }
  console.log(`  [OK] Live /api/products/${created.slug} resolved successfully with stock: ${pdpApiCheck.body.stock}`);

  // Fetch Product Detail Page HTML
  const pdpHtmlCheck = await request({ path: `/product/${created.slug}`, method: "GET" });
  console.log(`  [OK] Storefront PDP /product/${created.slug} rendered HTTP ${pdpHtmlCheck.statusCode}`);
  if (pdpHtmlCheck.statusCode !== 200) {
    throw new Error(`PDP HTML request returned status ${pdpHtmlCheck.statusCode}`);
  }

  // 8. TEARDOWN & RESTORATION (STRICT 0 PRODUCTS RULE)
  console.log("\n--- 8. CLEANING UP TEMPORARY PIECE (RESTORING TO 0 PRODUCTS) ---");
  const deleteRes = await request({
    path: `/api/admin/products/${created.id}`,
    method: "DELETE",
    headers: { Cookie: cookieHeader },
  });
  console.log(`  [OK] DELETE /api/admin/products/${created.id} HTTP Status: ${deleteRes.statusCode}`);

  // Delete uploaded test image
  if (fs.existsSync(localUploadedFileOnDisk)) {
    fs.unlinkSync(localUploadedFileOnDisk);
    console.log(`  [OK] Cleaned up temporary upload file: ${localUploadedFileOnDisk}`);
  }

  // Verify catalog count returned to 0
  const finalCheck = await request({ path: "/api/products", method: "GET" });
  console.log(`  [OK] Final Catalog Product Count: ${finalCheck.body.length}`);
  if (finalCheck.body.length !== 0) {
    throw new Error(`CRITICAL: Catalog did not return to 0 products (found ${finalCheck.body.length})!`);
  }

  console.log("\n================================================================================");
  console.log("            ALL AUDITS AND VERIFICATIONS PASSED WITH 100% SUCCESS               ");
  console.log("================================================================================\n");
}

runCompleteAudit().catch((err) => {
  console.error("\n[!] AUDIT FAILED:", err);
  process.exit(1);
});
