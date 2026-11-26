import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }
    if (category && category !== "ALL") {
      where.category = category;
    }
    if (status && status !== "ALL") {
      where.status = status;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      description,
      pricePKR,
      compareAtPrice,
      category,
      categoryId,
      showOnHome,
      showOnHanger,
      hangerOrder,
      sizes,
      stock,
      images,
      featured,
      status,
    } = body;

    if (!title || pricePKR === undefined) {
      return NextResponse.json(
        { error: "Title and pricePKR are required" },
        { status: 400 }
      );
    }

    // Auto-generate unique slug if not provided
    const baseSlug = slug && slug.trim() ? slugify(slug.trim()) : slugify(title);
    let finalSlug = baseSlug;
    let counter = 1;

    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const sizesJson = typeof sizes === "string" ? sizes : JSON.stringify(sizes || []);
    const imagesJson = typeof images === "string" ? images : JSON.stringify(images || []);

    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        description: description?.trim() || "",
        pricePKR: Number(pricePKR),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        category: category || "Hoodies",
        categoryId: categoryId || null,
        showOnHome: showOnHome !== undefined ? Boolean(showOnHome) : true,
        showOnHanger: showOnHanger !== undefined ? Boolean(showOnHanger) : true,
        hangerOrder: hangerOrder !== undefined ? Number(hangerOrder) : 0,
        sizes: sizesJson,
        stock: Number(stock) || 0,
        images: imagesJson,
        featured: Boolean(featured),
        status: status || "ACTIVE",
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
