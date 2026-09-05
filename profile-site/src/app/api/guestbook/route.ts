import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import {
  addGuestbookEntry,
  deleteGuestbookEntry,
  isBlocked,
  readStore,
  setGuestbookHidden,
} from "@/lib/db";

export async function GET() {
  const store = await readStore();
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  const entries = (store.guestbook || [])
    .filter((e) => isAdmin || !e.hidden)
    .map((e) =>
      isAdmin
        ? e
        : {
            id: e.id,
            name: e.name,
            image: e.image,
            text: e.text,
            createdAt: e.createdAt,
          },
    );
  return NextResponse.json({
    enabled: store.settings.enableGuestbook !== false,
    entries,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "follower") {
    return NextResponse.json(
      { error: "سجّل الدخول عبر Google لتكتب على الجدار" },
      { status: 401 },
    );
  }
  if (await isBlocked(session.user.id)) {
    return NextResponse.json({ error: "لا يمكنك الكتابة هنا" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const entry = await addGuestbookEntry({
    googleId: session.user.id,
    name: session.user.name || "زائر",
    email: session.user.email || "",
    image: session.user.image || "",
    text: String(body.text || ""),
  });
  if (!entry) {
    return NextResponse.json({ error: "تعذّر حفظ الرسالة" }, { status: 400 });
  }
  return NextResponse.json({ entry }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });
  const ok = await setGuestbookHidden(id, Boolean(body.hidden));
  if (!ok) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });
  const ok = await deleteGuestbookEntry(id);
  if (!ok) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
