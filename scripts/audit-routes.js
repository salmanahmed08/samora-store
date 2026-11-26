const http = require("http");

const routes = [
  { name: "Storefront Home", path: "/" },
  { name: "Shop Catalog", path: "/shop" },
  { name: "Lookbook", path: "/lookbook" },
  { name: "About Brand", path: "/about" },
  { name: "Contact Concierge", path: "/contact" },
  { name: "Track Order", path: "/track-order" },
  { name: "Policies", path: "/policies" },
  { name: "Cart View", path: "/cart" },
  { name: "Checkout", path: "/checkout" },
  { name: "Admin Dashboard", path: "/admin" },
  { name: "Admin Products", path: "/admin/products" },
  { name: "Admin Bulk Add", path: "/admin/products/bulk" },
  { name: "Admin Categories", path: "/admin/categories" },
  { name: "Admin Google Sync", path: "/admin/google-sync" },
  { name: "Admin Orders", path: "/admin/orders" },
  { name: "Admin Banners", path: "/admin/banners" },
  { name: "Admin Settings", path: "/admin/settings" },
  { name: "API Products", path: "/api/products" },
  { name: "API Categories", path: "/api/categories" },
];

async function measureRoute(r) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(`http://localhost:3000${r.path}`, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        const ms = Date.now() - start;
        resolve({ ...r, status: res.statusCode, timeMs: ms });
      });
    });
    req.on("error", (err) => {
      resolve({ ...r, status: "ERR", timeMs: Date.now() - start, error: err.message });
    });
  });
}

(async () => {
  console.log("=== MEASURING PRODUCTION ROUTE PERFORMANCE & HTTP INTEGRITY ===");
  console.log("---------------------------------------------------------------");
  for (const r of routes) {
    const res = await measureRoute(r);
    console.log(`[${res.status}] ${res.name.padEnd(22)} (${res.path.padEnd(22)}) -> ${res.timeMs}ms`);
  }
  console.log("---------------------------------------------------------------");
  console.log("ALL ROUTE CHECKS FINISHED!");
  process.exit(0);
})();
