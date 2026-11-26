import { prisma } from "./prisma";
import { formatPKR } from "./utils";
import { sendWhatsAppMessage } from "./whatsapp-automation";

export interface VoiceAgentSettings {
  voiceAgentEnabled: boolean;
  forceOffHoursMode: boolean; // Overrides schedule to force Off-Hours AI
  agentName: string;
  agentLanguage: "bilingual" | "urdu" | "english";
  agentTone: "luxury_polite" | "warm_casual" | "formal";
  greetingMessage: string;
  systemPrompt: string;
  businessHoursStart: string; // e.g. "11:00" (PKT)
  businessHoursEnd: string; // e.g. "21:00" (PKT)
  businessDays: string; // e.g. "Mon,Tue,Wed,Thu,Fri,Sat"
  voiceAgentSecret: string; // Bearer token for Vapi/Retell/Twilio
  ownerPhone: string;
}

export const DEFAULT_VOICE_AGENT_SETTINGS: VoiceAgentSettings = {
  voiceAgentEnabled: true,
  forceOffHoursMode: false,
  agentName: "Ayla — SAMORA Concierge",
  agentLanguage: "bilingual",
  agentTone: "luxury_polite",
  greetingMessage:
    "Assalam-o-Alaikum, thank you for calling SAMORA Luxury Streetwear atelier. Our human concierge team is currently resting for the evening, but I'm Ayla, your AI nighttime concierge. How may I assist you with an order, sizing, or silhouette tonight?",
  systemPrompt: `You are Ayla, the nighttime AI Voice Concierge for SAMORA (an artisanal high-end luxury streetwear atelier based in Lahore, Pakistan).
Brand Identity:
- SAMORA specializes in 450 GSM French Terry loopback cotton hoodies, boxy dropped-shoulder cuts, and bespoke heavyweight silhouettes.
- All deliveries nationwide are Cash on Delivery (COD) via express courier riders (2-4 business days).
- Official WhatsApp / Hotline: 03344826415.
- Orders have full 7-day doorstep size exchange.

Personality & Rules:
- Speak in warm, polite, and elegant bilingual Roman Urdu and English.
- Be concise and articulate (suitable for low-latency phone conversations).
- You have 3 tools available:
  1. check_order_status: Always ask the caller for their Order Number (e.g., SMR-...) or their mobile phone number.
  2. check_product_availability: Look up active streetwear hoodies, prices in PKR, and available sizes.
  3. book_callback_or_note: If the caller wants human intervention, custom alterations, or immediate dispatch help, politely take their name, number, and inquiry. Reassure them that our atelier manager will message them on WhatsApp first thing in the morning!`,
  businessHoursStart: "11:00",
  businessHoursEnd: "21:00",
  businessDays: "Mon,Tue,Wed,Thu,Fri,Sat",
  voiceAgentSecret: "samora_voice_secret_2026",
  ownerPhone: "03344826415",
};

export async function getVoiceAgentSettings(): Promise<VoiceAgentSettings> {
  try {
    const keys = Object.keys(DEFAULT_VOICE_AGENT_SETTINGS);
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: keys } },
    });
    const map = new Map<string, string>();
    rows.forEach((r) => map.set(r.key, r.value));

    return {
      voiceAgentEnabled: map.get("voiceAgentEnabled") !== "false",
      forceOffHoursMode: map.get("forceOffHoursMode") === "true",
      agentName: map.get("agentName") || DEFAULT_VOICE_AGENT_SETTINGS.agentName,
      agentLanguage: (map.get("agentLanguage") as any) || DEFAULT_VOICE_AGENT_SETTINGS.agentLanguage,
      agentTone: (map.get("agentTone") as any) || DEFAULT_VOICE_AGENT_SETTINGS.agentTone,
      greetingMessage: map.get("greetingMessage") || DEFAULT_VOICE_AGENT_SETTINGS.greetingMessage,
      systemPrompt: map.get("systemPrompt") || DEFAULT_VOICE_AGENT_SETTINGS.systemPrompt,
      businessHoursStart:
        map.get("businessHoursStart") || DEFAULT_VOICE_AGENT_SETTINGS.businessHoursStart,
      businessHoursEnd: map.get("businessHoursEnd") || DEFAULT_VOICE_AGENT_SETTINGS.businessHoursEnd,
      businessDays: map.get("businessDays") || DEFAULT_VOICE_AGENT_SETTINGS.businessDays,
      voiceAgentSecret:
        map.get("voiceAgentSecret") || DEFAULT_VOICE_AGENT_SETTINGS.voiceAgentSecret,
      ownerPhone: map.get("ownerPhone") || DEFAULT_VOICE_AGENT_SETTINGS.ownerPhone,
    };
  } catch {
    return DEFAULT_VOICE_AGENT_SETTINGS;
  }
}

/**
 * Check if the store is currently OPEN or OFF_HOURS based on PKT (Asia/Karachi, UTC+5)
 */
export function isCurrentlyOffHours(settings: VoiceAgentSettings): {
  isOffHours: boolean;
  currentPktTime: string;
  reason: string;
} {
  if (settings.forceOffHoursMode) {
    return {
      isOffHours: true,
      currentPktTime: new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Karachi" }),
      reason: "Manual Force Off-Hours Mode is Enabled in Admin",
    };
  }

  // Calculate current PKT time
  const now = new Date();
  const pktString = now.toLocaleString("en-US", { timeZone: "Asia/Karachi" });
  const pktDate = new Date(pktString);

  const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][pktDate.getDay()];
  const allowedDays = settings.businessDays.split(",").map((s) => s.trim());

  if (!allowedDays.includes(dayOfWeek)) {
    return {
      isOffHours: true,
      currentPktTime: pktDate.toLocaleTimeString("en-US"),
      reason: `Atelier is closed on ${dayOfWeek}s.`,
    };
  }

  const [startH, startM] = settings.businessHoursStart.split(":").map(Number);
  const [endH, endM] = settings.businessHoursEnd.split(":").map(Number);

  const currentMinutes = pktDate.getHours() * 60 + pktDate.getMinutes();
  const startMinutes = startH * 60 + (startM || 0);
  const endMinutes = endH * 60 + (endM || 0);

  if (currentMinutes < startMinutes || currentMinutes >= endMinutes) {
    return {
      isOffHours: true,
      currentPktTime: pktDate.toLocaleTimeString("en-US"),
      reason: `Outside working hours (${settings.businessHoursStart} - ${settings.businessHoursEnd} PKT).`,
    };
  }

  return {
    isOffHours: false,
    currentPktTime: pktDate.toLocaleTimeString("en-US"),
    reason: "Atelier is Open for Live Phone Concierge.",
  };
}

/**
 * Tool 1: Live Order Status Checker for Voice Bot
 */
export async function toolCheckOrderStatus(query: string) {
  const cleaned = query.trim().replace(/[^a-zA-Z0-9-]/g, "");

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { orderNumber: { equals: cleaned } },
        { phone: { contains: cleaned.replace(/[^0-9]/g, "") } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  if (!order) {
    return {
      found: false,
      message: `No order found matching "${query}". Please ask the caller to confirm their exact Order Number (e.g. SMR-...) or the mobile number they placed the order with.`,
    };
  }

  let items: any[] = [];
  try {
    items = JSON.parse(order.items);
  } catch {}

  const itemSummary = items
    .map((it) => `${it.title} (Size: ${it.size}, Qty: ${it.quantity})`)
    .join(", ");

  return {
    found: true,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    status: order.status,
    confirmationState: order.confirmationState,
    totalPKR: order.totalPKR,
    items: itemSummary,
    trackingNumber: order.trackingNumber || "Assigned upon courier dispatch",
    message: `Order #${order.orderNumber} for ${order.customerName} is currently ${order.status} (${order.confirmationState}). Items: ${itemSummary}. Total payable is PKR ${order.totalPKR} via Cash on Delivery.`,
  };
}

/**
 * Tool 2: Live Product Availability & Pricing Checker for Voice Bot
 */
export async function toolCheckProductAvailability(query: string) {
  const products = await prisma.product.findMany({
    where: {
      status: { in: ["ACTIVE", "SOLD_OUT"] },
      OR: [
        { title: { contains: query } },
        { category: { contains: query } },
        { sku: { contains: query } },
        { description: { contains: query } },
      ],
    },
    take: 4,
  });

  if (products.length === 0) {
    return {
      found: false,
      message: `We do not currently have a piece matching "${query}". Let the caller know we specialize in 450 GSM heavyweight oversized streetwear hoodies and offer to book a callback.`,
    };
  }

  const results = products.map((p) => {
    let sizes: string[] = [];
    try {
      sizes = JSON.parse(p.sizes);
    } catch {}

    return {
      title: p.title,
      sku: p.sku,
      pricePKR: p.pricePKR,
      isSoldOut: p.status === "SOLD_OUT" || p.stock === 0,
      sizes: sizes.join(", "),
    };
  });

  return {
    found: true,
    products: results,
    message: results
      .map(
        (r) =>
          `${r.title} (${r.sku}): PKR ${r.pricePKR}. Available sizes: ${r.sizes}. Status: ${
            r.isSoldOut ? "Currently SOLD OUT (Ask similar on WhatsApp)" : "In Stock"
          }.`
      )
      .join(" | "),
  };
}

/**
 * Tool 3: Book Callback or Take Nighttime Message for Voice Bot
 */
export async function toolBookCallback(data: {
  callerName: string;
  callerPhone: string;
  note: string;
  relatedOrderNumber?: string;
}) {
  const callLog = await prisma.callLog.create({
    data: {
      callerName: data.callerName || "Nighttime Caller",
      callerPhone: data.callerPhone,
      callType: "OFF_HOURS_AI",
      durationSeconds: 90,
      intent: "CALLBACK_REQUEST",
      relatedOrderNumber: data.relatedOrderNumber,
      aiSummary: `Customer requested urgent morning callback: ${data.note}`,
      transcript: JSON.stringify([
        {
          role: "agent",
          text: "I have recorded your request. Our atelier team will contact you first thing in the morning via WhatsApp.",
          time: new Date().toISOString(),
        },
      ]),
      callbackRequested: true,
      callbackStatus: "PENDING",
    },
  });

  // Alert Owner on WhatsApp immediately
  const settings = await getVoiceAgentSettings();
  try {
    await sendWhatsAppMessage({
      phone: settings.ownerPhone || "03344826415",
      customerName: "SAMORA Admin",
      eventType: "ADMIN_NEW_ORDER",
      recipientType: "ADMIN",
      text: `📞 *NIGHTTIME AI VOICE CALL ALERT*\n\nCaller: *${data.callerName}*\nPhone: *${data.callerPhone}*\nNote: ${data.note}\nOrder #: ${data.relatedOrderNumber || "N/A"}\nStatus: High Priority Callback Scheduled.`,
    });
  } catch {}

  return {
    success: true,
    callLogId: callLog.id,
    message: `Thank you ${data.callerName}. Your callback request has been logged and our atelier manager will message you on WhatsApp at ${data.callerPhone} when business hours open at 11:00 AM.`,
  };
}
