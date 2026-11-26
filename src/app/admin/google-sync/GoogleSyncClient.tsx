"use client";

import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FolderSync,
  Play,
  Save,
  Clock,
  Layers,
  Sparkles,
  Download,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import { BACKDROP_PRESETS } from "@/lib/studio-presets";
import { useToast } from "@/components/admin/ToastContext";

export default function GoogleSyncClient() {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptDetails, setShowScriptDetails] = useState(false);
  const [reapplyingPreset, setReapplyingPreset] = useState(false);

  const [settings, setSettings] = useState({
    googleSyncEnabled: false,
    googleSyncMode: "apps_script",
    googleAppsScriptUrl: "",
    googleSheetUrl: "https://docs.google.com/spreadsheets/d/1X3F7XTpM9mNJpjE6rcWBKJHy-50cBnRwnK9pZCwiKjo/edit?usp=drivesdk",
    googleSheetTabName: "Products",
    googleDriveFolderUrl: "https://drive.google.com/drive/folders/1omIlzF5sxHGVplB4xmHq4jxZmS7zas9V",
    googleApiKey: "",
    googleSyncIntervalSeconds: 60,
    googleSyncArchiveMissing: true,
    googleWebhookSecret: "",
    googleLastSyncAt: "",
    autoStudioBackdropEnabled: true,
    studioBackdropPreset: "warm_sandstone",
    useHangerCutouts: true,
    autoWriteContentEnabled: false,
    geminiApiKey: "",
  });

  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSyncedProducts: 0, totalManualProducts: 0 });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/google-sync", {
        credentials: "include",
      });
      if (res.status === 401) {
        toastError("Session expired. Please sign in again.");
        window.location.href = "/admin/login";
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (data.logs) setLogs(data.logs);
        if (data.stats) setStats(data.stats);
      }
    } catch (err: any) {
      console.error("Failed to load sync data:", err);
      toastError(err.message || "Failed to load sync data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/google-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "save_settings", settings }),
      });
      const data = await res.json();
      if (data.success) {
        toastSuccess("Google Sync & Studio settings saved successfully!");
        loadData();
      } else {
        toastError(data.message || data.error || "Failed to save settings");
      }
    } catch (err: any) {
      toastError(`Save failed: ${err.message || "Network error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/admin/google-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "sync_now" }),
      });
      const data = await res.json();
      if (data.success) {
        toastSuccess(data.message || "Sync finished successfully!");
      } else {
        toastError(`Sync notice: ${data.message || data.error || "Check logs below"}`);
      }
      loadData();
    } catch (err: any) {
      toastError(`Sync failed: ${err.message || "Network error"}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await fetch("/api/admin/google-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "test_connection" }),
      });
      const data = await res.json();
      const msg = data.message || (data.success ? "Connection operational" : "Connection check failed");
      setTestResult({
        success: Boolean(data.success),
        message: msg,
      });
      if (data.success) {
        toastSuccess("Connection test passed!");
      } else {
        toastError(msg);
      }
    } catch (err: any) {
      const msg = `Connection test failed: ${err.message || "Network error"}`;
      setTestResult({
        success: false,
        message: msg,
      });
      toastError(msg);
    } finally {
      setTesting(false);
    }
  };

  const handleReapplyPreset = async (presetId: string) => {
    try {
      setReapplyingPreset(true);
      const res = await fetch("/api/admin/google-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reapply_backdrop", preset: presetId }),
      });
      const data = await res.json();
      if (data.success) {
        toastSuccess(data.message || "Preset applied to all products!");
        setSettings((prev) => ({ ...prev, studioBackdropPreset: presetId }));
      } else {
        toastError(data.message || data.error || "Failed to reapply preset");
      }
    } catch (err: any) {
      toastError(`Re-apply failed: ${err.message || "Network error"}`);
    } finally {
      setReapplyingPreset(false);
    }
  };

  const downloadCsvTemplate = () => {
    const csvContent =
      "SKU,Title,Price_PKR,Compare_At_Price,Category,Sizes,Stock,Description,Images,Show_On_Home,Show_On_Hanger,Status\n" +
      'SMR-001,Obsidian Heavyweight Hoodie,4500,5500,Hoodies,"S, M, L, XL",15,Haute 480GSM loopback cotton hoodie.,SMR-001.jpg,YES,YES,Active\n' +
      'SMR-002,Desert Taupe Drop-Shoulder Hoodie,4200,5200,Hoodies,"S, M, L, XL",12,Oversized dropped shoulder French terry fleece.,SMR-002.jpg,YES,YES,Active\n';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Samora_Products_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatedAppsScriptCode = `/**
 * SAMORA HAUTE STREETWEAR // Google Sheet & Drive Automatic Sync Bridge
 * Sheet: ${settings.googleSheetUrl}
 * Drive Folder: ${settings.googleDriveFolderUrl}
 */
const CONFIG = {
  SHEET_ID: "${settings.googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1] || "PASTE_SHEET_ID_HERE"}",
  TAB_NAME: "${settings.googleSheetTabName || "Products"}",
  DRIVE_FOLDER_ID: "${settings.googleDriveFolderUrl.match(/\/folders\/([a-zA-Z0-9-_]+)/)?.[1] || "PASTE_DRIVE_FOLDER_ID_HERE"}",
  WEBHOOK_SECRET: "${settings.googleWebhookSecret}",
  STORE_URL: "http://localhost:3000" // or your live custom domain
};

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.TAB_NAME) || ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();
    if (!data || data.length < 2) {
      return ContentService.createTextOutput(JSON.stringify({ rows: [], driveFiles: [] })).setMimeType(ContentService.MimeType.JSON);
    }
    const headers = data[0].map(h => String(h).toLowerCase().replace(/[^a-z0-9]/g, ''));
    const rows = [];
    for (let i = 1; i < data.length; i++) {
      const row = {};
      let hasVal = false;
      headers.forEach((h, idx) => {
        row[h] = data[i][idx] !== undefined ? String(data[i][idx]).trim() : '';
        if (row[h]) hasVal = true;
      });
      if (hasVal) rows.push(row);
    }

    // List Drive Images
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    const driveFiles = [];
    scanFolder(folder, driveFiles, '');

    return ContentService.createTextOutput(JSON.stringify({ rows: rows, driveFiles: driveFiles })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function scanFolder(folder, list, pathPrefix) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    const mime = f.getMimeType();
    if (mime.indexOf('image/') === 0) {
      list.push({
        id: f.getId(),
        name: f.getName(),
        folderName: folder.getName(),
        modifiedTime: f.getLastUpdated().toISOString(),
        mimeType: mime,
        size: f.getSize(),
        base64: Utilities.base64Encode(f.getBlob().getBytes())
      });
    }
  }
  const subs = folder.getFolders();
  while (subs.hasNext()) {
    scanFolder(subs.next(), list, folder.getName());
  }
}

function onEdit(e) {
  notifyStore();
}

function notifyStore() {
  try {
    const webhookUrl = CONFIG.STORE_URL + "/api/webhooks/google-sync?secret=" + CONFIG.WEBHOOK_SECRET;
    UrlFetchApp.fetch(webhookUrl, {
      method: "post",
      muteHttpExceptions: true
    });
  } catch(e) {}
}`;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Banner Status Bar */}
      <div className="rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                settings.googleSyncEnabled
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  settings.googleSyncEnabled ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {settings.googleSyncEnabled
                ? `Active — Auto-checking every ${settings.googleSyncIntervalSeconds}s`
                : "Auto-Sync Paused"}
            </span>

            <span className="text-xs text-[#6B5E54] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Last Synced:{" "}
              {settings.googleLastSyncAt
                ? new Date(settings.googleLastSyncAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : "Never"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1A17] tracking-tight">
            Google Sheet & Drive Live Sync Atelier
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5E54]">
            Keep your Storefront, Shop & Rope Hanger Slider automatically updated directly from Google Sheets & Drive.
          </p>
        </div>

        {/* Sync Now & Save Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-[#FFFFFF] hover:bg-[#EBE4D8] text-xs font-semibold text-[#1F1A17] transition flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${testing ? "animate-spin" : ""}`} />
            <span>{testing ? "Testing..." : "Test Connection"}</span>
          </button>

          <button
            type="button"
            onClick={handleSyncNow}
            disabled={syncing}
            className="px-5 py-2.5 rounded-xl bg-[#2C3A2F] hover:bg-[#1F1A17] text-white text-xs font-semibold transition flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Now"}</span>
          </button>
        </div>
      </div>

      {/* Test Connection Alert Feedback */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
            testResult.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Grid: Settings & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Connection Form & Mode Selector */}
        <div className="lg:col-span-8 space-y-6">
          {/* Connection Card */}
          <div className="rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[rgba(31,26,23,0.08)] pb-4">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-[#2C3A2F]" />
                <h3 className="font-serif font-bold text-lg text-[#1F1A17]">Two-Source Data Connection</h3>
              </div>

              {/* Mode Switcher */}
              <div className="flex p-1 bg-[#EBE4D8] rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, googleSyncMode: "apps_script" })}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    settings.googleSyncMode === "apps_script"
                      ? "bg-[#FAF8F4] text-[#1F1A17] shadow-sm"
                      : "text-[#6B5E54] hover:text-[#1F1A17]"
                  }`}
                >
                  Mode A: Easy Apps Script (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, googleSyncMode: "api_key" })}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    settings.googleSyncMode === "api_key"
                      ? "bg-[#FAF8F4] text-[#1F1A17] shadow-sm"
                      : "text-[#6B5E54] hover:text-[#1F1A17]"
                  }`}
                >
                  Mode B: Direct API / Link
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Google Sheet URL */}
              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                  Google Sheet URL (Full Link)
                </label>
                <input
                  type="text"
                  value={settings.googleSheetUrl}
                  onChange={(e) => setSettings({ ...settings, googleSheetUrl: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/1X3F7XTpM9mNJpjE6rcWBKJHy-50cBnRwnK9pZCwiKjo/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs font-mono text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tab Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                    Sheet Tab Name
                  </label>
                  <input
                    type="text"
                    value={settings.googleSheetTabName}
                    onChange={(e) => setSettings({ ...settings, googleSheetTabName: e.target.value })}
                    placeholder="Products"
                    className="w-full px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                  />
                </div>

                {/* Drive Folder URL */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                    Google Drive Folder URL
                  </label>
                  <input
                    type="text"
                    value={settings.googleDriveFolderUrl}
                    onChange={(e) => setSettings({ ...settings, googleDriveFolderUrl: e.target.value })}
                    placeholder="https://drive.google.com/drive/folders/1omIlzF5sxHGVplB4xmHq4jxZmS7zas9V"
                    className="w-full px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs font-mono text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Auto Content & SEO Copywriter Upgrade */}
              <div className="p-4 rounded-2xl bg-[#EBE4D8]/50 border border-[rgba(31,26,23,0.08)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#1F1A17] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#B55A38]" />
                      <span>Smart Auto-Content & SEO Copywriter</span>
                    </h3>
                    <p className="text-[11px] text-[#6B5E54] mt-0.5">
                      Auto-generate luxury boutique description, fabric GSM specs, and SEO titles/descriptions when left blank in Google Sheets.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoWriteContentEnabled}
                    onChange={(e) =>
                      setSettings({ ...settings, autoWriteContentEnabled: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#2C3A2F] rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1F1A17] mb-1">
                    Gemini AI API Key (Optional — Zero-Key Smart Template Fallback works 100% offline)
                  </label>
                  <input
                    type="password"
                    value={settings.geminiApiKey}
                    onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                    placeholder="AIzaSy... (leave blank to use built-in luxury streetwear copy engine)"
                    className="w-full px-4 py-2 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs font-mono text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                  />
                </div>
              </div>

              {settings.googleSyncMode === "apps_script" ? (
                <div>
                  <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                    Apps Script Web App URL
                  </label>
                  <input
                    type="text"
                    value={settings.googleAppsScriptUrl}
                    onChange={(e) => setSettings({ ...settings, googleAppsScriptUrl: e.target.value })}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="w-full px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs font-mono text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                  />
                  <span className="text-[11px] text-[#6B5E54] mt-1 block">
                    Copy the pre-filled script below, paste it into Google Sheet Extensions &rarr; Apps Script, deploy as Web App, and paste the URL here.
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                    Google API Key (Optional for Public Sheets)
                  </label>
                  <input
                    type="password"
                    value={settings.googleApiKey}
                    onChange={(e) => setSettings({ ...settings, googleApiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs font-mono text-[#1F1A17] focus:ring-2 focus:ring-[#2C3A2F]/20 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#2C3A2F] text-white text-xs font-semibold hover:bg-[#1F1A17] transition flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Connection Settings"}</span>
              </button>
            </div>
          </div>

          {/* PART 2: Auto Studio Image Processor & Backdrop Card */}
          <div className="rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[rgba(31,26,23,0.08)] pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#B55A38]" />
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1F1A17]">Auto Classic Studio Image Processor</h3>
                  <span className="text-xs text-[#6B5E54]">
                    100% untouched garment fidelity, auto-segmentation & luxury studio plate compositing
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#EBE4D8] text-[#1F1A17]">
                Offline Sharp Engine
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[rgba(31,26,23,0.08)]">
                <div>
                  <span className="text-xs font-semibold text-[#1F1A17] block">
                    Automatic Background Removal & Studio Backdrop
                  </span>
                  <span className="text-[11px] text-[#6B5E54]">
                    Removes messy backgrounds from Drive photos and centers pristine cutout on classic luxury studio wall
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoStudioBackdropEnabled}
                  onChange={(e) => setSettings({ ...settings, autoStudioBackdropEnabled: e.target.checked })}
                  className="w-5 h-5 accent-[#2C3A2F] cursor-pointer"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[rgba(31,26,23,0.08)]">
                <div>
                  <span className="text-xs font-semibold text-[#1F1A17] block">
                    Use Transparent Cutout on Rope & Hanger Slider
                  </span>
                  <span className="text-[11px] text-[#6B5E54]">
                    Hangs the hoodie realistically on the wooden hanger with ZERO rectangular background box
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.useHangerCutouts}
                  onChange={(e) => setSettings({ ...settings, useHangerCutouts: e.target.checked })}
                  className="w-5 h-5 accent-[#2C3A2F] cursor-pointer"
                />
              </div>

              {/* 5 Classic Studio Backdrop Presets Swatches */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-[#1F1A17]">
                  Classic Studio Backdrop Style (Strictly Never Plain White)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BACKDROP_PRESETS.map((p) => {
                    const isSelected = settings.studioBackdropPreset === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSettings({ ...settings, studioBackdropPreset: p.id })}
                        className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? "border-[#2C3A2F] bg-white ring-2 ring-[#2C3A2F]/20 shadow-sm"
                            : "border-[rgba(31,26,23,0.10)] bg-[#FFFFFF] hover:border-[#2C3A2F]/40"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                              style={{
                                background:
                                  p.id === "pure_transparent"
                                    ? "repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 8px 8px"
                                    : `linear-gradient(135deg, ${p.gradientColors[0]}, ${p.gradientColors[1]})`,
                              }}
                            />
                            <span className="text-xs font-serif font-bold text-[#1F1A17]">{p.name}</span>
                          </div>
                          <p className="text-[10px] text-[#6B5E54] leading-tight">{p.subtitle}</p>
                        </div>

                        {isSelected && (
                          <div className="pt-2 text-right">
                            <span className="text-[10px] font-semibold text-[#2C3A2F]">Active Preset</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-[#6B5E54]">
                  Changes will apply automatically to all newly synced or updated Drive photos.
                </span>
                <button
                  type="button"
                  onClick={() => handleReapplyPreset(settings.studioBackdropPreset)}
                  disabled={reapplyingPreset}
                  className="px-4 py-2 rounded-xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.15)] hover:bg-[#EBE4D8] text-xs font-semibold text-[#1F1A17] transition flex items-center gap-2 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${reapplyingPreset ? "animate-spin" : ""}`} />
                  <span>{reapplyingPreset ? "Re-applying..." : "Re-apply Backdrop to All Synced Products"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Automation Rules & 1-Click Starter Kit */}
        <div className="lg:col-span-4 space-y-6">
          {/* Automation Controls Card */}
          <div className="rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-[rgba(31,26,23,0.08)] pb-3">
              <Clock className="w-5 h-5 text-[#2C3A2F]" />
              <h3 className="font-serif font-bold text-base text-[#1F1A17]">Auto-Sync Controls</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1F1A17]">
                  Automatic Background Poller
                </span>
                <input
                  type="checkbox"
                  checked={settings.googleSyncEnabled}
                  onChange={(e) => setSettings({ ...settings, googleSyncEnabled: e.target.checked })}
                  className="w-5 h-5 accent-[#2C3A2F] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1A17] mb-1.5">
                  Check for Updates Every
                </label>
                <select
                  value={settings.googleSyncIntervalSeconds}
                  onChange={(e) => setSettings({ ...settings, googleSyncIntervalSeconds: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(31,26,23,0.15)] bg-white text-xs text-[#1F1A17] focus:outline-none"
                >
                  <option value={30}>30 Seconds (Fastest)</option>
                  <option value={60}>1 Minute (Recommended)</option>
                  <option value={180}>3 Minutes</option>
                  <option value={300}>5 Minutes</option>
                  <option value={900}>15 Minutes</option>
                </select>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  id="archiveMissing"
                  checked={settings.googleSyncArchiveMissing}
                  onChange={(e) => setSettings({ ...settings, googleSyncArchiveMissing: e.target.checked })}
                  className="w-4 h-4 accent-[#2C3A2F] mt-0.5 cursor-pointer"
                />
                <label htmlFor="archiveMissing" className="text-xs text-[#6B5E54] cursor-pointer">
                  Auto-hide / archive products removed from Google Sheet (Never deletes manual products)
                </label>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-[#2C3A2F] hover:bg-[#1F1A17] text-white text-xs font-semibold transition text-center shadow-sm"
              >
                Save Poller Rules
              </button>
            </div>
          </div>

          {/* 1-Click Starter Kit Card */}
          <div className="rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1F1A17] flex items-center gap-2">
              <Download className="w-4 h-4 text-[#B55A38]" />
              <span>Owner Starter Kit</span>
            </h3>

            <p className="text-xs text-[#6B5E54]">
              Use our pre-configured CSV template with the exact columns and headers to import into Google Sheets in seconds:
            </p>

            <button
              type="button"
              onClick={downloadCsvTemplate}
              className="w-full py-2.5 rounded-xl bg-white border border-[rgba(31,26,23,0.15)] hover:bg-[#EBE4D8] text-xs font-semibold text-[#1F1A17] transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Google Sheet Template (.csv)</span>
            </button>

            {/* Apps Script Code Drawer */}
            <div className="pt-2 border-t border-[rgba(31,26,23,0.08)]">
              <button
                type="button"
                onClick={() => setShowScriptDetails(!showScriptDetails)}
                className="w-full flex items-center justify-between text-xs font-semibold text-[#1F1A17] py-1"
              >
                <span>3-Step Apps Script Bridge Code</span>
                {showScriptDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showScriptDetails && (
                <div className="mt-3 space-y-3">
                  <ol className="text-[11px] text-[#6B5E54] space-y-1 list-decimal pl-4">
                    <li>Open your Google Sheet &rarr; Extensions &rarr; Apps Script</li>
                    <li>Paste the code below & click Deploy &rarr; New Deployment &rarr; Web App</li>
                    <li>Set 'Who has access' to 'Anyone' and paste the URL on the left!</li>
                  </ol>

                  <div className="relative">
                    <pre className="p-3 bg-[#1F1A17] text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto max-h-48 scrollbar-thin">
                      {generatedAppsScriptCode}
                    </pre>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedAppsScriptCode);
                        setCopiedScript(true);
                        setTimeout(() => setCopiedScript(false), 2000);
                      }}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded bg-[#2C3A2F] text-white text-[10px] font-sans hover:bg-black transition flex items-center gap-1 shadow"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedScript ? "Copied!" : "Copy Script"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sync History Table */}
      <div className="rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.12)] p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(31,26,23,0.08)] pb-3">
          <h3 className="font-serif font-bold text-lg text-[#1F1A17]">Recent Sync Activity Log</h3>
          <span className="text-xs text-[#6B5E54]">Showing last 15 automated & manual runs</span>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6B5E54]">
            No sync logs recorded yet. Click "Sync Now" above to initiate the first run.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EBE4D8]/50 text-[#6B5E54] uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Trigger</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Images</th>
                  <th className="px-4 py-3">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(31,26,23,0.06)]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/60 transition">
                    <td className="px-4 py-3 font-mono text-[11px] text-[#6B5E54]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold uppercase text-[10px] text-[#2C3A2F]">
                      {log.triggerType}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          log.status === "success"
                            ? "bg-emerald-100 text-emerald-800"
                            : log.status === "partial"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#1F1A17]">+{log.productsCreated}</td>
                    <td className="px-4 py-3 font-mono text-[#1F1A17]">{log.productsUpdated}</td>
                    <td className="px-4 py-3 font-mono text-[#1F1A17]">{log.imagesSynced}</td>
                    <td className="px-4 py-3 text-[#6B5E54] max-w-xs truncate">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
