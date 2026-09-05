import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { addComment, deleteComment, isBlocked, readStore } from "@/lib/db";

export async function POST(request: Request) {
  const store = await readStore();
  if (!store.settings.enableComments) {
    return NextResponse.json({ error: "Comments are disabled" }, { status: 403 });
  }

  const session = await auth();
  if (session?.user?.role === "follower" && (await isBlocked(session.user.id))) {
    return NextResponse.json({ error: "لا يمكنك التعليق على هذه الصفحة" }, { status: 403 });
  }

  const body = await request.json();
  const postId = String(body.postId || "");
  const authorName = String(body.authorName || "");
  const text = String(body.text || "");

  const post = await addComment(postId, { authorName, text });
  if (!post) {
    return NextResponse.json({ error: "Could not add comment" }, { status: 400 });
  }

  return NextResponse.json({ comments: post.comments }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId") || "";
  const commentId = searchParams.get("commentId") || "";

  const post = await deleteComment(postId, commentId);
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ comments: post.comments });
}
