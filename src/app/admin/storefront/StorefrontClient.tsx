"use client";

import React, { useState } from "react";
import {
  Sliders,
  Sparkles,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Save,
  RefreshCw,
  ShoppingBag,
  Layers,
  ArrowRight,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  pricePKR: number;
  images: string;
  showOnHome: boolean;
  showOnHanger: boolean;
  hangerOrder: number;
}

interface Banner {
  id: string;
  slotName: string;
  title: string;
  subtitle: string | null;
  imagePath: string;
  ctaText: string | null;
  ctaLink: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface StorefrontClientProps {
  initialSettings: Record<string, string>;
  initialProducts: Product[];
  initialHeroBanners: Banner[];
}

export default function StorefrontClient({
  initialSettings,
  initialProducts,
  initialHeroBanners,
}: StorefrontClientProps) {
  // Settings State
  const [hangerEnabled, setHangerEnabled] = useState(
    initialSettings.hangerEnabled !== "false"
  );
  const [hangerTitle, setHangerTitle] = useState(
    initialSettings.hangerTitle || "Fresh Off The Rail"
  );
  const [hangerSubtitle, setHangerSubtitle] = useState(
    initialSettings.hangerSubtitle || "Click any piece hanging on the line to inspect details"
  );
  const [hangerSpeed, setHangerSpeed] = useState(
    initialSettings.hangerSpeed || "slow"
  );
  const [homeProductLimit, setHomeProductLimit] = useState(
    initialSettings.homeProductLimit || "8"
  );

  // Products State
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Hero Banners State
  const [heroBanners, setHeroBanners] = useState<Banner[]>(initialHeroBanners);

  // Status / Feedback
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingProducts, setSavingProducts] = useState(false);
  const [savingBannerId, setSavingBannerId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 3500);
  };

  // Save Hanger & Home Limit Settings
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingSettings(true);

    try {
      const res = await fetch("/api/admin/hanger-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            hangerEnabled: String(hangerEnabled),
            hangerTitle: hangerTitle.trim(),
            hangerSubtitle: hangerSubtitle.trim(),
            hangerSpeed,
            homeProductLimit: String(homeProductLimit),
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      showNotification("success", "Hanger slider and home settings updated successfully.");
    } catch (err: any) {
      showNotification("error", err.message || "Failed to update settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Toggle individual product on Home or Hanger
  const handleToggleProduct = (
    id: string,
    field: "showOnHome" | "showOnHanger",
    value: boolean
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Update product hanger order
  const handleUpdateOrder = (id: string, orderVal: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, hangerOrder: orderVal } : p))
    );
  };

  // Batch Save Product Toggles
  const handleSaveProductToggles = async () => {
    setSavingProducts(true);
    try {
      const res = await fetch("/api/admin/hanger-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productToggles: products.map((p) => ({
            id: p.id,
            showOnHome: p.showOnHome,
            showOnHanger: p.showOnHanger,
            hangerOrder: p.hangerOrder,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to save product display toggles");
      showNotification("success", "All product display toggles saved successfully.");
    } catch (err: any) {
      showNotification("error", err.message || "Failed to save toggles.");
    } finally {
      setSavingProducts(false);
    }
  };

  // Save individual Hero Banner
  const handleSaveBanner = async (banner: Banner) => {
    setSavingBannerId(banner.id);
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: banner.title,
          subtitle: banner.subtitle,
          ctaText: banner.ctaText,
          ctaLink: banner.ctaLink,
          imagePath: banner.imagePath,
          isActive: banner.isActive,
        }),
      });

      if (!res.ok) throw new Error("Failed to update hero slide");
      showNotification("success", `Slide "${banner.title}" updated successfully.`);
    } catch (err: any) {
      showNotification("error", err.message || "Failed to update slide.");
    } finally {
      setSavingBannerId(null);
    }
  };

  const updateBannerField = (id: string, field: keyof Banner, val: any) => {
    setHeroBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: val } : b))
    );
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(31,26,23,0.08)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1A17] tracking-tight">
              Storefront & Rail Controls
            </h1>
            <span className="px-3 py-1 rounded-full bg-[#2C3A2F]/10 border border-[#2C3A2F]/20 text-[#2C3A2F] text-xs font-semibold">
              Live Store Settings
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B5E54] mt-0.5">
            Visually manage the animated Clothesline Slider, Home Page drop limits, and Hero Campaign slides.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSaveSettings()}
          disabled={savingSettings}
          className="px-6 py-2.5 bg-[#2C3A2F] text-white hover:bg-[#1F1A17] text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50 self-start sm:self-auto"
        >
          {savingSettings ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save Storefront Settings</span>
        </button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-3 shadow-sm ${
            notification.type === "success"
              ? "bg-[#2C3A2F]/10 border border-[#2C3A2F]/20 text-[#2C3A2F] font-semibold"
              : "bg-[#B55A38]/10 border border-[#B55A38]/20 text-[#B55A38]"
          }`}
        >
          {notification.type === "success" ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* =========================================================================
          SECTION 1 & 2: ROPE SLIDER CONTROLS & HOME DROP LIMITS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Rope Slider Settings (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[rgba(31,26,23,0.10)] rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[rgba(31,26,23,0.08)] pb-4">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-[#2C3A2F]" />
              <h2 className="text-base font-bold font-serif text-[#1F1A17]">
                Clothesline & Hanger Slider Settings
              </h2>
            </div>

            {/* Master Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hangerEnabled}
                onChange={(e) => setHangerEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#2C3A2F] rounded"
              />
              <span className="text-xs font-semibold text-[#1F1A17]">
                {hangerEnabled ? "Slider Visible (ON)" : "Slider Hidden (OFF)"}
              </span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                Section Heading
              </label>
              <input
                type="text"
                value={hangerTitle}
                onChange={(e) => setHangerTitle(e.target.value)}
                placeholder="Fresh Off The Rail"
                className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-4 py-2.5 text-xs text-[#1F1A17] focus:outline-none focus:border-[#1F1A17] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                Section Subtitle
              </label>
              <input
                type="text"
                value={hangerSubtitle}
                onChange={(e) => setHangerSubtitle(e.target.value)}
                placeholder="Click any piece hanging on the line to inspect details"
                className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-4 py-2.5 text-xs text-[#1F1A17] focus:outline-none focus:border-[#1F1A17] transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Slider Speed */}
              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                  Glide Speed
                </label>
                <select
                  value={hangerSpeed}
                  onChange={(e) => setHangerSpeed(e.target.value)}
                  className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1A17] focus:outline-none focus:border-[#1F1A17] cursor-pointer"
                >
                  <option value="slow">Gentle Slow (~48s loop)</option>
                  <option value="medium">Smooth Medium (~35s loop)</option>
                  <option value="gentle">Ultra Relaxed (~65s loop)</option>
                </select>
              </div>

              {/* Home Page Product Limit */}
              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                  Home Grid Display Limit
                </label>
                <select
                  value={homeProductLimit}
                  onChange={(e) => setHomeProductLimit(e.target.value)}
                  className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1A17] focus:outline-none focus:border-[#1F1A17] cursor-pointer"
                >
                  <option value="4">Show 4 Products</option>
                  <option value="6">Show 6 Products</option>
                  <option value="8">Show 8 Products (Recommended)</option>
                  <option value="12">Show 12 Products</option>
                  <option value="16">Show 16 Products</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Summary Card (5 cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[rgba(31,26,23,0.10)] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[rgba(31,26,23,0.08)] pb-3">
            <Sparkles className="w-4 h-4 text-[#2C3A2F]" />
            <h3 className="text-sm font-bold font-serif text-[#1F1A17]">
              Live Storefront Balance
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.08)] flex justify-between items-center">
              <span className="text-[#6B5E54]">Pieces on Rope Slider:</span>
              <strong className="text-[#1F1A17] font-serif text-sm">
                {products.filter((p) => p.showOnHanger).length} pieces
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.08)] flex justify-between items-center">
              <span className="text-[#6B5E54]">Pieces on Home Grid:</span>
              <strong className="text-[#1F1A17] font-serif text-sm">
                {products.filter((p) => p.showOnHome).length} pieces (Max: {homeProductLimit})
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.08)] flex justify-between items-center">
              <span className="text-[#6B5E54]">Total Products in Catalog:</span>
              <strong className="text-[#1F1A17] font-serif text-sm">
                {products.length} pieces
              </strong>
            </div>
          </div>

          <p className="text-[11px] text-[#6B5E54] leading-relaxed pt-1">
            Toggle which products appear on the Clothesline Rail or the Home Page Grid in the checklist below.
          </p>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: VISUAL CHECKLIST & TOGGLES GRID
          ========================================================================= */}
      <div className="bg-[#FFFFFF] border border-[rgba(31,26,23,0.10)] rounded-3xl overflow-hidden shadow-sm space-y-4">
        <div className="p-6 border-b border-[rgba(31,26,23,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold font-serif text-[#1F1A17]">
              Product Display Checklist ({products.length} products)
            </h2>
            <span className="text-xs text-[#6B5E54]">
              Turn &ldquo;Hang on Rope&rdquo; or &ldquo;Show on Home&rdquo; ON/OFF for each piece.
            </span>
          </div>

          <button
            type="button"
            onClick={handleSaveProductToggles}
            disabled={savingProducts || products.length === 0}
            className="px-5 py-2.5 bg-[#2C3A2F] text-white hover:bg-[#1F1A17] text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50 self-start sm:self-auto"
          >
            {savingProducts ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Product Toggles</span>
          </button>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-8 h-8 text-[#6B5E54] mx-auto" />
            <h3 className="text-sm font-semibold text-[#1F1A17]">No products in catalog</h3>
            <p className="text-xs text-[#6B5E54] max-w-sm mx-auto">
              Add products using &ldquo;Bulk Add (Same Rate)&rdquo; to configure them for the clothesline rail.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F4] border-b border-[rgba(31,26,23,0.08)] text-[#6B5E54] uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5 text-center">Hang on Rope</th>
                  <th className="px-5 py-3.5 text-center">Show on Home</th>
                  <th className="px-5 py-3.5 text-center">Rail Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(31,26,23,0.06)]">
                {products.map((p) => {
                  let images: string[] = [];
                  try {
                    images = JSON.parse(p.images);
                  } catch {}
                  const firstImg = images[0] || "";

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F4]/80 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] rounded-lg shrink-0 overflow-hidden p-0.5">
                            {firstImg ? (
                              <img src={firstImg} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-[#6B5E54]">
                                N/A
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold font-serif text-[#1F1A17]">{p.title}</div>
                            <div className="text-[11px] text-[#6B5E54]">/product/{p.slug}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-[#1F1A17]">
                        <span className="px-2.5 py-1 rounded-full bg-[#EBE4D8]/60 text-[11px] font-medium">
                          {p.category}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-bold text-[#1F1A17]">
                        {formatPKR(p.pricePKR)}
                      </td>

                      {/* Hang on Rope Toggle */}
                      <td className="px-5 py-3.5 text-center">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={p.showOnHanger}
                            onChange={(e) =>
                              handleToggleProduct(p.id, "showOnHanger", e.target.checked)
                            }
                            className="w-4 h-4 accent-[#2C3A2F] rounded"
                          />
                          <span
                            className={`text-[11px] font-semibold ${
                              p.showOnHanger ? "text-[#2C3A2F]" : "text-[#6B5E54]"
                            }`}
                          >
                            {p.showOnHanger ? "ON" : "OFF"}
                          </span>
                        </label>
                      </td>

                      {/* Show on Home Toggle */}
                      <td className="px-5 py-3.5 text-center">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={p.showOnHome}
                            onChange={(e) =>
                              handleToggleProduct(p.id, "showOnHome", e.target.checked)
                            }
                            className="w-4 h-4 accent-[#2C3A2F] rounded"
                          />
                          <span
                            className={`text-[11px] font-semibold ${
                              p.showOnHome ? "text-[#2C3A2F]" : "text-[#6B5E54]"
                            }`}
                          >
                            {p.showOnHome ? "ON" : "OFF"}
                          </span>
                        </label>
                      </td>

                      {/* Rail Order Input */}
                      <td className="px-5 py-3.5 text-center">
                        <input
                          type="number"
                          value={p.hangerOrder}
                          onChange={(e) =>
                            handleUpdateOrder(p.id, Number(e.target.value) || 0)
                          }
                          className="w-16 bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-2 py-1 text-center font-semibold text-xs text-[#1F1A17]"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 4: HERO FULL-IMAGE BANNERS CONTROL
          ========================================================================= */}
      <div className="bg-[#FFFFFF] border border-[rgba(31,26,23,0.10)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-[rgba(31,26,23,0.08)] pb-4">
          <div className="flex items-center gap-2.5">
            <ImageIcon className="w-4 h-4 text-[#2C3A2F]" />
            <h2 className="text-base font-bold font-serif text-[#1F1A17]">
              Hero Full-Image Banners ({heroBanners.length} Slides)
            </h2>
          </div>
          <p className="text-xs text-[#6B5E54] mt-1">
            Edit the uncropped campaign imagery, headline, and button links for each rotating slide in the Split Hero.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {heroBanners.map((banner, idx) => {
            const isSavingThis = savingBannerId === banner.id;

            return (
              <div
                key={banner.id}
                className="rounded-2xl border border-[rgba(31,26,23,0.10)] bg-[#FAF8F4] p-4 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  {/* Slide Badge & Preview */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold font-serif text-[#2C3A2F] uppercase">
                      Slide #{idx + 1} &bull; {banner.slotName}
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={banner.isActive}
                        onChange={(e) =>
                          updateBannerField(banner.id, "isActive", e.target.checked)
                        }
                        className="accent-[#2C3A2F]"
                      />
                      <span className="text-[11px] text-[#6B5E54]">Active</span>
                    </label>
                  </div>

                  {/* Image Stage Preview */}
                  <div className="relative aspect-[3/4] rounded-xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.08)] overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={banner.imagePath}
                      alt={banner.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F1A17] mb-1">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={banner.title}
                      onChange={(e) =>
                        updateBannerField(banner.id, "title", e.target.value)
                      }
                      className="w-full bg-[#FFFFFF] border border-[rgba(31,26,23,0.12)] rounded-xl px-3 py-1.5 text-xs text-[#1F1A17] font-serif font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F1A17] mb-1">
                      Story / Subtitle
                    </label>
                    <textarea
                      rows={2}
                      value={banner.subtitle || ""}
                      onChange={(e) =>
                        updateBannerField(banner.id, "subtitle", e.target.value)
                      }
                      className="w-full bg-[#FFFFFF] border border-[rgba(31,26,23,0.12)] rounded-xl px-3 py-1.5 text-xs text-[#1F1A17] resize-none"
                    />
                  </div>

                  {/* Button Link */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#1F1A17] mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={banner.ctaText || ""}
                        onChange={(e) =>
                          updateBannerField(banner.id, "ctaText", e.target.value)
                        }
                        placeholder="DISCOVER"
                        className="w-full bg-[#FFFFFF] border border-[rgba(31,26,23,0.12)] rounded-xl px-2.5 py-1.5 text-[11px] text-[#1F1A17]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#1F1A17] mb-1">
                        Link
                      </label>
                      <input
                        type="text"
                        value={banner.ctaLink || ""}
                        onChange={(e) =>
                          updateBannerField(banner.id, "ctaLink", e.target.value)
                        }
                        placeholder="/shop"
                        className="w-full bg-[#FFFFFF] border border-[rgba(31,26,23,0.12)] rounded-xl px-2.5 py-1.5 text-[11px] text-[#1F1A17]"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Slide Button */}
                <button
                  type="button"
                  onClick={() => handleSaveBanner(banner)}
                  disabled={isSavingThis}
                  className="w-full py-2 rounded-xl bg-[#2C3A2F] text-white hover:bg-[#1F1A17] text-xs font-semibold transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  {isSavingThis ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Slide Changes</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
