import http from "http";

const BASE_URL = "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function request(
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {}
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(
      url,
      {
        method: options.method || "GET",
        headers: options.headers || {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body: data,
          });
        });
      }
    );
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runAudit() {
  console.log("=================================================");
  console.log("   SAMORA LUXURY STORE - PRE-LAUNCH AUDIT & QA   ");
  console.log("=================================================\n");

  // 1. Security Headers on Storefront
  try {
    const res = await request("/");
    const frameOptions = res.headers["x-frame-options"];
    const contentType = res.headers["x-content-type-options"];
    const referrer = res.headers["referrer-policy"];
    const poweredBy = res.headers["x-powered-by"];

    const ok =
      res.statusCode === 200 &&
      frameOptions === "DENY" &&
      contentType === "nosniff" &&
      referrer === "strict-origin-when-cross-origin" &&
      !poweredBy;

    results.push({
      name: "Security Headers Verification (X-Frame-Options, nosniff, Referrer, No-Powered-By)",
      passed: ok,
      details: `Status: ${res.statusCode}, X-Frame: ${frameOptions}, Nosniff: ${contentType}, Powered-By: ${poweredBy || "Hidden (OK)"}`,
    });
  } catch (err: any) {
    results.push({ name: "Security Headers Verification", passed: false, details: err.message });
  }

  // 2. Admin Endpoint 401 Authorization Guards
  const adminEndpoints = [
    { path: "/api/admin/products", method: "GET" },
    { path: "/api/admin/orders", method: "GET" },
    { path: "/api/admin/categories", method: "GET" },
    { path: "/api/admin/banners", method: "GET" },
    { path: "/api/admin/messages", method: "GET" },
    { path: "/api/admin/settings", method: "GET" },
    { path: "/api/admin/google-sync", method: "GET" },
    { path: "/api/admin/whatsapp-bot", method: "GET" },
    { path: "/api/admin/voice-agent", method: "GET" },
    { path: "/api/admin/seo", method: "GET" },
    { path: "/api/admin/stats", method: "GET" },
    {
      path: "/api/admin/change-password",
      method: "POST",
      body: JSON.stringify({ currentPassword: "foo", newPassword: "bar" }),
    },
  ];

  for (const ep of adminEndpoints) {
    try {
      const res = await request(ep.path, {
        method: ep.method,
        headers: ep.body ? { "Content-Type": "application/json" } : {},
        body: ep.body,
      });
      const isProtected = res.statusCode === 401;
      results.push({
        name: `Admin Route Guard: ${ep.path}`,
        passed: isProtected,
        details: `HTTP Status: ${res.statusCode} (Expected 401 Unauthorized)`,
      });
    } catch (err: any) {
      results.push({ name: `Admin Route Guard: ${ep.path}`, passed: false, details: err.message });
    }
  }

  // 3. Public SEO & Core Pages
  const publicPages = [
    { path: "/", title: "Homepage" },
    { path: "/shop", title: "Shop Catalog" },
    { path: "/lookbook", title: "Lookbook Editorial" },
    { path: "/about", title: "About Samora" },
    { path: "/contact", title: "Contact Us" },
    { path: "/policies", title: "Policies" },
    { path: "/track-order", title: "Track Order" },
    { path: "/cart", title: "Cart Drawer/Page" },
    { path: "/checkout", title: "Checkout" },
    { path: "/sitemap.xml", title: "Dynamic XML Sitemap" },
    { path: "/robots.txt", title: "Robots.txt" },
  ];

  for (const page of publicPages) {
    try {
      const res = await request(page.path);
      const passed = res.statusCode === 200;
      results.push({
        name: `Public Route: ${page.title} (${page.path})`,
        passed,
        details: `HTTP Status: ${res.statusCode}`,
      });
    } catch (err: any) {
      results.push({ name: `Public Route: ${page.title}`, passed: false, details: err.message });
    }
  }

  // 4. Rate Limiting Protection Test on /api/auth/login
  try {
    let hit429 = false;
    for (let i = 0; i < 7; i++) {
      const res = await request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "198.51.100.42" },
        body: JSON.stringify({ email: "attacker@test.com", password: "wrongpassword" }),
      });
      if (res.statusCode === 429) {
        hit429 = true;
        break;
      }
    }
    results.push({
      name: "Rate Limiter Defense: Brute-Force Block on /api/auth/login",
      passed: hit429,
      details: hit429
        ? "Successfully throttled attacker IP with HTTP 429 Too Many Requests"
        : "Failed to throttle within expected hit threshold",
    });
  } catch (err: any) {
    results.push({ name: "Rate Limiter Defense", passed: false, details: err.message });
  }

  // 5. Public Settings Sanitization Test
  try {
    const res = await request("/api/settings");
    let passed = false;
    if (res.statusCode === 200) {
      const json = JSON.parse(res.body);
      const leakedKey = ["googleApiKey", "whatsappAccessToken", "voiceAgentSecret", "geminiApiKey"].find(
        (k) => json[k] !== undefined
      );
      passed = !leakedKey;
      results.push({
        name: "Public Settings API Secret Masking",
        passed,
        details: passed
          ? "No API keys or sensitive secrets exposed in public /api/settings"
          : `Leaked secret key in public payload: ${leakedKey}`,
      });
    } else {
      results.push({
        name: "Public Settings API Secret Masking",
        passed: false,
        details: `HTTP ${res.statusCode}`,
      });
    }
  } catch (err: any) {
    results.push({ name: "Public Settings API Secret Masking", passed: false, details: err.message });
  }

  // Print Summary
  console.log("\n=================== AUDIT RESULTS ===================");
  let passedCount = 0;
  for (const r of results) {
    const icon = r.passed ? "✓ PASS" : "✗ FAIL";
    console.log(`${icon} | ${r.name.padEnd(55)} | ${r.details}`);
    if (r.passed) passedCount++;
  }
  console.log("=====================================================");
  console.log(`TOTAL SCORE: ${passedCount}/${results.length} PASSED (${Math.round((passedCount / results.length) * 100)}%)`);

  if (passedCount === results.length) {
    console.log("\n>>> ALL SECURITY GUARDS & CORE ROUTES 100% OPERATIONAL & VERIFIED <<<\n");
    process.exit(0);
  } else {
    console.error("\n>>> SOME CHECKS FAILED <<<\n");
    process.exit(1);
  }
}

runAudit();
