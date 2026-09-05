import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { readStore, updateProfile } from "@/lib/db";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ profile: store.profile });
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const profile = await updateProfile({
    displayName: body.displayName !== undefined ? String(body.displayName) : undefined,
    username: body.username !== undefined ? String(body.username) : undefined,
    bio: body.bio !== undefined ? String(body.bio) : undefined,
    avatarUrl: body.avatarUrl !== undefined ? String(body.avatarUrl) : undefined,
    coverUrl: body.coverUrl !== undefined ? String(body.coverUrl) : undefined,
    website: body.website !== undefined ? String(body.website) : undefined,
    location: body.location !== undefined ? String(body.location) : undefined,
    emailPublic: body.emailPublic !== undefined ? String(body.emailPublic) : undefined,
  });

  return NextResponse.json({ profile });
}
