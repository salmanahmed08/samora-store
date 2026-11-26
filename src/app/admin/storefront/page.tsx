import React from "react";
import { prisma } from "@/lib/prisma";
import StorefrontClient from "./StorefrontClient";

export const dynamic = "force-dynamic";

export default async function AdminStorefrontPage() {
  const settingsRows = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: [
          "homeProductLimit",
          "hangerEnabled",
          "hangerSpeed",
          "hangerTitle",
          "hangerSubtitle",
        ],
      },
    },
  });

  const settings: Record<string, string> = {
    homeProductLimit: "8",
    hangerEnabled: "true",
    hangerSpeed: "slow",
    hangerTitle: "Fresh Off The Rail",
    hangerSubtitle: "Click any piece hanging on the line to inspect details",
  };

  settingsRows.forEach((r) => {
    settings[r.key] = r.value;
  });

  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      pricePKR: true,
      images: true,
      showOnHome: true,
      showOnHanger: true,
      hangerOrder: true,
    },
    orderBy: [{ hangerOrder: "asc" }, { createdAt: "desc" }],
  });

  const heroBanners = await prisma.banner.findMany({
    where: {
      slotName: { startsWith: "hero_slide" },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <StorefrontClient
      initialSettings={settings}
      initialProducts={JSON.parse(JSON.stringify(products))}
      initialHeroBanners={JSON.parse(JSON.stringify(heroBanners))}
    />
  );
}
