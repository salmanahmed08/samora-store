import React, { Suspense } from "react";
import type { Metadata } from "next";
import TrackOrderClient from "./TrackOrderClient";
import { getSeoSettings } from "@/lib/seo-settings";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const baseUrl = seo.siteDomain.replace(/\/$/, "");

  return {
    title: "Track Your Order — Live Dispatch & Courier Status",
    description:
      "Track your SAMORA order status across Pakistan. Enter your Order Number (e.g. SMR-...) to view live verification, packaging, and express dispatch details.",
    alternates: {
      canonical: `${baseUrl}/track-order`,
    },
  };
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[60vh] flex items-center justify-center text-xs text-[#6B5E54]">
          Loading tracker...
        </div>
      }
    >
      <TrackOrderClient />
    </Suspense>
  );
}
