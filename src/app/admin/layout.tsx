"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Tags,
  Sliders,
  ShoppingCart,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Globe,
  Bot,
  PhoneCall,
  Search,
} from "lucide-react";
import { BRAND_LOGOS } from "@/lib/brand-assets";
import { ToastProvider } from "@/components/admin/ToastContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");

  // If on login page, render clean standalone view
  if (pathname === "/admin/login") {
    return <ToastProvider>{children}</ToastProvider>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  const navSections = [
    {
      title: "Store Management",
      items: [
        { label: "Home Summary", subtitle: "Today's orders & store status", href: "/admin", icon: LayoutDashboard },
        { label: "My Products", subtitle: "View, edit, or remove items", href: "/admin/products", icon: Package },
        { label: "Add Many Products", subtitle: "Add several items at one price", href: "/admin/products/bulk", icon: Layers },
        { label: "Categories", subtitle: "Group items like Hoodies or Tees", href: "/admin/categories", icon: Tags },
        { label: "Customer Orders", subtitle: "Update order status & view replies", href: "/admin/orders", icon: ShoppingCart },
      ],
    },
    {
      title: "Automated Assistants",
      items: [
        {
          label: "Sheet & Drive Auto-Update",
          subtitle: "Sync prices & photos automatically",
          href: "/admin/google-sync",
          icon: Sliders,
          isSync: true,
        },
        {
          label: "WhatsApp Messages",
          subtitle: "Order alerts, quiz & replies",
          href: "/admin/whatsapp-bot",
          icon: Bot,
          badge: "Quiz Bot",
        },
        {
          label: "After-Hours Call Bot",
          subtitle: "AI phone help when closed",
          href: "/admin/voice-agent",
          icon: PhoneCall,
          badge: "Nighttime",
        },
      ],
    },
    {
      title: "Storefront & Showcase",
      items: [
        { label: "Store Look & Hanger", subtitle: "Control hanger bar & home items", href: "/admin/storefront", icon: Sliders },
        { label: "Banners & Photos", subtitle: "Manage showcase banners", href: "/admin/banners", icon: ImageIcon },
        { label: "Search & Store SEO", subtitle: "How your store shows on Google", href: "/admin/seo", icon: Globe },
      ],
    },
    {
      title: "Help & Settings",
      items: [
        { label: "Customer Messages", subtitle: "Read messages from Contact page", href: "/admin/messages", icon: MessageSquare },
        { label: "Store Info & Security", subtitle: "Phone, social links & password", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const getPageTitle = () => {
    if (pathname === "/admin") return "Home Summary";
    if (pathname === "/admin/google-sync") return "Sheet & Drive Auto-Update";
    if (pathname === "/admin/seo") return "Search & Store SEO";
    if (pathname === "/admin/products/bulk") return "Add Many Products";
    if (pathname.startsWith("/admin/products/new")) return "Add New Product";
    if (pathname.includes("/admin/products/") && pathname.includes("/edit")) return "Edit Product";
    if (pathname.startsWith("/admin/products")) return "My Products";
    if (pathname.startsWith("/admin/categories")) return "Categories";
    if (pathname.startsWith("/admin/storefront")) return "Store Look & Hanger Rail";
    if (pathname.startsWith("/admin/orders")) return "Customer Orders";
    if (pathname.startsWith("/admin/banners")) return "Banners & Photos";
    if (pathname.startsWith("/admin/whatsapp-bot")) return "WhatsApp Messages & Quiz Bot";
    if (pathname.startsWith("/admin/voice-agent")) return "After-Hours Call Bot";
    if (pathname.startsWith("/admin/messages")) return "Customer Messages";
    if (pathname.startsWith("/admin/settings")) return "Store Info & Security";
    return "Admin Portal";
  };

  const handleAdminSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSearch.trim()) return;
    const term = adminSearch.trim();
    if (term.toUpperCase().startsWith("SMR-") || term.length > 8) {
      router.push(`/admin/orders?search=${encodeURIComponent(term)}`);
    } else {
      router.push(`/admin/products?search=${encodeURIComponent(term)}`);
    }
    setAdminSearch("");
  };

  return (
    <div className="min-h-screen bg-[#F5F1EA] flex flex-col lg:flex-row text-[#1F1A17] font-sans">
      {/* Mobile Header Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3.5 bg-[#FFFFFF] border-b border-[rgba(31,26,23,0.08)] sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] p-1 flex items-center justify-center">
            <img
              src={BRAND_LOGOS.adminPortal.path}
              alt="SAMORA"
              className="w-full h-full object-contain filter contrast-110"
            />
          </div>
          <div>
            <span className="text-sm font-bold font-serif text-[#1F1A17] tracking-tight block leading-none">
              SAMORA
            </span>
            <span className="text-[10px] text-[#6B5E54] block mt-0.5">Admin Atelier</span>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-[#1F1A17] hover:bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)]"
          aria-label="Toggle admin sidebar"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#1F1A17]/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Grouped Luxury Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#FFFFFF] border-r border-[rgba(31,26,23,0.08)] p-5 flex flex-col justify-between z-50 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1 scrollbar-thin">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] p-1.5 flex items-center justify-center shadow-sm">
              <img
                src={BRAND_LOGOS.adminPortal.path}
                alt={BRAND_LOGOS.adminPortal.name}
                className="w-full h-full object-contain filter contrast-110"
              />
            </div>
            <div>
              <span className="text-sm font-bold font-serif text-[#1F1A17] tracking-tight block leading-none">
                SAMORA
              </span>
              <span className="text-[11px] text-[#6B5E54] block mt-1">
                Atelier Management
              </span>
            </div>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleAdminSearch} className="px-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#6B5E54] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search SKU or Order..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] text-[11px] text-[#1F1A17] placeholder-[#6B5E54] focus:outline-none focus:ring-1 focus:ring-[#2C3A2F]"
              />
            </div>
          </form>

          {/* Grouped Navigation Menu */}
          <nav className="space-y-5">
            {navSections.map((sec) => (
              <div key={sec.title} className="space-y-1">
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#6B5E54] block mb-1">
                  {sec.title}
                </span>

                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname === item.href ||
                        (item.href !== "/admin/products" && pathname.startsWith(item.href)) ||
                        (item.href === "/admin/products" &&
                          pathname.startsWith("/admin/products") &&
                          !pathname.startsWith("/admin/products/bulk"));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                        isActive
                          ? "bg-[#2C3A2F] text-white shadow-sm"
                          : "text-[#6B5E54] hover:text-[#1F1A17] hover:bg-[#F7F5F0]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[#6B5E54]"}`} />
                        <div className="truncate">
                          <span className="block truncate">{item.label}</span>
                          {(item as any).subtitle && (
                            <span
                              className={`block text-[10px] font-normal truncate ${
                                isActive ? "text-white/80" : "text-[#6B5E54]/80"
                              }`}
                            >
                              {(item as any).subtitle}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {(item as any).badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-100 text-emerald-800">
                            {(item as any).badge}
                          </span>
                        )}
                        {(item as any).isSync && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Sync Active" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-[rgba(31,26,23,0.08)] space-y-1.5 shrink-0">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#6B5E54] hover:text-[#1F1A17] hover:bg-[#F7F5F0] transition"
          >
            <span>View Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#6B5E54] hover:text-[#B55A38] hover:bg-[#B55A38]/10 transition text-left"
          >
            <LogOut className="w-3.5 h-3.5 text-[#B55A38]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 h-16 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[rgba(31,26,23,0.08)] sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#6B5E54] font-medium">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#6B5E54]" />
            <span className="text-[#1F1A17] font-semibold">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#1F1A17] hover:text-[#2C3A2F] flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[rgba(31,26,23,0.12)] bg-[#FAF8F4] hover:bg-[#EBE4D8] transition shadow-sm"
            >
              <span>View Store</span>
              <ExternalLink className="w-3 h-3 text-[#2C3A2F]" />
            </Link>

            <div className="flex items-center gap-2 pl-3 border-l border-[rgba(31,26,23,0.10)]">
              <div className="w-7 h-7 rounded-full bg-[#2C3A2F] text-white text-xs font-semibold flex items-center justify-center">
                A
              </div>
              <span className="text-xs font-medium text-[#1F1A17]">
                admin@samora.pk
              </span>
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </div>
    </div>
  );
}
