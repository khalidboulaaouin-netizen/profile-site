import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin";
import { getAnalyticsSummary, recordPageVisit } from "@/lib/db";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const days = Number(url.searchParams.get("days") || 30);
  const summary = await getAnalyticsSummary(days);
  return NextResponse.json(summary);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const headerList = await headers();
  const country =
    headerList.get("x-vercel-ip-country") ||
    headerList.get("cf-ipcountry") ||
    "ZZ";

  const rawVisitor = String(body.visitorId || "").slice(0, 80);
  const ua = headerList.get("user-agent") || "";
  const visitorHash = createHash("sha256")
    .update(`${rawVisitor}|${ua.slice(0, 80)}`)
    .digest("hex")
    .slice(0, 24);

  await recordPageVisit({ visitorHash, countryCode: country });
  return NextResponse.json({ ok: true });
}
