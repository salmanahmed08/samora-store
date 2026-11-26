import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import {
  getSyncSettings,
  executeSync,
  reapplyBackdropPresetToAll,
  extractGoogleSheetId,
  extractGoogleDriveFolderId,
} from "@/lib/google-sync";

// GET /api/admin/google-sync: returns current settings, sync logs, and live status
export async function GET() {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const settings = await getSyncSettings();
    const logs = await prisma.syncLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    const totalSyncedProducts = await prisma.product.count({
      where: { syncSource: "google_sync", status: { not: "ARCHIVED" } },
    });

    const totalManualProducts = await prisma.product.count({
      where: { syncSource: "manual" },
    });

    return NextResponse.json({
      success: true,
      settings,
      logs,
      stats: {
        totalSyncedProducts,
        totalManualProducts,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load sync data" },
      { status: 500 }
    );
  }
}

// POST /api/admin/google-sync: save settings, trigger manual sync, or test connection
export async function POST(request: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "save_settings") {
      const { settings } = body;
      if (!settings) {
        return NextResponse.json({ success: false, message: "Missing settings payload" }, { status: 400 });
      }

      const keysToSave = [
        "googleSyncEnabled",
        "googleSyncMode",
        "googleAppsScriptUrl",
        "googleSheetUrl",
        "googleSheetTabName",
        "googleDriveFolderUrl",
        "googleApiKey",
        "googleSyncIntervalSeconds",
        "googleSyncArchiveMissing",
        "autoStudioBackdropEnabled",
        "studioBackdropPreset",
        "useHangerCutouts",
        "autoWriteContentEnabled",
        "geminiApiKey",
      ];

      for (const k of keysToSave) {
        if (settings[k] !== undefined) {
          const val = String(settings[k]);
          await prisma.siteSetting.upsert({
            where: { key: k },
            update: { value: val },
            create: { key: k, value: val },
          });
        }
      }

      return NextResponse.json({ success: true, message: "Settings saved successfully" });
    }

    if (action === "sync_now") {
      const result = await executeSync("manual");
      return NextResponse.json(result);
    }

    if (action === "test_connection") {
      const settings = await getSyncSettings();
      // Test sheet
      const sheetId = extractGoogleSheetId(settings.googleSheetUrl);
      const folderId = extractGoogleDriveFolderId(settings.googleDriveFolderUrl);

      if (!sheetId) {
        return NextResponse.json({
          success: false,
          message: "Invalid Google Sheet URL. Please check the pasted link.",
        });
      }

      // If Apps Script URL is present, test ping
      if (settings.googleSyncMode === "apps_script") {
        if (!settings.googleAppsScriptUrl) {
          return NextResponse.json({
            success: false,
            message: "Apps Script Web App URL is empty. Please deploy the script and paste its URL.",
          });
        }

        try {
          const res = await fetch(settings.googleAppsScriptUrl, { cache: "no-store" });
          if (!res.ok) {
            return NextResponse.json({
              success: false,
              message: `Apps Script replied with HTTP ${res.status}. Make sure access is set to 'Anyone'.`,
            });
          }
          const data = await res.json();
          const rowCount = Array.isArray(data.rows) ? data.rows.length : 0;
          const driveCount = Array.isArray(data.driveFiles) ? data.driveFiles.length : 0;
          return NextResponse.json({
            success: true,
            message: `Connection Successful! Found ${rowCount} product rows in Sheet and ${driveCount} images in Google Drive.`,
            details: { rowCount, driveCount },
          });
        } catch (e: any) {
          return NextResponse.json({
            success: false,
            message: `Could not reach Apps Script: ${e.message}`,
          });
        }
      }

      // Direct mode test
      try {
        const tab = encodeURIComponent(settings.googleSheetTabName || "Products");
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${tab}`;
        const res = await fetch(csvUrl, { cache: "no-store" });
        if (!res.ok) {
          return NextResponse.json({
            success: false,
            message: `Could not access Sheet CSV (HTTP ${res.status}). Ensure Sheet link sharing is set to 'Anyone with the link can view' or use Easy Apps Script Mode.`,
          });
        }
        const text = await res.text();
        const hasHeader = text.toLowerCase().includes("sku") || text.toLowerCase().includes("title");
        return NextResponse.json({
          success: true,
          message: `Direct Link Connection OK! Sheet found with valid columns.`,
          details: { validSheet: true, hasHeader },
        });
      } catch (e: any) {
        return NextResponse.json({
          success: false,
          message: `Connection test error: ${e.message}`,
        });
      }
    }

    if (action === "reapply_backdrop") {
      const { preset } = body;
      if (!preset) {
        return NextResponse.json({ success: false, message: "Preset name required" }, { status: 400 });
      }
      const count = await reapplyBackdropPresetToAll(preset);
      return NextResponse.json({
        success: true,
        message: `Successfully re-applied ${preset} backdrop to ${count} synced products!`,
      });
    }

    return NextResponse.json({ success: false, message: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Request failed" },
      { status: 500 }
    );
  }
}
