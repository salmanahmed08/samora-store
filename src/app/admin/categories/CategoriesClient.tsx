"use client";

import React, { useState } from "react";
import {
  Tags,
  Plus,
  Edit,
  Trash2,
  Check,
  AlertCircle,
  AlertTriangle,
  FolderTree,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

export default function CategoriesClient({
  initialCategories = [],
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  // New Category Form
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(categories.length + 1);
  const [isActive, setIsActive] = useState(true);
  const [creating, setCreating] = useState(false);

  // Edit Modal State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSortOrder, setEditSortOrder] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Modal State
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotification = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  // Add Category Handler
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          sortOrder: Number(sortOrder) || categories.length + 1,
          isActive,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create category");
      }

      const created = await res.json();
      setCategories((prev) => [...prev, { ...created, productCount: 0 }]);
      setName("");
      setSlug("");
      setDescription("");
      setSortOrder(categories.length + 2);
      showNotification("success", `Category "${created.name}" created successfully.`);
    } catch (err: any) {
      showNotification("error", err.message || "Failed to create category.");
    } finally {
      setCreating(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (cat: Category) => {
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cat.id,
          isActive: !cat.isActive,
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c))
      );
      showNotification(
        "success",
        `Category "${cat.name}" is now ${!cat.isActive ? "active" : "hidden"}.`
      );
    } catch (err: any) {
      showNotification("error", err.message || "Error toggling category.");
    }
  };

  // Open Edit Modal
  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDescription(cat.description || "");
    setEditSortOrder(cat.sortOrder);
    setEditIsActive(cat.isActive);
  };

  // Save Edit Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;

    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCategory.id,
          name: editName.trim(),
          slug: editSlug.trim(),
          description: editDescription.trim() || null,
          sortOrder: Number(editSortOrder),
          isActive: editIsActive,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update category");
      }

      const updated = await res.json();
      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );
      setEditingCategory(null);
      showNotification("success", `Category "${updated.name}" updated successfully.`);
    } catch (err: any) {
      showNotification("error", err.message || "Failed to update category.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Category Handler
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories?id=${categoryToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete category");

      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      setCategoryToDelete(null);
      showNotification("success", `Category "${categoryToDelete.name}" deleted.`);
    } catch (err: any) {
      showNotification("error", err.message || "Failed to delete category.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(31,26,23,0.08)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1A17] tracking-tight">
              Categories Manager
            </h1>
            <span className="px-3 py-1 rounded-full bg-[#2C3A2F]/10 border border-[#2C3A2F]/20 text-[#2C3A2F] text-xs font-semibold">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B5E54] mt-0.5">
            Organize and reorder your clothing collections across the clothesline rail, shop filters, and navigation.
          </p>
        </div>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-3 shadow-sm ${
            message.type === "success"
              ? "bg-[#2C3A2F]/10 border border-[#2C3A2F]/20 text-[#2C3A2F] font-semibold"
              : "bg-[#B55A38]/10 border border-[#B55A38]/20 text-[#B55A38]"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Add New Category Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[rgba(31,26,23,0.10)] rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[rgba(31,26,23,0.08)] pb-3">
            <Tags className="w-4 h-4 text-[#2C3A2F]" />
            <h2 className="text-base font-bold font-serif text-[#1F1A17]">
              + Add New Category
            </h2>
          </div>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Knitwear, Cargo Pants"
                className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1A17] placeholder-[#6B5E54]/60 focus:outline-none focus:border-[#1F1A17] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                URL Slug (Optional — Auto-generated)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. knitwear"
                className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1A17] placeholder-[#6B5E54]/60 focus:outline-none focus:border-[#1F1A17] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short craftsmanship note or fabric details..."
                className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1A17] placeholder-[#6B5E54]/60 focus:outline-none focus:border-[#1F1A17] transition resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3.5 py-2 text-xs text-[#1F1A17] focus:outline-none focus:border-[#1F1A17]"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-[#2C3A2F] w-4 h-4 rounded"
                  />
                  <span className="text-xs font-medium text-[#1F1A17]">Active in Store</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="w-full py-3 rounded-full bg-[#2C3A2F] text-white text-xs font-semibold hover:bg-[#1F1A17] transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {creating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Create Category</span>
            </button>
          </form>
        </div>

        {/* Right: Existing Categories Table (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[rgba(31,26,23,0.10)] rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[rgba(31,26,23,0.08)] flex items-center justify-between">
            <h2 className="text-sm font-bold font-serif text-[#1F1A17]">
              Active Store Categories ({categories.length})
            </h2>
            <span className="text-xs text-[#6B5E54]">Order determines menu & tab placement</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F4] border-b border-[rgba(31,26,23,0.08)] text-[#6B5E54] uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Live Products</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(31,26,23,0.06)]">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#FAF8F4]/80 transition">
                    <td className="px-5 py-3.5 font-bold text-[#6B5E54]">
                      #{cat.sortOrder}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold font-serif text-[#1F1A17] text-sm">
                        {cat.name}
                      </div>
                      <div className="text-[11px] text-[#6B5E54]">{cat.slug}</div>
                      {cat.description && (
                        <div className="text-[11px] text-[#6B5E54]/80 line-clamp-1 mt-0.5">
                          {cat.description}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-[#1F1A17]">
                      <span className="px-2.5 py-1 rounded-full bg-[#EBE4D8]/60 text-xs">
                        {cat.productCount} {cat.productCount === 1 ? "piece" : "pieces"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase transition ${
                          cat.isActive
                            ? "bg-[#2C3A2F]/10 text-[#2C3A2F] border border-[#2C3A2F]/20 hover:bg-[#2C3A2F]/20"
                            : "bg-[#EBE4D8] text-[#6B5E54] border border-[rgba(31,26,23,0.10)] hover:bg-[#EBE4D8]/80"
                        }`}
                        title="Click to toggle active state"
                      >
                        {cat.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{cat.isActive ? "Active" : "Hidden"}</span>
                      </button>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-[#6B5E54] hover:text-[#1F1A17] rounded-lg hover:bg-[#FAF8F4] transition"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(cat)}
                          className="p-1.5 text-[#6B5E54] hover:text-[#B55A38] rounded-lg hover:bg-[#B55A38]/10 transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1A17]/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#FFFFFF] border border-[rgba(31,26,23,0.12)] rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
            <h3 className="text-base font-bold font-serif text-[#1F1A17] border-b border-[rgba(31,26,23,0.08)] pb-3">
              Edit Category: {editingCategory.name}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3 py-2 text-xs text-[#1F1A17]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3 py-2 text-xs text-[#1F1A17]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3 py-2 text-xs text-[#1F1A17] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F1A17] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(Number(e.target.value))}
                    className="w-full bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3 py-1.5 text-xs text-[#1F1A17]"
                  />
                </div>

                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="accent-[#2C3A2F]"
                    />
                    <span className="text-xs font-medium text-[#1F1A17]">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[rgba(31,26,23,0.08)]">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] text-xs font-semibold text-[#1F1A17] hover:bg-[#EBE4D8] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit || !editName.trim()}
                  className="px-5 py-2 rounded-xl bg-[#2C3A2F] hover:bg-[#1F1A17] text-white text-xs font-semibold transition disabled:opacity-50 shadow-sm"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1A17]/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#FFFFFF] border border-[rgba(31,26,23,0.12)] rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#B55A38]/10 border border-[#B55A38]/20 flex items-center justify-center text-[#B55A38] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold font-serif text-[#1F1A17]">
                  Delete Category
                </h3>
                <p className="text-xs text-[#6B5E54] leading-relaxed">
                  Are you sure you want to delete <strong className="text-[#1F1A17]">&ldquo;{categoryToDelete.name}&rdquo;</strong>? Any existing products assigned to this category will be preserved and unlinked safely.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[rgba(31,26,23,0.08)]">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] text-xs font-semibold text-[#1F1A17] hover:bg-[#EBE4D8] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-[#B55A38] hover:bg-[#964527] text-white text-xs font-semibold transition disabled:opacity-50 shadow-sm"
              >
                {deleting ? "Deleting..." : "Delete Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
