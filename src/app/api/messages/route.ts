import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET() {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rateCheck = checkRateLimit(`contact:${ip}`, 5, 5 * 60 * 1000); // 5 messages per 5 mins
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many messages sent. Please wait a few minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, phone, email, message } = body;

    if (
      !name ||
      !message ||
      typeof name !== "string" ||
      typeof message !== "string" ||
      name.length > 100 ||
      message.length > 2000
    ) {
      return NextResponse.json(
        { error: "Name and message are required (max 2000 characters)" },
        { status: 400 }
      );
    }

    const created = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        email: email ? email.trim() : null,
        message: message.trim(),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json({ error: "Failed to submit message" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, isRead } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Message id required" }, { status: 400 });
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: Boolean(isRead) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/messages error:", error);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Message id required" }, { status: 400 });
    }

    await prisma.contactMessage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/messages error:", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
