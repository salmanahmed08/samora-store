import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    // can search by id or slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const {
      title,
      slug,
      description,
      pricePKR,
      compareAtPrice,
      category,
      sizes,
      stock,
      images,
      featured,
      status,
    } = body;

    const sizesJson = typeof sizes === "string" ? sizes : JSON.stringify(sizes);
    const imagesJson = typeof images === "string" ? images : JSON.stringify(images);

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(slug && { slug: slug.trim() }),
        ...(description !== undefined && { description }),
        ...(pricePKR !== undefined && { pricePKR: Number(pricePKR) }),
        ...(compareAtPrice !== undefined
          ? { compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null }
          : {}),
        ...(category && { category: category.trim() }),
        ...(sizesJson !== undefined && { sizes: sizesJson }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(imagesJson !== undefined && { images: imagesJson }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
