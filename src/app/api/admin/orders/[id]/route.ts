import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { triggerOrderStatusNotification } from "@/lib/whatsapp-automation";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order, ...order });
  } catch (error: any) {
    console.error("GET /api/admin/orders/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);
    const body = await req.json();
    const { status, confirmationState, trackingNumber } = body;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (confirmationState) dataToUpdate.confirmationState = confirmationState;
    if (trackingNumber !== undefined) dataToUpdate.trackingNumber = trackingNumber;

    const order = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
    });

    // Notify customer on WhatsApp of status update (isolated secondary side effect)
    if (status) {
      try {
        triggerOrderStatusNotification(order).catch((e) =>
          console.warn("[Status Notification Error]", e)
        );
      } catch (notifyErr) {
        console.warn("[Status Notification Trigger Error]", notifyErr);
      }
    }

    return NextResponse.json({ success: true, order, ...order });
  } catch (error: any) {
    console.error("PATCH /api/admin/orders/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/admin/orders/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete order" }, { status: 500 });
  }
}
