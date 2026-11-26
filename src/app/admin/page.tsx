import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Plus,
  Clock,
  ExternalLink,
  Settings,
  ChevronRight,
  Layers,
  Sliders,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [productCount, orders, messages] = await Promise.all([
    prisma.product.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const totalRevenuePKR = orders.reduce((sum, ord) => sum + ord.totalPKR, 0);
  const unreadMessagesCount = messages.filter((m) => !m.isRead).length;

  const recentOrders = orders.slice(0, 5);
  const recentMessages = messages.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Page Header with 3 Big Clear Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1F1A17]/10">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#B55A38] block mb-1">
            Store Owner Portal &bull; SAMORA Atelier
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1A17] tracking-tight">
            Welcome to Your Store
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5E54] mt-0.5">
            Everything happening in your boutique today: live orders, stock counts, and instant updates.
          </p>
        </div>

        {/* 3 Big Clear Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/products/new"
            prefetch={true}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2C3A2F] text-white hover:bg-[#202B23] text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
            title="Create a new piece in your shop"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/orders"
            prefetch={true}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FAF8F4] hover:bg-[#EBE4D8] border border-[#1F1A17]/15 text-[#1F1A17] text-xs font-semibold rounded-xl shadow-xs transition active:scale-95"
            title="See customer orders & status"
          >
            <ShoppingCart className="w-4 h-4 text-[#2C3A2F]" />
            <span>View Orders</span>
          </Link>
          <Link
            href="/admin/google-sync"
            prefetch={true}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAF8F4] border border-[#1F1A17]/15 text-[#1F1A17] text-xs font-semibold rounded-xl shadow-xs transition active:scale-95"
            title="Update items from your Google Sheet & Google Drive"
          >
            <Sliders className="w-4 h-4 text-[#B55A38]" />
            <span>Sync Sheet & Drive</span>
          </Link>
        </div>
      </div>

      {/* 4 Balanced KPI Cards in One Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Products */}
        <div className="p-5 bg-white border border-[#1F1A17]/10 rounded-xl shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#6B5E54]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Products
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F4] border border-[#1F1A17]/10 flex items-center justify-center text-[#2C3A2F]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1F1A17] tracking-tight">
              {productCount}
            </div>
            <p className="text-xs text-[#6B5E54] mt-1">
              {productCount === 0
                ? "No products added yet"
                : `${productCount} active in catalog`}
            </p>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="p-5 bg-white border border-[#1F1A17]/10 rounded-xl shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#6B5E54]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F4] border border-[#1F1A17]/10 flex items-center justify-center text-[#2C3A2F]">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1F1A17] tracking-tight">
              {totalOrders}
            </div>
            <p className="text-xs text-[#6B5E54] mt-1">
              {pendingOrders > 0
                ? `${pendingOrders} awaiting fulfillment`
                : "All orders fulfilled"}
            </p>
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="p-5 bg-white border border-[#1F1A17]/10 rounded-xl shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#6B5E54]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Revenue (PKR)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F4] border border-[#1F1A17]/10 flex items-center justify-center text-[#2C3A2F]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1F1A17] tracking-tight">
              {formatPKR(totalRevenuePKR)}
            </div>
            <p className="text-xs text-[#6B5E54] mt-1">
              Cash on delivery sales
            </p>
          </div>
        </div>

        {/* Card 4: Unread Messages */}
        <div className="p-5 bg-white border border-[#1F1A17]/10 rounded-xl shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#6B5E54]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Unread Messages
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F4] border border-[#1F1A17]/10 flex items-center justify-center text-[#2C3A2F]">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1F1A17] tracking-tight">
              {unreadMessagesCount}
            </div>
            <p className="text-xs text-[#6B5E54] mt-1">
              {messages.length} total customer inquiries
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Recent Orders & Customer Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Column (8 cols): Recent Orders */}
        <div className="lg:col-span-8 bg-white border border-[#1F1A17]/10 rounded-xl overflow-hidden flex flex-col shadow-xs">
          <div className="p-5 border-b border-[#1F1A17]/10 flex items-center justify-between bg-[#FAF8F4]">
            <div>
              <h2 className="text-base font-semibold text-[#1F1A17]">
                Recent Orders
              </h2>
              <p className="text-xs text-[#6B5E54] mt-0.5">
                Latest customer purchases via Cash on Delivery
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#2C3A2F] hover:underline transition flex items-center gap-1"
            >
              <span>View all ({totalOrders})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-12 text-center space-y-2 my-auto">
              <div className="w-10 h-10 rounded-full bg-[#FAF8F4] border border-[#1F1A17]/10 flex items-center justify-center text-[#6B5E54] mx-auto">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#1F1A17]">
                No orders yet
              </h3>
              <p className="text-xs text-[#6B5E54] max-w-sm mx-auto">
                When customers place an order through your store, it will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F4] border-b border-[#1F1A17]/10 text-[#6B5E54] uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Order #</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">City</th>
                    <th className="px-5 py-3.5">Total</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1A17]/5">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAF8F4]/50 transition">
                      <td className="px-5 py-3.5 font-semibold text-[#1F1A17]">
                        {ord.orderNumber}
                      </td>
                      <td className="px-5 py-3.5 text-[#1F1A17]">
                        {ord.customerName}
                      </td>
                      <td className="px-5 py-3.5 text-[#6B5E54]">
                        {ord.city}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#1F1A17]">
                        {formatPKR(ord.totalPKR)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${
                            ord.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : ord.status === "SHIPPED"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : ord.status === "CONFIRMED"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-[#FAF8F4] text-[#6B5E54] border border-[#1F1A17]/10"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href="/admin/orders"
                          className="text-xs text-[#2C3A2F] hover:underline transition font-semibold"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Messages & Shortcuts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Messages Box */}
          <div className="bg-white border border-[#1F1A17]/10 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#1F1A17]/10 flex items-center justify-between bg-[#FAF8F4]">
              <div>
                <h3 className="text-sm font-semibold text-[#1F1A17]">
                  Messages
                </h3>
                <p className="text-xs text-[#6B5E54] mt-0.5">
                  Recent inquiries from contact page
                </p>
              </div>
              <Link
                href="/admin/messages"
                className="text-xs text-[#2C3A2F] hover:underline font-semibold transition"
              >
                View all ({messages.length})
              </Link>
            </div>

            {recentMessages.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#6B5E54]">
                No customer inquiries yet.
              </div>
            ) : (
              <div className="divide-y divide-[#1F1A17]/5">
                {recentMessages.map((m) => (
                  <div key={m.id} className="p-4 hover:bg-[#FAF8F4]/50 transition space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#1F1A17]">{m.name}</span>
                      {!m.isRead && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B5E54] line-clamp-2">
                      {m.message}
                    </p>
                    <span className="text-[10px] text-[#6B5E54]/80 block pt-0.5">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white border border-[#1F1A17]/10 rounded-xl p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-semibold text-[#1F1A17] uppercase tracking-wider">
              Quick Shortcuts
            </h4>
            <div className="space-y-1.5 text-xs">
              <Link
                href="/admin/categories"
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF8F4] hover:bg-[#F5F1EA] border border-[#1F1A17]/10 text-[#1F1A17] transition font-medium"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#2C3A2F]" />
                  <span>Manage Categories</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B5E54]" />
              </Link>
              <Link
                href="/admin/storefront"
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF8F4] hover:bg-[#F5F1EA] border border-[#1F1A17]/10 text-[#1F1A17] transition font-medium"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-[#2C3A2F]" />
                  <span>Rail & Storefront Controls</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B5E54]" />
              </Link>
              <Link
                href="/admin/banners"
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF8F4] hover:bg-[#F5F1EA] border border-[#1F1A17]/10 text-[#1F1A17] transition font-medium"
              >
                <span>Campaign Banners</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B5E54]" />
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF8F4] hover:bg-[#F5F1EA] border border-[#1F1A17]/10 text-[#1F1A17] transition font-medium"
              >
                <span>Store Settings</span>
                <Settings className="w-3.5 h-3.5 text-[#6B5E54]" />
              </Link>
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF8F4] hover:bg-[#F5F1EA] border border-[#1F1A17]/10 text-[#1F1A17] transition font-medium"
              >
                <span>Open Storefront</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#6B5E54]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
