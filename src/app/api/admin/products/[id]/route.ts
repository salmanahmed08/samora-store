import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/admin/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(
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

    const dataToUpdate: any = {};
    if (body.title !== undefined) dataToUpdate.title = body.title.trim();
    if (body.slug !== undefined && body.slug.trim()) {
      dataToUpdate.slug = slugify(body.slug.trim());
    }
    if (body.description !== undefined) dataToUpdate.description = body.description.trim();
    if (body.pricePKR !== undefined) dataToUpdate.pricePKR = Number(body.pricePKR);
    if (body.compareAtPrice !== undefined) {
      dataToUpdate.compareAtPrice = body.compareAtPrice ? Number(body.compareAtPrice) : null;
    }
    if (body.category !== undefined) dataToUpdate.category = body.category;
    if (body.categoryId !== undefined) dataToUpdate.categoryId = body.categoryId || null;
    if (body.showOnHome !== undefined) dataToUpdate.showOnHome = Boolean(body.showOnHome);
    if (body.showOnHanger !== undefined) dataToUpdate.showOnHanger = Boolean(body.showOnHanger);
    if (body.hangerOrder !== undefined) dataToUpdate.hangerOrder = Number(body.hangerOrder);
    if (body.sizes !== undefined) {
      dataToUpdate.sizes = typeof body.sizes === "string" ? body.sizes : JSON.stringify(body.sizes);
    }
    if (body.stock !== undefined) dataToUpdate.stock = Number(body.stock);
    if (body.images !== undefined) {
      dataToUpdate.images = typeof body.images === "string" ? body.images : JSON.stringify(body.images);
    }
    if (body.featured !== undefined) dataToUpdate.featured = Boolean(body.featured);
    if (body.status !== undefined) {
      dataToUpdate.status = body.status;
      if (body.status === "SOLD_OUT") {
        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing?.soldOutAt) {
          dataToUpdate.soldOutAt = new Date();
        }
      } else if (body.status === "ACTIVE") {
        dataToUpdate.soldOutAt = null;
      }
    }
    if (body.stock !== undefined && Number(body.stock) === 0) {
      dataToUpdate.status = "SOLD_OUT";
      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing?.soldOutAt) {
        dataToUpdate.soldOutAt = new Date();
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("PATCH /api/admin/products/[id] error:", error);
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
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Product deleted permanently" });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
