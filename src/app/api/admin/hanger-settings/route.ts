import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const HANGER_SETTING_DEFAULTS: Record<string, string> = {
  homeProductLimit: "8",
  hangerEnabled: "true",
  hangerSpeed: "slow",
  hangerTitle: "Fresh Off The Rail",
  hangerSubtitle: "Click any piece hanging on the line to inspect details",
};

export async function GET(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settingsRows = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "homeProductLimit",
            "hangerEnabled",
            "hangerSpeed",
            "hangerTitle",
            "hangerSubtitle",
          ],
        },
      },
    });

    const settings: Record<string, string> = { ...HANGER_SETTING_DEFAULTS };
    settingsRows.forEach((r) => {
      settings[r.key] = r.value;
    });

    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        pricePKR: true,
        images: true,
        showOnHome: true,
        showOnHanger: true,
        hangerOrder: true,
        status: true,
        createdAt: true,
      },
      orderBy: [{ hangerOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      settings,
      products,
    });
  } catch (error) {
    console.error("GET /api/admin/hanger-settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch hanger settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { settings, products, productToggles } = body;

    await prisma.$transaction(async (tx) => {
      // 1. Update site settings if provided
      if (settings && typeof settings === "object") {
        for (const [key, value] of Object.entries(settings)) {
          if (value !== undefined && value !== null) {
            await tx.siteSetting.upsert({
              where: { key },
              update: { value: String(value) },
              create: { key, value: String(value) },
            });
          }
        }
      }

      // 2. Update product toggles if provided
      const itemsToUpdate = productToggles || products || [];
      if (Array.isArray(itemsToUpdate)) {
        for (const item of itemsToUpdate) {
          if (!item.id) continue;
          const data: any = {};
          if (item.showOnHanger !== undefined) data.showOnHanger = Boolean(item.showOnHanger);
          if (item.showOnHome !== undefined) data.showOnHome = Boolean(item.showOnHome);
          if (item.hangerOrder !== undefined) data.hangerOrder = Number(item.hangerOrder);

          if (Object.keys(data).length > 0) {
            await tx.product.update({
              where: { id: item.id },
              data,
            });
          }
        }
      }
    });

    // Return the updated state
    const updatedSettingsRows = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "homeProductLimit",
            "hangerEnabled",
            "hangerSpeed",
            "hangerTitle",
            "hangerSubtitle",
          ],
        },
      },
    });

    const finalSettings: Record<string, string> = { ...HANGER_SETTING_DEFAULTS };
    updatedSettingsRows.forEach((r) => {
      finalSettings[r.key] = r.value;
    });

    return NextResponse.json({
      success: true,
      settings: finalSettings,
      message: "Hanger settings and product toggles updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/admin/hanger-settings error:", error);
    return NextResponse.json(
      { error: "Failed to update hanger settings" },
      { status: 500 }
    );
  }
}
