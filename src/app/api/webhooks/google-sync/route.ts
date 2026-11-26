import { NextRequest, NextResponse } from "next/server";
import { getSyncSettings, executeSync } from "@/lib/google-sync";

export async function POST(request: NextRequest) {
  try {
    const settings = await getSyncSettings();
    const url = new URL(request.url);
    const token =
      request.headers.get("x-webhook-secret") ||
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      url.searchParams.get("secret");

    if (!token || token !== settings.googleWebhookSecret) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing webhook secret token" },
        { status: 401 }
      );
    }

    let payload: any = null;
    try {
      payload = await request.json();
    } catch {
      // payload is optional
    }

    // Trigger sync immediately
    const result = await executeSync("webhook", payload && payload.rows ? payload : undefined);

    return NextResponse.json({
      success: true,
      message: "Webhook sync triggered successfully",
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Webhook trigger failed" },
      { status: 500 }
    );
  }
}
