import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/admin";
import { uploadPublicBinary } from "@/lib/storage";

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const VIDEO_EXTS = new Set(["mp4", "webm", "mov", "m4v"]);

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
]);

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "الملف مطلوب" }, { status: 400 });
  }

  const mime = (file.type || "").split(";")[0].trim().toLowerCase();
  const isImage = mime.startsWith("image/");
  const isVideo = mime.startsWith("video/") || VIDEO_TYPES.has(mime);

  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "يُسمح بالصور أو الفيديو فقط" }, { status: 400 });
  }

  const maxBytes = isVideo ? 80 * 1024 * 1024 : 8 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: isVideo ? "الحجم الأقصى للفيديو 80MB" : "الحجم الأقصى للصورة 8MB" },
      { status: 400 },
    );
  }

  const rawExt = file.name.split(".").pop()?.toLowerCase() || "";
  let safeExt: string;
  if (isVideo) {
    safeExt = VIDEO_EXTS.has(rawExt)
      ? rawExt === "mov"
        ? "mov"
        : rawExt
      : mime.includes("webm")
        ? "webm"
        : "mp4";
  } else {
    safeExt = IMAGE_EXTS.has(rawExt) ? rawExt : "jpg";
  }

  const filename = `${randomUUID()}.${safeExt}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadPublicBinary(
    filename,
    buffer,
    mime || (isVideo ? "video/mp4" : "image/jpeg"),
  );

  return NextResponse.json({
    url,
    mediaType: isVideo ? "video" : "image",
  });
}
