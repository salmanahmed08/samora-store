import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import sharp from "sharp";

export interface StudioOptions {
  preset?: string; // "warm_sandstone" | "classic_travertine" | "editorial_taupe" | "heritage_olive" | "pure_transparent" | "custom"
  customBackdropPath?: string;
  hangerCutoutOnly?: boolean;
}

import { BACKDROP_PRESETS } from "./studio-presets";
export { BACKDROP_PRESETS };

const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 1500; // 4:5 luxury portrait ratio

// Run ONNX @imgly background removal inside an isolated worker process
// to guarantee 100% clean memory and zero GLib native symbol collision with sharp
function removeBgInWorker(inputDiskPath: string, outputDiskPath: string): boolean {
  try {
    const workerScript = path.join(process.cwd(), "scripts", "remove-bg-worker.js");
    const proc = spawnSync("node", [workerScript, inputDiskPath, outputDiskPath], {
      timeout: 30000,
      encoding: "utf8",
    });
    return proc.status === 0 && fs.existsSync(outputDiskPath);
  } catch (err) {
    console.warn("[ImageStudio] Background removal worker error:", err);
    return false;
  }
}

// Generate classic studio SVG backdrop with soft radial vignette and ground shadow plate
function generateStudioBackdropSvg(presetId: string): string {
  const preset = BACKDROP_PRESETS.find((p) => p.id === presetId) || BACKDROP_PRESETS[0];

  if (preset.id === "pure_transparent") {
    return `<svg width="${TARGET_WIDTH}" height="${TARGET_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="none" />
    </svg>`;
  }

  const [topColor, bottomColor] = preset.gradientColors;
  const floor = preset.floorColor;

  return `<svg width="${TARGET_WIDTH}" height="${TARGET_HEIGHT}" viewBox="0 0 ${TARGET_WIDTH} ${TARGET_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${topColor}" />
        <stop offset="78%" stop-color="${bottomColor}" />
        <stop offset="100%" stop-color="${floor}" />
      </linearGradient>
      <radialGradient id="spotlight" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.18" />
        <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.04" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.12" />
      </radialGradient>
      <radialGradient id="groundShadow" cx="50%" cy="85%" rx="35%" ry="10%">
        <stop offset="0%" stop-color="${preset.shadowColor}" />
        <stop offset="70%" stop-color="${preset.shadowColor}" stop-opacity="0.25" />
        <stop offset="100%" stop-color="${preset.shadowColor}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <!-- Base Studio Wall -->
    <rect width="${TARGET_WIDTH}" height="${TARGET_HEIGHT}" fill="url(#wallGrad)" />
    <!-- Center Overhead Studio Spotlight -->
    <rect width="${TARGET_WIDTH}" height="${TARGET_HEIGHT}" fill="url(#spotlight)" />
    <!-- Soft Floor Ambient Contact Shadow -->
    <rect width="${TARGET_WIDTH}" height="${TARGET_HEIGHT}" fill="url(#groundShadow)" />
  </svg>`;
}

/**
 * Process a product image:
 * 1. Saves untouched original in storage/drive-sync/originals/
 * 2. Generates transparent cutout in storage/drive-sync/cutouts/{baseName}-cutout.png
 * 3. Composites cutout onto selected Classic Studio Backdrop in storage/drive-sync/studio/{baseName}-studio.webp
 */
export async function processProductImage(
  inputBuffer: Buffer,
  baseFilename: string,
  options: StudioOptions = {}
): Promise<{
  originalPath: string;
  cutoutPath: string;
  studioPath: string;
  cutoutUrl: string;
  studioUrl: string;
}> {
  const preset = options.preset || "warm_sandstone";
  const storageRoot = path.join(process.cwd(), "storage", "drive-sync");
  const originalsDir = path.join(storageRoot, "originals");
  const cutoutsDir = path.join(storageRoot, "cutouts");
  const studioDir = path.join(storageRoot, "studio");

  fs.mkdirSync(originalsDir, { recursive: true });
  fs.mkdirSync(cutoutsDir, { recursive: true });
  fs.mkdirSync(studioDir, { recursive: true });

  const cleanBase = baseFilename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  const originalFileName = `${cleanBase}.jpg`;
  const cutoutFileName = `${cleanBase}-cutout.png`;
  const studioFileName = `${cleanBase}-studio.webp`;

  const originalDiskPath = path.join(originalsDir, originalFileName);
  const cutoutDiskPath = path.join(cutoutsDir, cutoutFileName);
  const studioDiskPath = path.join(studioDir, studioFileName);

  // 1. Write original buffer
  await fs.promises.writeFile(originalDiskPath, inputBuffer);

  // 2. Generate transparent cutout
  let cutoutBuffer: Buffer;
  if (fs.existsSync(cutoutDiskPath)) {
    cutoutBuffer = await fs.promises.readFile(cutoutDiskPath);
  } else {
    const success = removeBgInWorker(originalDiskPath, cutoutDiskPath);
    if (success && fs.existsSync(cutoutDiskPath)) {
      cutoutBuffer = await fs.promises.readFile(cutoutDiskPath);
    } else {
      // Graceful fallback: maintain intact image as transparent PNG
      cutoutBuffer = await sharp(inputBuffer).png().toBuffer();
      await fs.promises.writeFile(cutoutDiskPath, cutoutBuffer);
    }

    // Trim excess transparency with slight breathing room
    try {
      cutoutBuffer = await sharp(cutoutBuffer)
        .trim({ threshold: 10 })
        .toBuffer();
      await fs.promises.writeFile(cutoutDiskPath, cutoutBuffer);
    } catch {}
  }

  // 3. Composite cutout onto Classic Studio Backdrop
  await compositeCutoutToStudio(cutoutBuffer, studioDiskPath, preset, options.customBackdropPath);

  const cutoutUrl = `/api/media/drive-sync/cutouts/${cutoutFileName}`;
  const studioUrl = `/api/media/drive-sync/studio/${studioFileName}`;

  return {
    originalPath: originalDiskPath,
    cutoutPath: cutoutDiskPath,
    studioPath: studioDiskPath,
    cutoutUrl,
    studioUrl,
  };
}

/**
 * Re-composite existing cutout onto studio backdrop without re-running background removal!
 */
export async function compositeCutoutToStudio(
  cutoutBuffer: Buffer,
  outputDiskPath: string,
  presetId = "warm_sandstone",
  customBackdropPath?: string
): Promise<void> {
  const maxGarmentWidth = 920;
  const maxGarmentHeight = 1180;

  // Resize garment cutout proportionally to fit nicely inside 1200x1500 frame with breathing space
  const garmentResized = await sharp(cutoutBuffer)
    .resize(maxGarmentWidth, maxGarmentHeight, {
      fit: "inside",
      withoutEnlargement: false,
    })
    .toBuffer();

  const garmentMeta = await sharp(garmentResized).metadata();
  const gw = garmentMeta.width || 800;
  const gh = garmentMeta.height || 1000;

  // Center horizontally, position vertically with balanced top/bottom margin
  const left = Math.round((TARGET_WIDTH - gw) / 2);
  const top = Math.round((TARGET_HEIGHT - gh) / 2) - 30; // slightly above optical center

  if (presetId === "pure_transparent") {
    await sharp({
      create: {
        width: TARGET_WIDTH,
        height: TARGET_HEIGHT,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: garmentResized, left, top }])
      .webp({ quality: 90 })
      .toFile(outputDiskPath);
    return;
  }

  let backdropBuffer: Buffer;
  if (presetId === "custom" && customBackdropPath && fs.existsSync(customBackdropPath)) {
    backdropBuffer = await sharp(customBackdropPath)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: "cover" })
      .toBuffer();
  } else {
    const svgStr = generateStudioBackdropSvg(presetId);
    backdropBuffer = await sharp(Buffer.from(svgStr)).png().toBuffer();
  }

  // Create subtle contact drop shadow directly from garment alpha silhouette
  const shadowBuffer = await sharp(garmentResized)
    .ensureAlpha()
    .tint({ r: 40, g: 32, b: 24 })
    .blur(16)
    .toBuffer();

  await sharp(backdropBuffer)
    .composite([
      // Soft ambient contact shadow behind garment
      {
        input: shadowBuffer,
        left: left,
        top: top + 18,
        blend: "multiply",
      },
      // Pristine untouched garment cutout
      {
        input: garmentResized,
        left: left,
        top: top,
        blend: "over",
      },
    ])
    .webp({ quality: 92 })
    .toFile(outputDiskPath);
}
