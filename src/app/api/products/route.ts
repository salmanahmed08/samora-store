import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getAdminSession } from "@/lib/auth";
import { getSyncSettings, executeSync } from "@/lib/google-sync";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Non-blocking Stale-While-Revalidate check:
    // If auto-sync is enabled and interval has passed, trigger background sync
    try {
      getSyncSettings().then((settings) => {
        if (settings.googleSyncEnabled) {
          const intervalMs = (settings.googleSyncIntervalSeconds || 60) * 1000;
          const last = settings.googleLastSyncAt ? new Date(settings.googleLastSyncAt).getTime() : 0;
          if (Date.now() - last >= intervalMs) {
            executeSync("auto").catch((e) => console.warn("[Background Sync]", e));
          }
        }
      }).catch(() => {});
    } catch {}

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const status = searchParams.get("status");
    const showOnHome = searchParams.get("showOnHome");
    const showOnHanger = searchParams.get("showOnHanger");
    const limit = searchParams.get("limit");

    const where: any = {};

    if (category && category !== "all" && category !== "ALL") {
      where.OR = [
        { category: { equals: category } },
        { categoryId: { equals: category } },
        { categoryRel: { slug: { equals: category } } },
        { categoryRel: { name: { equals: category } } },
      ];
    }

    if (showOnHome !== null && showOnHome !== undefined) {
      where.showOnHome = showOnHome === "true";
    }

    if (showOnHanger !== null && showOnHanger !== undefined) {
      where.showOnHanger = showOnHanger === "true";
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (status) {
      where.status = status;
    } else {
      // By default public API shows ACTIVE and unexpired SOLD_OUT (within 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      where.OR = [
        { status: "ACTIVE" },
        {
          status: "SOLD_OUT",
          soldOutAt: { gt: twentyFourHoursAgo },
        },
      ];
    }

    if (search) {
      const searchConditions = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    const orderBy: any = showOnHanger === "true"
      ? [{ hangerOrder: "asc" }, { createdAt: "desc" }]
      : [{ createdAt: "desc" }];

    const take = limit ? Math.max(1, parseInt(limit, 10)) : undefined;

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take,
      include: {
        categoryRel: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
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
        { error: "Title and Price (PKR) are required" },
        { status: 400 }
      );
    }

    let resolvedCategory = category?.trim() || "Hoodies";
    let resolvedCategoryId = categoryId || null;

    if (resolvedCategoryId && !category) {
      const cat = await prisma.category.findUnique({ where: { id: resolvedCategoryId } });
      if (cat) {
        resolvedCategory = cat.name;
      }
    } else if (!resolvedCategoryId && resolvedCategory) {
      const cat = await prisma.category.findFirst({
        where: {
          OR: [{ name: resolvedCategory }, { slug: slugify(resolvedCategory) }],
        },
      });
      if (cat) {
        resolvedCategoryId = cat.id;
      }
    }

    let baseSlug = slugify(title);
    let finalSlug = baseSlug;
    let counter = 1;

    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const sizesJson = typeof sizes === "string" ? sizes : JSON.stringify(sizes || ["S", "M", "L", "XL"]);
    const imagesJson = typeof images === "string" ? images : JSON.stringify(images || []);

    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        description: description || "",
        pricePKR: Number(pricePKR),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        category: resolvedCategory,
        categoryId: resolvedCategoryId,
        showOnHome: showOnHome !== undefined ? Boolean(showOnHome) : true,
        showOnHanger: showOnHanger !== undefined ? Boolean(showOnHanger) : true,
        hangerOrder: hangerOrder !== undefined ? Number(hangerOrder) : 0,
        sizes: sizesJson,
        stock: Number(stock) || 0,
        images: imagesJson,
        featured: Boolean(featured),
        status: status || "ACTIVE",
      },
      include: {
        categoryRel: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
