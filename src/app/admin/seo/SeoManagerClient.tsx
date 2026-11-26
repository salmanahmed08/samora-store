"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Search,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Share2,
  Code2,
} from "lucide-react";

export default function SeoManagerClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const [settings, setSettings] = useState({
    metaTitle: "SAMORA — Haute Streetwear & Luxury Essentials Pakistan",
    metaDescription:
      "Artisanal heavyweight streetwear tailored in Pakistan. 450 GSM loopback French Terry hoodies, oversized boxy cuts & bespoke luxury silhouettes. Cash on Delivery nationwide.",
    siteDomain: "https://samora.pk",
    focusKeywords: "Luxury streetwear Pakistan, Heavyweight hoodies Lahore, 450 GSM French Terry, Artisanal oversized streetwear, Pakistani designer hoodies, COD streetwear Pakistan",
    googleVerification: "",
    facebookPixelId: "",
    ogImageUrl: "/assets/logos/logo-2.jpeg",
  });

  useEffect(() => {
    fetch("/api/admin/seo")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ success: true, message: "SEO configurations updated live!" });
      } else {
        setFeedback({ success: false, message: data.message || "Failed to update." });
      }
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || "Request failed." });
    } finally {
      setSaving(false);
    }
  };

  const domainUrl = (settings.siteDomain || "https://samora.pk").replace(/\/$/, "");

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Search Engine Optimization
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1A17] tracking-tight">
            SEO & Search Presence Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5E54]">
            Control default meta titles, descriptions, canonical domains, Google Search Console tags, and preview live SERP snippets.
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs font-semibold text-[#1F1A17] hover:bg-[#EBE4D8] transition flex items-center gap-1.5 shadow-sm"
          >
            <span>View sitemap.xml</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs font-semibold text-[#1F1A17] hover:bg-[#EBE4D8] transition flex items-center gap-1.5 shadow-sm"
          >
            <span>robots.txt</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
            feedback.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {feedback.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Google Search Live Snippet Preview */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B5E54]">
          <Search className="w-4 h-4 text-[#2C3A2F]" />
          <span>Google Search SERP Result Preview</span>
        </div>

        {/* Realistic Google Search Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E0E0E0] shadow-sm max-w-2xl space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] text-[#202124]">
            <div className="w-4 h-4 rounded-full bg-[#FAF8F4] border border-black/10 overflow-hidden flex items-center justify-center">
              <span className="text-[8px] font-bold">S</span>
            </div>
            <span className="font-medium truncate">{domainUrl.replace(/^https?:\/\//, "")}</span>
            <span className="text-gray-400">&gt; home</span>
          </div>

          <h3 className="text-base sm:text-lg text-[#1a0dab] hover:underline font-medium leading-snug cursor-pointer">
            {settings.metaTitle || "SAMORA — Haute Streetwear & Luxury Essentials Pakistan"}
          </h3>

          <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
            {settings.metaDescription || "Artisanal heavyweight streetwear tailored in Pakistan. 450 GSM French Terry cotton hoodies..."}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#6B5E54]">
          <span>Title Length: {settings.metaTitle.length} / 60 chars</span>
          <span>Description Length: {settings.metaDescription.length} / 160 chars</span>
        </div>
      </div>

      {/* SEO Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] shadow-sm space-y-5">
          <div className="border-b border-[rgba(31,26,23,0.08)] pb-4 flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-[#2C3A2F]" />
            <h2 className="text-lg font-bold font-serif text-[#1F1A17]">Site-Wide Metadata Configuration</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1F1A17] mb-1">
                Default Meta Title (Optimal: 50–60 characters)
              </label>
              <input
                type="text"
                value={settings.metaTitle}
                onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1F1A17] mb-1">
                Default Meta Description (Optimal: 145–160 characters)
              </label>
              <textarea
                rows={3}
                value={settings.metaDescription}
                onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1F1A17] mb-1">
                  Production Canonical Domain URL
                </label>
                <input
                  type="url"
                  value={settings.siteDomain}
                  onChange={(e) => setSettings({ ...settings, siteDomain: e.target.value })}
                  placeholder="https://samora.pk"
                  className="w-full px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs text-[#1F1A17] font-mono focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1F1A17] mb-1">
                  Default Social Share Image Path (og:image)
                </label>
                <input
                  type="text"
                  value={settings.ogImageUrl}
                  onChange={(e) => setSettings({ ...settings, ogImageUrl: e.target.value })}
                  placeholder="/assets/logos/logo-2.jpeg"
                  className="w-full px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs text-[#1F1A17] font-mono focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1F1A17] mb-1">
                Target Focus Keywords (Comma separated)
              </label>
              <input
                type="text"
                value={settings.focusKeywords}
                onChange={(e) => setSettings({ ...settings, focusKeywords: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Verification & Analytics Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] shadow-sm space-y-5">
          <div className="border-b border-[rgba(31,26,23,0.08)] pb-4 flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-[#B55A38]" />
            <h2 className="text-lg font-bold font-serif text-[#1F1A17]">Google & Meta Analytics Verification</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1F1A17] mb-1">
                Google Search Console Verification Code
              </label>
              <input
                type="text"
                value={settings.googleVerification}
                onChange={(e) => setSettings({ ...settings, googleVerification: e.target.value })}
                placeholder="e.g. google-site-verification=..."
                className="w-full px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs text-[#1F1A17] font-mono focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
              />
              <span className="text-[10px] text-[#6B5E54] block mt-1">
                Pasted into the HTML &lt;head&gt; automatically to verify ownership on Google.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#1F1A17] mb-1">
                Meta / Facebook Pixel ID (Optional)
              </label>
              <input
                type="text"
                value={settings.facebookPixelId}
                onChange={(e) => setSettings({ ...settings, facebookPixelId: e.target.value })}
                placeholder="e.g. 123456789012345"
                className="w-full px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs text-[#1F1A17] font-mono focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-3 rounded-xl bg-[#2C3A2F] text-white text-xs font-semibold hover:bg-[#1F1A17] transition flex items-center gap-2 shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save SEO Configurations"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
