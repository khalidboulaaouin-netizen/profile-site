import { NextResponse } from "next/server";
import { auth, isGoogleAuthConfigured } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import {
  addStory,
  deleteStory,
  getStoryViewers,
  isBlocked,
  listActiveStories,
  listHighlights,
  readStore,
  recordStoryView,
  saveStoryToHighlight,
} from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storyId = searchParams.get("id");
  const viewersOnly = searchParams.get("viewers") === "1";

  if (viewersOnly) {
    const { error } = await requireAdmin();
    if (error) return error;
    if (!storyId) {
      return NextResponse.json({ error: "story id required" }, { status: 400 });
    }
    const viewers = await getStoryViewers(storyId);
    if (!viewers) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ viewers });
  }

  const session = await auth();
  if (session?.user?.role === "follower" && (await isBlocked(session.user.id))) {
    return NextResponse.json(
      { error: "لا يمكنك مشاهدة هذه الصفحة", stories: [], blocked: true },
      { status: 403 },
    );
  }

  const store = await readStore();
  const stories = await listActiveStories();
  const isAdmin = session?.user?.role === "admin";

  return NextResponse.json({
    stories: stories.map((story) => ({
      id: story.id,
      imageUrl: story.imageUrl,
      caption: story.caption,
      createdAt: story.createdAt,
      expiresAt: story.expiresAt,
      viewerCount: story.viewers.length,
      viewers: isAdmin ? story.viewers : undefined,
      viewedByMe:
        session?.user?.role === "follower"
          ? story.viewers.some((v) => v.googleId === session.user.id)
          : false,
    })),
    profile: {
      displayName: store.profile.displayName,
      avatarUrl: store.profile.avatarUrl,
    },
    googleConfigured: isGoogleAuthConfigured(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const action = String(body.action || "create");

  if (action === "view") {
    const session = await auth();
    if (!session?.user || session.user.role !== "follower") {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول عبر Google لمشاهدة الستوري" },
        { status: 401 },
      );
    }

    if (await isBlocked(session.user.id)) {
      return NextResponse.json(
        { error: "لا يمكنك مشاهدة الستوري" },
        { status: 403 },
      );
    }

    const storyId = String(body.storyId || "");
    if (!storyId) {
      return NextResponse.json({ error: "story id required" }, { status: 400 });
    }

    const result = await recordStoryView({
      storyId,
      googleId: session.user.id,
      name: session.user.name || "متابع",
      email: session.user.email || "",
      image: session.user.image || "",
    });

    if (!result) {
      return NextResponse.json({ error: "الستوري غير موجودة أو منتهية" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      alreadyViewed: result.alreadyViewed,
      viewerCount: result.story.viewers.length,
    });
  }

  const { error } = await requireAdmin();
  if (error) return error;

  if (action === "saveToHighlight") {
    const storyId = String(body.storyId || "");
    const highlightId = body.highlightId ? String(body.highlightId) : undefined;
    const newTitle = body.newTitle ? String(body.newTitle) : undefined;
    if (!storyId) {
      return NextResponse.json({ error: "story id required" }, { status: 400 });
    }
    const highlight = await saveStoryToHighlight({ storyId, highlightId, newTitle });
    if (!highlight) {
      return NextResponse.json(
        { error: "تعذّر الحفظ في أبرز اللحظات (تأكد أن الستوري ما زالت نشطة)" },
        { status: 400 },
      );
    }
    const highlights = await listHighlights();
    return NextResponse.json({ highlight, highlights });
  }

  const imageUrl = String(body.imageUrl || "").trim();
  const caption = String(body.caption || "").trim();
  if (!imageUrl) {
    return NextResponse.json({ error: "الصورة مطلوبة" }, { status: 400 });
  }

  const story = await addStory({ imageUrl, caption });
  return NextResponse.json({ story }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });
  }

  const ok = await deleteStory(id);
  if (!ok) {
    return NextResponse.json({ error: "غير موجودة" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
