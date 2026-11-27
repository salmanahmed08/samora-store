import React from "react";
import { prisma } from "@/lib/prisma";
import HeroSlider from "@/components/HeroSlider";
import RopeHangerSlider from "@/components/RopeHangerSlider";
import CuratedHomeGrid from "@/components/CuratedHomeGrid";
import BrandTicker from "@/components/BrandTicker";
import EditorialCampaignSections from "@/components/EditorialCampaignSections";
import BrandEthosSplit from "@/components/BrandEthosSplit";
import SocialCommunityStrip from "@/components/SocialCommunityStrip";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Fetch active categories
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  // 2. Fetch site settings
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

  const homeLimit = parseInt(settings.homeProductLimit || "8", 10) || 8;

  // 3. Fetch active and unexpired SOLD_OUT products (24h rule)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { status: "ACTIVE" },
        {
          status: "SOLD_OUT",
          soldOutAt: { gt: twentyFourHoursAgo },
        },
      ],
    },
    orderBy: [{ hangerOrder: "asc" }, { createdAt: "desc" }],
  });

  const hangerProducts = products.filter((p) => p.showOnHanger);
  const homeProducts = products.filter((p) => p.showOnHome);

  return (
    <div className="w-full bg-[#F5F1EA]">
      {/* 1. Split Editorial Showcase Hero (Uncropped Visual Frame & Story) */}
      <HeroSlider categories={JSON.parse(JSON.stringify(categories))} />

      {/* 2. Signature Interactive Rope & Hanger Clothesline Slider (Placed right below Hero) */}
      {settings.hangerEnabled !== "false" && (
        <RopeHangerSlider
          products={JSON.parse(JSON.stringify(hangerProducts))}
          categories={JSON.parse(JSON.stringify(categories))}
          settings={settings}
        />
      )}

      {/* 3. Curated Home Page Products Grid (Controlled by Admin homeProductLimit) */}
      <CuratedHomeGrid
        products={JSON.parse(JSON.stringify(homeProducts))}
        categories={JSON.parse(JSON.stringify(categories))}
        homeLimit={homeLimit}
      />

      {/* 4. Infinite Marquee Brand Ticker */}
      <BrandTicker />

      {/* 5. Editorial Streetwear Showcase Grid (Magazine-style asymmetric showcase) */}
      <EditorialCampaignSections />

      {/* 6. Brand Ethos / Craftsmanship Split Banner */}
      <BrandEthosSplit />

      {/* 7. Social Community Strip (Instagram & Facebook showcase) */}
      <SocialCommunityStrip />
    </div>
  );
}
