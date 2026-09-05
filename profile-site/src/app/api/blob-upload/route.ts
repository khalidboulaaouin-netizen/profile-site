import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/** Client-side direct upload to Vercel Blob (bypasses serverless body size limits). */
export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

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
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "video/mp4",
          "video/webm",
          "video/quicktime",
          "video/x-m4v",
        ],
        maximumSizeInBytes: 80 * 1024 * 1024,
        allowOverwrite: true,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // No server-side follow-up needed; client creates the post after upload.
      },
    });

    return NextResponse.json(json);
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل تجهيز الرفع";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
