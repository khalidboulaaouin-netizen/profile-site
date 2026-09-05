import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isBlocked } from "@/lib/db";

export const runtime = "nodejs";

/** Direct-to-Blob upload for chat photos/videos (follower or owner). */
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
        const session = await auth();
        if (!session?.user) throw new Error("غير مصرح");
        if (session.user.role !== "admin" && session.user.role !== "follower") {
          throw new Error("غير مصرح");
        }
        if (
          session.user.role === "follower" &&
          (await isBlocked(session.user.id))
        ) {
          throw new Error("محظور");
        }

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
          maximumSizeInBytes: 40 * 1024 * 1024,
          allowOverwrite: true,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Client attaches the URL to the chat message after upload.
      },
    });

    return NextResponse.json(json);
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل تجهيز الرفع";
    const status =
      message === "غير مصرح" ? 401 : message === "محظور" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
