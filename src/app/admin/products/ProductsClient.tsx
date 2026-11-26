"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Layers,
  Edit,
  Trash2,
  Package,
  Search,
  Filter,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";
import { useToast } from "@/components/admin/ToastContext";

interface Product {
  id: string;
  sku?: string | null;
  syncSource?: string;
  title: string;
  slug: string;
  description: string;
  pricePKR: number;
  compareAtPrice: number | null;
  category: string;
  sizes: string;
  stock: number;
  images: string;
  featured: boolean;
  status: string;
  soldOutAt?: string | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const { success, error: toastError } = useToast();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categories, setCategories] = useState<Category[]>([]);

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setCategories(data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "ALL" || p.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "ALL" || p.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        success(`Product "${productToDelete.title}" deleted.`);
        setProductToDelete(null);
      } else {
        toastError("Failed to delete product");
      }
    } catch {
      toastError("Error deleting product");
    } finally {
      setDeleting(false);
    }
  };

  const statuses = ["ALL", "ACTIVE", "SOLD_OUT", "DRAFT", "ARCHIVED"];

  const getSoldOutCountdown = (soldOutAt?: string | null) => {
    if (!soldOutAt) return null;
    const expiry = new Date(soldOutAt).getTime() + 24 * 60 * 60 * 1000;
    const diff = expiry - Date.now();
    if (diff <= 0) return "Auto-hiding on next sync";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `Auto-hiding in ${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Bulk Add & Single Add Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(31,26,23,0.08)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1A17] tracking-tight">
            Products ({products.length})
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5E54] mt-0.5">
            Manage your store catalog, prices, inventory, and storefront display toggles.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Prominent Bulk Add (Same Rate) Button */}
          <Link
            href="/admin/products/bulk"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FAF8F4] hover:bg-[#EBE4D8] border border-[rgba(31,26,23,0.15)] text-[#1F1A17] text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Layers className="w-4 h-4 text-[#2C3A2F]" />
            <span>Bulk Add (Same Rate)</span>
          </Link>

          {/* Standard Single Add Product Button */}
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2C3A2F] text-white hover:bg-[#1F1A17] text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#FFFFFF] border border-[rgba(31,26,23,0.10)] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6B5E54] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, category, or slug..."
            className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl pl-10 pr-3.5 py-2 text-xs text-[#1F1A17] placeholder-[#6B5E54]/60 focus:outline-none focus:border-[#1F1A17] transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#6B5E54]">
            <Filter className="w-3.5 h-3.5 text-[#6B5E54]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3 py-2 text-xs text-[#1F1A17] focus:outline-none focus:border-[#1F1A17] cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#6B5E54]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3 py-2 text-xs text-[#1F1A17] focus:outline-none focus:border-[#1F1A17] cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Statuses" : s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product Table / Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 border border-[rgba(31,26,23,0.10)] bg-[#FFFFFF] rounded-3xl text-center space-y-4 max-w-lg mx-auto my-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] flex items-center justify-center text-[#2C3A2F] mx-auto shadow-sm">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold font-serif text-[#1F1A17]">
            {products.length === 0 ? "No products in catalog yet" : "No matching products found"}
          </h2>
          <p className="text-xs text-[#6B5E54] leading-relaxed max-w-sm mx-auto">
            {products.length === 0
              ? "Your catalog starts clean with 0 items. Use 'Bulk Add' to upload a full collection in minutes or add single products."
              : "Try adjusting your search query or clear the active category filters."}
          </p>
          {products.length === 0 ? (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/admin/products/bulk"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FAF8F4] hover:bg-[#EBE4D8] border border-[rgba(31,26,23,0.15)] text-[#1F1A17] text-xs font-semibold rounded-xl shadow-sm transition"
              >
                <Layers className="w-4 h-4 text-[#2C3A2F]" />
                <span>Bulk Add (Same Rate)</span>
              </Link>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2C3A2F] text-white hover:bg-[#1F1A17] text-xs font-semibold rounded-xl shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Single Product</span>
              </Link>
            </div>
          ) : (
            <button
              onClick={() => {
                setSearch("");
                setCategoryFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="px-4 py-2 rounded-xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] text-xs text-[#1F1A17] hover:bg-[#EBE4D8] transition font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="border border-[rgba(31,26,23,0.10)] bg-[#FFFFFF] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F4] border-b border-[rgba(31,26,23,0.08)] text-[#6B5E54] uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Sizes</th>
                  <th className="px-5 py-3.5">Stock</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(31,26,23,0.06)]">
                {filteredProducts.map((p) => {
                  let images: string[] = [];
                  try {
                    images = JSON.parse(p.images);
                  } catch {
                    images = [];
                  }
                  const firstImg = images[0] || "";

                  let sizesList: string[] = [];
                  try {
                    sizesList = JSON.parse(p.sizes);
                  } catch {
                    sizesList = [];
                  }

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F4]/80 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] rounded-lg shrink-0 overflow-hidden relative p-0.5">
                            {firstImg ? (
                              <img src={firstImg} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-[#6B5E54]">
                                N/A
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold font-serif text-[#1F1A17] line-clamp-1">{p.title}</span>
                              {p.syncSource === "google_sync" ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  Synced from Sheet
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#EBE4D8] text-[#6B5E54]">
                                  Manual
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#6B5E54]">
                              {p.sku ? <span className="font-mono text-[#2C3A2F] mr-2">[{p.sku}]</span> : null}
                              /product/{p.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-[#1F1A17] font-medium">
                        <span className="px-2.5 py-1 rounded-full bg-[#EBE4D8]/60 text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-bold text-[#1F1A17]">
                        <div>{formatPKR(p.pricePKR)}</div>
                        {p.compareAtPrice && (
                          <div className="text-[10px] text-[#6B5E54] line-through">
                            {formatPKR(p.compareAtPrice)}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {sizesList.map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 rounded-md bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] text-[10px] font-semibold text-[#1F1A17]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`font-semibold text-xs ${
                            p.stock > 5
                              ? "text-[#2C3A2F]"
                              : p.stock > 0
                              ? "text-amber-700"
                              : "text-[#B55A38]"
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                              p.status === "ACTIVE"
                                ? "bg-[#2C3A2F]/10 text-[#2C3A2F] border border-[#2C3A2F]/20"
                                : p.status === "SOLD_OUT"
                                ? "bg-[#1F1A17] text-[#FAF8F4] border border-[#B55A38]"
                                : "bg-[#EBE4D8] text-[#6B5E54] border border-[rgba(31,26,23,0.10)]"
                            }`}
                          >
                            {p.status}
                          </span>
                          {p.status === "SOLD_OUT" && p.soldOutAt && (
                            <span className="block text-[10px] font-mono text-[#B55A38]">
                              {getSoldOutCountdown(p.soldOutAt)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-[#6B5E54] hover:text-[#1F1A17] rounded-lg hover:bg-[#FAF8F4] transition"
                            title="View on store"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 text-[#6B5E54] hover:text-[#1F1A17] rounded-lg hover:bg-[#FAF8F4] transition"
                            title="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 text-[#6B5E54] hover:text-[#B55A38] rounded-lg hover:bg-[#B55A38]/10 transition"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1A17]/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#FFFFFF] border border-[rgba(31,26,23,0.12)] rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#B55A38]/10 border border-[#B55A38]/20 flex items-center justify-center text-[#B55A38] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold font-serif text-[#1F1A17]">
                  Delete Product
                </h3>
                <p className="text-xs text-[#6B5E54] leading-relaxed">
                  Are you sure you want to delete <strong className="text-[#1F1A17]">&ldquo;{productToDelete.title}&rdquo;</strong>? This action will remove it from your store catalog and cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[rgba(31,26,23,0.08)]">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] text-xs font-semibold text-[#1F1A17] hover:bg-[#EBE4D8] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-[#B55A38] hover:bg-[#964527] text-white text-xs font-semibold transition disabled:opacity-50 shadow-sm"
              >
                {deleting ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
