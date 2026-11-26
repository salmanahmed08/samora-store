"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Star, Loader2, Plus, Image as ImageIcon } from "lucide-react";

interface LocalImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function LocalImageUploader({ images, onChange }: LocalImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (data.urls && Array.isArray(data.urls)) {
        onChange([...images, ...data.urls]);
      } else if (data.url) {
        onChange([...images, data.url]);
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image(s)");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const makeCoverImage = (indexToCover: number) => {
    if (indexToCover === 0) return;
    const target = images[indexToCover];
    const rest = images.filter((_, idx) => idx !== indexToCover);
    onChange([target, ...rest]);
  };

  const [manualUrl, setManualUrl] = useState("");
  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    onChange([...images, manualUrl.trim()]);
    setManualUrl("");
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-[#2C3A2F] bg-[#FAF8F4]"
            : "border-[rgba(31,26,23,0.18)] bg-[#FAF8F4]/60 hover:border-[#2C3A2F] hover:bg-[#FAF8F4]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] flex items-center justify-center text-[#2C3A2F] shadow-sm">
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#2C3A2F]" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>

          <div>
            <span className="text-sm font-semibold text-[#1F1A17] block">
              {uploading
                ? "Uploading image(s) to local storage..."
                : "Drop images here, or browse files"}
            </span>
            <span className="text-xs text-[#6B5E54] mt-0.5 block">
              Saved locally to /public/uploads/ &bull; Supports PNG, JPG, WEBP
            </span>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-[#B55A38]/10 border border-[#B55A38]/20 text-xs text-[#B55A38]">
          {uploadError}
        </div>
      )}

      {/* Manual URL/Path Option */}
      <div className="flex gap-2">
        <input
          type="text"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          placeholder="Or paste local path (e.g. /assets/editorial-hoodies/hoodie-editorial-01.jpeg)"
          className="flex-1 bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] rounded-xl px-3.5 py-2 text-xs text-[#1F1A17] placeholder-[#6B5E54]/60 focus:outline-none focus:border-[#1F1A17] transition"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddManualUrl();
            }
          }}
        />
        <button
          type="button"
          onClick={handleAddManualUrl}
          className="px-4 py-2 bg-[#FAF8F4] hover:bg-[#EBE4D8] border border-[rgba(31,26,23,0.15)] text-[#1F1A17] text-xs font-semibold rounded-xl transition shrink-0 shadow-sm"
        >
          Add Path
        </button>
      </div>

      {/* Image Gallery Grid */}
      {images.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between text-xs text-[#6B5E54]">
            <span>
              Uploaded images ({images.length})
            </span>
            <span className="text-[11px] font-medium text-[#2C3A2F]">
              ★ First image is the main storefront cover
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {images.map((img, idx) => {
              const isCover = idx === 0;
              return (
                <div
                  key={idx}
                  className={`group relative aspect-[3/4] bg-[#EBE4D8] rounded-xl border overflow-hidden transition p-1 shadow-sm ${
                    isCover
                      ? "border-[#2C3A2F] ring-2 ring-[#2C3A2F]/20"
                      : "border-[rgba(31,26,23,0.10)]"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Product image ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />

                  {/* Cover Tag */}
                  {isCover && (
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#2C3A2F] text-white rounded-md text-[10px] font-semibold shadow-sm">
                      Cover
                    </div>
                  )}

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-[#1F1A17]/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1 rounded-md bg-[#FAF8F4] text-[#B55A38] hover:bg-[#B55A38] hover:text-white transition shadow-sm"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => makeCoverImage(idx)}
                        className="w-full py-1 bg-[#FAF8F4] hover:bg-[#FFFFFF] text-[#1F1A17] rounded-md text-[10px] font-semibold transition flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Star className="w-3 h-3 text-[#2C3A2F]" />
                        <span>Set as Cover</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
