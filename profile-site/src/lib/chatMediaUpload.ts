import { upload } from "@vercel/blob/client";

const SERVER_UPLOAD_MAX = 3.5 * 1024 * 1024;
const CHAT_MEDIA_MAX = 40 * 1024 * 1024;

export type ChatMediaKind = "image" | "video";

export type ChatMediaUploadResult = {
  url: string;
  mediaType: ChatMediaKind;
};

function isVideoFile(file: File) {
  const mime = (file.type || "").toLowerCase();
  if (mime.startsWith("video/")) return true;
  return /\.(mp4|webm|mov|m4v)$/i.test(file.name);
}

function resolveContentType(file: File, mediaType: ChatMediaKind) {
  const mime = (file.type || "").toLowerCase().trim();
  if (mime && mime !== "application/octet-stream") return mime;
  if (mediaType === "video") {
    if (/\.webm$/i.test(file.name)) return "video/webm";
    if (/\.mov$/i.test(file.name)) return "video/quicktime";
    if (/\.m4v$/i.test(file.name)) return "video/x-m4v";
    return "video/mp4";
  }
  if (/\.png$/i.test(file.name)) return "image/png";
  if (/\.webp$/i.test(file.name)) return "image/webp";
  if (/\.gif$/i.test(file.name)) return "image/gif";
  return "image/jpeg";
}

async function uploadViaApi(file: File): Promise<ChatMediaUploadResult> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/messages/upload", { method: "POST", body });
  let data: { error?: string; url?: string; mediaType?: string } = {};
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    throw new Error(data.error || `فشل الرفع (${res.status})`);
  }
  if (!data.url) throw new Error("لم يُرجع الخادم رابط الملف");
  return {
    url: data.url,
    mediaType: data.mediaType === "video" ? "video" : "image",
  };
}

async function uploadViaClientBlob(
  file: File,
  mediaType: ChatMediaKind,
): Promise<ChatMediaUploadResult> {
  const ext =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    (mediaType === "video" ? "mp4" : "jpg");
  const pathname = `uploads/chat-${crypto.randomUUID()}.${ext}`;
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/messages/blob-upload",
        contentType: resolveContentType(file, mediaType),
        multipart: file.size > 4 * 1024 * 1024,
      });
      if (!blob.url) throw new Error("لم يُرجع Blob رابطاً");
      return { url: blob.url, mediaType };
    } catch (err) {
      lastError = err;
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 400 + attempt * 600));
      }
    }
  }
  const message =
    lastError instanceof Error ? lastError.message : "فشل رفع الملف إلى Blob";
  throw new Error(message);
}

export async function uploadChatMedia(
  file: File,
): Promise<ChatMediaUploadResult> {
  if (file.size > CHAT_MEDIA_MAX) {
    throw new Error("الحجم الأقصى للصورة/الفيديو في الخاص 40MB");
  }

  const mediaType: ChatMediaKind = isVideoFile(file) ? "video" : "image";
  if (mediaType === "video" || file.size > SERVER_UPLOAD_MAX) {
    return uploadViaClientBlob(file, mediaType);
  }

  try {
    return await uploadViaApi(file);
  } catch {
    return uploadViaClientBlob(file, mediaType);
  }
}

export function isChatVideoMessage(
  mediaType?: "image" | "video",
  mediaUrl?: string,
) {
  if (mediaType === "video") return true;
  if (mediaType === "image") return false;
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(mediaUrl || "");
}
