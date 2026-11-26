"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UploadCloud,
  Check,
  Trash2,
  Plus,
  Layers,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface QueuedProduct {
  id: string;
  tempIndex: number;
  title: string;
  pricePKR: number;
  compareAtPrice: number | null;
  category: string;
  categoryId: string | null;
  sizes: string[];
  stock: number;
  images: string[];
  description: string;
  showOnHome: boolean;
  showOnHanger: boolean;
  hangerOrder: number;
}

const COMMON_SIZES = ["S", "M", "L", "XL", "XXL"];

export default function BulkAddProductsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories list
  const [categories, setCategories] = useState<Category[]>([]);

  // Step A: Shared Defaults
  const [sharedPrice, setSharedPrice] = useState<string>("2500");
  const [sharedCompareAt, setSharedCompareAt] = useState<string>("");
  const [sharedCategory, setSharedCategory] = useState<string>("Hoodies");
  const [sharedCategoryId, setSharedCategoryId] = useState<string | null>(null);
  const [sharedSizes, setSharedSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [sharedStock, setSharedStock] = useState<string>("1");
  const [sharedDescription, setSharedDescription] = useState<string>(
    "Heavyweight 450 GSM combed French Terry cotton streetwear silhouette. Tailored boxy drape with reinforced double-needle seams."
  );
  const [sharedShowOnHome, setSharedShowOnHome] = useState<boolean>(true);
  const [sharedShowOnHanger, setSharedShowOnHanger] = useState<boolean>(true);

  // Step B: Queued Products from Uploaded Images
  const [queuedProducts, setQueuedProducts] = useState<QueuedProduct[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  // Step C: Submission state
  const [publishing, setPublishing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
            setSharedCategory(data[0].name);
            setSharedCategoryId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Update category selection
  const handleCategoryChange = (catName: string) => {
    setSharedCategory(catName);
    const found = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
    setSharedCategoryId(found ? found.id : null);
  };

  // Toggle shared size chip
  const toggleSharedSize = (size: string) => {
    setSharedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Apply shared defaults to all queued products
  const applyDefaultsToAll = () => {
    const priceNum = Number(sharedPrice) || 2500;
    const compareNum = sharedCompareAt ? Number(sharedCompareAt) : null;
    const stockNum = Number(sharedStock) || 1;

    setQueuedProducts((prev) =>
      prev.map((item) => ({
        ...item,
        pricePKR: priceNum,
        compareAtPrice: compareNum,
        category: sharedCategory,
        categoryId: sharedCategoryId,
        sizes: [...sharedSizes],
        stock: stockNum,
        description: sharedDescription,
        showOnHome: sharedShowOnHome,
        showOnHanger: sharedShowOnHanger,
      }))
    );
  };

  // Multi-image upload handler
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");
    setUploadProgress(`Uploading ${files.length} images to local archive...`);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload images. Please try smaller files.");
      }

      const data = await res.json();
      const uploadedUrls: string[] = data.urls || (data.url ? [data.url] : []);

      if (uploadedUrls.length === 0) {
        throw new Error("No image URLs returned from upload handler.");
      }

      const priceNum = Number(sharedPrice) || 2500;
      const compareNum = sharedCompareAt ? Number(sharedCompareAt) : null;
      const stockNum = Number(sharedStock) || 1;

      // Generate a new queued product for every uploaded image
      const newItems: QueuedProduct[] = uploadedUrls.map((url, idx) => {
        const itemNumber = queuedProducts.length + idx + 1;
        const paddedNum = itemNumber < 10 ? `0${itemNumber}` : `${itemNumber}`;
        const prefix = sharedCategory.endsWith("s")
          ? sharedCategory.slice(0, -1)
          : sharedCategory;

        return {
          id: `temp-${Date.now()}-${idx}`,
          tempIndex: itemNumber,
          title: `Samora ${prefix} ${paddedNum}`,
          pricePKR: priceNum,
          compareAtPrice: compareNum,
          category: sharedCategory,
          categoryId: sharedCategoryId,
          sizes: [...sharedSizes],
          stock: stockNum,
          images: [url],
          description: sharedDescription,
          showOnHome: sharedShowOnHome,
          showOnHanger: sharedShowOnHanger,
          hangerOrder: itemNumber,
        };
      });

      setQueuedProducts((prev) => [...prev, ...newItems]);
      setUploadProgress("");
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Update single queued item field
  const updateQueuedItem = (id: string, updates: Partial<QueuedProduct>) => {
    setQueuedProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Remove single queued item
  const removeQueuedItem = (id: string) => {
    setQueuedProducts((prev) => prev.filter((item) => item.id !== id));
  };

  // Toggle size on individual queued item
  const toggleItemSize = (id: string, size: string) => {
    setQueuedProducts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const exists = item.sizes.includes(size);
        const updated = exists
          ? item.sizes.filter((s) => s !== size)
          : [...item.sizes, size];
        return { ...item, sizes: updated };
      })
    );
  };

  // Final Publish All Products via atomic /api/admin/products/bulk
  const handlePublishAll = async () => {
    if (queuedProducts.length === 0) {
      setError("Please drop or select at least one product image before publishing.");
      return;
    }

    setPublishing(true);
    setError("");

    try {
      const payload = {
        products: queuedProducts.map((p) => ({
          title: p.title.trim(),
          pricePKR: p.pricePKR,
          compareAtPrice: p.compareAtPrice,
          category: p.category,
          categoryId: p.categoryId,
          sizes: p.sizes,
          stock: p.stock,
          images: p.images,
          description: p.description,
          showOnHome: p.showOnHome,
          showOnHanger: p.showOnHanger,
          hangerOrder: p.hangerOrder,
          status: "ACTIVE",
        })),
      };

      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to publish products in bulk.");
      }

      setPublishSuccess(true);
      setTimeout(() => {
        router.push("/admin/products");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "An error occurred while publishing.");
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(31,26,23,0.08)]">
        <div>
          <Link
            href="/admin/products"
            className="text-xs text-[#6B5E54] hover:text-[#1F1A17] transition inline-flex items-center gap-1.5 mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1A17] tracking-tight">
              Bulk Add Products (Same Rate)
            </h1>
            <span className="px-3 py-1 rounded-full bg-[#2C3A2F]/10 border border-[#2C3A2F]/20 text-[#2C3A2F] text-xs font-semibold">
              Fast Batch Upload
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B5E54] mt-1">
            Drop multiple garment photos at once, set shared batch rates, and publish your collection in 1 click.
          </p>
        </div>

        {queuedProducts.length > 0 && (
          <button
            type="button"
            onClick={handlePublishAll}
            disabled={publishing}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C3A2F] text-white hover:bg-[#1F1A17] text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50 self-start sm:self-auto"
          >
            {publishing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Publishing {queuedProducts.length} Pieces...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Publish All {queuedProducts.length} Pieces</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Error / Success Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-[#B55A38]/10 border border-[#B55A38]/20 text-xs text-[#B55A38] flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {publishSuccess && (
        <div className="p-4 rounded-2xl bg-[#2C3A2F]/10 border border-[#2C3A2F]/20 text-xs text-[#2C3A2F] flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-[#2C3A2F]" />
          <span className="font-semibold">
            All {queuedProducts.length} pieces published successfully! Redirecting to catalog...
          </span>
        </div>
      )}

      {/* =========================================================================
          STEP A: SHARED RATE & BATCH DEFAULTS BAR (TOP CARD)
          ========================================================================= */}
      <div className="bg-[#FFFFFF] border border-[rgba(31,26,23,0.10)] rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(31,26,23,0.08)] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-[#1F1A17] text-white flex items-center justify-center text-xs font-bold font-serif">
              A
            </span>
            <div>
              <h2 className="text-base font-bold font-serif text-[#1F1A17]">
                Shared Batch Defaults & Rates
              </h2>
              <span className="text-xs text-[#6B5E54]">
                These defaults will auto-fill every image you upload below.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={applyDefaultsToAll}
            disabled={queuedProducts.length === 0}
            className="px-4 py-2 rounded-xl bg-[#FAF8F4] hover:bg-[#EBE4D8] border border-[rgba(31,26,23,0.15)] text-[#1F1A17] text-xs font-semibold transition disabled:opacity-40 shadow-sm"
          >
            Apply to All {queuedProducts.length} Items Below
          </button>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Common Price */}
          <div>
            <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
              Common Price (PKR) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs text-[#6B5E54] font-medium">
                PKR
              </span>
              <input
                type="number"
                value={sharedPrice}
                onChange={(e) => setSharedPrice(e.target.value)}
                placeholder="2500"
                className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl pl-12 pr-4 py-2.5 text-sm font-semibold text-[#1F1A17] placeholder-[#6B5E54]/60 focus:outline-none focus:border-[#1F1A17] transition"
              />
            </div>
          </div>

          {/* Optional Compare-at Price */}
          <div>
            <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
              Original / Compare-At Price (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs text-[#6B5E54] font-medium">
                PKR
              </span>
              <input
                type="number"
                value={sharedCompareAt}
                onChange={(e) => setSharedCompareAt(e.target.value)}
                placeholder="3500"
                className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl pl-12 pr-4 py-2.5 text-sm text-[#1F1A17] placeholder-[#6B5E54]/60 focus:outline-none focus:border-[#1F1A17] transition"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
              Category *
            </label>
            <select
              value={sharedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-4 py-2.5 text-sm text-[#1F1A17] focus:outline-none focus:border-[#1F1A17] transition cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Count */}
          <div>
            <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
              Stock Count per Piece *
            </label>
            <input
              type="number"
              value={sharedStock}
              onChange={(e) => setSharedStock(e.target.value)}
              placeholder="1"
              className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-4 py-2.5 text-sm text-[#1F1A17] placeholder-[#6B5E54]/60 focus:outline-none focus:border-[#1F1A17] transition"
            />
          </div>
        </div>

        {/* Sizes Multi-Select Chips & Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[rgba(31,26,23,0.06)]">
          {/* Sizes */}
          <div>
            <span className="block text-xs font-semibold text-[#1F1A17] mb-2">
              Default Sizes Available:
            </span>
            <div className="flex flex-wrap gap-2">
              {COMMON_SIZES.map((sz) => {
                const isSelected = sharedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSharedSize(sz)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? "bg-[#2C3A2F] text-white shadow-sm"
                        : "bg-[#FAF8F4] text-[#1F1A17] border border-[rgba(31,26,23,0.15)] hover:border-[#1F1A17]"
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            {/* Show on Home */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sharedShowOnHome}
                onChange={(e) => setSharedShowOnHome(e.target.checked)}
                className="w-4 h-4 accent-[#2C3A2F] rounded"
              />
              <span className="text-xs font-medium text-[#1F1A17]">
                Show on Home Page
              </span>
            </label>

            {/* Hang on Rope Slider */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sharedShowOnHanger}
                onChange={(e) => setSharedShowOnHanger(e.target.checked)}
                className="w-4 h-4 accent-[#2C3A2F] rounded"
              />
              <span className="text-xs font-medium text-[#1F1A17]">
                Hang on Rope Slider
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STEP B: MULTI-IMAGE DRAG & DROP ZONE
          ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-[#1F1A17] text-white flex items-center justify-center text-xs font-bold font-serif">
              B
            </span>
            <h2 className="text-base font-bold font-serif text-[#1F1A17]">
              Multi-Image Drop Zone (1 Photo = 1 Product)
            </h2>
          </div>
          <span className="text-xs text-[#6B5E54]">
            {queuedProducts.length} pieces currently staged
          </span>
        </div>

        {/* Drop Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[rgba(31,26,23,0.20)] hover:border-[#2C3A2F] bg-[#FFFFFF] hover:bg-[#FAF8F4] rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition shadow-sm group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFilesSelected}
            className="hidden"
          />

          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] flex items-center justify-center text-[#2C3A2F] mb-4 group-hover:scale-105 transition-transform shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold font-serif text-[#1F1A17]">
            Drop 5, 10, 20 or more product photos here
          </h3>
          <p className="text-xs sm:text-sm text-[#6B5E54] mt-1 max-w-md mx-auto">
            Or click to browse your folders. Each photo instantly generates a dedicated product piece ready for publishing.
          </p>

          {uploading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#2C3A2F]">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{uploadProgress || "Uploading images locally..."}</span>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          BATCH PREVIEW ROWS / CARDS
          ========================================================================= */}
      {queuedProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pt-4">
            <h3 className="text-sm font-bold font-serif text-[#1F1A17]">
              Staged Products Review ({queuedProducts.length} items)
            </h3>
            <button
              type="button"
              onClick={() => setQueuedProducts([])}
              className="text-xs text-[#6B5E54] hover:text-[#B55A38] transition font-medium"
            >
              Clear All Staged Items
            </button>
          </div>

          <div className="space-y-3">
            {queuedProducts.map((item, idx) => (
              <div
                key={item.id}
                className="bg-[#FFFFFF] border border-[rgba(31,26,23,0.10)] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Titles */}
                <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                  <div className="w-16 h-20 rounded-xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-sm">
                    <img
                      src={item.images[0]}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#6B5E54] uppercase">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateQueuedItem(item.id, { title: e.target.value })}
                        className="text-sm font-semibold font-serif text-[#1F1A17] bg-transparent border-b border-transparent hover:border-[rgba(31,26,23,0.20)] focus:border-[#1F1A17] focus:outline-none px-1 py-0.5 w-full sm:w-72"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B5E54]">
                      <span>
                        Category: <strong className="text-[#1F1A17]">{item.category}</strong>
                      </span>
                      <span>&bull;</span>
                      <span>
                        Sizes: {item.sizes.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Price, Stock, Toggles & Delete */}
                <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-[rgba(31,26,23,0.06)]">
                  {/* Price input */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#6B5E54]">PKR</span>
                    <input
                      type="number"
                      value={item.pricePKR}
                      onChange={(e) =>
                        updateQueuedItem(item.id, { pricePKR: Number(e.target.value) || 0 })
                      }
                      className="w-24 bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#1F1A17] text-right"
                    />
                  </div>

                  {/* Stock */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#6B5E54]">Stock:</span>
                    <input
                      type="number"
                      value={item.stock}
                      onChange={(e) =>
                        updateQueuedItem(item.id, { stock: Number(e.target.value) || 1 })
                      }
                      className="w-16 bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-2 py-1.5 text-xs text-[#1F1A17] text-center"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer" title="Show on Home Page">
                      <input
                        type="checkbox"
                        checked={item.showOnHome}
                        onChange={(e) => updateQueuedItem(item.id, { showOnHome: e.target.checked })}
                        className="accent-[#2C3A2F]"
                      />
                      <span className="text-[11px] text-[#6B5E54]">Home</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer" title="Hang on Rope Slider">
                      <input
                        type="checkbox"
                        checked={item.showOnHanger}
                        onChange={(e) => updateQueuedItem(item.id, { showOnHanger: e.target.checked })}
                        className="accent-[#2C3A2F]"
                      />
                      <span className="text-[11px] text-[#6B5E54]">Rail</span>
                    </label>
                  </div>

                  {/* Delete Row Button */}
                  <button
                    type="button"
                    onClick={() => removeQueuedItem(item.id)}
                    className="p-2 rounded-xl text-[#6B5E54] hover:text-[#B55A38] hover:bg-[#B55A38]/10 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP C: ONE-CLICK PUBLISH (STICKY BOTTOM BAR)
          ========================================================================= */}
      {queuedProducts.length > 0 && (
        <div className="sticky bottom-6 z-30 bg-[#FFFFFF] border border-[rgba(31,26,23,0.12)] rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#2C3A2F] uppercase tracking-wider block">
              Ready to Publish
            </span>
            <div className="text-sm font-bold font-serif text-[#1F1A17]">
              {queuedProducts.length} products staged &bull; Total catalog batch:{" "}
              {formatPKR(
                queuedProducts.reduce((sum, item) => sum + item.pricePKR * item.stock, 0)
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePublishAll}
              disabled={publishing}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#2C3A2F] text-white hover:bg-[#1F1A17] text-xs font-semibold rounded-full shadow-lg shadow-[#2C3A2F]/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {publishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Publishing All {queuedProducts.length} Products...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Publish All {queuedProducts.length} Products</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
