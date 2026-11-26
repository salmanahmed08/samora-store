import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = getAdminSession();
    const settings = await prisma.siteSetting.findMany();
    const map: Record<string, string> = {};

    const sensitiveKeys = new Set([
      "googleApiKey",
      "googleWebhookSecret",
      "whatsappAccessToken",
      "whatsappWebhookVerifyToken",
      "voiceAgentSecret",
      "geminiApiKey",
    ]);

    settings.forEach((s) => {
      // If public request, completely omit sensitive secrets
      if (!session && sensitiveKeys.has(s.key)) {
        return;
      }
      map[s.key] = s.value;
    });

    return NextResponse.json(map);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json(); // Record<string, string>

    for (const [key, value] of Object.entries(body)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
