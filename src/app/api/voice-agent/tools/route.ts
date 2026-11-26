import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getVoiceAgentSettings,
  toolCheckOrderStatus,
  toolCheckProductAvailability,
  toolBookCallback,
} from "@/lib/voice-agent";

/**
 * POST /api/voice-agent/tools
 * Tool execution endpoint called by Vapi / Retell / Twilio AI agent or Local Simulator
 */
export async function POST(req: NextRequest) {
  try {
    const settings = await getVoiceAgentSettings();
    const authHeader = req.headers.get("authorization") || "";
    const bearer = authHeader.replace(/^Bearer\s+/i, "");

    // Allow internal requests or requests matching secret
    const isInternal = req.headers.get("x-samora-simulator") === "true";
    if (!isInternal && settings.voiceAgentSecret && bearer !== settings.voiceAgentSecret) {
      return NextResponse.json({ error: "Unauthorized tool execution" }, { status: 401 });
    }

    const body = await req.json();
    const { toolName, parameters = {} } = body;

    let result: any = null;

    if (toolName === "check_order_status") {
      result = await toolCheckOrderStatus(parameters.query || parameters.orderNumber || parameters.phone || "");
    } else if (toolName === "check_product_availability") {
      result = await toolCheckProductAvailability(parameters.query || "");
    } else if (toolName === "book_callback_or_note") {
      result = await toolBookCallback({
        callerName: parameters.callerName || "Customer",
        callerPhone: parameters.callerPhone || "",
        note: parameters.note || "General Inquiry",
        relatedOrderNumber: parameters.relatedOrderNumber,
      });
    } else {
      return NextResponse.json({ error: `Unknown tool "${toolName}"` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      toolName,
      result,
    });
  } catch (error: any) {
    console.error("[Voice Agent Tool Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
