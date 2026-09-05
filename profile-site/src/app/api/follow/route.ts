import { NextResponse } from "next/server";
import { auth, isGoogleAuthConfigured } from "@/lib/auth";
import {
  followWithGoogle,
  unfollowByGoogleId,
  isFollowing,
  isBlocked,
  readStore,
} from "@/lib/db";

export async function GET() {
  const session = await auth();
  const store = await readStore();
  const googleId = session?.user?.role === "follower" ? session.user.id : null;
  const blocked = googleId ? await isBlocked(googleId) : false;
  const following = googleId && !blocked ? await isFollowing(googleId) : false;

  return NextResponse.json({
    count: store.followers.length,
    following,
    blocked,
    googleConfigured: isGoogleAuthConfigured(),
    allowFollow: store.settings.allowFollow,
  });
}

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "follower") {
    return NextResponse.json(
      { error: "يجب المتابعة عبر حساب Google فقط" },
      { status: 401 },
    );
  }

  if (await isBlocked(session.user.id)) {
    return NextResponse.json(
      { error: "لا يمكنك متابعة هذه الصفحة" },
      { status: 403 },
    );
  }

  const store = await readStore();
  if (!store.settings.allowFollow) {
    return NextResponse.json({ error: "المتابعة معطّلة حالياً" }, { status: 403 });
  }

  const result = await followWithGoogle({
    googleId: session.user.id,
    name: session.user.name || "متابع",
    email: session.user.email || "",
    image: session.user.image || "",
  });

  if (!result) {
    return NextResponse.json(
      { error: "لا يمكنك متابعة هذه الصفحة" },
      { status: 403 },
    );
  }

  return NextResponse.json(result);
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user || session.user.role !== "follower") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const ok = await unfollowByGoogleId(session.user.id);
  return NextResponse.json({ ok });
}
