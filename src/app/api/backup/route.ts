import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { readStore, writeStore } from "@/lib/db";
import type { Store } from "@/lib/types";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const store = await readStore();
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    store,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="hodouri-backup-${Date.now()}.json"`,
    },
  });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const incoming = (body?.store || body) as Store | null;
  if (!incoming || typeof incoming !== "object" || !incoming.profile || !incoming.settings) {
    return NextResponse.json({ error: "ملف النسخة الاحتياطية غير صالح" }, { status: 400 });
  }

  await writeStore(incoming);
  const store = await readStore();
  return NextResponse.json({ ok: true, settings: store.settings, profile: store.profile });
}
