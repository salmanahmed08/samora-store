"use client";

import React from "react";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "@/components/CartContext";
import { formatPKR, buildWhatsAppLink } from "@/lib/utils";
import { BRAND_CONTACT } from "@/lib/brand-assets";

export default function CartClient() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalPKR,
    totalCount,
  } = useCart();

  const FREE_SHIPPING_THRESHOLD = 5000;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPKR);
  const progressPercent = Math.min(100, Math.round((totalPKR / FREE_SHIPPING_THRESHOLD) * 100));
  const shippingFee = totalPKR >= FREE_SHIPPING_THRESHOLD || totalPKR === 0 ? 0 : 250;
  const finalTotalPKR = totalPKR + shippingFee;

  const cartSummaryForWhatsApp = items
    .map(
      (it, idx) =>
        `${idx + 1}. ${it.title} (Size: ${it.size}, Qty: ${it.quantity}) - ${formatPKR(
          it.pricePKR * it.quantity
        )}`
    )
    .join("\n");

  const whatsAppMessage = `Hello SAMORA! I would like to order the following items:\n\n${cartSummaryForWhatsApp}\n\nTotal: ${formatPKR(
    finalTotalPKR
  )}\nPayment: Cash on Delivery\n\nPlease confirm availability and dispatch steps.`;

  const whatsAppLink = buildWhatsAppLink(BRAND_CONTACT.whatsAppNumber, whatsAppMessage);

  return (
    <div className="w-full min-h-screen bg-[#F5F1EA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <Link
          href="/shop"
          prefetch={true}
          className="text-xs text-[#6B5E54] hover:text-[#1F1A17] transition inline-flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>

        {/* Title */}
        <div className="border-b border-[rgba(31,26,23,0.10)] pb-6 flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#1F1A17]">
            Shopping Bag ({totalCount})
          </h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-[#B55A38] hover:underline font-semibold"
            >
              Clear Bag
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="p-12 sm:p-16 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#EBE4D8] text-[#2C3A2F] mx-auto flex items-center justify-center">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-serif text-[#1F1A17]">Your bag is currently empty</h2>
              <p className="text-xs text-[#6B5E54] max-w-sm mx-auto">
                Explore our signature 450 GSM French Terry hoodies and handcrafted luxury silhouettes.
              </p>
            </div>
            <Link
              href="/shop"
              prefetch={true}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#2C3A2F] text-white text-xs font-semibold hover:bg-[#1F1A17] transition shadow-sm"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-7 space-y-4">
              {items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.size}-${idx}`}
                  className="p-4 sm:p-5 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] flex items-center gap-4 sm:gap-6 shadow-sm"
                >
                  <div className="w-20 h-24 rounded-2xl bg-[#EBE4D8] overflow-hidden p-2 flex items-center justify-center shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold font-serif text-[#1F1A17] truncate">{item.title}</h3>
                    <span className="text-[11px] text-[#6B5E54] block mt-0.5">Size: {item.size}</span>
                    <span className="text-xs font-bold font-serif text-[#1F1A17] block mt-1">
                      {formatPKR(item.pricePKR)}
                    </span>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center rounded-xl bg-[#EBE4D8]/60 border border-[rgba(31,26,23,0.08)]">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 text-[#1F1A17] hover:text-[#B55A38]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#1F1A17]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 text-[#1F1A17] hover:text-[#2C3A2F]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[11px] text-[#B55A38] hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] shadow-sm space-y-6">
              <h2 className="text-base font-bold font-serif text-[#1F1A17] border-b border-[rgba(31,26,23,0.08)] pb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-[#6B5E54]">
                  <span>Subtotal</span>
                  <span className="text-[#1F1A17] font-bold">{formatPKR(totalPKR)}</span>
                </div>
                <div className="flex justify-between text-[#6B5E54]">
                  <span>Courier Shipping (COD)</span>
                  <span className={shippingFee === 0 ? "text-[#2C3A2F] font-bold" : ""}>
                    {shippingFee === 0 ? "FREE" : formatPKR(250)}
                  </span>
                </div>
                <div className="pt-3 border-t border-[rgba(31,26,23,0.08)] flex justify-between text-base font-bold text-[#1F1A17]">
                  <span>Total Payable:</span>
                  <span className="font-serif">{formatPKR(finalTotalPKR)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/checkout"
                  prefetch={true}
                  className="w-full py-3.5 rounded-full bg-[#2C3A2F] hover:bg-[#1F1A17] text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-full bg-[#FAF8F4] hover:bg-[#EBE4D8] border border-[rgba(31,26,23,0.15)] text-[#1F1A17] text-xs font-semibold transition flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4 text-[#2C3A2F]" />
                  <span>Order via WhatsApp Direct</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
