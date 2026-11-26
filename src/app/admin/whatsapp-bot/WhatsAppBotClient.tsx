"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Save,
  Send,
  Smartphone,
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  Shield,
  Check,
  X,
  Layers,
  RotateCcw,
  PlusCircle,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";
import { useToast } from "@/components/admin/ToastContext";

const RECOMMENDED_TEMPLATES = {
  whatsappTemplateQuizGreeting:
    "Assalam-o-Alaikum {customerName}! Thank you for shopping with SAMORA. Your order #{orderNumber} ({items}) for PKR {totalPKR} (Cash on Delivery) has been received. Please select an option below to confirm your order:",
  whatsappTemplateConfirmedReply:
    "Thank you, {customerName}! Your SAMORA order #{orderNumber} is officially confirmed. Our team is carefully inspecting and packing your pieces — we'll message you as soon as it's on the way.",
  whatsappTemplateCheckingReply:
    "Take your time, {customerName}! Feel free to browse more pieces at SAMORA — your order #{orderNumber} is safely on hold. Just reply OK whenever you're ready to confirm.",
  whatsappTemplateCancelledReply:
    "No problem at all, {customerName}. Your SAMORA order #{orderNumber} has been cancelled as requested. Whenever you'd like to shop again, we're always here to help!",
  whatsappTemplateAdminAlert:
    "NEW SAMORA ORDER #{orderNumber} | Customer: {customerName} ({phone}) | City: {city} | Address: {address} | Items: {items} | Total: PKR {totalPKR} (COD) | Quiz Status: Awaiting Customer Confirmation.",
  whatsappTemplateStatusUpdate:
    "Assalam-o-Alaikum {customerName}, great news! Your SAMORA order #{orderNumber} status has been updated to: {status}. {trackingInfo} Thank you for choosing SAMORA.",
};

export default function WhatsAppBotClient() {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const [settings, setSettings] = useState<any>({
    whatsappMode: "simulator",
    whatsappPhoneNumberId: "",
    whatsappAccessToken: "",
    whatsappWebhookVerifyToken: "samora_whatsapp_webhook_2026",
    whatsappOwnerAlertPhone: "03344826415",
    whatsappTemplateAdminAlert: RECOMMENDED_TEMPLATES.whatsappTemplateAdminAlert,
    whatsappTemplateQuizGreeting: RECOMMENDED_TEMPLATES.whatsappTemplateQuizGreeting,
    whatsappTemplateConfirmedReply: RECOMMENDED_TEMPLATES.whatsappTemplateConfirmedReply,
    whatsappTemplateCheckingReply: RECOMMENDED_TEMPLATES.whatsappTemplateCheckingReply,
    whatsappTemplateCancelledReply: RECOMMENDED_TEMPLATES.whatsappTemplateCancelledReply,
    whatsappTemplateStatusUpdate: RECOMMENDED_TEMPLATES.whatsappTemplateStatusUpdate,
  });

  const [logs, setLogs] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({});
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchLog, setSearchLog] = useState("");
  const [customReplyText, setCustomReplyText] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/whatsapp-bot", {
        credentials: "include",
      });
      if (res.status === 401) {
        toastError("Session expired. Please sign in again.");
        window.location.href = "/admin/login";
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          // Pre-fill any blanks with recommended templates
          setSettings({
            ...data.settings,
            whatsappTemplateQuizGreeting:
              data.settings.whatsappTemplateQuizGreeting || RECOMMENDED_TEMPLATES.whatsappTemplateQuizGreeting,
            whatsappTemplateConfirmedReply:
              data.settings.whatsappTemplateConfirmedReply || RECOMMENDED_TEMPLATES.whatsappTemplateConfirmedReply,
            whatsappTemplateCheckingReply:
              data.settings.whatsappTemplateCheckingReply || RECOMMENDED_TEMPLATES.whatsappTemplateCheckingReply,
            whatsappTemplateCancelledReply:
              data.settings.whatsappTemplateCancelledReply || RECOMMENDED_TEMPLATES.whatsappTemplateCancelledReply,
            whatsappTemplateAdminAlert:
              data.settings.whatsappTemplateAdminAlert || RECOMMENDED_TEMPLATES.whatsappTemplateAdminAlert,
            whatsappTemplateStatusUpdate:
              data.settings.whatsappTemplateStatusUpdate || RECOMMENDED_TEMPLATES.whatsappTemplateStatusUpdate,
          });
        }
        if (data.logs) setLogs(data.logs);
        if (data.recentOrders) {
          setRecentOrders(data.recentOrders);
          if (data.recentOrders.length > 0) {
            setSelectedOrder((prev: any) => {
              if (!prev) return data.recentOrders[0];
              const updated = data.recentOrders.find((o: any) => o.id === prev.id);
              return updated || data.recentOrders[0];
            });
          } else {
            setSelectedOrder(null);
          }
        }
        if (data.counts) setCounts(data.counts);
      }
    } catch (e: any) {
      console.error(e);
      toastError(e.message || "Failed to load WhatsApp data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetTemplates = () => {
    setSettings((prev: any) => ({
      ...prev,
      ...RECOMMENDED_TEMPLATES,
    }));
    toastInfo("Templates reset to recommended SAMORA defaults. Click 'Save Settings' to apply.");
  };

  const handleCreateTestOrder = async () => {
    setCreatingOrder(true);
    try {
      const res = await fetch("/api/admin/whatsapp-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "create_test_order" }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        toastSuccess(`Created Test Order #${data.order.orderNumber}`);
        await fetchData();
        setSelectedOrder(data.order);
      } else {
        toastError(data.error || "Failed to create test order");
      }
    } catch (err: any) {
      toastError(err.message || "Error creating test order");
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/whatsapp-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "save_settings", settings }),
      });
      const data = await res.json();
      if (data.success) {
        toastSuccess("WhatsApp Bot Settings saved successfully!");
        fetchData();
      } else {
        toastError(data.error || "Failed to save settings");
      }
    } catch (e: any) {
      toastError("Failed to save: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSimulateQuizClick = async (buttonId: string) => {
    if (!selectedOrder) return;
    setSimulating(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/whatsapp-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "simulate_quiz_click",
          phone: selectedOrder.phone,
          buttonId,
          orderNumber: selectedOrder.orderNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(data.result?.replyMessage);
        toastSuccess(`Simulated button reply recorded! Quiz state: ${data.result?.actionTaken || "UPDATED"}`);
        fetchData(); // reload logs & order state
      } else {
        toastError(data.error || "Simulation failed");
      }
    } catch (e: any) {
      toastError("Simulation error: " + e.message);
    } finally {
      setSimulating(false);
    }
  };

  const handleSimulateTextReply = async () => {
    if (!selectedOrder || !customReplyText.trim()) return;
    setSimulating(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/whatsapp-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "simulate_text_reply",
          phone: selectedOrder.phone,
          text: customReplyText.trim(),
          orderNumber: selectedOrder.orderNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(data.result?.replyMessage);
        setCustomReplyText("");
        toastSuccess("Custom reply processed and auto-reply triggered!");
        fetchData();
      } else {
        toastError(data.error || "Simulation error");
      }
    } catch (e: any) {
      toastError("Simulation error: " + e.message);
    } finally {
      setSimulating(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const q = searchLog.toLowerCase();
    return (
      l.phone?.toLowerCase().includes(q) ||
      l.customerName?.toLowerCase().includes(q) ||
      l.messageBody?.toLowerCase().includes(q) ||
      l.eventType?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(31,26,23,0.08)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#2C3A2F]/10 text-[#2C3A2F] text-[10px] font-semibold uppercase tracking-wider">
              Automated Customer Engagement
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                settings.whatsappMode === "live"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-blue-100 text-blue-800 border border-blue-300"
              }`}
            >
              {settings.whatsappMode === "live" ? "Live Meta Cloud API" : "Local Live Simulator"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1A17] tracking-tight mt-1">
            WhatsApp Automation & Quiz Bot
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5E54] mt-0.5">
            Instant owner checkout alerts, interactive 3-option confirmation quiz, and automated dispatch status updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-[rgba(31,26,23,0.12)] text-[#1F1A17] hover:bg-[#FAF8F4] transition shadow-sm"
            title="Refresh logs & orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2C3A2F] hover:bg-[#1F1A17] text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[rgba(31,26,23,0.08)] shadow-sm">
          <span className="text-[11px] text-[#6B5E54] block">Outbound Alerts Sent</span>
          <span className="text-xl font-bold font-serif text-[#1F1A17] mt-1 block">
            {counts.totalOutbound || 0}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[rgba(31,26,23,0.08)] shadow-sm">
          <span className="text-[11px] text-[#6B5E54] block">Inbound Customer Replies</span>
          <span className="text-xl font-bold font-serif text-[#2C3A2F] mt-1 block">
            {counts.totalInbound || 0}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[rgba(31,26,23,0.08)] shadow-sm">
          <span className="text-[11px] text-[#6B5E54] block">Quiz Confirmed Orders</span>
          <span className="text-xl font-bold font-serif text-emerald-700 mt-1 block">
            {counts.totalQuizConfirmed || 0}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[rgba(31,26,23,0.08)] shadow-sm">
          <span className="text-[11px] text-[#6B5E54] block">Checking More (Warm)</span>
          <span className="text-xl font-bold font-serif text-amber-700 mt-1 block">
            {counts.totalCheckingMore || 0}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 Cols): Settings, Provider & Templates */}
        <div className="lg:col-span-7 space-y-6">
          {/* Provider Mode Selection */}
          <div className="p-6 rounded-3xl bg-white border border-[rgba(31,26,23,0.10)] shadow-sm space-y-4">
            <h2 className="text-sm font-bold font-serif text-[#1F1A17] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#2C3A2F]" />
              <span>WhatsApp Provider Configuration</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  settings.whatsappMode === "simulator"
                    ? "border-[#2C3A2F] bg-[#FAF8F4] ring-1 ring-[#2C3A2F]"
                    : "border-[rgba(31,26,23,0.10)] bg-white hover:bg-[#FAF8F4]"
                }`}
              >
                <input
                  type="radio"
                  name="whatsappMode"
                  checked={settings.whatsappMode === "simulator"}
                  onChange={() => setSettings({ ...settings, whatsappMode: "simulator" })}
                  className="mt-0.5 accent-[#2C3A2F]"
                />
                <div>
                  <span className="text-xs font-bold text-[#1F1A17] block">Local Live Simulator</span>
                  <p className="text-[11px] text-[#6B5E54] mt-0.5">
                    Zero-key local test mode. Every notification & quiz reply runs seamlessly in browser simulator.
                  </p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  settings.whatsappMode === "live"
                    ? "border-[#2C3A2F] bg-[#FAF8F4] ring-1 ring-[#2C3A2F]"
                    : "border-[rgba(31,26,23,0.10)] bg-white hover:bg-[#FAF8F4]"
                }`}
              >
                <input
                  type="radio"
                  name="whatsappMode"
                  checked={settings.whatsappMode === "live"}
                  onChange={() => setSettings({ ...settings, whatsappMode: "live" })}
                  className="mt-0.5 accent-[#2C3A2F]"
                />
                <div>
                  <span className="text-xs font-bold text-[#1F1A17] block">Meta WhatsApp Cloud API</span>
                  <p className="text-[11px] text-[#6B5E54] mt-0.5">
                    Live production mode. Dispatches real interactive button messages to customer WhatsApp.
                  </p>
                </div>
              </label>
            </div>

            {settings.whatsappMode === "live" && (
              <div className="space-y-3 pt-2 border-t border-[rgba(31,26,23,0.06)]">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1F1A17] mb-1">
                    Meta Phone Number ID
                  </label>
                  <input
                    type="text"
                    value={settings.whatsappPhoneNumberId}
                    onChange={(e) =>
                      setSettings({ ...settings, whatsappPhoneNumberId: e.target.value })
                    }
                    placeholder="e.g. 109842839218392"
                    className="w-full px-3.5 py-2 rounded-xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs font-mono text-[#1F1A17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1F1A17] mb-1">
                    Meta Permanent System User Access Token
                  </label>
                  <input
                    type="password"
                    value={settings.whatsappAccessToken}
                    onChange={(e) =>
                      setSettings({ ...settings, whatsappAccessToken: e.target.value })
                    }
                    placeholder="EAAX..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs font-mono text-[#1F1A17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1F1A17] mb-1">
                    Webhook Verify Token (Hub Challenge)
                  </label>
                  <input
                    type="text"
                    value={settings.whatsappWebhookVerifyToken}
                    onChange={(e) =>
                      setSettings({ ...settings, whatsappWebhookVerifyToken: e.target.value })
                    }
                    placeholder="samora_whatsapp_webhook_2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs font-mono text-[#1F1A17] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#6B5E54] block mt-1">
                    Webhook Callback URL: <code>/api/webhooks/whatsapp</code>
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[#1F1A17] mb-1">
                Owner Alert WhatsApp Number
              </label>
              <input
                type="text"
                value={settings.whatsappOwnerAlertPhone}
                onChange={(e) =>
                  setSettings({ ...settings, whatsappOwnerAlertPhone: e.target.value })
                }
                placeholder="03344826415"
                className="w-full px-3.5 py-2 rounded-xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs font-mono text-[#1F1A17] focus:outline-none"
              />
            </div>
          </div>

          {/* Message Templates Editor */}
          <div className="p-6 rounded-3xl bg-white border border-[rgba(31,26,23,0.10)] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(31,26,23,0.08)] pb-3">
              <div>
                <h2 className="text-sm font-bold font-serif text-[#1F1A17]">
                  Interactive Quiz & Notification Templates
                </h2>
                <span className="text-[11px] font-sans font-normal text-[#6B5E54]">
                  Variables: {"{customerName}"}, {"{orderNumber}"}, {"{items}"}, {"{totalPKR}"}, {"{trackingInfo}"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetTemplates}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#B55A38]/30 bg-[#FAF8F4] text-[#B55A38] text-[11px] font-medium hover:bg-[#B55A38]/10 transition self-start sm:self-auto"
                title="Reset to recommended luxury streetwear copy"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Recommended Defaults</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1">
                  1. Customer 3-Option Confirmation Quiz Greeting
                </label>
                <textarea
                  rows={4}
                  value={settings.whatsappTemplateQuizGreeting}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappTemplateQuizGreeting: e.target.value })
                  }
                  className="w-full p-3 rounded-2xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs font-sans text-[#1F1A17] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1">
                  2. Button 1 Reply (OK - Confirm Order)
                </label>
                <input
                  type="text"
                  value={settings.whatsappTemplateConfirmedReply}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappTemplateConfirmedReply: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs text-[#1F1A17] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1">
                  3. Button 2 Reply (I Will Check More)
                </label>
                <input
                  type="text"
                  value={settings.whatsappTemplateCheckingReply}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappTemplateCheckingReply: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs text-[#1F1A17] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1">
                  4. Button 3 Reply (No - Cancel Order)
                </label>
                <input
                  type="text"
                  value={settings.whatsappTemplateCancelledReply}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappTemplateCancelledReply: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs text-[#1F1A17] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1">
                  5. Owner Checkout Alert Template
                </label>
                <textarea
                  rows={4}
                  value={settings.whatsappTemplateAdminAlert}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappTemplateAdminAlert: e.target.value })
                  }
                  className="w-full p-3 rounded-2xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs font-sans text-[#1F1A17] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1">
                  6. Personalized Order Status Update Template
                </label>
                <textarea
                  rows={3}
                  value={settings.whatsappTemplateStatusUpdate}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappTemplateStatusUpdate: e.target.value })
                  }
                  className="w-full p-3 rounded-2xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs font-sans text-[#1F1A17] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Live Interactive Quiz Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#1F1A17] text-[#FAF8F4] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold font-serif text-white">
                  WhatsApp Live Quiz Simulator
                </h2>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Interactive
              </span>
            </div>

            {/* Select Order to simulate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] text-white/70">
                  Select Order to Test:
                </label>
                <button
                  type="button"
                  disabled={creatingOrder}
                  onClick={handleCreateTestOrder}
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>{creatingOrder ? "Creating..." : "Create Quick Test Order"}</span>
                </button>
              </div>

              {recentOrders.length > 0 ? (
                <div className="relative">
                  <select
                    value={selectedOrder?.id || ""}
                    onChange={(e) => {
                      const o = recentOrders.find((x) => x.id === e.target.value);
                      setSelectedOrder(o || null);
                      setTestResult(null);
                    }}
                    className="w-full appearance-none p-3 rounded-xl bg-[#2C2420] border border-white/20 text-xs text-[#FAF8F4] focus:outline-none focus:border-emerald-400 transition"
                    style={{ backgroundColor: "#2C2420", color: "#FAF8F4" }}
                  >
                    {recentOrders.map((ro) => (
                      <option
                        key={ro.id}
                        value={ro.id}
                        style={{ backgroundColor: "#1F1A17", color: "#FAF8F4" }}
                      >
                        #{ro.orderNumber} — {ro.customerName} ({formatPKR(ro.totalPKR)} • {ro.status}) [{ro.confirmationState}]
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center space-y-2">
                  <p className="text-xs text-white/60">No orders currently in database.</p>
                  <button
                    type="button"
                    disabled={creatingOrder}
                    onClick={handleCreateTestOrder}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                  >
                    {creatingOrder ? "Creating..." : "Create Quick Test Order"}
                  </button>
                </div>
              )}
            </div>

            {/* Live WhatsApp Bubble Preview */}
            {selectedOrder && (
              <div className="space-y-3 pt-2">
                <div className="bg-[#242A27] border border-white/10 rounded-2xl p-4 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-white/50">
                    <span>SAMORA Official Store</span>
                    <span>Just Now</span>
                  </div>

                  <p className="text-xs text-white/90 whitespace-pre-line leading-relaxed font-sans">
                    {(() => {
                      const template =
                        settings.whatsappTemplateQuizGreeting ||
                        RECOMMENDED_TEMPLATES.whatsappTemplateQuizGreeting;
                      return template
                        .replace(/{customerName}/g, selectedOrder.customerName)
                        .replace(/{orderNumber}/g, selectedOrder.orderNumber)
                        .replace(/{totalPKR}/g, formatPKR(selectedOrder.totalPKR))
                        .replace(/{items}/g, selectedOrder.items ? "Selected Pieces" : "Luxury Silhouettes");
                    })()}
                  </p>

                  {/* Current Quiz State Badge */}
                  <div className="pt-1 pb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/80">
                      CURRENT QUIZ STATE: {selectedOrder.confirmationState}
                    </span>
                  </div>

                  {/* 3 Interactive Buttons */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      disabled={simulating}
                      onClick={() =>
                        handleSimulateQuizClick(`CONFIRM_OK:${selectedOrder.orderNumber}`)
                      }
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-200 text-xs font-semibold transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>OK - Confirm Order</span>
                    </button>

                    <button
                      type="button"
                      disabled={simulating}
                      onClick={() =>
                        handleSimulateQuizClick(`CHECK_MORE:${selectedOrder.orderNumber}`)
                      }
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 text-xs font-semibold transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>I Will Check More</span>
                    </button>

                    <button
                      type="button"
                      disabled={simulating}
                      onClick={() =>
                        handleSimulateQuizClick(`CANCEL_NO:${selectedOrder.orderNumber}`)
                      }
                      className="w-full py-2.5 px-3 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-200 text-xs font-semibold transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>No - Cancel Order</span>
                    </button>
                  </div>
                </div>

                {/* Simulate Custom Text Reply */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customReplyText}
                    onChange={(e) => setCustomReplyText(e.target.value)}
                    placeholder='Type text reply (e.g. "ok", "yes", "cancel")...'
                    className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={simulating || !customReplyText.trim()}
                    onClick={handleSimulateTextReply}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition disabled:opacity-40"
                  >
                    Reply
                  </button>
                </div>

                {/* Result Feedback Banner */}
                {testResult && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Automated Bot Reply:</span>
                    </span>
                    <p className="whitespace-pre-line text-[11px] leading-relaxed text-white/90">
                      {testResult}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Delivery & Quiz Response Logs Table */}
      <div className="p-6 rounded-3xl bg-white border border-[rgba(31,26,23,0.10)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold font-serif text-[#1F1A17]">
              Message Delivery & Quiz Response Logs
            </h2>
            <p className="text-xs text-[#6B5E54]">
              Real-time audit log of every outbound alert and inbound customer quiz button click.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#6B5E54] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              placeholder="Search phone, recipient, or text..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[rgba(31,26,23,0.12)] bg-[#FAF8F4] text-xs text-[#1F1A17] focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F4] border-b border-[rgba(31,26,23,0.08)] text-[#6B5E54] uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3">Recipient / Phone</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Message Body</th>
                <th className="px-4 py-3">Provider Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(31,26,23,0.06)]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#6B5E54]">
                    No WhatsApp logs found yet. Click any quiz button in the simulator above to generate your first live log!
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF8F4]/80 transition">
                    <td className="px-4 py-3 font-mono text-[10px] text-[#6B5E54] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString()} · {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          log.direction === "INBOUND"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {log.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#1F1A17]">{log.customerName || "Customer"}</div>
                      <div className="text-[10px] text-[#6B5E54] font-mono">{log.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] text-[#2C3A2F] bg-[#EBE4D8]/60 px-2 py-0.5 rounded">
                        {log.eventType}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-[#1F1A17]" title={log.messageBody}>
                      {log.messageBody}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                          log.providerStatus === "SENT"
                            ? "bg-emerald-100 text-emerald-800"
                            : log.providerStatus === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-[#EBE4D8] text-[#1F1A17]"
                        }`}
                      >
                        {log.providerStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
