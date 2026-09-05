import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import {
  addQuestionAnswer,
  deleteQuestionAnswer,
  isBlocked,
  readStore,
  setQuestionAnswerHidden,
  updateDailyQuestion,
} from "@/lib/db";

export async function GET() {
  const store = await readStore();
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  const q = store.dailyQuestion;
  const answers = (q.answers || [])
    .filter((a) => isAdmin || !a.hidden)
    .map((a) =>
      isAdmin
        ? a
        : {
            id: a.id,
            name: a.name,
            image: a.image,
            text: a.text,
            createdAt: a.createdAt,
          },
    );
  return NextResponse.json({
    enabled: store.settings.enableDailyQuestion !== false,
    question: {
      text: q.text,
      updatedAt: q.updatedAt,
      active: q.active,
      answers,
    },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "follower") {
    return NextResponse.json(
      { error: "سجّل الدخول عبر Google للإجابة" },
      { status: 401 },
    );
  }
  if (await isBlocked(session.user.id)) {
    return NextResponse.json({ error: "لا يمكنك الإجابة هنا" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const answer = await addQuestionAnswer({
    googleId: session.user.id,
    name: session.user.name || "زائر",
    email: session.user.email || "",
    image: session.user.image || "",
    text: String(body.text || ""),
  });
  if (!answer) {
    return NextResponse.json({ error: "تعذّر حفظ الإجابة" }, { status: 400 });
  }
  return NextResponse.json({ answer }, { status: 201 });
}

export async function PUT(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await request.json().catch(() => ({}));
  const question = await updateDailyQuestion({
    text: body.text !== undefined ? String(body.text) : undefined,
    active: body.active !== undefined ? Boolean(body.active) : undefined,
    resetAnswers: Boolean(body.resetAnswers),
  });
  return NextResponse.json({ question });
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });
  const ok = await setQuestionAnswerHidden(id, Boolean(body.hidden));
  if (!ok) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });
  const ok = await deleteQuestionAnswer(id);
  if (!ok) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
