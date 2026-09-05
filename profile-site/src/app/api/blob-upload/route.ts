import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/** Client-side direct upload to Vercel Blob (bypasses serverless body size limits). */
export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "رفع Blob غير مفعّل على الخادم" },
      { status: 503 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Auth only for token generation — completion webhooks are unsigned of cookies.
        const { error } = await requireAdmin();
        if (error) throw new Error("غير مصرح");

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/heic",
            "image/heif",
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "video/x-m4v",
            "application/octet-stream",
          ],
          maximumSizeInBytes: 80 * 1024 * 1024,
          allowOverwrite: true,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Client creates the post after upload; nothing to persist here.
      },
    });

    return NextResponse.json(json);
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل تجهيز الرفع";
    const status = message === "غير مصرح" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
