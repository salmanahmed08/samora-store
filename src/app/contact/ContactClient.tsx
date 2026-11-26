"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  MessageCircle,
  Instagram,
  Facebook,
  Copy,
  Check,
} from "lucide-react";
import { EDITORIAL_HOODIES, BRAND_CONTACT } from "@/lib/brand-assets";

export default function ContactClient() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedPhone, setCopiedPhone] = useState(false);

  const bannerImage = EDITORIAL_HOODIES[13]; // Hoodie 14

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(BRAND_CONTACT.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) {
      setError("Please provide your name and inquiry message.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, message }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message. Please try again or reach out on WhatsApp.");
      }

      setSubmitted(true);
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F1EA] py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Back Link */}
        <Link
          href="/"
          prefetch={true}
          className="text-xs text-[#6B5E54] hover:text-[#1F1A17] transition inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Page Banner in Warm Sandstone Split */}
        <div className="relative rounded-3xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.10)] overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 sm:p-12 shadow-sm gap-8">
          <div className="max-w-xl space-y-3">
            <span className="text-xs font-semibold text-[#B55A38] uppercase tracking-wider block">
              Concierge & Client Care
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold font-display text-[#1F1A17] leading-tight">
              Get in Touch with SAMORA
            </h1>
            <p className="text-sm text-[#6B5E54] leading-relaxed">
              Whether you need styling consultations, sizing guidance, order updates, or custom wholesale
              orders, our Lahore studio team is here to assist.
            </p>
          </div>

          <div className="w-56 sm:w-64 h-56 rounded-2xl bg-[#FAF8F4] overflow-hidden p-3 border border-[rgba(31,26,23,0.10)] flex items-center justify-center shrink-0">
            <img
              src={bannerImage.path}
              alt="SAMORA Studio Concierge"
              className="w-full h-full object-contain drop-shadow"
            />
          </div>
        </div>

        {/* Contact Info + Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Contact Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] space-y-6">
              <h2 className="text-lg font-bold font-display text-[#1F1A17]">Direct Support Channels</h2>

              <div className="space-y-4 text-xs">
                {/* WhatsApp */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#EBE4D8]/50 border border-[rgba(31,26,23,0.06)]">
                  <div className="w-9 h-9 rounded-xl bg-[#2C3A2F] text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-[#1F1A17] block">WhatsApp Priority Chat</span>
                    <a
                      href={BRAND_CONTACT.whatsAppQuickChatUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2C3A2F] font-bold text-sm hover:underline mt-0.5 inline-block"
                    >
                      {BRAND_CONTACT.phone}
                    </a>
                    <span className="text-[11px] text-[#6B5E54] block mt-0.5">
                      Fastest response for sizing and urgent order changes
                    </span>
                  </div>
                </div>

                {/* Studio Location */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#EBE4D8]/50 border border-[rgba(31,26,23,0.06)]">
                  <div className="w-9 h-9 rounded-xl bg-[#B55A38] text-white flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#1F1A17] block">Atelier & Production</span>
                    <span className="text-xs text-[#6B5E54] block mt-0.5">
                      Lahore, Punjab, Pakistan
                    </span>
                    <span className="text-[11px] text-[#6B5E54] block mt-0.5">
                      Dispatched nationwide via express courier services
                    </span>
                  </div>
                </div>

                {/* Social Connect */}
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href={BRAND_CONTACT.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] hover:border-[#1F1A17] text-xs font-semibold text-[#1F1A17] flex items-center justify-center gap-2 transition"
                  >
                    <Instagram className="w-4 h-4 text-[#B55A38]" />
                    <span>Instagram</span>
                  </a>
                  <a
                    href={BRAND_CONTACT.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] hover:border-[#1F1A17] text-xs font-semibold text-[#1F1A17] flex items-center justify-center gap-2 transition"
                  >
                    <Facebook className="w-4 h-4 text-[#2C3A2F]" />
                    <span>Facebook</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display text-[#1F1A17]">Send an Inquiry</h2>
                <p className="text-xs text-[#6B5E54] mt-1">
                  Our team reviews inquiries daily and responds within a few hours.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                  <h3 className="text-base font-bold font-serif">Message Received</h3>
                  <p className="text-xs text-emerald-700">
                    Thank you, {name || "valued customer"}. We have received your inquiry and will reach back out shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-3 text-xs underline font-semibold text-emerald-900"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-[#1F1A17] mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Salman Ahmed"
                        className="w-full px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#1F1A17] mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0300 1234567"
                        className="w-full px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1F1A17] mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="salman@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1F1A17] mb-1">
                      Your Message or Order Inquiry *
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share details regarding sizing, order questions, or special requests..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#2C3A2F] text-white font-semibold text-xs hover:bg-[#1F1A17] transition shadow-sm active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
