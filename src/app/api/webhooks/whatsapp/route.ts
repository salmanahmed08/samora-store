import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppSettings, processCustomerQuizReply } from "@/lib/whatsapp-automation";

// GET: Meta Hub Webhook Verification
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const settings = await getWhatsAppSettings();

    if (mode === "subscribe" && token === settings.whatsappWebhookVerifyToken) {
      return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse("Forbidden", { status: 403 });
  } catch (error: any) {
    return new NextResponse("Error", { status: 500 });
  }
}

// POST: Meta WhatsApp Webhook Incoming Messages & Button Click Payload
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check entry structure
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (Array.isArray(messages) && messages.length > 0) {
      const msg = messages[0];
      const fromPhone = msg.from; // e.g. "923344826415"

      let replyId: string | undefined;
      let replyText: string | undefined;

      // Button reply click
      if (msg.type === "interactive") {
        if (msg.interactive?.type === "button_reply") {
          replyId = msg.interactive.button_reply?.id;
          replyText = msg.interactive.button_reply?.title;
        }
      } else if (msg.type === "text") {
        replyText = msg.text?.body;
      }

      if (replyId || replyText) {
        // Extract order number from button ID if present (e.g. CONFIRM_OK:SMR-173200)
        let orderNumber: string | undefined;
        if (replyId && replyId.includes(":")) {
          orderNumber = replyId.split(":")[1];
        }

        await processCustomerQuizReply({
          phone: fromPhone,
          replyId,
          replyText,
          orderNumber,
        });
      }
    }

    return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  } catch (error: any) {
    console.error("[WhatsApp Webhook POST Error]", error);
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}
