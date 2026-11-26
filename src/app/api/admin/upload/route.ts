import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (typeof file === "string" || !file.name) continue;

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File exceeds max 10MB limit" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Verify Magic Bytes (JPEG, PNG, WebP only — reject SVG/HTML/scripts)
      const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      const isPng =
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47;
      const isWebp =
        buffer.length > 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP";

      if (!isJpeg && !isPng && !isWebp) {
        return NextResponse.json(
          { error: "Invalid image format. Only authentic JPG, PNG, or WebP allowed." },
          { status: 400 }
        );
      }

      // Safe resolved extension
      const ext = isJpeg ? ".jpg" : isPng ? ".png" : ".webp";

      // Strict filename sanitization and path traversal prevention
      const cleanBase = path
        .basename(file.name)
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 30);

      const fileName = `${cleanBase}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
      const filePath = path.join(uploadsDir, fileName);

      // Verify resolved path stays strictly inside uploadsDir
      if (!filePath.startsWith(uploadsDir)) {
        return NextResponse.json({ error: "Invalid upload path" }, { status: 400 });
      }

      await fs.writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/${fileName}`);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: "No valid files processed" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
