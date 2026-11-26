const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const brandSettings = [
    { key: "site_name", value: "Samora" },
    { key: "tagline", value: "Luxury Streetwear Pakistan" },
    { key: "whatsapp", value: "03344826415" },
    { key: "whatsapp_url", value: "https://wa.me/923344826415" },
    { key: "instagram", value: "https://www.instagram.com/samorapk2008/" },
    { key: "facebook", value: "https://www.facebook.com/profile.php?id=61593252326408" },
    { key: "email", value: "contact@samora.pk" },
    { key: "homeProductLimit", value: "8" },
    { key: "hangerEnabled", value: "true" },
    { key: "hangerSpeed", value: "slow" },
    { key: "hangerTitle", value: "Fresh Off The Rail" },
    { key: "hangerSubtitle", value: "Click any piece hanging on the line to inspect details" },
  ];

  for (const s of brandSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
    console.log(`Setting upserted: ${s.key} = ${s.value}`);
  }

  await prisma.$disconnect();
  console.log("Brand settings synced successfully!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
