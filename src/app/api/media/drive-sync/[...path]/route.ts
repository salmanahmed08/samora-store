import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const subPath = params.path ? params.path.join("/") : "";
    const storageRoot = path.resolve(process.cwd(), "storage", "drive-sync");
    const resolvedPath = path.resolve(storageRoot, subPath);

    // Strict path traversal defense: ensure resolved path is inside storageRoot
    if (!resolvedPath.startsWith(storageRoot)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).isDirectory()) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    if (!allowedExtensions.includes(ext)) {
      return new NextResponse("Unsupported Media Type", { status: 415 });
    }

    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";

    const fileBuffer = await fs.promises.readFile(resolvedPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[Media Serve Error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
