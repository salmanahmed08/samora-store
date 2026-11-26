import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slot = searchParams.get("slot");

    const where: any = {};
    if (slot) {
      where.slotName = slot;
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error("GET /api/banners error:", error);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { slotName, title, subtitle, imagePath, ctaText, ctaLink, isActive, sortOrder } = body;

    if (!slotName || !title || !imagePath) {
      return NextResponse.json(
        { error: "SlotName, Title, and ImagePath are required" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        slotName,
        title,
        subtitle: subtitle || null,
        imagePath,
        ctaText: ctaText || null,
        ctaLink: ctaLink || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error("POST /api/banners error:", error);
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
