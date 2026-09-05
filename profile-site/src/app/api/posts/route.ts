import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { addPost, deletePost, readStore, updatePost } from "@/lib/db";

function parseMediaType(value: unknown): "image" | "video" | "text" {
  if (value === "video") return "video";
  if (value === "text") return "text";
  return "image";
}

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ posts: store.posts });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const imageUrl = String(body.imageUrl || "").trim();
  const caption = String(body.caption || "").trim();
  const mediaType = parseMediaType(body.mediaType);

  if (mediaType === "text") {
    if (!caption) {
      return NextResponse.json({ error: "نص المقال مطلوب" }, { status: 400 });
    }
  } else if (!imageUrl) {
    return NextResponse.json({ error: "الوسائط مطلوبة" }, { status: 400 });
  }

  const post = await addPost({ imageUrl, caption, mediaType });
  return NextResponse.json({ post }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

  const post = await updatePost(id, {
    caption: body.caption !== undefined ? String(body.caption) : undefined,
    imageUrl: body.imageUrl !== undefined ? String(body.imageUrl) : undefined,
    hidden: body.hidden !== undefined ? Boolean(body.hidden) : undefined,
    mediaType: body.mediaType !== undefined ? parseMediaType(body.mediaType) : undefined,
  });

  if (!post) return NextResponse.json({ error: "المنشور غير موجود" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

  const ok = await deletePost(id);
  if (!ok) return NextResponse.json({ error: "المنشور غير موجود" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
