import { NextRequest, NextResponse } from "next/server";
import { getVoiceAgentSettings, isCurrentlyOffHours } from "@/lib/voice-agent";

/**
 * GET /api/voice-agent/routing
 * Used by Twilio / Vapi / Retell to know where to route incoming phone calls.
 */
export async function GET(req: NextRequest) {
  try {
    const settings = await getVoiceAgentSettings();
    const offHoursStatus = isCurrentlyOffHours(settings);

    return NextResponse.json({
      success: true,
      enabled: settings.voiceAgentEnabled,
      route: offHoursStatus.isOffHours ? "OFF_HOURS_AI" : "LIVE_HUMAN_FORWARD",
      forwardPhoneNumber: settings.ownerPhone || "03344826415",
      isOffHours: offHoursStatus.isOffHours,
      reason: offHoursStatus.reason,
      pktTime: offHoursStatus.currentPktTime,
      agentConfig: {
        agentName: settings.agentName,
        agentLanguage: settings.agentLanguage,
        greetingMessage: settings.greetingMessage,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
