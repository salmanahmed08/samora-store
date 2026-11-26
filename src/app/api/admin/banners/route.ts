import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error("GET /api/admin/banners error:", error);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items } = body; // Array of { id, sortOrder }

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Expected items array" }, { status: 400 });
    }

    for (const item of items) {
      if (item.id && typeof item.sortOrder === "number") {
        await prisma.banner.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        });
      }
    }

    const updated = await prisma.banner.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/admin/banners reorder error:", error);
    return NextResponse.json({ error: "Failed to reorder banners" }, { status: 500 });
  }
}
