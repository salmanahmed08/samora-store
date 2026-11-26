import React from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ShopCatalogClient from "./ShopCatalogClient";
import { getSeoSettings } from "@/lib/seo-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const baseUrl = seo.siteDomain.replace(/\/$/, "");

  return {
    title: "Shop Luxury Heavyweight Streetwear Collection",
    description:
      "Explore SAMORA's complete collection of 450 GSM French Terry cotton hoodies, oversized drop-shoulder essentials & streetwear silhouettes. Cash on Delivery across Pakistan.",
    alternates: {
      canonical: `${baseUrl}/shop`,
    },
    openGraph: {
      title: "Shop Luxury Streetwear & Heavyweight Hoodies | SAMORA",
      description:
        "Handcrafted luxury streetwear crafted in Pakistan. Premium fabrics, tailored boxy cuts, and nationwide doorstep delivery.",
      url: `${baseUrl}/shop`,
      images: [`${baseUrl}/assets/editorial-hoodies/hoodie-editorial-01.jpeg`],
    },
  };
}

export default async function ShopPage() {
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
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full min-h-screen bg-[#F5F1EA] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="sr-only">SAMORA Luxury Streetwear & Hoodie Collection</h1>
        <ShopCatalogClient initialProducts={JSON.parse(JSON.stringify(products))} />
      </div>
    </div>
  );
}
