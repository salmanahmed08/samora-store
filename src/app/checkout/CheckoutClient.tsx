"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  ArrowLeft,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/components/CartContext";
import { formatPKR } from "@/lib/utils";

const PAKISTAN_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Abbottabad",
  "Bahawalpur",
  "Sargodha",
  "Sukkur",
  "Sheikhupura",
  "Gujrat",
  "Mardan",
  "Kasur",
  "Rahim Yar Khan",
  "Sahiwal",
  "Wah Cantonment",
  "Mingora (Swat)",
  "Jhelum",
  "Muzaffarabad",
  "Mirpur (AJK)",
  "Other City",
];

export default function CheckoutClient() {
  const router = useRouter();
  const { items, totalPKR, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Lahore");
  const [address, setAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-[#F5F1EA] px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#EBE4D8] flex items-center justify-center text-[#6B5E54] mb-4 shadow-sm">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1A17] mb-2">
          Your Cart is Empty
        </h1>
        <p className="text-sm text-[#6B5E54] max-w-sm mb-6">
          Add artisanal streetwear silhouettes to your cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          prefetch={true}
          className="px-8 py-3.5 rounded-full bg-[#1F1A17] text-[#FAF8F4] text-xs font-semibold hover:bg-[#B55A38] transition shadow-md"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customerName.trim()) {
      setError("Please provide your full recipient name.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setError("Please provide a valid Pakistani mobile number (e.g., 0334-XXXXXXX).");
      return;
    }
    if (!address.trim()) {
      setError("Please provide your complete shipping street address.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        address: orderNotes.trim()
          ? `${address.trim()} (Notes: ${orderNotes.trim()})`
          : address.trim(),
        items: items.map((it) => ({
          productId: it.productId,
          title: it.title,
          size: it.size,
          quantity: it.quantity,
          pricePKR: it.pricePKR,
          image: it.image,
        })),
        totalPKR,
        paymentMethod: "COD",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to confirm order. Please try again.");
      }

      const order = await res.json();
      clearCart();
      router.push(`/order-success/${order.orderNumber}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while placing order.");
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F1EA] py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link
          href="/cart"
          prefetch={true}
          className="text-xs text-[#6B5E54] hover:text-[#1F1A17] transition inline-flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Cart</span>
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2C3A2F]/10 border border-[#2C3A2F]/20 text-xs text-[#2C3A2F] font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Cash on Delivery Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#1F1A17]">
            Finalize Your Bespoke Order
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5E54] max-w-md mx-auto">
            Pay safely with Cash on Delivery anywhere in Pakistan. Standard delivery within 2-4 business days.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 max-w-2xl mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Checkout Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] shadow-sm space-y-6"
          >
            <h2 className="text-base font-bold font-serif text-[#1F1A17] border-b border-[rgba(31,26,23,0.08)] pb-4">
              Shipping & Recipient Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Salman Ahmed"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[rgba(31,26,23,0.15)] text-xs text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                  Mobile Number (WhatsApp Enabled) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0334-XXXXXXX"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[rgba(31,26,23,0.15)] text-xs text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                />
                <span className="text-[10px] text-[#6B5E54] block mt-1">
                  Required for courier dispatch confirmation and parcel tracking SMS.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                  Destination City (Pakistan) *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[rgba(31,26,23,0.15)] text-xs text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                >
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                  Complete Street Address / House / Colony *
                </label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #, Street #, Sector / Colony, Landmark"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[rgba(31,26,23,0.15)] text-xs text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                  Special Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Call before arrival, leave with security guard"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[rgba(31,26,23,0.15)] text-xs text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Method Badge */}
            <div className="p-4 rounded-2xl bg-[#EBE4D8]/60 border border-[rgba(31,26,23,0.08)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1F1A17] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#2C3A2F]" />
                  <span>Cash on Delivery (COD)</span>
                </span>
                <span className="text-[11px] font-semibold text-[#2C3A2F] uppercase tracking-wider">
                  Verified Payment
                </span>
              </div>
              <p className="text-[11px] text-[#6B5E54] leading-relaxed">
                Pay the exact amount in cash directly to the courier rider upon physical inspection & receipt of your parcel.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-[#2C3A2F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1F1A17] transition shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{submitting ? "Placing Order..." : `Confirm Order â€¢ ${formatPKR(totalPKR)}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Cart Review Sidebar */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] shadow-sm space-y-6">
            <h2 className="text-base font-bold font-serif text-[#1F1A17] border-b border-[rgba(31,26,23,0.08)] pb-4">
              Order Review ({items.length} {items.length === 1 ? "Item" : "Items"})
            </h2>

            <div className="divide-y divide-[rgba(31,26,23,0.06)] max-h-96 overflow-y-auto pr-1 space-y-3">
              {items.map((it) => (
                <div key={it.id} className="pt-3 first:pt-0 flex items-center gap-3.5">
                  <div className="w-14 h-16 rounded-xl bg-[#EBE4D8] overflow-hidden shrink-0 border border-[rgba(31,26,23,0.08)]">
                    <img
                      src={it.image}
                      alt={it.title}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-[#1F1A17] truncate">{it.title}</h3>
                    <span className="text-[10px] text-[#6B5E54] block">
                      Size: {it.size} â€¢ Qty: {it.quantity}
                    </span>
                    <span className="text-xs font-serif font-bold text-[#1F1A17] block mt-0.5">
                      {formatPKR(it.pricePKR * it.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Breakdown */}
            <div className="border-t border-[rgba(31,26,23,0.08)] pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-[#6B5E54]">
                <span>Subtotal:</span>
                <span>{formatPKR(totalPKR)}</span>
              </div>
              <div className="flex justify-between text-[#6B5E54]">
                <span>Nationwide Shipping:</span>
                <span className="text-[#2C3A2F] font-semibold uppercase tracking-wider text-[10px]">
                  Complimentary
                </span>
              </div>
              <div className="flex justify-between text-[#1F1A17] font-bold text-sm pt-2 border-t border-[rgba(31,26,23,0.06)]">
                <span>Total Payable (COD):</span>
                <span className="font-serif text-base">{formatPKR(totalPKR)}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-2 border-t border-[rgba(31,26,23,0.06)] space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-[#6B5E54]">
                <ShieldCheck className="w-4 h-4 text-[#2C3A2F] shrink-0" />
                <span>100% Original Heavyweight Streetwear Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#6B5E54]">
                <Truck className="w-4 h-4 text-[#2C3A2F] shrink-0" />
                <span>Express courier dispatch from Lahore atelier</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
