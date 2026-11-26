import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalProducts, orders, messages, totalBanners] = await Promise.all([
      prisma.product.count(),
      prisma.order.findMany({ select: { totalPKR: true, status: true } }),
      prisma.contactMessage.findMany({ select: { isRead: true } }),
      prisma.banner.count(),
    ]);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
    const totalRevenuePKR = orders.reduce((sum, o) => sum + o.totalPKR, 0);
    const unreadMessages = messages.filter((m) => !m.isRead).length;

    return NextResponse.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenuePKR,
      unreadMessages,
      totalBanners,
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
