import { prisma } from "./prisma";
import { formatPKR } from "./utils";
import { BRAND_CONTACT } from "./brand-assets";

export interface WhatsAppSettings {
  whatsappMode: "simulator" | "live";
  whatsappPhoneNumberId: string;
  whatsappAccessToken: string;
  whatsappWebhookVerifyToken: string;
  whatsappOwnerAlertPhone: string;
  whatsappTemplateAdminAlert: string;
  whatsappTemplateQuizGreeting: string;
  whatsappTemplateConfirmedReply: string;
  whatsappTemplateCheckingReply: string;
  whatsappTemplateCancelledReply: string;
  whatsappTemplateStatusUpdate: string;
}

export const DEFAULT_WHATSAPP_SETTINGS: WhatsAppSettings = {
  whatsappMode: "simulator",
  whatsappPhoneNumberId: "",
  whatsappAccessToken: "",
  whatsappWebhookVerifyToken: "samora_whatsapp_webhook_2026",
  whatsappOwnerAlertPhone: "03344826415",
  whatsappTemplateAdminAlert:
    "NEW SAMORA ORDER #{orderNumber} | Customer: {customerName} ({phone}) | City: {city} | Address: {address} | Items: {items} | Total: PKR {totalPKR} (COD) | Quiz Status: Awaiting Customer Confirmation.",
  whatsappTemplateQuizGreeting:
    "Assalam-o-Alaikum {customerName}! Thank you for shopping with SAMORA. Your order #{orderNumber} ({items}) for PKR {totalPKR} (Cash on Delivery) has been received. Please select an option below to confirm your order:",
  whatsappTemplateConfirmedReply:
    "Thank you, {customerName}! Your SAMORA order #{orderNumber} is officially confirmed. Our team is carefully inspecting and packing your pieces — we'll message you as soon as it's on the way.",
  whatsappTemplateCheckingReply:
    "Take your time, {customerName}! Feel free to browse more pieces at SAMORA — your order #{orderNumber} is safely on hold. Just reply OK whenever you're ready to confirm.",
  whatsappTemplateCancelledReply:
    "No problem at all, {customerName}. Your SAMORA order #{orderNumber} has been cancelled as requested. Whenever you'd like to shop again, we're always here to help!",
  whatsappTemplateStatusUpdate:
    "Assalam-o-Alaikum {customerName}, great news! Your SAMORA order #{orderNumber} status has been updated to: {status}. {trackingInfo} Thank you for choosing SAMORA.",
};

export async function getWhatsAppSettings(): Promise<WhatsAppSettings> {
  try {
    const keys = Object.keys(DEFAULT_WHATSAPP_SETTINGS);
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: keys } },
    });
    const map = new Map<string, string>();
    rows.forEach((r) => map.set(r.key, r.value));

    return {
      whatsappMode: (map.get("whatsappMode") as any) || DEFAULT_WHATSAPP_SETTINGS.whatsappMode,
      whatsappPhoneNumberId: map.get("whatsappPhoneNumberId") || "",
      whatsappAccessToken: map.get("whatsappAccessToken") || "",
      whatsappWebhookVerifyToken:
        map.get("whatsappWebhookVerifyToken") || DEFAULT_WHATSAPP_SETTINGS.whatsappWebhookVerifyToken,
      whatsappOwnerAlertPhone:
        map.get("whatsappOwnerAlertPhone") || DEFAULT_WHATSAPP_SETTINGS.whatsappOwnerAlertPhone,
      whatsappTemplateAdminAlert:
        map.get("whatsappTemplateAdminAlert") || DEFAULT_WHATSAPP_SETTINGS.whatsappTemplateAdminAlert,
      whatsappTemplateQuizGreeting:
        map.get("whatsappTemplateQuizGreeting") || DEFAULT_WHATSAPP_SETTINGS.whatsappTemplateQuizGreeting,
      whatsappTemplateConfirmedReply:
        map.get("whatsappTemplateConfirmedReply") || DEFAULT_WHATSAPP_SETTINGS.whatsappTemplateConfirmedReply,
      whatsappTemplateCheckingReply:
        map.get("whatsappTemplateCheckingReply") || DEFAULT_WHATSAPP_SETTINGS.whatsappTemplateCheckingReply,
      whatsappTemplateCancelledReply:
        map.get("whatsappTemplateCancelledReply") || DEFAULT_WHATSAPP_SETTINGS.whatsappTemplateCancelledReply,
      whatsappTemplateStatusUpdate:
        map.get("whatsappTemplateStatusUpdate") || DEFAULT_WHATSAPP_SETTINGS.whatsappTemplateStatusUpdate,
    };
  } catch {
    return DEFAULT_WHATSAPP_SETTINGS;
  }
}

function normalizePhone(rawPhone: string): string {
  let cleaned = rawPhone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "92" + cleaned.substring(1);
  }
  if (!cleaned.startsWith("92") && cleaned.length === 10) {
    cleaned = "92" + cleaned;
  }
  return cleaned;
}

export function formatItemsSummary(itemsRaw: string): string {
  try {
    const parsed = typeof itemsRaw === "string" ? JSON.parse(itemsRaw) : itemsRaw;
    if (Array.isArray(parsed)) {
      return parsed
        .map(
          (it: any) =>
            `• ${it.title || "Piece"} (Size: ${it.size || "M"}) x ${it.quantity || 1} — ${formatPKR(
              (it.pricePKR || 0) * (it.quantity || 1)
            )}`
        )
        .join("\n");
    }
  } catch {}
  return "• SAMORA Luxury Streetwear Silhouettes";
}

/**
 * Send WhatsApp text or interactive buttons through Meta Cloud API or Local Simulator
 */
export async function sendWhatsAppMessage(options: {
  phone: string;
  customerName?: string;
  orderId?: string;
  eventType: "ADMIN_NEW_ORDER" | "CUSTOMER_ORDER_QUIZ" | "QUIZ_REPLY" | "STATUS_UPDATE";
  recipientType: "ADMIN" | "CUSTOMER";
  text: string;
  interactiveButtons?: Array<{ id: string; title: string }>;
}): Promise<{ success: boolean; mode: "live" | "simulator"; messageId?: string }> {
  const settings = await getWhatsAppSettings();
  const normalizedPhone = normalizePhone(options.phone);

  // If live mode configured with valid token & Phone Number ID
  if (
    settings.whatsappMode === "live" &&
    settings.whatsappPhoneNumberId &&
    settings.whatsappAccessToken
  ) {
    try {
      const url = `https://graph.facebook.com/v21.0/${settings.whatsappPhoneNumberId}/messages`;
      let payload: any = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizedPhone,
      };

      if (options.interactiveButtons && options.interactiveButtons.length > 0) {
        payload.type = "interactive";
        payload.interactive = {
          type: "button",
          body: { text: options.text },
          action: {
            buttons: options.interactiveButtons.map((btn) => ({
              type: "reply",
              reply: {
                id: btn.id,
                title: btn.title.slice(0, 20),
              },
            })),
          },
        };
      } else {
        payload.type = "text";
        payload.text = { body: options.text };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.whatsappAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson?.error?.message || `HTTP ${res.status}`);
      }

      await (prisma as any).whatsAppLog.create({
        data: {
          orderId: options.orderId,
          direction: "OUTBOUND",
          recipientType: options.recipientType,
          phone: normalizedPhone,
          customerName: options.customerName,
          eventType: options.eventType,
          messageBody: options.text,
          providerStatus: "SENT",
          rawPayload: JSON.stringify({ payload, response: resJson }),
        },
      });

      return {
        success: true,
        mode: "live",
        messageId: resJson?.messages?.[0]?.id,
      };
    } catch (err: any) {
      console.error("[WhatsApp Live Send Error]", err);
      // Fallback log as failed
      await (prisma as any).whatsAppLog.create({
        data: {
          orderId: options.orderId,
          direction: "OUTBOUND",
          recipientType: options.recipientType,
          phone: normalizedPhone,
          customerName: options.customerName,
          eventType: options.eventType,
          messageBody: options.text,
          providerStatus: "FAILED",
          rawPayload: JSON.stringify({ error: err.message }),
        },
      });
      return { success: false, mode: "live" };
    }
  }

  // Local Simulator Mode (Default on localhost)
  await (prisma as any).whatsAppLog.create({
    data: {
      orderId: options.orderId,
      direction: "OUTBOUND",
      recipientType: options.recipientType,
      phone: normalizedPhone,
      customerName: options.customerName,
      eventType: options.eventType,
      messageBody: options.text,
      providerStatus: "SIMULATED",
      rawPayload: JSON.stringify({
        simulated: true,
        interactiveButtons: options.interactiveButtons,
      }),
    },
  });

  return { success: true, mode: "simulator" };
}

/**
 * Handle new order placement triggers (Owner Alert + Customer Quiz)
 */
export async function triggerNewOrderAutomations(order: {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  items: string;
  totalPKR: number;
}) {
  const settings = await getWhatsAppSettings();
  const itemsText = formatItemsSummary(order.items);
  const formattedTotal = formatPKR(order.totalPKR);

  // 1. Send Alert to Owner (SAMORA Admin)
  const ownerMessage = settings.whatsappTemplateAdminAlert
    .replace(/{orderNumber}/g, order.orderNumber)
    .replace(/{customerName}/g, order.customerName)
    .replace(/{phone}/g, order.phone)
    .replace(/{city}/g, order.city)
    .replace(/{address}/g, order.address)
    .replace(/{items}/g, itemsText)
    .replace(/{totalPKR}/g, formattedTotal);

  await sendWhatsAppMessage({
    phone: settings.whatsappOwnerAlertPhone || "03344826415",
    customerName: "SAMORA Admin",
    orderId: order.id,
    eventType: "ADMIN_NEW_ORDER",
    recipientType: "ADMIN",
    text: ownerMessage,
  });

  // 2. Send 3-Option Interactive Confirmation Quiz to Customer
  const customerQuizMessage = settings.whatsappTemplateQuizGreeting
    .replace(/{orderNumber}/g, order.orderNumber)
    .replace(/{customerName}/g, order.customerName)
    .replace(/{items}/g, itemsText)
    .replace(/{totalPKR}/g, formattedTotal);

  await sendWhatsAppMessage({
    phone: order.phone,
    customerName: order.customerName,
    orderId: order.id,
    eventType: "CUSTOMER_ORDER_QUIZ",
    recipientType: "CUSTOMER",
    text: customerQuizMessage,
    interactiveButtons: [
      { id: `CONFIRM_OK:${order.orderNumber}`, title: "OK - Confirm Order" },
      { id: `CHECK_MORE:${order.orderNumber}`, title: "I Will Check More" },
      { id: `CANCEL_NO:${order.orderNumber}`, title: "No - Cancel Order" },
    ],
  });
}

/**
 * Handle incoming customer Quiz replies (Button clicks or text "ok", "1", "yes", "cancel", etc.)
 */
export async function processCustomerQuizReply(options: {
  phone: string;
  replyId?: string;
  replyText?: string;
  orderNumber?: string;
}): Promise<{
  actionTaken: "CONFIRMED" | "CHECKING_MORE" | "CANCELLED" | "UNKNOWN";
  replyMessage: string;
  order?: any;
}> {
  const settings = await getWhatsAppSettings();
  const normalizedPhone = normalizePhone(options.phone);

  // 1. Locate Order (either by explicit orderNumber or latest awaiting order for this phone)
  let order: any = null;
  if (options.orderNumber) {
    order = await prisma.order.findUnique({
      where: { orderNumber: options.orderNumber },
    });
  }

  if (!order) {
    order = await prisma.order.findFirst({
      where: {
        OR: [
          { phone: { contains: options.phone.replace(/[^0-9]/g, "") } },
          { phone: { contains: normalizedPhone } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!order) {
    return {
      actionTaken: "UNKNOWN",
      replyMessage: "Assalam-o-Alaikum! We couldn't find an active order for this phone. Please share your Order Number.",
    };
  }

  // 2. Determine Action from Button ID or Text
  const rawId = (options.replyId || "").toUpperCase();
  const rawText = (options.replyText || "").toLowerCase().trim();

  let action: "CONFIRMED" | "CHECKING_MORE" | "CANCELLED" | "UNKNOWN" = "UNKNOWN";

  if (
    rawId.startsWith("CONFIRM_OK") ||
    rawText === "1" ||
    rawText === "ok" ||
    rawText === "confirm" ||
    rawText === "yes" ||
    rawText === "haan" ||
    rawText === "done"
  ) {
    action = "CONFIRMED";
  } else if (
    rawId.startsWith("CHECK_MORE") ||
    rawText === "2" ||
    rawText === "check" ||
    rawText === "more" ||
    rawText.includes("check more")
  ) {
    action = "CHECKING_MORE";
  } else if (
    rawId.startsWith("CANCEL_NO") ||
    rawText === "3" ||
    rawText === "no" ||
    rawText === "cancel" ||
    rawText === "nahi" ||
    rawText.includes("cancel")
  ) {
    action = "CANCELLED";
  }

  let autoReply = "";

  if (action === "CONFIRMED") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        confirmationState: "CONFIRMED_BY_CUSTOMER",
        status: "CONFIRMED",
        customerQuizReplyAt: new Date(),
      },
    });

    autoReply = settings.whatsappTemplateConfirmedReply
      .replace(/{customerName}/g, order.customerName)
      .replace(/{orderNumber}/g, order.orderNumber);

    // Alert Owner
    await sendWhatsAppMessage({
      phone: settings.whatsappOwnerAlertPhone || "03344826415",
      customerName: "SAMORA Admin",
      orderId: order.id,
      eventType: "STATUS_UPDATE",
      recipientType: "ADMIN",
      text: `✅ *ORDER CONFIRMED BY CUSTOMER*\n\nCustomer *${order.customerName}* just confirmed Order *#${order.orderNumber}* (${formatPKR(
        order.totalPKR
      )}) via WhatsApp Quiz! Ready for dispatch.`,
    });
  } else if (action === "CHECKING_MORE") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        confirmationState: "CHECKING_MORE",
        customerQuizReplyAt: new Date(),
      },
    });

    autoReply = settings.whatsappTemplateCheckingReply
      .replace(/{customerName}/g, order.customerName)
      .replace(/{orderNumber}/g, order.orderNumber);

    // Alert Owner
    await sendWhatsAppMessage({
      phone: settings.whatsappOwnerAlertPhone || "03344826415",
      customerName: "SAMORA Admin",
      orderId: order.id,
      eventType: "STATUS_UPDATE",
      recipientType: "ADMIN",
      text: `⏳ *CUSTOMER CHECKING MORE*\n\nCustomer *${order.customerName}* selected "I Will Check More" for Order *#${order.orderNumber}*. Order marked in amber badge on dashboard.`,
    });
  } else if (action === "CANCELLED") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        confirmationState: "CANCELLED_BY_CUSTOMER",
        status: "CANCELLED",
        customerQuizReplyAt: new Date(),
      },
    });

    autoReply = settings.whatsappTemplateCancelledReply
      .replace(/{customerName}/g, order.customerName)
      .replace(/{orderNumber}/g, order.orderNumber);

    // Alert Owner
    await sendWhatsAppMessage({
      phone: settings.whatsappOwnerAlertPhone || "03344826415",
      customerName: "SAMORA Admin",
      orderId: order.id,
      eventType: "STATUS_UPDATE",
      recipientType: "ADMIN",
      text: `❌ *ORDER CANCELLED BY CUSTOMER*\n\nCustomer *${order.customerName}* requested cancellation for Order *#${order.orderNumber}* via WhatsApp Quiz.`,
    });
  } else {
    autoReply = `Assalam-o-Alaikum *${order.customerName}*! Please reply:\n1️⃣ *OK* to confirm order #${order.orderNumber}\n2️⃣ *CHECK* to explore more pieces\n3️⃣ *NO* to cancel`;
  }

  // Log incoming inbound message
  await (prisma as any).whatsAppLog.create({
    data: {
      orderId: order.id,
      direction: "INBOUND",
      recipientType: "CUSTOMER",
      phone: normalizedPhone,
      customerName: order.customerName,
      eventType: "QUIZ_REPLY",
      messageBody: options.replyText || options.replyId || "Button Click",
      providerStatus: "SENT",
      rawPayload: JSON.stringify(options),
    },
  });

  // Send the automated response to the customer
  await sendWhatsAppMessage({
    phone: order.phone,
    customerName: order.customerName,
    orderId: order.id,
    eventType: "QUIZ_REPLY",
    recipientType: "CUSTOMER",
    text: autoReply,
  });

  return {
    actionTaken: action,
    replyMessage: autoReply,
    order,
  };
}

/**
 * Handle Order Status Change Notifications (Packed, Shipped, etc.)
 */
export async function triggerOrderStatusNotification(order: {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  status: string;
  trackingNumber?: string | null;
}) {
  const settings = await getWhatsAppSettings();

  const trackingText = order.trackingNumber
    ? `*Courier Tracking #:* ${order.trackingNumber}\nTrack online at /track-order?orderNumber=${encodeURIComponent(
        order.orderNumber
      )}`
    : `Track order status anytime on our website under /track-order.`;

  const statusMsg = settings.whatsappTemplateStatusUpdate
    .replace(/{customerName}/g, order.customerName)
    .replace(/{orderNumber}/g, order.orderNumber)
    .replace(/{status}/g, order.status)
    .replace(/{trackingInfo}/g, trackingText);

  await sendWhatsAppMessage({
    phone: order.phone,
    customerName: order.customerName,
    orderId: order.id,
    eventType: "STATUS_UPDATE",
    recipientType: "CUSTOMER",
    text: statusMsg,
  });
}
