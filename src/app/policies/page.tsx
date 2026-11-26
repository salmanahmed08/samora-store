import React from "react";
import type { Metadata } from "next";
import PoliciesClient from "./PoliciesClient";
import { getSeoSettings } from "@/lib/seo-settings";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const baseUrl = seo.siteDomain.replace(/\/$/, "");

  return {
    title: "Shipping, 7-Day Exchange & Garment Care Policies",
    description:
      "Read SAMORA's nationwide Cash on Delivery shipping rules, hassle-free 7-day courier exchange policy, and 450 GSM French Terry cold-wash garment care guidelines.",
    alternates: {
      canonical: `${baseUrl}/policies`,
    },
    openGraph: {
      title: "Store Policies & Customer Care | SAMORA Pakistan",
      description: "Insured express shipping, 7-day size exchanges, and honest boutique care.",
      url: `${baseUrl}/policies`,
    },
  };
}

export default function PoliciesPage() {
  return <PoliciesClient />;
}
