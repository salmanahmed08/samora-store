import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Support multiple formats:
    // 1) { products: [...], shared: {...} }
    // 2) { items: [...], shared: {...} }
    // 3) { items: [...], commonPricePKR: ..., commonCategory: ... }
    // 4) [ ...products ]
    let rawItems: any[] = [];
    let shared: any = {};

    if (Array.isArray(body)) {
      rawItems = body;
    } else if (body && typeof body === "object") {
      rawItems = body.products || body.items || [];
      shared = {
        ...(body.shared || {}),
        pricePKR: body.shared?.pricePKR ?? body.commonPricePKR ?? body.pricePKR,
        compareAtPrice: body.shared?.compareAtPrice ?? body.commonCompareAtPrice ?? body.compareAtPrice,
        category: body.shared?.category ?? body.commonCategory ?? body.category,
        categoryId: body.shared?.categoryId ?? body.commonCategoryId ?? body.categoryId,
        sizes: body.shared?.sizes ?? body.commonSizes ?? body.sizes,
        stock: body.shared?.stock ?? body.commonStock ?? body.stock,
        description: body.shared?.description ?? body.commonDescription ?? body.description,
        showOnHome: body.shared?.showOnHome ?? body.commonShowOnHome ?? body.showOnHome,
        showOnHanger: body.shared?.showOnHanger ?? body.commonShowOnHanger ?? body.showOnHanger,
        status: body.shared?.status ?? body.commonStatus ?? body.status,
      };
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { error: "No products provided. Expected an array in 'products' or 'items'." },
        { status: 400 }
      );
    }

    // Resolve shared category info if provided
    let sharedCategoryName = shared.category || null;
    let sharedCategoryId = shared.categoryId || null;

    if (sharedCategoryId && !sharedCategoryName) {
      const cat = await prisma.category.findUnique({ where: { id: sharedCategoryId } });
      if (cat) sharedCategoryName = cat.name;
    } else if (sharedCategoryName && !sharedCategoryId) {
      const cat = await prisma.category.findFirst({
        where: {
          OR: [{ name: sharedCategoryName }, { slug: slugify(sharedCategoryName) }],
        },
      });
      if (cat) sharedCategoryId = cat.id;
    }

    // Execute in a single clean transaction
    const createdProducts = await prisma.$transaction(async (tx) => {
      const results: any[] = [];
      const usedSlugs = new Set<string>();

      for (let i = 0; i < rawItems.length; i++) {
        const item = rawItems[i];
        const title = (item.title || shared.title || `Streetwear Piece ${i + 1}`).trim();
        const pricePKR = item.pricePKR !== undefined ? Number(item.pricePKR) : (shared.pricePKR !== undefined ? Number(shared.pricePKR) : 0);
        const compareAtPrice = item.compareAtPrice !== undefined ? (item.compareAtPrice ? Number(item.compareAtPrice) : null) : (shared.compareAtPrice ? Number(shared.compareAtPrice) : null);

        let categoryName = item.category?.trim() || sharedCategoryName || "Hoodies";
        let categoryId = item.categoryId || sharedCategoryId || null;

        if (categoryId && !item.category) {
          const cat = await tx.category.findUnique({ where: { id: categoryId } });
          if (cat) categoryName = cat.name;
        }

        const description = (item.description || shared.description || "").trim();
        const stock = item.stock !== undefined ? Number(item.stock) : (shared.stock !== undefined ? Number(shared.stock) : 10);
        const featured = item.featured !== undefined ? Boolean(item.featured) : (shared.featured !== undefined ? Boolean(shared.featured) : false);
        const showOnHome = item.showOnHome !== undefined ? Boolean(item.showOnHome) : (shared.showOnHome !== undefined ? Boolean(shared.showOnHome) : true);
        const showOnHanger = item.showOnHanger !== undefined ? Boolean(item.showOnHanger) : (shared.showOnHanger !== undefined ? Boolean(shared.showOnHanger) : true);
        const hangerOrder = item.hangerOrder !== undefined ? Number(item.hangerOrder) : (i + 1);
        const status = item.status || shared.status || "ACTIVE";

        const sizes = item.sizes !== undefined ? item.sizes : (shared.sizes !== undefined ? shared.sizes : ["S", "M", "L", "XL"]);
        const sizesJson = typeof sizes === "string" ? sizes : JSON.stringify(sizes);

        let images = item.images !== undefined ? item.images : (item.image ? [item.image] : (shared.images !== undefined ? shared.images : []));
        const imagesJson = typeof images === "string" ? images : JSON.stringify(images);

        // Generate unique slug
        let baseSlug = slugify(title);
        let finalSlug = baseSlug;
        let counter = 1;

        while (
          usedSlugs.has(finalSlug) ||
          (await tx.product.findUnique({ where: { slug: finalSlug } }))
        ) {
          finalSlug = `${baseSlug}-${counter}`;
          counter++;
        }

        usedSlugs.add(finalSlug);

        const product = await tx.product.create({
          data: {
            title,
            slug: finalSlug,
            description,
            pricePKR,
            compareAtPrice,
            category: categoryName,
            categoryId,
            sizes: sizesJson,
            stock,
            images: imagesJson,
            featured,
            showOnHome,
            showOnHanger,
            hangerOrder,
            status,
          },
        });

        results.push(product);
      }

      return results;
    });

    return NextResponse.json(
      {
        success: true,
        count: createdProducts.length,
        products: createdProducts,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/products/bulk error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to bulk create products" },
      { status: 500 }
    );
  }
}
