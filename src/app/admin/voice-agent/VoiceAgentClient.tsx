"use client";

import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  PhoneForwarded,
  Clock,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Copy,
  ExternalLink,
  MessageCircle,
  Play,
  Square,
  Shield,
  Search,
  Check,
  Sparkles,
} from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";
import { useToast } from "@/components/admin/ToastContext";

export default function VoiceAgentClient() {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [settings, setSettings] = useState<any>({
    voiceAgentEnabled: true,
    forceOffHoursMode: false,
    agentName: "Ayla — SAMORA Concierge",
    agentLanguage: "bilingual",
    agentTone: "luxury_polite",
    greetingMessage: "",
    systemPrompt: "",
    businessHoursStart: "11:00",
    businessHoursEnd: "21:00",
    businessDays: "Mon,Tue,Wed,Thu,Fri,Sat",
    voiceAgentSecret: "samora_voice_secret_2026",
    ownerPhone: "03344826415",
  });

  const [offHoursStatus, setOffHoursStatus] = useState<any>({
    isOffHours: true,
    currentPktTime: "",
    reason: "",
  });

  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalCalls: 0, pendingCallbacks: 0 });
  const [searchLog, setSearchLog] = useState("");

  // Live Simulator States
  const [simActive, setSimActive] = useState(false);
  const [simQuery, setSimQuery] = useState("");
  const [simMessages, setSimMessages] = useState<Array<{ role: "agent" | "caller"; text: string }>>([]);
  const [simExecuting, setSimExecuting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/voice-agent");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (data.offHoursStatus) setOffHoursStatus(data.offHoursStatus);
        if (data.callLogs) setCallLogs(data.callLogs);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/voice-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "save_settings", settings }),
      });
      const data = await res.json();
      if (data.success) {
        success("Voice Agent settings saved successfully!");
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

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleMarkDone = async (id: string) => {
    try {
      await fetch("/api/admin/voice-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_callback_done", callLogId: id }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Browser Speech Synthesis (TTS)
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startSimulatorCall = () => {
    setSimActive(true);
    const greeting =
      settings.greetingMessage ||
      "Assalam-o-Alaikum, thank you for calling SAMORA atelier nighttime concierge. How may I assist you?";
    setSimMessages([{ role: "agent", text: greeting }]);
    speakText(greeting);
  };

  const endSimulatorCall = async () => {
    if (simMessages.length > 1) {
      // Save simulated call to CallLog
      try {
        await fetch("/api/voice-agent/webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-samora-simulator": "true",
          },
          body: JSON.stringify({
            callerPhone: "0300-SIMULATOR",
            callerName: "Admin Test Caller",
            durationSeconds: simMessages.length * 15,
            intent: "ORDER_STATUS",
            aiSummary: `Simulator session with ${simMessages.length} exchanges.`,
            transcript: simMessages,
            callbackRequested: false,
          }),
        });
        fetchData();
      } catch {}
    }
    setSimActive(false);
    setSimMessages([]);
    setSimQuery("");
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleSendSimQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simQuery.trim()) return;

    const query = simQuery.trim();
    const newMessages = [...simMessages, { role: "caller" as const, text: query }];
    setSimMessages(newMessages);
    setSimQuery("");
    setSimExecuting(true);

    try {
      let agentReply = "";
      const lower = query.toLowerCase();

      // Tool matching heuristic in simulator
      if (lower.includes("order") || lower.includes("smr") || /\d{4,}/.test(query)) {
        // Run check_order_status
        const res = await fetch("/api/voice-agent/tools", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-samora-simulator": "true",
          },
          body: JSON.stringify({
            toolName: "check_order_status",
            parameters: { query },
          }),
        });
        const data = await res.json();
        agentReply =
          data.result?.message ||
          "I checked our atelier system but could not locate that order reference.";
      } else if (lower.includes("callback") || lower.includes("call me") || lower.includes("morning")) {
        // Run book_callback_or_note
        const res = await fetch("/api/voice-agent/tools", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-samora-simulator": "true",
          },
          body: JSON.stringify({
            toolName: "book_callback_or_note",
            parameters: {
              callerName: "Ahmad Khan",
              callerPhone: "0334-4826415",
              note: query,
            },
          }),
        });
        const data = await res.json();
        agentReply = data.result?.message || "I have logged your morning callback request.";
      } else {
        // Run check_product_availability
        const res = await fetch("/api/voice-agent/tools", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-samora-simulator": "true",
          },
          body: JSON.stringify({
            toolName: "check_product_availability",
            parameters: { query },
          }),
        });
        const data = await res.json();
        agentReply =
          data.result?.message ||
          "Our atelier pieces are crafted from 450 GSM French Terry loopback cotton with cash on delivery across Pakistan.";
      }

      setSimMessages([...newMessages, { role: "agent", text: agentReply }]);
      speakText(agentReply);
    } catch (err: any) {
      const errReply = "Apologies, I am experiencing a brief connection delay. Please hold on.";
      setSimMessages([...newMessages, { role: "agent", text: errReply }]);
    } finally {
      setSimExecuting(false);
    }
  };

  const filteredLogs = callLogs.filter((l) => {
    const q = searchLog.toLowerCase();
    return (
      l.callerPhone?.toLowerCase().includes(q) ||
      l.callerName?.toLowerCase().includes(q) ||
      l.aiSummary?.toLowerCase().includes(q) ||
      l.intent?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(31,26,23,0.08)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#2C3A2F]/10 text-[#2C3A2F] text-[10px] font-semibold uppercase tracking-wider">
              Autonomous Voice Concierge
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                offHoursStatus.isOffHours
                  ? "bg-purple-100 text-purple-900 border border-purple-300"
                  : "bg-emerald-100 text-emerald-900 border border-emerald-300"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  offHoursStatus.isOffHours ? "bg-purple-600 animate-pulse" : "bg-emerald-600"
                }`}
              />
              <span>{offHoursStatus.isOffHours ? "Off-Hours AI Active" : "Store Hours (Forwarding)"}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1A17] tracking-tight mt-1">
            Off-Hours AI Voice Receptionist
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5E54] mt-0.5">
            Bilingual nighttime voice receptionist ready to answer order inquiries, check 450 GSM inventory, and book callbacks at 2 AM.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-[rgba(31,26,23,0.12)] text-[#1F1A17] hover:bg-[#FAF8F4] transition shadow-sm"
            title="Refresh logs & status"
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

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[rgba(31,26,23,0.08)] shadow-sm">
          <span className="text-[11px] text-[#6B5E54] block">Current PKT Time</span>
          <span className="text-xl font-bold font-mono text-[#1F1A17] mt-1 block">
            {offHoursStatus.currentPktTime || "--:--"}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[rgba(31,26,23,0.08)] shadow-sm">
          <span className="text-[11px] text-[#6B5E54] block">Routing Decision</span>
          <span className="text-sm font-bold font-serif text-[#2C3A2F] mt-1 block">
            {offHoursStatus.isOffHours ? "AI Nighttime Agent" : "Forward to Owner (03344826415)"}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[rgba(31,26,23,0.08)] shadow-sm">
          <span className="text-[11px] text-[#6B5E54] block">Pending Morning Callbacks</span>
          <span className="text-xl font-bold font-serif text-amber-700 mt-1 block">
            {stats.pendingCallbacks || 0}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[rgba(31,26,23,0.08)] shadow-sm">
          <span className="text-[11px] text-[#6B5E54] block">Total Nighttime Calls</span>
          <span className="text-xl font-bold font-serif text-[#1F1A17] mt-1 block">
            {stats.totalCalls || 0}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 Cols): Schedule, Persona & Provider Setup */}
        <div className="lg:col-span-7 space-y-6">
          {/* Operating Hours & Override */}
          <div className="p-6 rounded-3xl bg-white border border-[rgba(31,26,23,0.10)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold font-serif text-[#1F1A17] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2C3A2F]" />
                <span>Operating Hours Schedule (Asia/Karachi, PKT)</span>
              </h2>

              <label className="flex items-center gap-2 text-xs font-semibold text-[#1F1A17] cursor-pointer">
                <span>Force Off-Hours Mode</span>
                <input
                  type="checkbox"
                  checked={settings.forceOffHoursMode}
                  onChange={(e) =>
                    setSettings({ ...settings, forceOffHoursMode: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#2C3A2F] rounded"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1F1A17] mb-1">
                  Atelier Opens (PKT)
                </label>
                <input
                  type="time"
                  value={settings.businessHoursStart}
                  onChange={(e) =>
                    setSettings({ ...settings, businessHoursStart: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1F1A17] mb-1">
                  Atelier Closes (PKT)
                </label>
                <input
                  type="time"
                  value={settings.businessHoursEnd}
                  onChange={(e) =>
                    setSettings({ ...settings, businessHoursEnd: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1F1A17] mb-1">
                  Active Business Days
                </label>
                <input
                  type="text"
                  value={settings.businessDays}
                  onChange={(e) =>
                    setSettings({ ...settings, businessDays: e.target.value })
                  }
                  placeholder="Mon,Tue,Wed,Thu,Fri,Sat"
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs font-mono"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#EBE4D8]/50 border border-[rgba(31,26,23,0.08)] flex items-center justify-between text-xs">
              <span className="text-[#6B5E54]">Active Routing Rule:</span>
              <span className="font-semibold text-[#1F1A17]">{offHoursStatus.reason}</span>
            </div>
          </div>

          {/* AI Persona & Knowledge Prompt */}
          <div className="p-6 rounded-3xl bg-white border border-[rgba(31,26,23,0.10)] shadow-sm space-y-4">
            <h2 className="text-sm font-bold font-serif text-[#1F1A17] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B55A38]" />
              <span>AI Receptionist Persona & Script</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1F1A17] mb-1">
                  Agent Name & Title
                </label>
                <input
                  type="text"
                  value={settings.agentName}
                  onChange={(e) => setSettings({ ...settings, agentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1F1A17] mb-1">
                  Language Preference
                </label>
                <select
                  value={settings.agentLanguage}
                  onChange={(e) => setSettings({ ...settings, agentLanguage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs"
                >
                  <option value="bilingual">Bilingual (Urdu / Roman Urdu + English)</option>
                  <option value="urdu">Urdu / Roman Urdu Only</option>
                  <option value="english">English Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1">
                Nighttime Phone Greeting (Spoken first upon call connection)
              </label>
              <textarea
                rows={3}
                value={settings.greetingMessage}
                onChange={(e) =>
                  setSettings({ ...settings, greetingMessage: e.target.value })
                }
                className="w-full p-3 rounded-2xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs leading-relaxed focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1A17] mb-1">
                AI Knowledge & Policy System Prompt
              </label>
              <textarea
                rows={6}
                value={settings.systemPrompt}
                onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                className="w-full p-3 rounded-2xl border border-[rgba(31,26,23,0.15)] bg-[#FAF8F4] text-xs font-mono leading-relaxed focus:outline-none"
              />
            </div>
          </div>

          {/* 1-Click Provider Integration Guide */}
          <div className="p-6 rounded-3xl bg-white border border-[rgba(31,26,23,0.10)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold font-serif text-[#1F1A17]">
                1-Click Provider Setup (Vapi.ai / Retell AI / Twilio)
              </h2>
              <span className="text-[10px] font-mono text-[#6B5E54]">Zero Configuration Code</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.08)]">
                <div>
                  <span className="text-[11px] text-[#6B5E54] block">Call Routing Webhook</span>
                  <code className="text-xs text-[#1F1A17] font-bold">/api/voice-agent/routing</code>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("/api/voice-agent/routing", "routing")}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[rgba(31,26,23,0.15)] text-[11px] font-semibold hover:bg-[#EBE4D8]"
                >
                  {copiedKey === "routing" ? "Copied!" : "Copy URL"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.08)]">
                <div>
                  <span className="text-[11px] text-[#6B5E54] block">Tool Execution Webhook</span>
                  <code className="text-xs text-[#1F1A17] font-bold">/api/voice-agent/tools</code>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("/api/voice-agent/tools", "tools")}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[rgba(31,26,23,0.15)] text-[11px] font-semibold hover:bg-[#EBE4D8]"
                >
                  {copiedKey === "tools" ? "Copied!" : "Copy URL"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.08)]">
                <div>
                  <span className="text-[11px] text-[#6B5E54] block">End-of-Call Webhook</span>
                  <code className="text-xs text-[#1F1A17] font-bold">/api/voice-agent/webhook</code>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("/api/voice-agent/webhook", "webhook")}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[rgba(31,26,23,0.15)] text-[11px] font-semibold hover:bg-[#EBE4D8]"
                >
                  {copiedKey === "webhook" ? "Copied!" : "Copy URL"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Live Voice Receptionist Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#1F1A17] text-[#FAF8F4] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm font-bold font-serif text-white">
                  Live Voice Receptionist Simulator
                </h2>
              </div>
              {isSpeaking && (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30">
                  <Volume2 className="w-3 h-3 animate-pulse" />
                  <span>Speaking (TTS)</span>
                </span>
              )}
            </div>

            {!simActive ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto text-purple-300 shadow-inner">
                  <PhoneForwarded className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Simulate Incoming Off-Hours Call</h3>
                  <p className="text-xs text-white/60 max-w-xs mx-auto">
                    Test the AI agent speaking over your computer speaker and answering live store queries against your SQLite database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startSimulatorCall}
                  className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-purple-600/30 flex items-center gap-2 mx-auto active:scale-95"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Test Phone Call</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-white/60 border-b border-white/10 pb-2">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Call Connected</span>
                  </span>
                  <button
                    type="button"
                    onClick={endSimulatorCall}
                    className="px-3 py-1 rounded-lg bg-red-600/40 hover:bg-red-600/60 text-red-200 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Square className="w-3 h-3" />
                    <span>Hang Up</span>
                  </button>
                </div>

                {/* Conversation Scroll Stage */}
                <div className="h-64 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {simMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        msg.role === "caller" ? "items-end" : "items-start"
                      }`}
                    >
                      <span className="text-[10px] text-white/40 mb-0.5">
                        {msg.role === "caller" ? "Caller (You)" : settings.agentName}
                      </span>
                      <div
                        className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                          msg.role === "caller"
                            ? "bg-purple-600 text-white rounded-br-none"
                            : "bg-[#282E2B] text-white/90 border border-white/10 rounded-bl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {simExecuting && (
                    <div className="text-[11px] text-purple-300 animate-pulse">
                      Ayla is looking up store records...
                    </div>
                  )}
                </div>

                {/* Input Prompt */}
                <form onSubmit={handleSendSimQuery} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={simQuery}
                    onChange={(e) => setSimQuery(e.target.value)}
                    placeholder='Speak to AI: "Check order SMR...", "Do you have hoodies?", "Book callback"...'
                    className="flex-1 px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={simExecuting || !simQuery.trim()}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition disabled:opacity-40"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nighttime Call Logs & Callback Queue Table */}
      <div className="p-6 rounded-3xl bg-white border border-[rgba(31,26,23,0.10)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold font-serif text-[#1F1A17]">
              Nighttime Call Logs & Morning Callback Queue
            </h2>
            <p className="text-xs text-[#6B5E54]">
              High-priority callback requests booked by the AI agent during off-hours.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#6B5E54] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              placeholder="Search caller phone, name, or note..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[rgba(31,26,23,0.12)] bg-[#FAF8F4] text-xs text-[#1F1A17] focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F4] border-b border-[rgba(31,26,23,0.08)] text-[#6B5E54] uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Caller</th>
                <th className="px-4 py-3">Intent</th>
                <th className="px-4 py-3">AI Call Summary & Note</th>
                <th className="px-4 py-3">Callback Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(31,26,23,0.06)]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#6B5E54]">
                    No nighttime calls logged yet. Start a simulator call above to test tool execution!
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF8F4]/80 transition">
                    <td className="px-4 py-3 font-mono text-[10px] text-[#6B5E54] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString()} · {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#1F1A17]">{log.callerName || "Nighttime Caller"}</div>
                      <div className="text-[10px] text-[#6B5E54] font-mono">{log.callerPhone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#EBE4D8] text-[#1F1A17]">
                        {log.intent}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-sm text-[#1F1A17]">
                      <p className="line-clamp-2">{log.aiSummary}</p>
                      {log.relatedOrderNumber && (
                        <span className="text-[10px] text-[#2C3A2F] font-mono block mt-0.5">
                          Order Ref: #{log.relatedOrderNumber}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {log.callbackRequested ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            log.callbackStatus === "DONE"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800 animate-pulse"
                          }`}
                        >
                          {log.callbackStatus === "DONE" ? "Completed" : "Callback Needed"}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#6B5E54]">Info Only</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={buildWhatsAppLink(
                            log.callerPhone,
                            `Assalam-o-Alaikum ${log.callerName || ""}! This is SAMORA atelier following up on your nighttime call inquiry.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-[#EBE4D8] hover:bg-[#FAF8F4] text-[#2C3A2F] transition"
                          title="Message on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                        {log.callbackRequested && log.callbackStatus !== "DONE" && (
                          <button
                            type="button"
                            onClick={() => handleMarkDone(log.id)}
                            className="px-2 py-1 rounded-lg bg-[#2C3A2F] hover:bg-[#1F1A17] text-white text-[10px] font-semibold transition"
                          >
                            Mark Done
                          </button>
                        )}
                      </div>
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
