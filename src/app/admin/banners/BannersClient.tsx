"use client";

import React, { useState } from "react";
import {
  Edit,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  Save,
  MapPin,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { useToast } from "@/components/admin/ToastContext";
import { BANNER_LOCATION_MAP, EDITORIAL_HOODIE_FILES } from "@/lib/editorial-images-list";

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

export default function BannersClient({ initialBanners }: { initialBanners: Banner[] }) {
  const { success, error: toastError } = useToast();
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Edit Form states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [ctaText, setCtaText] = useState("Explore Collection");
  const [ctaLink, setCtaLink] = useState("/shop");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  // File upload state
  const [uploading, setUploading] = useState(false);

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || "");
    setImagePath(b.imagePath);
    setCtaText(b.ctaText || "");
    setCtaLink(b.ctaLink || "");
    setIsActive(b.isActive);
    setSortOrder(b.sortOrder);
    setError("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setImagePath(data.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/banners/${editingBanner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          imagePath,
          ctaText,
          ctaLink,
          isActive,
          sortOrder: Number(sortOrder),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update banner");
      }

      const updated = await res.json();
      setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setEditingBanner(null);
    } catch (err: any) {
      setError(err.message || "Error updating banner");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (b: Banner) => {
    try {
      const res = await fetch(`/api/admin/banners/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !b.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBanners((prev) => prev.map((item) => (item.id === b.id ? updated : item)));
        success(`Banner status set to ${!b.isActive ? "Active" : "Inactive"}`);
      } else {
        toastError("Failed to toggle banner status");
      }
    } catch {
      toastError("Failed to toggle banner status");
    }
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const current = newBanners[index];
    const target = newBanners[targetIndex];

    const currentOrder = current.sortOrder;
    current.sortOrder = target.sortOrder;
    target.sortOrder = currentOrder;

    newBanners[index] = target;
    newBanners[targetIndex] = current;

    setBanners(newBanners);

    try {
      await fetch("/api/admin/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            { id: current.id, sortOrder: current.sortOrder },
            { id: target.id, sortOrder: target.sortOrder },
          ],
        }),
      });
    } catch {
      console.error("Failed to reorder banners");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1F1A17]/10">
        <div>
          <h1 className="text-2xl font-bold text-[#1F1A17] tracking-tight">
            Banners ({banners.length})
          </h1>
          <p className="text-sm text-[#6B5E54] mt-0.5">
            Manage the visual campaign banners shown across the Hero, Lookbook, and Home sections.
          </p>
        </div>

        <div className="text-xs text-[#6B5E54] px-3.5 py-1.5 rounded-lg bg-white border border-[#1F1A17]/10 shadow-xs font-semibold">
          {banners.filter((b) => b.isActive).length} active banners
        </div>
      </div>

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {banners.map((b, idx) => (
          <div
            key={b.id}
            className={`bg-white border rounded-xl overflow-hidden flex flex-col justify-between transition group shadow-xs ${
              b.isActive ? "border-[#1F1A17]/10" : "border-[#1F1A17]/5 opacity-60"
            }`}
          >
            {/* Visual Preview */}
            <div className="relative aspect-[16/10] bg-[#FAF8F4] border-b border-[#1F1A17]/10 overflow-hidden">
              <img
                src={b.imagePath}
                alt={b.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Slot pill */}
              <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-[#1F1A17] font-semibold border border-[#1F1A17]/10 shadow-xs">
                {b.slotName.replace(/_/g, " ")}
              </div>

              {/* Active Toggle */}
              <div className="absolute top-2.5 right-2.5">
                <button
                  onClick={() => toggleVisibility(b)}
                  className={`px-2 py-0.5 text-[10px] rounded font-semibold transition ${
                    b.isActive
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs"
                      : "bg-[#FAF8F4] text-[#6B5E54] border border-[#1F1A17]/15"
                  }`}
                  title={b.isActive ? "Click to hide" : "Click to activate"}
                >
                  {b.isActive ? "Active" : "Hidden"}
                </button>
              </div>

              {/* Order Controls */}
              <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-white/90 backdrop-blur-md rounded border border-[#1F1A17]/15 p-0.5 shadow-xs">
                <button
                  onClick={() => moveOrder(idx, "up")}
                  disabled={idx === 0}
                  className="p-1 text-[#6B5E54] hover:text-[#1F1A17] disabled:opacity-20 transition"
                  title="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveOrder(idx, "down")}
                  disabled={idx === banners.length - 1}
                  className="p-1 text-[#6B5E54] hover:text-[#1F1A17] disabled:opacity-20 transition"
                  title="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#6B5E54] uppercase font-semibold">
                    Position #{b.sortOrder + 1}
                  </span>
                  {BANNER_LOCATION_MAP[b.slotName] && (
                    <span className="text-[10px] bg-[#2C3A2F]/10 text-[#2C3A2F] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{BANNER_LOCATION_MAP[b.slotName].label}</span>
                    </span>
                  )}
                </div>

                {BANNER_LOCATION_MAP[b.slotName] && (
                  <div className="p-2 bg-[#FAF8F4] border border-[#1F1A17]/8 rounded-lg text-[11px] text-[#2C3A2F] font-medium leading-tight">
                    <span className="font-semibold block text-[#1F1A17] text-[11px] mb-0.5">Where It Shows:</span>
                    {BANNER_LOCATION_MAP[b.slotName].location}
                  </div>
                )}

                <h3 className="text-sm font-semibold text-[#1F1A17] mt-0.5 line-clamp-1">
                  {b.title}
                </h3>
                {b.subtitle && (
                  <p className="text-xs text-[#6B5E54] line-clamp-2">
                    {b.subtitle}
                  </p>
                )}
                
                <p className="text-[10px] text-[#6B5E54] font-mono truncate" title={b.imagePath}>
                  Path: {b.imagePath}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1F1A17]/10 flex items-center justify-between text-xs text-[#6B5E54]">
                <span className="truncate max-w-[140px] text-[11px]">
                  Button: <strong className="text-[#1F1A17] font-semibold">{b.ctaText || "None"}</strong>
                </span>

                <button
                  onClick={() => openEditModal(b)}
                  className="px-2.5 py-1 rounded-md bg-[#FAF8F4] hover:bg-[#F5F1EA] border border-[#1F1A17]/10 text-[#1F1A17] text-xs font-semibold transition flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Banner Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1A17]/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-[#1F1A17]/10 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1F1A17]/10 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#1F1A17]">
                  Edit Banner #{editingBanner.sortOrder + 1}
                </h2>
                <span className="text-xs text-[#6B5E54]">
                  Slot: {editingBanner.slotName}
                </span>
              </div>
              <button
                onClick={() => setEditingBanner(null)}
                className="p-1.5 rounded-lg text-[#6B5E54] hover:text-[#1F1A17] hover:bg-[#FAF8F4] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#1F1A17] font-semibold mb-1">
                  Headline Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-[#1F1A17]/15 rounded-lg p-2.5 text-xs text-[#1F1A17] focus:outline-none focus:border-[#2C3A2F]"
                />
              </div>

              <div>
                <label className="block text-[#1F1A17] font-semibold mb-1">
                  Subtitle
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-white border border-[#1F1A17]/15 rounded-lg p-2.5 text-xs text-[#1F1A17] focus:outline-none focus:border-[#2C3A2F]"
                />
              </div>

              {/* Image Asset */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[#1F1A17] font-semibold">
                    Banner Image File / Path
                  </label>
                  <span className="text-[10px] text-[#6B5E54]">Pick from catalog below or upload new</span>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={imagePath}
                    onChange={(e) => setImagePath(e.target.value)}
                    className="flex-1 bg-white border border-[#1F1A17]/15 rounded-lg p-2.5 text-[#1F1A17] focus:outline-none focus:border-[#2C3A2F] text-xs font-mono"
                    placeholder="/assets/editorial-hoodies/..."
                  />
                  <label className="px-3 py-2 bg-[#FAF8F4] hover:bg-[#F5F1EA] border border-[#1F1A17]/15 text-[#1F1A17] rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 shrink-0 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? "Uploading..." : "Upload New"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>

                {imagePath && (
                  <div className="h-32 w-full bg-[#FAF8F4] rounded-lg border border-[#1F1A17]/10 overflow-hidden relative group">
                    <img src={imagePath} alt="Selected preview" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                      Selected: {imagePath.split("/").pop()}
                    </div>
                  </div>
                )}

                {/* Quick Visual Picker from Editorial Hoodie Archive */}
                <div className="space-y-1.5 pt-2 border-t border-[#1F1A17]/8">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#1F1A17] flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-[#2C3A2F]" />
                      <span>Select From Verified Editorial & Store Archive</span>
                    </span>
                    <span className="text-[10px] text-[#6B5E54]">Click thumbnail to apply</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1.5 bg-[#FAF8F4] rounded-lg border border-[#1F1A17]/10">
                    {EDITORIAL_HOODIE_FILES.map((fileName) => {
                      const fullPath = `/assets/editorial-hoodies/${fileName}`;
                      const isSelected = imagePath === fullPath;
                      return (
                        <button
                          key={fileName}
                          type="button"
                          onClick={() => setImagePath(fullPath)}
                          className={`relative aspect-square rounded-md overflow-hidden border transition ${
                            isSelected
                              ? "border-[#2C3A2F] ring-2 ring-[#2C3A2F]/30"
                              : "border-[#1F1A17]/10 hover:border-[#1F1A17]/40"
                          }`}
                          title={fileName}
                        >
                          <img
                            src={fullPath}
                            alt={fileName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#2C3A2F]/50 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1F1A17] font-semibold mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full bg-white border border-[#1F1A17]/15 rounded-lg p-2 text-xs text-[#1F1A17] focus:outline-none focus:border-[#2C3A2F]"
                  />
                </div>
                <div>
                  <label className="block text-[#1F1A17] font-semibold mb-1">
                    Destination Link
                  </label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    className="w-full bg-white border border-[#1F1A17]/15 rounded-lg p-2 text-xs text-[#1F1A17] focus:outline-none focus:border-[#2C3A2F]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="bannerActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-[#2C3A2F] rounded cursor-pointer"
                  />
                  <label htmlFor="bannerActiveCheck" className="text-xs text-[#1F1A17] font-medium cursor-pointer select-none">
                    Banner is visible (Active)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1F1A17]/10">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-4 py-2 rounded-lg bg-[#FAF8F4] border border-[#1F1A17]/10 text-[#6B5E54] hover:text-[#1F1A17] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#2C3A2F] text-white font-semibold text-xs rounded-lg hover:bg-[#202B23] disabled:opacity-50 flex items-center gap-1.5 transition shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
