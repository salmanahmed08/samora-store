"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Clock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatPKR } from "@/lib/utils";

export default function TrackOrderClient() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get("orderNumber") || "";

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTrack = async (targetOrderNumber?: string) => {
    const num = targetOrderNumber || orderNumber;
    if (!num.trim()) {
      setError("Please enter your Order Number (e.g. SMR-...)");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(num.trim())}`);
      if (!res.ok) {
        throw new Error("Order not found. Please double-check your Order Number.");
      }
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Failed to locate order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      handleTrack(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  let items: any[] = [];
  if (order?.items) {
    try {
      items = JSON.parse(order.items);
    } catch {
      items = [];
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <div className="text-right">
            <span className="px-3.5 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold inline-block">
              Confirmed
            </span>
            <span className="text-[11px] text-[#6B5E54] block mt-1">
              Your order is verified and being prepared at our atelier.
            </span>
          </div>
        );
      case "PACKED":
        return (
          <div className="text-right">
            <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold inline-block">
              Packed & Ready
            </span>
            <span className="text-[11px] text-[#6B5E54] block mt-1">
              Quality checked and packed in our signature packaging.
            </span>
          </div>
        );
      case "SHIPPED":
        return (
          <div className="text-right">
            <span className="px-3.5 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold inline-block">
              Shipped via Express Courier
            </span>
            <span className="text-[11px] text-[#6B5E54] block mt-1">
              On the road to your city. You will receive an SMS on delivery day.
            </span>
          </div>
        );
      case "DELIVERED":
        return (
          <div className="text-right">
            <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold inline-block">
              Delivered
            </span>
            <span className="text-[11px] text-[#6B5E54] block mt-1">
              Parcel safely handed over. Enjoy your bespoke fit!
            </span>
          </div>
        );
      case "CANCELLED":
        return (
          <div className="text-right">
            <span className="px-3.5 py-1 rounded-full bg-red-100 text-red-900 text-xs font-bold inline-block">
              Cancelled
            </span>
            <span className="text-[11px] text-[#6B5E54] block mt-1">
              This order was cancelled as requested.
            </span>
          </div>
        );
      default:
        return (
          <div className="text-right">
            <span className="px-3.5 py-1 rounded-full bg-[#EBE4D8] text-[#1F1A17] text-xs font-bold inline-block">
              Order Received (Pending Confirmation)
            </span>
            <span className="text-[11px] text-[#6B5E54] block mt-1">
              We received your order. Tap OK on WhatsApp to confirm!
            </span>
          </div>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F1EA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          prefetch={true}
          className="text-xs text-[#6B5E54] hover:text-[#1F1A17] transition inline-flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold text-[#B55A38] uppercase tracking-wider block">
            Express Courier Tracking
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#1F1A17]">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5E54] max-w-md mx-auto">
            Enter your order reference number received via SMS or WhatsApp confirmation.
          </p>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#6B5E54] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter Order # (e.g. SMR-173200...)"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[rgba(31,26,23,0.15)] text-xs font-mono text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 rounded-2xl bg-[#2C3A2F] text-white text-xs font-semibold hover:bg-[#1F1A17] transition shadow-sm active:scale-[0.98] disabled:opacity-50 shrink-0"
            >
              {loading ? "Locating..." : "Track Order"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Details Output */}
        {order && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(31,26,23,0.08)] pb-5">
              <div>
                <span className="text-[11px] text-[#6B5E54] block">Order Number</span>
                <span className="font-mono text-base font-bold text-[#1F1A17]">{order.orderNumber}</span>
              </div>
              <div>{getStatusBadge(order.status)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#6B5E54] block">Customer Name:</span>
                <span className="font-semibold text-[#1F1A17]">{order.customerName}</span>
              </div>
              <div>
                <span className="text-[#6B5E54] block">Delivery Destination:</span>
                <span className="font-semibold text-[#1F1A17]">{order.city}, Pakistan</span>
              </div>
            </div>

            {/* Items table */}
            <div className="border-t border-[rgba(31,26,23,0.08)] pt-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B5E54] block">
                Ordered Silhouettes ({items.length})
              </span>
              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[rgba(31,26,23,0.06)] text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#1F1A17] block">{it.title}</span>
                      <span className="text-[#6B5E54] text-[11px]">Size: {it.size || "Standard"} • Qty: {it.quantity || 1}</span>
                    </div>
                    <span className="font-bold font-serif text-[#1F1A17]">{formatPKR(it.pricePKR || 0)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-[rgba(31,26,23,0.08)] pt-4 flex justify-between items-center text-sm font-bold text-[#1F1A17]">
              <span>Total Payable (COD):</span>
              <span className="font-serif text-base">{formatPKR(order.totalPKR)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
