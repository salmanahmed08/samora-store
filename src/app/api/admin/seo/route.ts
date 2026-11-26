import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { getSeoSettings } from "@/lib/seo-settings";

export async function GET() {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const settings = await getSeoSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json({ success: false, message: "Missing settings payload" }, { status: 400 });
    }

    const mapping: Record<string, string> = {
      seo_metaTitle: settings.metaTitle || "",
      seo_metaDescription: settings.metaDescription || "",
      seo_siteDomain: settings.siteDomain || "",
      seo_focusKeywords: settings.focusKeywords || "",
      seo_googleVerification: settings.googleVerification || "",
      seo_facebookPixelId: settings.facebookPixelId || "",
      seo_ogImageUrl: settings.ogImageUrl || "",
    };

    for (const [key, value] of Object.entries(mapping)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    return NextResponse.json({ success: true, message: "SEO Settings updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
