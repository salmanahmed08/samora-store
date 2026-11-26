import React from "react";
import type { Metadata } from "next";
import LookbookClient from "./LookbookClient";
import { getSeoSettings } from "@/lib/seo-settings";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const baseUrl = seo.siteDomain.replace(/\/$/, "");

  return {
    title: "14-Piece Editorial Runway Lookbook",
    description:
      "Explore SAMORA's 14-piece haute streetwear hoodie campaign. Uncut 4K visual editorials displaying heavy drape, dense 450 GSM French Terry and structured cuts.",
    alternates: {
      canonical: `${baseUrl}/lookbook`,
    },
    openGraph: {
      title: "14-Piece Editorial Lookbook | SAMORA Pakistan",
      description:
        "High-definition gallery of bespoke 450 GSM hoodies and artisanal street silhouettes.",
      url: `${baseUrl}/lookbook`,
      images: [`${baseUrl}/assets/editorial-hoodies/hoodie-editorial-02.jpeg`],
    },
  };
}

export default function LookbookPage() {
  return <LookbookClient />;
}
