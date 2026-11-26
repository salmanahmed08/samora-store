"use client";

import React, { useState } from "react";
import { formatPKR, buildWhatsAppLink } from "@/lib/utils";
import { ShoppingCart, Eye, X, MessageCircle, Search } from "lucide-react";
import { BRAND_LOGOS } from "@/lib/brand-assets";
import { useToast } from "@/components/admin/ToastContext";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  items: string;
  totalPKR: number;
  status: string;
  confirmationState: string;
  customerQuizReplyAt?: string | null;
  trackingNumber?: string | null;
  paymentMethod: string;
  createdAt: string;
}

export default function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const { success, error: toastError } = useToast();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statuses = ["ALL", "PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.toLowerCase().includes(search.toLowerCase()) ||
      o.city.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.status === 401) {
        toastError("Session expired. Please sign in again.");
        window.location.href = "/admin/login";
        return;
      }

      const data = await res.json();
      if (res.ok && data) {
        const updated = data.order || data;
        setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
        if (selectedOrder?.id === id) {
          setSelectedOrder(updated);
        }
        success(`Order #${updated.orderNumber} updated to ${newStatus}`);
      } else {
        toastError(data.error || "Failed to update order status");
      }
    } catch (err: any) {
      toastError(err.message || "Error updating order");
    } finally {
      setUpdatingId(null);
    }
  };

  const getWhatsAppMessageUrl = (ord: Order) => {
    const message = `Assalam-o-Alaikum ${ord.customerName}! This is Samora confirming your order #${ord.orderNumber} for ${formatPKR(
      ord.totalPKR
    )}. Current dispatch status: ${ord.status}. Let us know if you need any assistance!`;
    return buildWhatsAppLink(ord.phone, message);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-[#1F1A17]/10">
        <h1 className="text-2xl font-bold text-[#1F1A17] tracking-tight">
          Orders ({orders.length})
        </h1>
        <p className="text-sm text-[#6B5E54] mt-0.5">
          Manage customer orders, track fulfillment statuses, and message clients on WhatsApp.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((st) => {
            const count = st === "ALL" ? orders.length : orders.filter((o) => o.status === st).length;
            const isSelected = statusFilter === st;

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isSelected
                    ? "bg-[#2C3A2F] text-white shadow-xs"
                    : "bg-white border border-[#1F1A17]/10 text-[#6B5E54] hover:text-[#1F1A17] hover:bg-[#FAF8F4]"
                }`}
              >
                {st === "ALL" ? "All Orders" : st.charAt(0) + st.slice(1).toLowerCase()} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#6B5E54] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders by order number, customer name, phone, or city..."
            className="w-full bg-white border border-[#1F1A17]/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1F1A17] placeholder-[#6B5E54]/70 focus:outline-none focus:border-[#2C3A2F] transition shadow-xs"
          />
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 border border-[#1F1A17]/10 bg-white rounded-xl text-center space-y-2 max-w-md mx-auto my-6 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-[#FAF8F4] border border-[#1F1A17]/10 flex items-center justify-center text-[#6B5E54] mx-auto">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#1F1A17]">
            No orders found
          </h3>
          <p className="text-xs text-[#6B5E54]">
            {statusFilter === "ALL"
              ? "When customers place orders, they will appear here with full dispatch controls."
              : `There are currently no orders with status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="border border-[#1F1A17]/10 bg-white rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F4] border-b border-[#1F1A17]/10 text-[#6B5E54] uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Order #</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Destination</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Total (PKR)</th>
                  <th className="px-5 py-3.5">Quiz State</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1A17]/5">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF8F4]/50 transition">
                    <td className="px-5 py-3.5 font-semibold text-[#1F1A17]">
                      {ord.orderNumber}
                    </td>
                    <td className="px-5 py-3.5 text-[#1F1A17]">
                      {ord.customerName}
                    </td>
                    <td className="px-5 py-3.5 text-[#6B5E54]">
                      {ord.phone}
                    </td>
                    <td className="px-5 py-3.5 text-[#6B5E54]">
                      {ord.city}
                    </td>
                    <td className="px-5 py-3.5 text-[#6B5E54]">
                      {ord.paymentMethod}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#1F1A17]">
                      {formatPKR(ord.totalPKR)}
                    </td>

                    {/* Quiz Confirmation State Badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.confirmationState === "CONFIRMED_BY_CUSTOMER"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : ord.confirmationState === "CHECKING_MORE"
                            ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                            : ord.confirmationState === "CANCELLED_BY_CUSTOMER"
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : "bg-[#EBE4D8] text-[#6B5E54] border border-[rgba(31,26,23,0.12)]"
                        }`}
                      >
                        {ord.confirmationState === "CONFIRMED_BY_CUSTOMER"
                          ? "Customer Confirmed"
                          : ord.confirmationState === "CHECKING_MORE"
                          ? "Checking More"
                          : ord.confirmationState === "CANCELLED_BY_CUSTOMER"
                          ? "Cancelled by Customer"
                          : "Awaiting Reply"}
                      </span>
                    </td>

                    {/* Status Select */}
                    <td className="px-5 py-3.5">
                      <select
                        value={ord.status}
                        disabled={updatingId === ord.id}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md border focus:outline-none transition ${
                          ord.status === "DELIVERED"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : ord.status === "SHIPPED"
                            ? "border-blue-300 bg-blue-50 text-blue-800"
                            : ord.status === "PACKED"
                            ? "border-purple-300 bg-purple-50 text-purple-800"
                            : ord.status === "CONFIRMED"
                            ? "border-amber-300 bg-amber-50 text-amber-800"
                            : ord.status === "CANCELLED"
                            ? "border-red-300 bg-red-50 text-red-800"
                            : "border-[#1F1A17]/15 bg-[#FAF8F4] text-[#6B5E54]"
                        }`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PACKED">Packed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={getWhatsAppMessageUrl(ord)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 transition"
                          title="Message Customer on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-2.5 py-1 rounded-md bg-[#FAF8F4] border border-[#1F1A17]/10 hover:bg-[#F5F1EA] text-[#1F1A17] text-xs font-semibold transition flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1A17]/50 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white border border-[#1F1A17]/10 rounded-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1F1A17]/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FAF8F4] border border-[#1F1A17]/10 p-1 flex items-center justify-center shrink-0">
                  <img
                    src={BRAND_LOGOS.footerInvoice.path}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1F1A17]">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <span className="text-xs text-[#6B5E54]">
                    Placed {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-[#6B5E54] hover:text-[#1F1A17] hover:bg-[#FAF8F4] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Delivery Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FAF8F4] p-4 rounded-xl border border-[#1F1A17]/10">
              <div>
                <span className="text-[11px] text-[#6B5E54] font-semibold uppercase block mb-1">
                  Customer Details
                </span>
                <p className="text-[#1F1A17] font-semibold">{selectedOrder.customerName}</p>
                <p className="text-[#6B5E54]">Phone: {selectedOrder.phone}</p>
                <p className="text-[#6B5E54]">City: {selectedOrder.city}</p>
                <p className="text-[#6B5E54] mt-1">{selectedOrder.address}</p>
              </div>

              <div>
                <span className="text-[11px] text-[#6B5E54] font-semibold uppercase block mb-1">
                  Fulfillment Status
                </span>
                <p className="text-[#6B5E54]">Payment: {selectedOrder.paymentMethod}</p>
                <p className="text-[#6B5E54]">Status: <strong className="text-[#1F1A17]">{selectedOrder.status}</strong></p>

                <div className="pt-3">
                  <a
                    href={getWhatsAppMessageUrl(selectedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2C3A2F] hover:bg-[#202B23] text-white text-xs font-semibold rounded-lg transition shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Message on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#1F1A17] block">
                Purchased Items
              </span>
              {(() => {
                let items: any[] = [];
                try {
                  items = JSON.parse(selectedOrder.items);
                } catch {
                  items = [];
                }

                return items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-[#FAF8F4] rounded-lg border border-[#1F1A17]/10 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#1F1A17]">{it.title}</div>
                      <div className="text-[#6B5E54] text-[11px] mt-0.5">
                        Size: {it.size} &bull; Qty: {it.quantity}
                      </div>
                    </div>
                    <div className="font-semibold text-[#1F1A17]">
                      {formatPKR(it.pricePKR * it.quantity)}
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-[#1F1A17]/10 flex justify-between items-baseline">
              <span className="text-sm font-semibold text-[#6B5E54]">Total Amount:</span>
              <span className="text-lg font-bold text-[#1F1A17]">
                {formatPKR(selectedOrder.totalPKR)}
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-[#2C3A2F] text-white font-semibold text-xs rounded-lg hover:bg-[#202B23] transition shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
