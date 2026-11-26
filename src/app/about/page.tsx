import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, Layers, Zap } from "lucide-react";
import { EDITORIAL_HOODIES } from "@/lib/brand-assets";
import { getSeoSettings } from "@/lib/seo-settings";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const baseUrl = seo.siteDomain.replace(/\/$/, "");

  return {
    title: "About The Brand — Craft, Heritage & Standards",
    description:
      "Learn about SAMORA: Pakistani artisanal craftsmanship, 450 GSM pure French Terry cotton, and bespoke luxury streetwear manufactured in Lahore for nationwide delivery.",
    alternates: {
      canonical: `${baseUrl}/about`,
    },
    openGraph: {
      title: "About SAMORA | Artisanal Luxury Streetwear Pakistan",
      description:
        "Pakistan's textile excellence translated into modern heavyweight streetwear silhouettes.",
      url: `${baseUrl}/about`,
      images: [`${baseUrl}/assets/editorial-hoodies/hoodie-editorial-12.jpeg`],
    },
  };
}

export default function AboutPage() {
  const bannerImage = EDITORIAL_HOODIES[11]; // Hoodie 12

  return (
    <div className="w-full min-h-screen bg-[#F5F1EA] py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Back Link */}
        <Link
          href="/"
          prefetch={true}
          className="text-xs text-[#6B5E54] hover:text-[#1F1A17] transition inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Hero Atmosphere Banner in Warm Sandstone Split */}
        <div className="relative rounded-3xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 sm:p-12 shadow-sm gap-8">
          <div className="max-w-xl space-y-3">
            <span className="text-xs font-semibold text-[#B55A38] uppercase tracking-wider block">
              Brand Story & Manifesto
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold font-display text-[#1F1A17] leading-tight">
              Crafted in Lahore. <br />
              <span className="font-editorial italic font-normal text-[#6B5E54]">
                Engineered for daily luxury.
              </span>
            </h1>
            <p className="text-sm text-[#6B5E54] leading-relaxed">
              Pakistan possesses some of the finest cotton cultivation and textile infrastructure in the world.
              SAMORA harnesses that heritage to create heavyweight 450 GSM streetwear essentials that stand shoulder
              to shoulder with international fashion houses.
            </p>
          </div>

          <div className="w-64 sm:w-72 h-64 rounded-2xl bg-[#FAF8F4] overflow-hidden p-3 border border-[rgba(31,26,23,0.10)] flex items-center justify-center shrink-0">
            <img
              src={bannerImage.path}
              alt={bannerImage.title}
              className="w-full h-full object-contain drop-shadow"
            />
          </div>
        </div>

        {/* Textile Specifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBE4D8] text-[#2C3A2F] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold font-display text-[#1F1A17]">450 GSM Pure French Terry</h2>
            <p className="text-xs text-[#6B5E54] leading-relaxed">
              Dense loopback construction that drapes solidly on the shoulders without losing shape or bunching up.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBE4D8] text-[#B55A38] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold font-display text-[#1F1A17]">Pre-Shrunk Enzyme Washed</h2>
            <p className="text-xs text-[#6B5E54] leading-relaxed">
              Cold-water preshrunk and finished with organic enzyme washing for a buttery, lived-in feel from the first wear.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBE4D8] text-[#2C3A2F] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold font-display text-[#1F1A17]">Double-Needle Structural Seams</h2>
            <p className="text-xs text-[#6B5E54] leading-relaxed">
              Reinforced shoulders, cuffs, and hem engineered to withstand years of active street wear and laundering.
            </p>
          </div>
        </div>

        {/* CTA to Shop */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#1F1A17] text-[#FAF8F4] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold font-display">Experience the standard firsthand.</h2>
            <p className="text-xs sm:text-sm text-[#A89C8F]">
              Dispatched with nationwide Cash on Delivery and complimentary exchange support.
            </p>
          </div>
          <Link
            href="/shop"
            prefetch={true}
            className="px-8 py-3.5 rounded-full bg-[#FAF8F4] text-[#1F1A17] font-semibold text-xs hover:bg-[#EBE4D8] transition shrink-0 flex items-center gap-2 active:scale-[0.98]"
          >
            <span>Explore The Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
