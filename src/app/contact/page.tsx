import React from "react";
import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import { getSeoSettings } from "@/lib/seo-settings";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const baseUrl = seo.siteDomain.replace(/\/$/, "");

  return {
    title: "Concierge & Direct Client Support",
    description:
      "Reach out to SAMORA Haute Streetwear atelier in Lahore. Contact us for custom sizing consultations, bulk orders, order tracking, and priority WhatsApp assistance.",
    alternates: {
      canonical: `${baseUrl}/contact`,
    },
    openGraph: {
      title: "Contact & Concierge | SAMORA Pakistan",
      description:
        "Connect directly with our Lahore atelier via WhatsApp 03344826415, social channels or direct message inquiry.",
      url: `${baseUrl}/contact`,
      images: [`${baseUrl}/assets/editorial-hoodies/hoodie-editorial-14.jpeg`],
    },
  };
}

export default function ContactPage() {
  return <ContactClient />;
}
