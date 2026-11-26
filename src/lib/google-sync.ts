import fs from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "./prisma";
import { processProductImage, compositeCutoutToStudio } from "./image-studio";
import { resolveProductContentAndSeo } from "./auto-copywriter";

export interface SyncSettings {
  googleSyncEnabled: boolean;
  googleSyncMode: "apps_script" | "api_key";
  googleAppsScriptUrl: string;
  googleSheetUrl: string;
  googleSheetTabName: string;
  googleDriveFolderUrl: string;
  googleApiKey: string;
  googleSyncIntervalSeconds: number;
  googleSyncArchiveMissing: boolean;
  googleWebhookSecret: string;
  googleLastSyncAt?: string;
  autoStudioBackdropEnabled: boolean;
  studioBackdropPreset: string;
  useHangerCutouts: boolean;
  autoWriteContentEnabled: boolean;
  geminiApiKey: string;
}

export interface SyncResult {
  success: boolean;
  triggerType: "auto" | "manual" | "webhook";
  status: "success" | "partial" | "error";
  productsCreated: number;
  productsUpdated: number;
  productsArchived: number;
  imagesSynced: number;
  message: string;
  details?: Record<string, any>;
}

// In-memory mutex lock to prevent concurrent sync executions
let isSyncInProgress = false;

export async function getSyncSettings(): Promise<SyncSettings> {
  const settingsRows = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: [
          "googleSyncEnabled",
          "googleSyncMode",
          "googleAppsScriptUrl",
          "googleSheetUrl",
          "googleSheetTabName",
          "googleDriveFolderUrl",
          "googleApiKey",
          "googleSyncIntervalSeconds",
          "googleSyncArchiveMissing",
          "googleWebhookSecret",
          "googleLastSyncAt",
          "autoStudioBackdropEnabled",
          "studioBackdropPreset",
          "useHangerCutouts",
          "autoWriteContentEnabled",
          "geminiApiKey",
        ],
      },
    },
  });

  const map = new Map<string, string>();
  for (const s of settingsRows) {
    map.set(s.key, s.value);
  }

  let webhookSecret = map.get("googleWebhookSecret");
  if (!webhookSecret) {
    webhookSecret = crypto.randomBytes(16).toString("hex");
    await prisma.siteSetting.upsert({
      where: { key: "googleWebhookSecret" },
      update: { value: webhookSecret },
      create: { key: "googleWebhookSecret", value: webhookSecret },
    });
  }

  return {
    googleSyncEnabled: map.get("googleSyncEnabled") === "true",
    googleSyncMode: (map.get("googleSyncMode") as any) || "apps_script",
    googleAppsScriptUrl: map.get("googleAppsScriptUrl") || "",
    googleSheetUrl:
      map.get("googleSheetUrl") ||
      "https://docs.google.com/spreadsheets/d/1X3F7XTpM9mNJpjE6rcWBKJHy-50cBnRwnK9pZCwiKjo/edit?usp=drivesdk",
    googleSheetTabName: map.get("googleSheetTabName") || "Products",
    googleDriveFolderUrl:
      map.get("googleDriveFolderUrl") ||
      "https://drive.google.com/drive/folders/1omIlzF5sxHGVplB4xmHq4jxZmS7zas9V",
    googleApiKey: map.get("googleApiKey") || "",
    googleSyncIntervalSeconds: parseInt(map.get("googleSyncIntervalSeconds") || "60", 10),
    googleSyncArchiveMissing: map.get("googleSyncArchiveMissing") === "true",
    googleWebhookSecret: webhookSecret,
    googleLastSyncAt: map.get("googleLastSyncAt"),
    autoStudioBackdropEnabled: map.get("autoStudioBackdropEnabled") !== "false", // default true
    studioBackdropPreset: map.get("studioBackdropPreset") || "warm_sandstone",
    useHangerCutouts: map.get("useHangerCutouts") !== "false", // default true
    autoWriteContentEnabled: map.get("autoWriteContentEnabled") === "true",
    geminiApiKey: map.get("geminiApiKey") || "",
  };
}

export function extractGoogleSheetId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9-_]{20,}$/.test(url.trim())) return url.trim();
  return null;
}

export function extractGoogleDriveFolderId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9-_]{20,}$/.test(url.trim())) return url.trim();
  return null;
}

export function normalizeSkuOrFilename(str: string): string {
  if (!str) return "";
  let base = str.trim().replace(/\.[^/.]+$/, ""); // strip extension
  // Strip common angle suffixes: -1, _1, (1), -front, -back, _main, -detail, -tag, etc.
  base = base.replace(/[-_ ]?(front|back|main|cover|model|detail|tag|side|closeup|angle)$/i, "");
  base = base.replace(/[-_ ]?\(?\d+\)?$/, ""); // remove trailing numbers like -1, _2, (3)
  return base.trim().toUpperCase();
}

/**
 * Robust CSV parser that handles quotes, commas, and newlines
 */
export function parseCsv(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
      current += char;
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      lines.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current) lines.push(current);

  if (lines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let cell = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuote && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (c === "," && !inQuote) {
        result.push(cell.trim());
        cell = "";
      } else {
        cell += c;
      }
    }
    result.push(cell.trim());
    return result;
  };

  const headers = parseRow(lines[0]).map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, "")
  );

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseRow(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((hdr, idx) => {
      obj[hdr] = values[idx] || "";
    });
    rows.push(obj);
  }
  return rows;
}

/**
 * Fetch rows from Google Sheet
 */
async function fetchSheetData(
  settings: SyncSettings
): Promise<{ rows: any[]; driveFiles?: any[] }> {
  // If Apps Script Mode
  if (settings.googleSyncMode === "apps_script" && settings.googleAppsScriptUrl) {
    const res = await fetch(settings.googleAppsScriptUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Apps Script responded with HTTP ${res.status}`);
    }
    const data = await res.json();
    return {
      rows: Array.isArray(data.rows) ? data.rows : [],
      driveFiles: Array.isArray(data.driveFiles) ? data.driveFiles : [],
    };
  }

  // Direct Mode fallback via CSV / Google Sheet Public Export
  const sheetId = extractGoogleSheetId(settings.googleSheetUrl);
  if (!sheetId) {
    throw new Error("Invalid Google Sheet URL or ID");
  }

  const tab = encodeURIComponent(settings.googleSheetTabName || "Products");
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${tab}`;

  const res = await fetch(csvUrl, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to read Sheet CSV (HTTP ${res.status}). Ensure Sheet is publicly accessible or use Easy Apps Script Mode.`);
  }

  const text = await res.text();
  const rawRows = parseCsv(text);
  return { rows: rawRows };
}

/**
 * Main Sync Engine Execution
 */
export async function executeSync(
  triggerType: "auto" | "manual" | "webhook" = "manual",
  overridePayload?: { rows: any[]; driveFiles?: any[] }
): Promise<SyncResult> {
  if (isSyncInProgress) {
    return {
      success: false,
      triggerType,
      status: "partial",
      productsCreated: 0,
      productsUpdated: 0,
      productsArchived: 0,
      imagesSynced: 0,
      message: "Sync is already in progress, skipping duplicate trigger.",
    };
  }

  isSyncInProgress = true;
  const startTime = Date.now();

  try {
    const settings = await getSyncSettings();

    let sheetData: { rows: any[]; driveFiles?: any[] };
    if (overridePayload) {
      sheetData = overridePayload;
    } else {
      sheetData = await fetchSheetData(settings);
    }

    const { rows, driveFiles = [] } = sheetData;

    let createdCount = 0;
    let updatedCount = 0;
    let archivedCount = 0;
    let imagesCount = 0;
    const syncedSkus = new Set<string>();

    // Index drive files by name and SKU
    const driveFileByName = new Map<string, any>();
    const driveFilesBySku = new Map<string, any[]>();

    for (const file of driveFiles) {
      const name = (file.name || "").trim().toLowerCase();
      driveFileByName.set(name, file);

      const norm = normalizeSkuOrFilename(file.name || "");
      if (norm) {
        if (!driveFilesBySku.has(norm)) driveFilesBySku.set(norm, []);
        driveFilesBySku.get(norm)!.push(file);
      }
      // Subfolder matching if available
      if (file.folderName) {
        const folderNorm = file.folderName.trim().toUpperCase();
        if (!driveFilesBySku.has(folderNorm)) driveFilesBySku.set(folderNorm, []);
        driveFilesBySku.get(folderNorm)!.push(file);
      }
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      // Flexible field resolution
      const getVal = (...keys: string[]) => {
        for (const k of keys) {
          const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (row[cleanK] !== undefined && row[cleanK] !== null && String(row[cleanK]).trim() !== "") {
            return String(row[cleanK]).trim();
          }
        }
        return "";
      };

      let sku = getVal("sku", "itemcode", "code", "id", "productid");
      let title = getVal("title", "producttitle", "name", "productname");

      if (!sku && !title) continue; // skip completely empty row

      if (!sku && title) {
        sku = `SMR-${(i + 1).toString().padStart(3, "0")}`;
      } else if (sku && !title) {
        // Smart Title Fallback from SKU
        title = `Samora ${sku.toUpperCase()}`;
      }
      sku = sku.toUpperCase();
      syncedSkus.add(sku);

      const rawPrice = getVal("pricepkr", "price", "rate", "cost").replace(/[^0-9.]/g, "");
      const pricePKR = parseFloat(rawPrice) || 0;

      const rawCompare = getVal("compareatprice", "compareprice", "originalprice", "mrp").replace(/[^0-9.]/g, "");
      const compareAtPrice = rawCompare ? parseFloat(rawCompare) : null;

      const categoryName = getVal("category", "type", "collection") || "Streetwear";
      const rawDescription = getVal("description", "details", "desc");
      const rawSizes = getVal("sizes", "size") || "S, M, L, XL";
      const sizesArray = rawSizes.split(",").map((s) => s.trim()).filter(Boolean);

      const rawStock = getVal("stock", "qty", "quantity").replace(/[^0-9]/g, "");
      let stock = rawStock ? parseInt(rawStock, 10) : 10;

      const showHomeVal = getVal("showonhome", "home", "featured").toLowerCase();
      const showOnHome = showHomeVal === "no" || showHomeVal === "false" ? false : true;

      const showHangerVal = getVal("showonhanger", "hanger", "rope").toLowerCase();
      const showOnHanger = showHangerVal === "no" || showHangerVal === "false" ? false : true;

      const statusVal = getVal("status", "state").toLowerCase().trim();
      const isSoldOutFlag =
        statusVal.includes("sold") ||
        statusVal.includes("stole") ||
        (rawStock !== "" && stock === 0);

      // Check existing product to maintain soldOutAt timestamp lifecycle
      const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${sku.toLowerCase()}`;
      const existingProduct = await prisma.product.findFirst({
        where: { OR: [{ sku }, { slug }] },
      });

      let status = "ACTIVE";
      let soldOutAt: Date | null = existingProduct?.soldOutAt || null;

      if (isSoldOutFlag) {
        status = "SOLD_OUT";
        stock = 0;
        if (!soldOutAt) {
          soldOutAt = new Date();
        }
      } else if (statusVal === "draft") {
        status = "DRAFT";
      } else if (statusVal === "archived" || statusVal === "inactive") {
        status = "ARCHIVED";
      } else {
        // Restocked or Active
        status = "ACTIVE";
        soldOutAt = null;
      }

      // Check if product was SOLD_OUT > 24 hours ago, auto-transition to ARCHIVED
      if (status === "SOLD_OUT" && soldOutAt) {
        const hoursPassed = (Date.now() - new Date(soldOutAt).getTime()) / (1000 * 60 * 60);
        if (hoursPassed >= 24) {
          status = "ARCHIVED";
        }
      }

      // 1. Resolve Copywriting & SEO metadata (Smart Auto-Writer)
      const generatedCopy = await resolveProductContentAndSeo({
        sku,
        title,
        category: categoryName,
        pricePKR,
        sizes: sizesArray,
        existingDescription: rawDescription,
        geminiApiKey: settings.geminiApiKey,
        autoWriteEnabled: settings.autoWriteContentEnabled,
      });

      const finalDescription = generatedCopy.description;
      const finalMetaTitle = getVal("metatitle", "seotitle") || generatedCopy.metaTitle;
      const finalMetaDescription = getVal("metadescription", "seodescription") || generatedCopy.metaDescription;

      // 2. Ensure Category exists
      const catSlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const categoryRec = await prisma.category.upsert({
        where: { slug: catSlug },
        update: { name: categoryName },
        create: { name: categoryName, slug: catSlug },
      });

      // 3. Resolve Multi-Images for this product
      // Grouping logic:
      // a. Explicit list from Sheet
      // b. Auto-match Drive images by SKU prefix or subfolder (e.g. SMR-104* or subfolder SMR-104)
      const rawImagesCol = getVal("images", "image", "photos", "photo");
      const matchedFiles: any[] = [];
      const seenFileIds = new Set<string>();

      if (rawImagesCol) {
        const imageRefs = rawImagesCol.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
        for (const ref of imageRefs) {
          if (ref.startsWith("http://") || ref.startsWith("https://")) {
            matchedFiles.push({ url: ref, name: path.basename(ref) });
          } else {
            const foundFile = driveFileByName.get(ref.toLowerCase());
            if (foundFile && !seenFileIds.has(foundFile.id)) {
              seenFileIds.add(foundFile.id);
              matchedFiles.push(foundFile);
            }
          }
        }
      }

      // If empty or additional angle auto-discovery by SKU
      const normSku = normalizeSkuOrFilename(sku);
      const skuDriveFiles = driveFilesBySku.get(normSku) || [];
      for (const df of skuDriveFiles) {
        if (!seenFileIds.has(df.id)) {
          seenFileIds.add(df.id);
          matchedFiles.push(df);
        }
      }

      // Also search driveFiles list for prefix matching (e.g. "SMR-104_1.jpg", "SMR-104-front.png")
      for (const df of driveFiles) {
        const dfName = (df.name || "").trim().toUpperCase();
        if (
          (dfName.startsWith(`${sku}-`) ||
            dfName.startsWith(`${sku}_`) ||
            dfName.startsWith(`${sku} `) ||
            dfName === `${sku}.JPG` ||
            dfName === `${sku}.PNG` ||
            dfName === `${sku}.WEBP` ||
            dfName === `${sku}.JPEG`) &&
          !seenFileIds.has(df.id)
        ) {
          seenFileIds.add(df.id);
          matchedFiles.push(df);
        }
      }

      // Sort files: Front/Main shot first, then angles, detail/back last
      matchedFiles.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        const score = (n: string) => {
          if (n === `${sku.toLowerCase()}.jpg` || n === `${sku.toLowerCase()}.png` || n === `${sku.toLowerCase()}.webp`) return 10;
          if (n.includes("front") || n.includes("main") || n.includes("cover") || n.includes("01")) return 8;
          if (n.includes("back")) return 2;
          if (n.includes("tag") || n.includes("detail")) return 1;
          return 5;
        };
        return score(nameB) - score(nameA);
      });

      // Process matched images through Studio / Caching
      const finalStudioUrls: string[] = [];
      const finalCutoutUrls: string[] = [];
      const syncedImageMeta: any[] = [];

      for (let imgIdx = 0; imgIdx < matchedFiles.length; imgIdx++) {
        const fileObj = matchedFiles[imgIdx];
        const baseName = `${sku}-${imgIdx + 1}`;

        try {
          let buffer: Buffer | null = null;
          if (fileObj.buffer) {
            buffer = fileObj.buffer;
          } else if (fileObj.base64) {
            buffer = Buffer.from(fileObj.base64, "base64");
          } else if (fileObj.url) {
            if (fileObj.url.startsWith("http://") || fileObj.url.startsWith("https://")) {
              const imgRes = await fetch(fileObj.url, { cache: "no-store" });
              if (imgRes.ok) {
                const arrayBuf = await imgRes.arrayBuffer();
                buffer = Buffer.from(arrayBuf);
              }
            } else if (fileObj.url.startsWith("/")) {
              const localDiskPath = path.join(process.cwd(), "public", fileObj.url);
              if (fs.existsSync(localDiskPath)) {
                buffer = await fs.promises.readFile(localDiskPath);
              }
            }
          }

          if (buffer) {
            const processed = await processProductImage(buffer, baseName, {
              preset: settings.studioBackdropPreset,
            });
            finalStudioUrls.push(processed.studioUrl);
            finalCutoutUrls.push(processed.cutoutUrl);
            syncedImageMeta.push({
              fileId: fileObj.id || baseName,
              fileName: fileObj.name || baseName,
              modifiedTime: fileObj.modifiedTime || new Date().toISOString(),
              backdropPreset: settings.studioBackdropPreset,
            });
            imagesCount++;
          }
        } catch (imgErr) {
          console.warn(`[Sync] Error processing image for SKU ${sku}:`, imgErr);
        }
      }

      // Fallback if no images found
      if (finalStudioUrls.length === 0) {
        finalStudioUrls.push("/assets/editorial-hoodies/hoodie-editorial-01.jpeg");
        finalCutoutUrls.push("/assets/editorial-hoodies/hoodie-editorial-01.jpeg");
      }

      // Calculate row hash to detect updates
      const rowHash = crypto
        .createHash("md5")
        .update(JSON.stringify({ title, pricePKR, compareAtPrice, categoryName, finalDescription, rawSizes, stock, showOnHome, showOnHanger, status, soldOutAt, finalStudioUrls, finalMetaTitle, finalMetaDescription }))
        .digest("hex");

      if (existingProduct) {
        if (existingProduct.syncSource === "manual") {
          // Never overwrite purely manual products
          continue;
        }

        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            title,
            description: finalDescription,
            pricePKR,
            compareAtPrice,
            category: categoryName,
            categoryId: categoryRec.id,
            showOnHome,
            showOnHanger,
            sizes: JSON.stringify(sizesArray),
            stock,
            images: JSON.stringify(finalStudioUrls),
            cutoutImages: JSON.stringify(finalCutoutUrls),
            status,
            soldOutAt,
            metaTitle: finalMetaTitle,
            metaDescription: finalMetaDescription,
            syncSource: "google_sync",
            externalRowHash: rowHash,
            syncedImageMeta: JSON.stringify(syncedImageMeta),
            lastSyncedAt: new Date(),
          },
        });
        updatedCount++;
      } else {
        await prisma.product.create({
          data: {
            sku,
            title,
            slug,
            description: finalDescription,
            pricePKR,
            compareAtPrice,
            category: categoryName,
            categoryId: categoryRec.id,
            showOnHome,
            showOnHanger,
            sizes: JSON.stringify(sizesArray),
            stock,
            images: JSON.stringify(finalStudioUrls),
            cutoutImages: JSON.stringify(finalCutoutUrls),
            status,
            soldOutAt,
            metaTitle: finalMetaTitle,
            metaDescription: finalMetaDescription,
            syncSource: "google_sync",
            externalRowHash: rowHash,
            syncedImageMeta: JSON.stringify(syncedImageMeta),
            lastSyncedAt: new Date(),
          },
        });
        createdCount++;
      }
    }

    // Archive missing synced products if setting enabled
    if (settings.googleSyncArchiveMissing && syncedSkus.size > 0) {
      const missingProducts = await prisma.product.findMany({
        where: {
          syncSource: "google_sync",
          sku: { notIn: Array.from(syncedSkus) },
          status: { not: "ARCHIVED" },
        },
      });

      for (const mp of missingProducts) {
        await prisma.product.update({
          where: { id: mp.id },
          data: { status: "ARCHIVED" },
        });
        archivedCount++;
      }
    }

    // Auto-expire SOLD_OUT products whose 24-hour window has lapsed across ALL products (both synced and manual)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const expiredSoldOut = await prisma.product.findMany({
      where: {
        status: "SOLD_OUT",
        soldOutAt: { lte: twentyFourHoursAgo },
      },
    });

    for (const exp of expiredSoldOut) {
      await prisma.product.update({
        where: { id: exp.id },
        data: { status: "ARCHIVED" },
      });
      archivedCount++;
    }

    const elapsed = Date.now() - startTime;
    const nowIso = new Date().toISOString();

    await prisma.siteSetting.upsert({
      where: { key: "googleLastSyncAt" },
      update: { value: nowIso },
      create: { key: "googleLastSyncAt", value: nowIso },
    });

    const log = await prisma.syncLog.create({
      data: {
        triggerType,
        status: "success",
        productsCreated: createdCount,
        productsUpdated: updatedCount,
        productsArchived: archivedCount,
        imagesSynced: imagesCount,
        message: `Synced ${rows.length} rows (${createdCount} created, ${updatedCount} updated) in ${elapsed}ms`,
        details: JSON.stringify({ elapsed, skusSynced: Array.from(syncedSkus) }),
      },
    });

    return {
      success: true,
      triggerType,
      status: "success",
      productsCreated: createdCount,
      productsUpdated: updatedCount,
      productsArchived: archivedCount,
      imagesSynced: imagesCount,
      message: `Sync completed successfully (${createdCount} created, ${updatedCount} updated, ${imagesCount} images processed).`,
    };
  } catch (err: any) {
    console.error("[Sync Engine Error]", err);
    await prisma.syncLog.create({
      data: {
        triggerType,
        status: "error",
        message: err.message || "Unknown error during sync",
        details: JSON.stringify({ error: String(err) }),
      },
    });

    return {
      success: false,
      triggerType,
      status: "error",
      productsCreated: 0,
      productsUpdated: 0,
      productsArchived: 0,
      imagesSynced: 0,
      message: err.message || "Failed to execute sync",
    };
  } finally {
    isSyncInProgress = false;
  }
}

/**
 * Re-apply backdrop preset to all synced products from saved cutouts
 */
export async function reapplyBackdropPresetToAll(newPreset: string): Promise<number> {
  const products = await prisma.product.findMany({
    where: { syncSource: "google_sync" },
  });

  let count = 0;
  const storageRoot = path.join(process.cwd(), "storage", "drive-sync");
  const cutoutsDir = path.join(storageRoot, "cutouts");
  const studioDir = path.join(storageRoot, "studio");

  for (const prod of products) {
    let images: string[] = [];
    try {
      images = JSON.parse(prod.images || "[]");
    } catch {
      images = [];
    }

    const updatedStudioUrls: string[] = [];
    for (const imgUrl of images) {
      if (imgUrl.includes("/api/media/drive-sync/studio/")) {
        const studioFilename = path.basename(imgUrl.split("?")[0]);
        const base = studioFilename.replace(/-studio\.webp$/, "");
        const cutoutFilename = `${base}-cutout.png`;
        const cutoutDisk = path.join(cutoutsDir, cutoutFilename);
        const studioDisk = path.join(studioDir, studioFilename);

        if (fs.existsSync(cutoutDisk)) {
          const cutoutBuf = await fs.promises.readFile(cutoutDisk);
          await compositeCutoutToStudio(cutoutBuf, studioDisk, newPreset);
          updatedStudioUrls.push(`/api/media/drive-sync/studio/${studioFilename}?v=${Date.now()}`);
        } else {
          updatedStudioUrls.push(imgUrl);
        }
      } else {
        updatedStudioUrls.push(imgUrl);
      }
    }

    await prisma.product.update({
      where: { id: prod.id },
      data: {
        images: JSON.stringify(updatedStudioUrls),
        syncedImageMeta: JSON.stringify({ backdropPreset: newPreset, reprocessedAt: new Date().toISOString() }),
      },
    });
    count++;
  }

  await prisma.siteSetting.upsert({
    where: { key: "studioBackdropPreset" },
    update: { value: newPreset },
    create: { key: "studioBackdropPreset", value: newPreset },
  });

  return count;
}
