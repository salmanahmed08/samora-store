const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testMessage() {
  const res = await fetch("http://localhost:3000/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Salman Tester",
      phone: "0300-1112233",
      email: "salman@atelier.pk",
      message: "Inquiry regarding 450 GSM custom sizing.",
    }),
  });
  console.log("Message submission status:", res.status);
  const data = await res.json();
  console.log("Message record created in SQLite:", data.id, "from:", data.name);
  await prisma.contactMessage.delete({ where: { id: data.id } });
  console.log("Verified and cleaned up test message.");
}

testMessage()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
