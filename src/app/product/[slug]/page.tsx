import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductView from "@/components/ProductView";
import { getSeoSettings } from "@/lib/seo-settings";
import { formatPKR } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = params;
  const product = await prisma.product.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: { categoryRel: true },
  });

  if (!product) {
    return {
      title: "Piece Not Found | SAMORA",
    };
  }

  const seo = await getSeoSettings();
  const baseUrl = seo.siteDomain.replace(/\/$/, "");

  let images: string[] = [];
  try {
    images = JSON.parse(product.images || "[]");
  } catch {
    images = [];
  }
  const coverImage = images[0] || "/assets/editorial-hoodies/hoodie-editorial-01.jpeg";
  const ogImageUrl = coverImage.startsWith("http") ? coverImage : `${baseUrl}${coverImage}`;

  const title =
    product.metaTitle ||
    `${product.title} — ${product.category || "Haute Streetwear"} (PKR ${product.pricePKR.toLocaleString()})`;

  const description =
    product.metaDescription ||
    (product.description && product.description.length > 30
      ? product.description.slice(0, 155)
      : `Order the bespoke ${product.title} in Pakistan. Handcrafted luxury streetwear with Cash on Delivery nationwide.`);

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/product/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/product/${product.slug}`,
      siteName: "SAMORA",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 1500,
          alt: product.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: {
      categoryRel: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Related products query (same category or latest, excluding current)
  const relatedProducts = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      id: { not: product.id },
      ...(product.category ? { category: product.category } : {}),
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const seo = await getSeoSettings();
  const baseUrl = seo.siteDomain.replace(/\/$/, "");

  let images: string[] = [];
  try {
    images = JSON.parse(product.images || "[]");
  } catch {
    images = [];
  }
  const coverImage = images[0] || "/assets/editorial-hoodies/hoodie-editorial-01.jpeg";
  const fullCoverUrl = coverImage.startsWith("http") ? coverImage : `${baseUrl}${coverImage}`;

  // Structured Data (Product + BreadcrumbList)
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    image: images.map((img) => (img.startsWith("http") ? img : `${baseUrl}${img}`)),
    description: product.description,
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: "SAMORA",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: "PKR",
      price: product.pricePKR,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "SAMORA",
      },
    },
  };

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category || "Shop",
        item: `${baseUrl}/shop?category=${encodeURIComponent(product.category || "")}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: `${baseUrl}/product/${product.slug}`,
      },
    ],
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F1EA]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <ProductView product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
