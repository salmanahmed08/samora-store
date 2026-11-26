"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle, Check, RefreshCw, Sliders } from "lucide-react";
import LocalImageUploader from "./LocalImageUploader";
import { slugify } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    description: string;
    pricePKR: number;
    compareAtPrice: number | null;
    category: string;
    categoryId?: string | null;
    sizes: string;
    stock: number;
    images: string;
    featured: boolean;
    showOnHome?: boolean;
    showOnHanger?: boolean;
    hangerOrder?: number;
    status: string;
  };
  isEdit?: boolean;
}

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "CUSTOM"];

export default function ProductFormClient({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug);
  const [category, setCategory] = useState(initialData?.category || "Hoodies");
  const [categoryId, setCategoryId] = useState<string | null>(initialData?.categoryId || null);
  const [pricePKR, setPricePKR] = useState(initialData?.pricePKR?.toString() || "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialData?.compareAtPrice ? initialData.compareAtPrice.toString() : ""
  );
  const [stock, setStock] = useState(initialData?.stock?.toString() || "20");

  // Display toggles
  const [showOnHome, setShowOnHome] = useState(initialData?.showOnHome ?? true);
  const [showOnHanger, setShowOnHanger] = useState(initialData?.showOnHanger ?? true);
  const [hangerOrder, setHangerOrder] = useState<number>(initialData?.hangerOrder ?? 0);

  // Parse initial sizes
  const [sizes, setSizes] = useState<string[]>(() => {
    if (!initialData?.sizes) return ["S", "M", "L", "XL"];
    try {
      const parsed = JSON.parse(initialData.sizes);
      return Array.isArray(parsed) ? parsed : ["S", "M", "L", "XL"];
    } catch {
      return ["S", "M", "L", "XL"];
    }
  });

  // Optional Measurement fields
  const [chestSize, setChestSize] = useState("");
  const [lengthSize, setLengthSize] = useState("");
  const [sleeveSize, setSleeveSize] = useState("");

  // Parse initial images
  const [images, setImages] = useState<string[]>(() => {
    if (!initialData?.images) return [];
    try {
      const parsed = JSON.parse(initialData.images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [description, setDescription] = useState(initialData?.description || "");
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [status, setStatus] = useState(initialData?.status || "ACTIVE");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
            if (!initialData?.category) {
              setCategory(data[0].name);
              setCategoryId(data[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, [initialData]);

  // Auto-generate slug from title if enabled
  useEffect(() => {
    if (autoSlug && title) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug]);

  const handleCategorySelect = (catName: string) => {
    setCategory(catName);
    const found = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
    setCategoryId(found ? found.id : null);
  };

  const toggleSize = (size: string) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const [customSizeInput, setCustomSizeInput] = useState("");
  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (trimmed && !sizes.includes(trimmed)) {
      setSizes([...sizes, trimmed]);
      setCustomSizeInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !pricePKR) {
      setError("Please fill in Product Title and Price (PKR).");
      return;
    }

    setLoading(true);
    setError("");

    // Build final description including optional measurements if provided
    let finalDesc = description.trim();
    if (chestSize || lengthSize || sleeveSize) {
      const specsBlock = `\n\n[MEASUREMENTS & FIT]: ${chestSize ? `Chest: ${chestSize}" | ` : ""}${
        lengthSize ? `Length: ${lengthSize}" | ` : ""
      }${sleeveSize ? `Sleeve: ${sleeveSize}"` : ""}`;
      if (!finalDesc.includes("[MEASUREMENTS & FIT]")) {
        finalDesc += specsBlock;
      }
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim() ? slugify(slug.trim()) : slugify(title),
      category,
      categoryId,
      pricePKR: Number(pricePKR),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      stock: Number(stock) || 0,
      sizes,
      images,
      description: finalDesc,
      featured,
      showOnHome,
      showOnHanger,
      hangerOrder: Number(hangerOrder) || 0,
      status,
    };

    try {
      const endpoint = isEdit && initialData?.id
        ? `/api/admin/products/${initialData.id}`
        : "/api/admin/products";

      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save product");
      }

      setSuccess(true);
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col gap-2 pb-4 border-b border-[rgba(31,26,23,0.08)]">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs text-[#6B5E54] hover:text-[#1F1A17] transition w-fit font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1A17] tracking-tight">
          {isEdit ? `Edit Product: ${initialData?.title}` : "Add Product"}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B5E54]">
          Configure garment details, price, inventory, and storefront display toggles.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#B55A38]/10 border border-[#B55A38]/20 text-xs text-[#B55A38] flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#B55A38]" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-[#2C3A2F]/10 border border-[#2C3A2F]/20 text-xs text-[#2C3A2F] flex items-center gap-2 shadow-sm font-semibold">
          <Check className="w-4 h-4 shrink-0 text-[#2C3A2F]" />
          <span>Product saved successfully! Redirecting to catalog...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Product Details */}
        <div className="bg-[#FFFFFF] border border-[rgba(31,26,23,0.10)] rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
          <h2 className="text-base font-bold font-serif text-[#1F1A17] border-b border-[rgba(31,26,23,0.08)] pb-3">
            Product Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Heavyweight Obsidian Box-Fit Hoodie"
                className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-4 py-2.5 text-sm text-[#1F1A17] placeholder-[#6B5E54]/60 focus:outline-none focus:border-[#1F1A17] transition font-serif font-semibold"
              />
            </div>

            {/* Auto-generated URL slug */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#1F1A17]">
                  URL Slug
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAutoSlug(true);
                    setSlug(slugify(title));
                  }}
                  className="text-[11px] text-[#6B5E54] hover:text-[#1F1A17] flex items-center gap-1 transition font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset from title</span>
                </button>
              </div>
              <div className="flex items-center bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-4 py-2 text-xs">
                <span className="text-[#6B5E54] select-none mr-1">/product/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    setSlug(e.target.value);
                  }}
                  placeholder="heavyweight-obsidian-hoodie"
                  className="flex-1 bg-transparent text-[#1F1A17] focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Dynamic Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-4 py-2.5 text-xs text-[#1F1A17] focus:outline-none focus:border-[#1F1A17] transition cursor-pointer"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Oversized Tees">Oversized Tees</option>
                    <option value="Jackets">Jackets</option>
                    <option value="Sweatshirts">Sweatshirts</option>
                    <option value="Bottoms">Bottoms</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="20"
                className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-4 py-2.5 text-xs text-[#1F1A17] focus:outline-none focus:border-[#1F1A17] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                Price (PKR) *
              </label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={pricePKR}
                onChange={(e) => setPricePKR(e.target.value)}
                placeholder="e.g. 7490"
                className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1F1A17] placeholder-[#6B5E54]/60 focus:outline-none focus:border-[#1F1A17] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                Compare-at Price (PKR, optional)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="e.g. 9990"
                className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-4 py-2.5 text-xs text-[#1F1A17] placeholder-[#6B5E54]/60 focus:outline-none focus:border-[#1F1A17] transition"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Storefront Display & Hanger Toggles */}
        <div className="bg-[#FFFFFF] border border-[rgba(31,26,23,0.10)] rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-[rgba(31,26,23,0.08)] pb-3">
            <Sliders className="w-4 h-4 text-[#2C3A2F]" />
            <h2 className="text-base font-bold font-serif text-[#1F1A17]">
              Storefront Display Controls
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
            {/* Show on Home Page */}
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] cursor-pointer select-none hover:border-[rgba(31,26,23,0.20)] transition">
              <input
                type="checkbox"
                checked={showOnHome}
                onChange={(e) => setShowOnHome(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#2C3A2F] rounded"
              />
              <div>
                <span className="text-xs font-semibold text-[#1F1A17] block">
                  Show on Home Page
                </span>
                <span className="text-[11px] text-[#6B5E54]">
                  Displays in Featured Drops grid on /
                </span>
              </div>
            </label>

            {/* Show on Rope Hanger */}
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] cursor-pointer select-none hover:border-[rgba(31,26,23,0.20)] transition">
              <input
                type="checkbox"
                checked={showOnHanger}
                onChange={(e) => setShowOnHanger(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#2C3A2F] rounded"
              />
              <div>
                <span className="text-xs font-semibold text-[#1F1A17] block">
                  Hang on Rope Slider
                </span>
                <span className="text-[11px] text-[#6B5E54]">
                  Suspended from wooden hanger on Clothesline
                </span>
              </div>
            </label>

            {/* Hanger Order */}
            <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)]">
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1">
                Hanger Display Order
              </label>
              <input
                type="number"
                value={hangerOrder}
                onChange={(e) => setHangerOrder(Number(e.target.value) || 0)}
                className="w-full bg-[#FFFFFF] border border-[rgba(31,26,23,0.15)] rounded-xl px-3 py-1.5 text-xs text-[#1F1A17]"
              />
              <span className="text-[11px] text-[#6B5E54] block mt-1">
                Lowest number hangs first (1, 2, 3...)
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Product Images */}
        <div className="bg-[#FFFFFF] border border-[rgba(31,26,23,0.10)] rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
          <h2 className="text-base font-bold font-serif text-[#1F1A17] border-b border-[rgba(31,26,23,0.08)] pb-3">
            Product Images
          </h2>
          <LocalImageUploader images={images} onChange={setImages} />
        </div>

        {/* Card 4: Sizing & Optional Fit Measurements */}
        <div className="bg-[#FFFFFF] border border-[rgba(31,26,23,0.10)] rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
          <h2 className="text-base font-bold font-serif text-[#1F1A17] border-b border-[rgba(31,26,23,0.08)] pb-3">
            Sizes & Measurements
          </h2>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[#1F1A17]">
              Select Available Sizes:
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map((s) => {
                const selected = sizes.includes(s);
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggleSize(s)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
                      selected
                        ? "bg-[#2C3A2F] text-white shadow-sm"
                        : "bg-[#FAF8F4] text-[#1F1A17] border border-[rgba(31,26,23,0.15)] hover:border-[#1F1A17]"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}

              {sizes
                .filter((s) => !AVAILABLE_SIZES.includes(s))
                .map((custom) => (
                  <button
                    type="button"
                    key={custom}
                    onClick={() => toggleSize(custom)}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-[#2C3A2F] text-white rounded-xl"
                  >
                    {custom} ✕
                  </button>
                ))}
            </div>

            {/* Custom size input */}
            <div className="flex gap-2 max-w-xs pt-1">
              <input
                type="text"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                placeholder="Add size (e.g. 3XL, 32W)"
                className="flex-1 bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3 py-1.5 text-xs text-[#1F1A17] placeholder-[#6B5E54]/60 focus:outline-none focus:border-[#1F1A17] uppercase"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomSize();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomSize}
                className="px-4 py-1.5 bg-[#FAF8F4] hover:bg-[#EBE4D8] border border-[rgba(31,26,23,0.15)] text-xs font-semibold text-[#1F1A17] rounded-xl transition shadow-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Measurements */}
          <div className="pt-4 border-t border-[rgba(31,26,23,0.08)] space-y-3">
            <span className="block text-xs font-semibold text-[#1F1A17]">
              Optional Size Measurements (inches):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#6B5E54] mb-1">
                  Chest Width
                </label>
                <input
                  type="text"
                  value={chestSize}
                  onChange={(e) => setChestSize(e.target.value)}
                  placeholder="e.g. 24.5"
                  className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3 py-1.5 text-xs text-[#1F1A17] placeholder-[#6B5E54]/60 focus:outline-none focus:border-[#1F1A17]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6B5E54] mb-1">
                  Body Length
                </label>
                <input
                  type="text"
                  value={lengthSize}
                  onChange={(e) => setLengthSize(e.target.value)}
                  placeholder="e.g. 28.0"
                  className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3 py-1.5 text-xs text-[#1F1A17] placeholder-[#6B5E54]/60 focus:outline-none focus:border-[#1F1A17]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6B5E54] mb-1">
                  Sleeve Length
                </label>
                <input
                  type="text"
                  value={sleeveSize}
                  onChange={(e) => setSleeveSize(e.target.value)}
                  placeholder="e.g. 25.5"
                  className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3 py-1.5 text-xs text-[#1F1A17] placeholder-[#6B5E54]/60 focus:outline-none focus:border-[#1F1A17]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Description & Status */}
        <div className="bg-[#FFFFFF] border border-[rgba(31,26,23,0.10)] rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
          <h2 className="text-base font-bold font-serif text-[#1F1A17] border-b border-[rgba(31,26,23,0.08)] pb-3">
            Description & Visibility
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
              Product Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the fabric weight, GSM, cut, fit, and details..."
              className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-2xl p-3.5 text-xs text-[#1F1A17] placeholder-[#6B5E54]/60 focus:outline-none focus:border-[#1F1A17] transition leading-relaxed resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                Visibility Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-4 py-2.5 text-xs text-[#1F1A17] focus:outline-none focus:border-[#1F1A17] transition cursor-pointer"
              >
                <option value="ACTIVE">Active (Live on store)</option>
                <option value="DRAFT">Draft (Hidden from store)</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5 pt-6">
              <input
                type="checkbox"
                id="featuredCheck"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#2C3A2F] rounded cursor-pointer"
              />
              <label
                htmlFor="featuredCheck"
                className="text-xs font-semibold text-[#1F1A17] cursor-pointer select-none"
              >
                Feature in Homepage Spotlight
              </label>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 rounded-xl bg-[#FAF8F4] hover:bg-[#EBE4D8] border border-[rgba(31,26,23,0.15)] text-xs font-semibold text-[#1F1A17] transition shadow-sm"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-7 py-2.5 bg-[#2C3A2F] text-white hover:bg-[#1F1A17] text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50"
          >
            {loading ? (
              <span>Saving Product...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? "Update Product" : "Save Product"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
