import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { blockUser, isBlocked, listBlockedUsers, unblockUser } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (session?.user?.role === "follower") {
    const blocked = await isBlocked(session.user.id);
    return NextResponse.json({ blocked });
  }

  const { error } = await requireAdmin();
  if (error) return error;

  const blockedUsers = await listBlockedUsers();
  return NextResponse.json({ blockedUsers });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const googleId = String(body.googleId || "").trim();
  if (!googleId) {
    return NextResponse.json({ error: "googleId required" }, { status: 400 });
  }

  const blocked = await blockUser({
    googleId,
    name: String(body.name || ""),
    email: String(body.email || ""),
    image: String(body.image || ""),
  });

  if (!blocked) {
    return NextResponse.json({ error: "Could not block user" }, { status: 400 });
  }

  return NextResponse.json({ blocked }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const googleId = searchParams.get("googleId") || "";
  if (!googleId) {
    return NextResponse.json({ error: "googleId required" }, { status: 400 });
  }

  const ok = await unblockUser(googleId);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
