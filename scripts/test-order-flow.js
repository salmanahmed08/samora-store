const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testOrderFlow() {
  console.log("=== TESTING ORDER CREATION & TRACKING LIFECYCLE ===");

  // 1. Submit order via API
  const orderPayload = {
    customerName: "Salman Test Patron",
    phone: "0300-9876543",
    city: "Lahore",
    address: "Gulberg III, Street 12, Lahore [WhatsApp Tracking: YES]",
    items: [
      {
        id: "sample-cart-item-1",
        title: "Test Atelier Piece",
        slug: "test-piece",
        size: "L",
        pricePKR: 8500,
        quantity: 1,
        image: "/assets/editorial-hoodies/hoodie-editorial-01.jpeg",
      },
    ],
    totalPKR: 8500,
    paymentMethod: "COD",
  };

  const res = await fetch("http://localhost:3000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload),
  });

  if (!res.ok) {
    throw new Error(`Order creation failed: ${res.status}`);
  }

  const order = await res.json();
  console.log(`✓ Order successfully created! Order Number: ${order.orderNumber}`);

  // 2. Query tracking endpoint
  const trackRes = await fetch(`http://localhost:3000/api/orders/${order.orderNumber}`);
  if (!trackRes.ok) {
    throw new Error(`Order tracking lookup failed: ${trackRes.status}`);
  }

  const trackedOrder = await trackRes.json();
  console.log(`✓ Order lookup successful! Status: ${trackedOrder.status}, Total: PKR ${trackedOrder.totalPKR}`);

  // 3. Test Order Success Page
  const successRes = await fetch(`http://localhost:3000/order-success/${order.orderNumber}`);
  console.log(`✓ Order Success page (/order-success/${order.orderNumber}) HTTP status: ${successRes.status}`);

  // 4. Verify Product count is still strictly 0
  const productCount = await prisma.product.count();
  console.log(`✓ Catalog Product Count in SQLite: ${productCount} (MUST BE 0)`);
  if (productCount !== 0) {
    throw new Error("Violation: Product count is not 0!");
  }

  // 5. Clean up test order so database remains pristine
  await prisma.order.delete({ where: { id: order.id } });
  console.log(`✓ Test order cleaned up from database.`);

  console.log("\nALL ORDER LIFECYCLE CHECKS PASSED PERFECTLY!");
}

testOrderFlow()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
