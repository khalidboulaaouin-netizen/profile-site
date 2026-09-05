import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { readStore } from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const store = await readStore();
  return NextResponse.json({
    followers: store.followers.map((f) => ({
      googleId: f.googleId,
      name: f.name,
      email: f.email,
      image: f.image,
      followedAt: f.followedAt,
    })),
  });
}
