async function testRoutes() {
  const routes = [
    "/",
    "/shop",
    "/lookbook",
    "/about",
    "/contact",
    "/cart",
    "/checkout",
    "/track-order",
    "/policies",
    "/admin/login",
    "/api/products",
    "/api/banners",
  ];

  console.log("Checking live endpoints on http://localhost:3000...\n");
  let allOk = true;

  for (const r of routes) {
    try {
      const res = await fetch(`http://localhost:3000${r}`);
      console.log(`[${res.status}] ${r}`);
      if (res.status >= 400) {
        allOk = false;
      }
    } catch (err) {
      console.error(`[FAIL] ${r} -> ${err.message}`);
      allOk = false;
    }
  }

  if (allOk) {
    console.log("\nALL ROUTES RESPONDED WITH STATUS 200 OK!");
  } else {
    console.error("\nSOME ROUTES FAILED!");
    process.exit(1);
  }
}

testRoutes();
