import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { isBlocked } from "@/lib/db";

const ALLOWED_TYPES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/x-m4a",
  "audio/aac",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
};

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
  if (!ALLOWED_TYPES.has(mime)) {
    return NextResponse.json({ error: "يُسمح بالملفات الصوتية فقط" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "الحجم الأقصى للصوت 5MB" }, { status: 400 });
  }

  const ext = EXT_BY_TYPE[mime] || "webm";
  const filename = `voice-${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
