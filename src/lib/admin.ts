import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return {
      session: null,
      error: NextResponse.json({ error: "غير مصرح" }, { status: 401 }),
    };
  }
  return { session, error: null };
}
