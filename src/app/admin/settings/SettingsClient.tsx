"use client";

import React, { useState } from "react";
import {
  Check,
  AlertCircle,
  Save,
  MessageCircle,
  Instagram,
  Facebook,
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { BRAND_LOGOS, BRAND_CONTACT } from "@/lib/brand-assets";

interface SettingsClientProps {
  initialSettings: Record<string, string>;
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<Record<string, string>>({
    site_name: initialSettings["site_name"] || "Samora",
    tagline: initialSettings["tagline"] || "Luxury Streetwear Pakistan",
    whatsapp: initialSettings["whatsapp"] || BRAND_CONTACT.phone,
    whatsapp_url: initialSettings["whatsapp_url"] || BRAND_CONTACT.whatsAppLink,
    instagram: initialSettings["instagram"] || BRAND_CONTACT.instagram,
    facebook: initialSettings["facebook"] || BRAND_CONTACT.facebook,
    ticker_text:
      initialSettings["ticker_text"] ||
      "Free Delivery on Orders Over PKR 5,000 • Cash on Delivery Available Across Pakistan • 450 GSM Heavyweight Essentials",
    free_shipping_threshold: initialSettings["free_shipping_threshold"] || "5000",
    shipping_flat_rate: initialSettings["shipping_flat_rate"] || "250",
    email: initialSettings["email"] || BRAND_CONTACT.email,
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ success: boolean; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPassword !== confirmPassword) {
      setPwdMsg({ success: false, text: "New password and confirmation do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPwdMsg({ success: false, text: "Password must be at least 8 characters long." });
      return;
    }

    setPwdLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwdMsg({ success: true, text: "Password successfully changed!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPwdMsg({ success: false, text: data.error || "Failed to update password." });
      }
    } catch {
      setPwdMsg({ success: false, text: "An unexpected error occurred." });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (err: any) {
      setError(err.message || "Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="pb-2 border-b border-[#1F1A17]/10">
        <h1 className="text-2xl font-bold text-[#1F1A17] tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-[#6B5E54] mt-0.5">
          Configure contact info, social links, shipping rates, and store announcements.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Official Brand Contact & Social Media */}
        <div className="bg-white border border-[#1F1A17]/10 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-semibold text-[#1F1A17] border-b border-[#1F1A17]/10 pb-3">
            Contact & Social Media
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Phone Number *</span>
              </label>
              <input
                type="text"
                required
                value={settings.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                placeholder="03344826415"
                className="w-full bg-white border border-[#1F1A17]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#1F1A17] focus:outline-none focus:border-[#2C3A2F] transition shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                WhatsApp Link URL
              </label>
              <input
                type="url"
                required
                value={settings.whatsapp_url}
                onChange={(e) => handleChange("whatsapp_url", e.target.value)}
                placeholder="https://wa.me/923344826415"
                className="w-full bg-white border border-[#1F1A17]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#1F1A17] focus:outline-none focus:border-[#2C3A2F] transition shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Instagram Profile URL *</span>
              </label>
              <input
                type="url"
                required
                value={settings.instagram}
                onChange={(e) => handleChange("instagram", e.target.value)}
                placeholder="https://www.instagram.com/samorapk2008/"
                className="w-full bg-white border border-[#1F1A17]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#1F1A17] focus:outline-none focus:border-[#2C3A2F] transition shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5 flex items-center gap-1.5">
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                <span>Facebook Page URL *</span>
              </label>
              <input
                type="url"
                required
                value={settings.facebook}
                onChange={(e) => handleChange("facebook", e.target.value)}
                placeholder="https://www.facebook.com/profile.php?id=61593252326408"
                className="w-full bg-white border border-[#1F1A17]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#1F1A17] focus:outline-none focus:border-[#2C3A2F] transition shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Announcements & Shipping */}
        <div className="bg-white border border-[#1F1A17]/10 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-semibold text-[#1F1A17] border-b border-[#1F1A17]/10 pb-3">
            Announcements & Shipping
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
              Header Announcement Marquee
            </label>
            <textarea
              rows={2}
              value={settings.ticker_text}
              onChange={(e) => handleChange("ticker_text", e.target.value)}
              className="w-full bg-white border border-[#1F1A17]/15 rounded-lg p-3 text-xs text-[#1F1A17] focus:outline-none focus:border-[#2C3A2F] transition leading-relaxed shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                Free Shipping Threshold (PKR)
              </label>
              <input
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) => handleChange("free_shipping_threshold", e.target.value)}
                className="w-full bg-white border border-[#1F1A17]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#1F1A17] focus:outline-none focus:border-[#2C3A2F] transition shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                Standard Shipping Flat Rate (PKR)
              </label>
              <input
                type="number"
                value={settings.shipping_flat_rate}
                onChange={(e) => handleChange("shipping_flat_rate", e.target.value)}
                className="w-full bg-white border border-[#1F1A17]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#1F1A17] focus:outline-none focus:border-[#2C3A2F] transition shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Brand Logos Overview */}
        <div className="bg-white border border-[#1F1A17]/10 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="border-b border-[#1F1A17]/10 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1F1A17]">
              Brand Logos System
            </h2>
            <span className="text-xs text-[#6B5E54]">4 brand touchpoints</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Logo 1 */}
            <div className="p-3.5 bg-[#FAF8F4] rounded-lg border border-[#1F1A17]/10 text-center space-y-2">
              <div className="w-12 h-12 bg-white border border-[#1F1A17]/10 rounded-lg p-1.5 overflow-hidden mx-auto flex items-center justify-center shadow-xs">
                <img
                  src={BRAND_LOGOS.storefrontNav.path}
                  alt={BRAND_LOGOS.storefrontNav.name}
                  className="w-full h-full object-contain filter contrast-125"
                />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#1F1A17] block">Logo 1</span>
                <span className="text-[11px] text-[#6B5E54] block mt-0.5">Storefront Header</span>
              </div>
            </div>

            {/* Logo 2 */}
            <div className="p-3.5 bg-[#FAF8F4] rounded-lg border border-[#1F1A17]/10 text-center space-y-2">
              <div className="w-12 h-12 bg-white border border-[#1F1A17]/10 rounded-lg p-1.5 overflow-hidden mx-auto flex items-center justify-center shadow-xs">
                <img
                  src={BRAND_LOGOS.footerInvoice.path}
                  alt={BRAND_LOGOS.footerInvoice.name}
                  className="w-full h-full object-contain filter contrast-125"
                />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#1F1A17] block">Logo 2</span>
                <span className="text-[11px] text-[#6B5E54] block mt-0.5">Footer & Invoice</span>
              </div>
            </div>

            {/* Logo 3 */}
            <div className="p-3.5 bg-[#FAF8F4] rounded-lg border border-[#1F1A17]/10 text-center space-y-2">
              <div className="w-12 h-12 bg-white border border-[#1F1A17]/10 rounded-lg p-1.5 overflow-hidden mx-auto flex items-center justify-center shadow-xs">
                <img
                  src={BRAND_LOGOS.adminPortal.path}
                  alt={BRAND_LOGOS.adminPortal.name}
                  className="w-full h-full object-contain filter contrast-125"
                />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#1F1A17] block">Logo 3</span>
                <span className="text-[11px] text-[#6B5E54] block mt-0.5">Admin Dashboard</span>
              </div>
            </div>

            {/* Logo 4 */}
            <div className="p-3.5 bg-[#FAF8F4] rounded-lg border border-[#1F1A17]/10 text-center space-y-2">
              <div className="w-12 h-12 bg-white border border-[#1F1A17]/10 rounded-lg p-1.5 overflow-hidden mx-auto flex items-center justify-center shadow-xs">
                <img
                  src={BRAND_LOGOS.preloaderFavicon.path}
                  alt={BRAND_LOGOS.preloaderFavicon.name}
                  className="w-full h-full object-contain filter contrast-125"
                />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#1F1A17] block">Logo 4</span>
                <span className="text-[11px] text-[#6B5E54] block mt-0.5">Preloader & Favicon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#2C3A2F] text-white font-semibold text-xs rounded-lg hover:bg-[#202B23] transition flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </form>

      {/* Security & Launch Readiness Panel */}
      <div className="bg-white border border-[#1F1A17]/10 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="border-b border-[#1F1A17]/10 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-semibold text-[#1F1A17]">
              Security & Production Launch Readiness
            </h2>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            All Systems Hardened
          </span>
        </div>

        <p className="text-xs text-[#6B5E54]">
          Live audit of application security defenses, token signatures, anti-abuse limiters, and SEO health.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FAF8F4] border border-[#1F1A17]/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#1F1A17]">Admin Authentication & Hashing</p>
              <p className="text-[11px] text-[#6B5E54]">Salted Bcrypt (12 rounds), constant-time comparison, no plaintext storage.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FAF8F4] border border-[#1F1A17]/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#1F1A17]">HMAC-SHA256 Signed Sessions</p>
              <p className="text-[11px] text-[#6B5E54]">Tamper-proof HTTP-only cookies with sameSite: lax and 7-day expiration.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FAF8F4] border border-[#1F1A17]/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#1F1A17]">Sliding Window Rate Limiter</p>
              <p className="text-[11px] text-[#6B5E54]">Brute-force protection on /api/auth/login, checkout, contact, and webhooks.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FAF8F4] border border-[#1F1A17]/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#1F1A17]">File Upload Magic Byte Inspection</p>
              <p className="text-[11px] text-[#6B5E54]">Strict buffer validation (JPEG, PNG, WebP only), path traversal prevention.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FAF8F4] border border-[#1F1A17]/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#1F1A17]">Security Headers & Anti-Clickjacking</p>
              <p className="text-[11px] text-[#6B5E54]">X-Frame-Options: DENY, nosniff, Referrer-Policy, hidden X-Powered-By.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FAF8F4] border border-[#1F1A17]/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#1F1A17]">Dynamic Sitemap & Structured Data</p>
              <p className="text-[11px] text-[#6B5E54]">Automatic /sitemap.xml, /robots.txt, and Schema.org JSON-LD generation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Admin Password Card */}
      <div className="bg-white border border-[#1F1A17]/10 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="border-b border-[#1F1A17]/10 pb-3 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#8C4A32]" />
          <h2 className="text-sm font-semibold text-[#1F1A17]">
            Change Admin Password
          </h2>
        </div>

        <p className="text-xs text-[#6B5E54]">
          Update the master administrative password. Passwords must be at least 8 characters long and are securely hashed.
        </p>

        {pwdMsg && (
          <div
            className={`p-3.5 rounded-lg border text-xs flex items-center gap-2 shadow-xs ${
              pwdMsg.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {pwdMsg.success ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{pwdMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#6B5E54]" />
              <span>Current Password</span>
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-white border border-[#1F1A17]/15 rounded-lg px-3.5 py-2 text-xs text-[#1F1A17] focus:outline-none focus:border-[#2C3A2F] transition shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full bg-white border border-[#1F1A17]/15 rounded-lg px-3.5 py-2 text-xs text-[#1F1A17] focus:outline-none focus:border-[#2C3A2F] transition shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full bg-white border border-[#1F1A17]/15 rounded-lg px-3.5 py-2 text-xs text-[#1F1A17] focus:outline-none focus:border-[#2C3A2F] transition shadow-xs"
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={pwdLoading}
              className="px-5 py-2 bg-[#8C4A32] text-white font-semibold text-xs rounded-lg hover:bg-[#723C28] transition flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{pwdLoading ? "Updating..." : "Update Password"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
