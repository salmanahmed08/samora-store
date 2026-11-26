import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

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
    if (body.subtitle !== undefined) dataToUpdate.subtitle = body.subtitle.trim();
    if (body.imagePath !== undefined) dataToUpdate.imagePath = body.imagePath.trim();
    if (body.ctaText !== undefined) dataToUpdate.ctaText = body.ctaText.trim();
    if (body.ctaLink !== undefined) dataToUpdate.ctaLink = body.ctaLink.trim();
    if (body.isActive !== undefined) dataToUpdate.isActive = Boolean(body.isActive);
    if (body.sortOrder !== undefined) dataToUpdate.sortOrder = Number(body.sortOrder);

    const banner = await prisma.banner.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error("PATCH /api/admin/banners/[id] error:", error);
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}
