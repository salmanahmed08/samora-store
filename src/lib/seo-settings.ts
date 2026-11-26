import { prisma } from "@/lib/prisma";

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  siteDomain: string;
  focusKeywords: string;
  googleVerification: string;
  facebookPixelId: string;
  ogImageUrl: string;
}

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  metaTitle: "SAMORA — Haute Streetwear & Luxury Essentials Pakistan",
  metaDescription:
    "Artisanal heavyweight streetwear tailored in Pakistan. 450 GSM loopback French Terry hoodies, oversized boxy cuts & bespoke luxury silhouettes. Cash on Delivery nationwide.",
  siteDomain: "https://samora.pk",
  focusKeywords: "Luxury streetwear Pakistan, Heavyweight hoodies Lahore, 450 GSM French Terry, Artisanal oversized streetwear, Pakistani designer hoodies, COD streetwear Pakistan",
  googleVerification: "",
  facebookPixelId: "",
  ogImageUrl: "/assets/logos/logo-2.jpeg",
};

export async function getSeoSettings(): Promise<SeoSettings> {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "seo_metaTitle",
            "seo_metaDescription",
            "seo_siteDomain",
            "seo_focusKeywords",
            "seo_googleVerification",
            "seo_facebookPixelId",
            "seo_ogImageUrl",
          ],
        },
      },
    });

    const map = new Map<string, string>();
    rows.forEach((r) => map.set(r.key, r.value));

    return {
      metaTitle: map.get("seo_metaTitle") || DEFAULT_SEO_SETTINGS.metaTitle,
      metaDescription: map.get("seo_metaDescription") || DEFAULT_SEO_SETTINGS.metaDescription,
      siteDomain: map.get("seo_siteDomain") || DEFAULT_SEO_SETTINGS.siteDomain,
      focusKeywords: map.get("seo_focusKeywords") || DEFAULT_SEO_SETTINGS.focusKeywords,
      googleVerification: map.get("seo_googleVerification") || "",
      facebookPixelId: map.get("seo_facebookPixelId") || "",
      ogImageUrl: map.get("seo_ogImageUrl") || DEFAULT_SEO_SETTINGS.ogImageUrl,
    };
  } catch {
    return DEFAULT_SEO_SETTINGS;
  }
}
