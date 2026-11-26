import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import {
  getVoiceAgentSettings,
  isCurrentlyOffHours,
} from "@/lib/voice-agent";

// GET: Returns current Voice Agent settings, routing status, and call logs
export async function GET() {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const settings = await getVoiceAgentSettings();
    const offHoursStatus = isCurrentlyOffHours(settings);

    const callLogs = await prisma.callLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
    });

    const pendingCallbacks = await prisma.callLog.count({
      where: { callbackRequested: true, callbackStatus: "PENDING" },
    });

    const totalCalls = await prisma.callLog.count();

    return NextResponse.json({
      success: true,
      settings,
      offHoursStatus,
      callLogs,
      stats: {
        totalCalls,
        pendingCallbacks,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Save settings or update callback status
export async function POST(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "save_settings") {
      const { settings } = body;
      const keys = Object.keys(settings);
      for (const k of keys) {
        await prisma.siteSetting.upsert({
          where: { key: k },
          update: { value: String(settings[k]) },
          create: { key: k, value: String(settings[k]) },
        });
      }
      return NextResponse.json({ success: true, message: "Voice Agent settings saved successfully!" });
    }

    if (action === "mark_callback_done") {
      const { callLogId } = body;
      await prisma.callLog.update({
        where: { id: callLogId },
        data: { callbackStatus: "DONE" },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
