import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVoiceAgentSettings } from "@/lib/voice-agent";

/**
 * POST /api/voice-agent/webhook
 * End of Call webhook from Vapi / Retell / Twilio saving audio call transcripts & summaries
 */
export async function POST(req: NextRequest) {
  try {
    const settings = await getVoiceAgentSettings();
    const authHeader = req.headers.get("authorization") || "";
    const bearer = authHeader.replace(/^Bearer\s+/i, "");

    const isInternal = req.headers.get("x-samora-simulator") === "true";
    if (!isInternal && settings.voiceAgentSecret && bearer !== settings.voiceAgentSecret) {
      return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
    }

    const body = await req.json();

    // Flexible extraction from Vapi, Retell, or Simulator payload
    const callerPhone = body.callerPhone || body.customer?.number || body.from || "0300-0000000";
    const callerName = body.callerName || body.customer?.name || null;
    const durationSeconds = body.durationSeconds || body.duration || 60;
    const aiSummary = body.aiSummary || body.summary || "Off-hours inquiry logged by AI Concierge.";
    const transcript =
      typeof body.transcript === "string" ? body.transcript : JSON.stringify(body.transcript || []);
    const intent = body.intent || "GENERAL";
    const relatedOrderNumber = body.relatedOrderNumber || null;
    const callbackRequested = Boolean(body.callbackRequested);

    const log = await prisma.callLog.create({
      data: {
        callerPhone,
        callerName,
        callType: isInternal ? "SIMULATED" : "OFF_HOURS_AI",
        durationSeconds: Number(durationSeconds),
        intent,
        relatedOrderNumber,
        aiSummary,
        transcript,
        callbackRequested,
        callbackStatus: callbackRequested ? "PENDING" : "DONE",
      },
    });

    return NextResponse.json({ success: true, callLogId: log.id });
  } catch (error: any) {
    console.error("[Voice Agent Webhook Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
