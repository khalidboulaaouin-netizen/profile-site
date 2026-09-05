import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import {
  countUnreadForOwner,
  getConversationByGoogleId,
  isBlocked,
  listConversations,
  markConversationRead,
  sendFollowerMessage,
  sendOwnerReply,
} from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const googleId = searchParams.get("googleId") || "";

  if (session?.user?.role === "admin") {
    if (googleId) {
      const conversation = await getConversationByGoogleId(googleId);
      if (!conversation) {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }
      await markConversationRead({ googleId, role: "owner" });
      const refreshed = await getConversationByGoogleId(googleId);
      return NextResponse.json({ conversation: refreshed });
    }

    const conversations = await listConversations();
    const unread = await countUnreadForOwner();
    return NextResponse.json({
      conversations: conversations.map((c) => ({
        id: c.id,
        googleId: c.googleId,
        name: c.name,
        email: c.email,
        image: c.image,
        updatedAt: c.updatedAt,
        preview: c.messages[c.messages.length - 1]?.text || "",
        unread: c.messages.filter((m) => m.from === "follower" && !m.readByOwner).length,
      })),
      unread,
    });
  }

  if (!session?.user || session.user.role !== "follower") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (await isBlocked(session.user.id)) {
    return NextResponse.json({ error: "blocked", blocked: true }, { status: 403 });
  }

  let conversation = await getConversationByGoogleId(session.user.id);
  if (conversation) {
    await markConversationRead({ googleId: session.user.id, role: "follower" });
    conversation = await getConversationByGoogleId(session.user.id);
  }

  return NextResponse.json({ conversation });
}

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json();
  const text = String(body.text || "");

  if (session?.user?.role === "admin") {
    const googleId = String(body.googleId || "");
    const conversation = await sendOwnerReply({ googleId, text });
    if (!conversation) {
      return NextResponse.json({ error: "تعذّر إرسال الرد" }, { status: 400 });
    }
    return NextResponse.json({ conversation });
  }

  if (!session?.user || session.user.role !== "follower") {
    return NextResponse.json(
      { error: "سجّل الدخول عبر Google لإرسال رسالة" },
      { status: 401 },
    );
  }

  if (await isBlocked(session.user.id)) {
    return NextResponse.json({ error: "لا يمكنك مراسلة هذه الصفحة" }, { status: 403 });
  }

  const conversation = await sendFollowerMessage({
    googleId: session.user.id,
    name: session.user.name || "متابع",
    email: session.user.email || "",
    image: session.user.image || "",
    text,
  });

  if (!conversation) {
    return NextResponse.json({ error: "تعذّر إرسال الرسالة" }, { status: 400 });
  }

  return NextResponse.json({ conversation }, { status: 201 });
}
