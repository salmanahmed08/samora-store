import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { getAdminSession } from "@/lib/auth";
import { triggerNewOrderAutomations } from "@/lib/whatsapp-automation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rateCheck = checkRateLimit(`checkout:${ip}`, 10, 5 * 60 * 1000); // 10 orders per 5 mins
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many checkout requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      customerName,
      phone,
      city,
      address,
      items,
      totalPKR,
      paymentMethod,
    } = body;

    if (
      !customerName ||
      !phone ||
      !city ||
      !address ||
      !items ||
      typeof customerName !== "string" ||
      typeof phone !== "string" ||
      customerName.length > 100 ||
      phone.length > 30 ||
      address.length > 500
    ) {
      return NextResponse.json(
        { error: "Missing or invalid checkout fields" },
        { status: 400 }
      );
    }

    const parsedTotal = Number(totalPKR);
    if (isNaN(parsedTotal) || parsedTotal <= 0 || parsedTotal > 5000000) {
      return NextResponse.json(
        { error: "Invalid order amount" },
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber();
    const itemsJson = typeof items === "string" ? items : JSON.stringify(items);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim(),
        items: itemsJson,
        totalPKR: Number(totalPKR),
        status: "PENDING",
        confirmationState: "AWAITING_CONFIRMATION",
        paymentMethod: paymentMethod || "COD",
      },
    });

    // Fire WhatsApp Automations asynchronously without blocking response
    try {
      triggerNewOrderAutomations(order).catch((err) =>
        console.warn("[WhatsApp New Order Alert Error]", err)
      );
    } catch {}

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
