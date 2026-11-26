import { prisma } from "./prisma";

export interface CopywriterInput {
  sku: string;
  title: string;
  category: string;
  pricePKR: number;
  sizes: string[];
  existingDescription?: string;
  geminiApiKey?: string;
  autoWriteEnabled?: boolean;
}

export interface GeneratedCopy {
  description: string;
  metaTitle: string;
  metaDescription: string;
}

// Fabric & design dictionaries for curated luxury streetwear
const FABRIC_SPECS = [
  "Crafted from ultra-heavyweight 450 GSM pure loopback French Terry cotton.",
  "Constructed with bespoke 420 GSM compact-spun luxury fleece for structural drape.",
  "Tailored using premium 400 GSM double-faced combed cotton with a dense hand-feel.",
  "Engineered with brushed heavyweight fleece, pre-shrunk for an enduring artisanal drape.",
];

const FIT_DESCRIPTIONS = [
  "Features a boxy, dropped-shoulder silhouette with structured double-layered ribbing.",
  "Tailored with architectural oversized proportions and clean draped shoulder lines.",
  "Engineered with a relaxed streetwear cut, reinforced bar-tack stitching, and ribbed cuffs.",
  "Finished with a generous dropped-shoulder drape, kangaroo pass-through pocket, and tonal stitching.",
];

const STYLING_NOTES = [
  "Pairs effortlessly with relaxed denim, heavyweight cargo trousers, or raw-edge sweatpants.",
  "Ideal for layered urban aesthetics over a crisp oversized tee or underneath a tailored overcoat.",
  "Style with wide-leg utility trousers and minimal leather footwear for an elevated modern silhouette.",
  "An essential centerpiece for monochromatic streetwear styling across Lahore and nationwide.",
];

const CARE_INSTRUCTIONS =
  "Care: Dry clean recommended or machine wash cold inside out on delicate cycle. Lay flat in shade to dry. Do not tumble dry or bleach. Warm iron inside out.";

/**
 * Offline rule-based smart luxury boutique copywriter
 */
export function generateLocalBoutiqueCopy(input: {
  sku: string;
  title: string;
  category: string;
  pricePKR: number;
  sizes: string[];
}): GeneratedCopy {
  const { sku, title, category, pricePKR, sizes } = input;
  const hashVal = (sku + title).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const fabric = FABRIC_SPECS[hashVal % FABRIC_SPECS.length];
  const fit = FIT_DESCRIPTIONS[(hashVal + 1) % FIT_DESCRIPTIONS.length];
  const styling = STYLING_NOTES[(hashVal + 2) % STYLING_NOTES.length];
  const sizeString = sizes.length > 0 ? sizes.join(", ") : "S, M, L, XL";

  const description = [
    `${title} by SAMORA â€” bespoke luxury ${category.toLowerCase()} designed for modern haute streetwear aesthetics.`,
    "",
    `â€¢ Fabric & Weight: ${fabric}`,
    `â€¢ Silhouette & Fit: ${fit}`,
    `â€¢ Available Sizes: ${sizeString}`,
    `â€¢ Styling: ${styling}`,
    `â€¢ SKU: ${sku}`,
    "",
    CARE_INSTRUCTIONS,
  ].join("\n");

  const metaTitle = `${title} (${sku}) | Luxury Heavyweight ${category} | SAMORA`;
  const metaDescription = `Buy the bespoke ${title} (${sku}) in Pakistan. 450 GSM heavyweight luxury ${category.toLowerCase()}, boxy oversized fit & Cash on Delivery nationwide by SAMORA.`;

  return {
    description,
    metaTitle,
    metaDescription,
  };
}

/**
 * Gemini AI copywriter with fallback to offline local generator
 */
async function generateAiBoutiqueCopy(
  input: {
    sku: string;
    title: string;
    category: string;
    pricePKR: number;
    sizes: string[];
  },
  apiKey: string
): Promise<GeneratedCopy | null> {
  try {
    const prompt = `You are a high-end luxury streetwear copywriter for "SAMORA" (a bespoke Pakistani luxury streetwear atelier in Lahore specializing in 450 GSM French Terry heavyweight hoodies and boxy luxury silhouettes).
Generate high-fashion, authentic, compelling boutique copy for this product:
Product SKU: ${input.sku}
Title: ${input.title}
Category: ${input.category}
Price: PKR ${input.pricePKR}
Sizes: ${input.sizes.join(", ")}

Return ONLY valid JSON with keys:
"description": A 3-to-4 paragraph luxury product description including fabric/GSM highlights, boxy dropped-shoulder silhouette, styling advice, and care tips.
"metaTitle": A compelling SEO title under 60 characters formatted: [Title] | SAMORA Luxury Streetwear
"metaDescription": A compelling SEO meta description under 155 characters highlighting 450 GSM heavyweight comfort, COD in Pakistan, and luxury streetwear.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    if (parsed.description && parsed.metaTitle && parsed.metaDescription) {
      return {
        description: parsed.description,
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
      };
    }
    return null;
  } catch (err) {
    console.warn("[AutoCopywriter] Gemini API call skipped/failed, falling back to local:", err);
    return null;
  }
}

/**
 * Main copywriting resolver:
 * - If custom description exists in Sheet, preserves it!
 * - If description is empty or autoWrite is enabled, fills missing fields
 * - If geminiApiKey is provided, uses AI, otherwise uses the smart local generator
 */
export async function resolveProductContentAndSeo(
  input: CopywriterInput
): Promise<GeneratedCopy> {
  const {
    sku,
    title,
    category,
    pricePKR,
    sizes,
    existingDescription,
    geminiApiKey,
    autoWriteEnabled,
  } = input;

  const hasCustomDesc =
    existingDescription &&
    existingDescription.trim().length > 15 &&
    !existingDescription.includes("from Samora Haute Streetwear.");

  // If user provided a genuine custom description and autoWrite is false, keep it
  if (hasCustomDesc && !autoWriteEnabled) {
    return {
      description: existingDescription!.trim(),
      metaTitle: `${title} (${sku}) | Luxury ${category} | SAMORA`,
      metaDescription: `Discover ${title} by SAMORA. Premium luxury ${category.toLowerCase()}, bespoke oversized cut, and Cash on Delivery nationwide in Pakistan.`,
    };
  }

  // If Gemini API Key provided, attempt AI copy
  if (geminiApiKey && geminiApiKey.trim()) {
    const aiResult = await generateAiBoutiqueCopy(
      { sku, title, category, pricePKR, sizes },
      geminiApiKey.trim()
    );
    if (aiResult) {
      // If owner had custom description, keep owner's description but take AI SEO metadata
      if (hasCustomDesc) {
        return {
          description: existingDescription!.trim(),
          metaTitle: aiResult.metaTitle,
          metaDescription: aiResult.metaDescription,
        };
      }
      return aiResult;
    }
  }

  // Instant local rule-based luxury copy generator (offline & 100% reliable)
  const localCopy = generateLocalBoutiqueCopy({ sku, title, category, pricePKR, sizes });
  if (hasCustomDesc) {
    return {
      description: existingDescription!.trim(),
      metaTitle: localCopy.metaTitle,
      metaDescription: localCopy.metaDescription,
    };
  }

  return localCopy;
}
