"use client";

import React from "react";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "./CartContext";
import { formatPKR } from "@/lib/utils";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalPKR,
    totalCount,
  } = useCart();

  const FREE_SHIPPING_THRESHOLD = 5000;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPKR);
  const progressPercent = Math.min(100, Math.round((totalPKR / FREE_SHIPPING_THRESHOLD) * 100));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1F1A17]/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F4] border-l border-[rgba(31,26,23,0.12)] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-[rgba(31,26,23,0.10)] flex items-center justify-between bg-[#F5F1EA]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#2C3A2F]" />
              <h2 className="text-base font-bold font-display text-[#1F1A17]">
                Your Cart ({totalCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="w-8 h-8 rounded-full bg-[#EBE4D8] hover:bg-[rgba(31,26,23,0.1)] text-[#1F1A17] flex items-center justify-center transition"
              aria-label="Close Cart"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="px-5 py-3.5 bg-[#EBE4D8]/60 border-b border-[rgba(31,26,23,0.08)]">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-[#6B5E54] font-medium">
                {remainingForFreeShipping > 0
                  ? `Add ${formatPKR(remainingForFreeShipping)} more for Free Shipping`
                  : "You've unlocked Free Nationwide Shipping!"}
              </span>
              <span className="text-[#1F1A17] font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#FAF8F4] h-1.5 rounded-full overflow-hidden border border-[rgba(31,26,23,0.06)]">
              <div
                className="bg-[#2C3A2F] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                <div className="w-16 h-16 rounded-2xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] flex items-center justify-center text-[#6B5E54]">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold font-display text-[#1F1A17]">
                    Your cart is empty
                  </h3>
                  <p className="text-xs text-[#6B5E54] max-w-[240px]">
                    Looks like you haven&apos;t added any handcrafted pieces yet.
                  </p>
                </div>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="px-6 py-2.5 rounded-full bg-[#2C3A2F] text-[#FAF8F4] text-xs font-semibold hover:bg-[#222D24] transition shadow-sm"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3.5 rounded-2xl bg-[#F5F1EA] border border-[rgba(31,26,23,0.08)] shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="relative w-18 h-22 sm:w-20 sm:h-24 rounded-xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] shrink-0 overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-[#6B5E54]">SAMORA</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="text-xs font-bold font-display text-[#1F1A17] hover:text-[#2C3A2F] transition line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#6B5E54] hover:text-[#B55A38] p-1 transition"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-1">
                        <span className="text-[11px] text-[#6B5E54]">
                          Size: <strong className="text-[#1F1A17] font-semibold">{item.size}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-lg border border-[rgba(31,26,23,0.12)] bg-[#FAF8F4]">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 text-[#6B5E54] hover:text-[#1F1A17] transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#1F1A17]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 text-[#6B5E54] hover:text-[#1F1A17] transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-xs font-bold text-[#1F1A17]">
                        {formatPKR(item.pricePKR * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[rgba(31,26,23,0.10)] bg-[#F5F1EA] space-y-4">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[#6B5E54]">
                  <span>Subtotal</span>
                  <span className="text-[#1F1A17] font-bold">{formatPKR(totalPKR)}</span>
                </div>
                <div className="flex justify-between text-[#6B5E54]">
                  <span>Shipping</span>
                  <span className={remainingForFreeShipping === 0 ? "text-[#2C3A2F] font-bold" : ""}>
                    {remainingForFreeShipping === 0 ? "FREE" : "PKR 250 (COD)"}
                  </span>
                </div>
                <div className="pt-2 border-t border-[rgba(31,26,23,0.10)] flex justify-between text-sm text-[#1F1A17] font-bold">
                  <span>Total</span>
                  <span>
                    {formatPKR(totalPKR + (remainingForFreeShipping === 0 ? 0 : 250))}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  prefetch={true}
                  onClick={closeCart}
                  className="w-full py-3.5 rounded-full bg-[#2C3A2F] hover:bg-[#222D24] text-[#FAF8F4] text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/cart"
                  prefetch={true}
                  onClick={closeCart}
                  className="w-full py-2.5 rounded-full bg-[#FAF8F4] hover:bg-[#EBE4D8] border border-[rgba(31,26,23,0.12)] text-[#1F1A17] text-xs font-semibold transition flex items-center justify-center active:scale-[0.98]"
                >
                  View Full Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
