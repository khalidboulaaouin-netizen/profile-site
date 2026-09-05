import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isBlocked, readStore, toggleLike } from "@/lib/db";

export async function POST(request: Request) {
  const store = await readStore();
  if (!store.settings.enableLikes) {
    return NextResponse.json({ error: "Likes are disabled" }, { status: 403 });
  }

  const session = await auth();
  if (session?.user?.role === "follower" && (await isBlocked(session.user.id))) {
    return NextResponse.json({ error: "لا يمكنك التفاعل مع هذه الصفحة" }, { status: 403 });
  }

  const body = await request.json();
  const postId = String(body.postId || "");
  const visitorId = String(body.visitorId || "").slice(0, 80);

  if (!postId || !visitorId) {
    return NextResponse.json({ error: "Missing postId or visitorId" }, { status: 400 });
  }

  const result = await toggleLike(postId, visitorId);
  if (!result) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({
    likes: result.post.likes,
    liked: result.liked,
    likedBy: result.post.likedBy,
  });
}
