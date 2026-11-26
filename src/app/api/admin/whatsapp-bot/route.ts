import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import {
  getWhatsAppSettings,
  sendWhatsAppMessage,
  processCustomerQuizReply,
  triggerNewOrderAutomations,
} from "@/lib/whatsapp-automation";

// GET: Returns settings, delivery/quiz logs, and recent orders for simulation
export async function GET() {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const settings = await getWhatsAppSettings();
    const logs = await (prisma as any).whatsAppLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const counts = {
      totalOutbound: await (prisma as any).whatsAppLog.count({ where: { direction: "OUTBOUND" } }),
      totalInbound: await (prisma as any).whatsAppLog.count({ where: { direction: "INBOUND" } }),
      totalQuizConfirmed: await prisma.order.count({ where: { confirmationState: "CONFIRMED_BY_CUSTOMER" } }),
      totalCheckingMore: await prisma.order.count({ where: { confirmationState: "CHECKING_MORE" } }),
    };

    return NextResponse.json({
      success: true,
      settings,
      logs,
      recentOrders,
      counts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Save settings, trigger manual test, or run live interactive quiz simulation
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
      return NextResponse.json({ success: true, message: "WhatsApp Bot Settings saved!" });
    }

    if (action === "create_test_order") {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const testOrder = await prisma.order.create({
        data: {
          orderNumber: `SMR-${randomDigits}`,
          customerName: "Zubair Hashmi",
          phone: "03344826415",
          city: "Lahore",
          address: "DHA Phase 5, Lahore, Pakistan",
          items: JSON.stringify([
            {
              title: "Obsidian Heavyweight Hoodie",
              size: "L",
              quantity: 1,
              pricePKR: 8500,
            },
          ]),
          totalPKR: 8500,
          status: "PENDING",
          confirmationState: "AWAITING_CONFIRMATION",
          paymentMethod: "COD",
        },
      });
      return NextResponse.json({ success: true, order: testOrder });
    }

    if (action === "simulate_quiz_click") {
      const { phone, buttonId, orderNumber } = body;
      const result = await processCustomerQuizReply({
        phone: phone || "03344826415",
        replyId: buttonId,
        orderNumber,
      });
      return NextResponse.json({ success: true, result });
    }

    if (action === "simulate_text_reply") {
      const { phone, text, orderNumber } = body;
      const result = await processCustomerQuizReply({
        phone: phone || "03344826415",
        replyText: text,
        orderNumber,
      });
      return NextResponse.json({ success: true, result });
    }

    if (action === "send_test_message") {
      const { phone, text } = body;
      const res = await sendWhatsAppMessage({
        phone: phone || "03344826415",
        customerName: "Test Recipient",
        eventType: "ADMIN_NEW_ORDER",
        recipientType: "CUSTOMER",
        text: text || "Assalam-o-Alaikum from SAMORA Storefront Test!",
      });
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
