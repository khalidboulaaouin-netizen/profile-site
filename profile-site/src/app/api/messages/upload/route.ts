import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { isBlocked } from "@/lib/db";
import { uploadPublicBinary } from "@/lib/storage";

const AUDIO_TYPES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/x-m4a",
  "audio/aac",
]);

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-m4v": "m4v",
};

/** Stay under Vercel serverless body limit (~4.5MB). Larger files use blob client upload. */
const MAX_SERVER_BYTES = 3.5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (session.user.role === "follower" && (await isBlocked(session.user.id))) {
    return NextResponse.json({ error: "blocked" }, { status: 403 });
  }

  if (session.user.role !== "admin" && session.user.role !== "follower") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "الملف مطلوب" }, { status: 400 });
  }

  const mime = (file.type || "").split(";")[0].trim().toLowerCase();
  const isAudio = AUDIO_TYPES.has(mime);
  const isImage = IMAGE_TYPES.has(mime);
  const isVideo = VIDEO_TYPES.has(mime);

  if (!isAudio && !isImage && !isVideo) {
    return NextResponse.json(
      { error: "يُسمح بالصوت أو الصور أو الفيديو فقط" },
      { status: 400 },
    );
  }

  if (file.size > MAX_SERVER_BYTES) {
    return NextResponse.json(
      {
        error:
          "الملف كبير للرفع عبر الخادم. استخدم الرفع المباشر (صورة/فيديو أكبر).",
        code: "too_large",
      },
      { status: 413 },
    );
  }

  const kind = isAudio ? "voice" : isVideo ? "chat-video" : "chat-image";
  const ext = EXT_BY_TYPE[mime] || (isVideo ? "mp4" : isImage ? "jpg" : "webm");
  const filename = `${kind}-${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadPublicBinary(filename, buffer, mime);

  return NextResponse.json({
    url,
    mediaType: isVideo ? "video" : isImage ? "image" : "audio",
  });
}
