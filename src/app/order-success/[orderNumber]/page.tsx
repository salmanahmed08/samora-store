import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPKR, buildWhatsAppLink } from "@/lib/utils";
import { CheckCircle2, MessageCircle, ArrowRight } from "lucide-react";
import { BRAND_LOGOS, BRAND_CONTACT } from "@/lib/brand-assets";

export const dynamic = "force-dynamic";

interface OrderSuccessProps {
  params: {
    orderNumber: string;
  };
}

export default async function OrderSuccessPage({ params }: OrderSuccessProps) {
  const { orderNumber } = params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
  });

  if (!order) {
    notFound();
  }

  let items: any[] = [];
  try {
    items = JSON.parse(order.items);
  } catch {
    items = [];
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F1EA] py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Success Header with LOGO 2 Invoice Header */}
        <div className="rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] p-8 sm:p-10 text-center space-y-5 shadow-sm">
          {/* Logo 2: Order Invoice & Official Seal */}
          <div className="w-16 h-16 mx-auto rounded-2xl border border-[rgba(31,26,23,0.12)] bg-[#EBE4D8] p-2 overflow-hidden shadow-sm">
            <img
              src={BRAND_LOGOS.footerInvoice.path}
              alt="SAMORA"
              className="w-full h-full object-contain filter contrast-110"
            />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2C3A2F]/10 border border-[#2C3A2F]/20 text-xs text-[#2C3A2F] font-semibold mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Order Confirmed</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-serif text-[#1F1A17]">
              Order #{order.orderNumber}
            </h1>
          </div>

          <p className="text-sm text-[#6B5E54] max-w-lg mx-auto leading-relaxed">
            Thank you, <strong className="text-[#1F1A17]">{order.customerName}</strong>. Your order has been
            placed successfully. Our dispatch team will pack and hand your parcel to the courier within 24 hours.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-[#EBE4D8]/50 border border-[rgba(31,26,23,0.10)] text-[#6B5E54]">
              Status: <strong className="text-[#1F1A17]">{order.status}</strong>
            </span>
            <span className="px-3 py-1 rounded-full bg-[#EBE4D8]/50 border border-[rgba(31,26,23,0.10)] text-[#6B5E54]">
              Payment: <strong className="text-[#1F1A17]">{order.paymentMethod}</strong>
            </span>
            <span className="px-3 py-1 rounded-full bg-[#EBE4D8]/50 border border-[rgba(31,26,23,0.10)] text-[#6B5E54]">
              Date: {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Order Details & Items Breakdown */}
        <div className="rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[rgba(31,26,23,0.10)] pb-3">
            <h2 className="text-sm font-semibold font-serif text-[#1F1A17]">
              Order Receipt
            </h2>
            <span className="text-xs text-[#6B5E54]">
              SAMORA Official Store
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#6B5E54]">
            <div>
              <span className="text-xs text-[#1F1A17] block font-medium mb-1">
                Delivery Address
              </span>
              <p className="text-[#1F1A17] font-semibold">{order.customerName}</p>
              <p className="text-[#6B5E54]">{order.address}</p>
              <p className="text-[#6B5E54]">{order.city}, Pakistan</p>
              <p className="mt-1 text-[#1F1A17]">Phone: {order.phone}</p>
            </div>

            <div>
              <span className="text-xs text-[#1F1A17] block font-medium mb-1">
                Shipping & Payment
              </span>
              <p className="text-[#1F1A17] font-semibold">Express Air Courier (24-48h)</p>
              <p className="text-[#6B5E54]">Payment: Cash on Delivery</p>
              <p className="text-[#2C3A2F] font-medium mt-1">Inspection permitted before payment</p>
            </div>
          </div>

          {/* Items List */}
          <div className="pt-4 border-t border-[rgba(31,26,23,0.10)] space-y-2.5">
            <span className="text-xs text-[#1F1A17] block font-medium">
              Items in this order
            </span>
            {items.map((it, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EBE4D8]/30 border border-[rgba(31,26,23,0.08)] text-xs"
              >
                <div>
                  <h4 className="text-[#1F1A17] font-semibold font-serif">{it.title}</h4>
                  <span className="text-[#6B5E54] text-[11px]">
                    Size: {it.size} &bull; Qty: {it.quantity}
                  </span>
                </div>
                <div className="text-[#1F1A17] font-bold">
                  {formatPKR(it.pricePKR * it.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp Direct Confirmation Banner */}
          <div className="p-4 rounded-2xl bg-[#2C3A2F]/10 border border-[#2C3A2F]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2C3A2F]/20 flex items-center justify-center text-[#2C3A2F] shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-semibold text-[#1F1A17]">
                  Confirm Directly on WhatsApp
                </h4>
                <p className="text-xs text-[#6B5E54]">
                  Notify our team directly to expedite packaging and courier dispatch.
                </p>
              </div>
            </div>
            <a
              href={buildWhatsAppLink(
                BRAND_CONTACT.whatsAppNumber,
                `Assalam-o-Alaikum SAMORA! I just placed order ${order.orderNumber} for ${formatPKR(
                  order.totalPKR
                )} (${order.customerName}, ${order.city}). Please confirm my courier dispatch.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-[#2C3A2F] hover:bg-[#1F1A17] text-white text-xs font-semibold transition flex items-center gap-1.5 shrink-0 shadow-md shadow-[#2C3A2F]/20"
              title="Confirm order on WhatsApp (0334 4826415)"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Confirm on WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-[rgba(31,26,23,0.10)] flex justify-between items-baseline">
            <span className="text-sm font-semibold text-[#1F1A17]">
              Total Payable (Cash on Delivery)
            </span>
            <span className="text-xl font-bold font-serif text-[#1F1A17]">
              {formatPKR(order.totalPKR)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href={`/track-order?orderNumber=${order.orderNumber}`}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#FAF8F4] hover:bg-[#EBE4D8] border border-[rgba(31,26,23,0.15)] text-[#1F1A17] text-xs font-semibold transition text-center"
          >
            Track Order Status
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#2C3A2F] text-white text-xs font-semibold hover:bg-[#1F1A17] transition text-center shadow-md shadow-[#2C3A2F]/20"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
