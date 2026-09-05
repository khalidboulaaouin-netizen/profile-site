import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { readStore, updateSettings, setHighlights } from "@/lib/db";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({
    settings: store.settings,
    highlights: store.highlights,
  });
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();

  if (body.highlights) {
    const highlights = await setHighlights(body.highlights);
    return NextResponse.json({ highlights });
  }

  const settings = await updateSettings({
    siteTitle: body.siteTitle !== undefined ? String(body.siteTitle) : undefined,
    siteDescription:
      body.siteDescription !== undefined ? String(body.siteDescription) : undefined,
    seoKeywords: Array.isArray(body.seoKeywords)
      ? body.seoKeywords.map(String)
      : undefined,
    allowFollow: body.allowFollow !== undefined ? Boolean(body.allowFollow) : undefined,
    brandName: body.brandName !== undefined ? String(body.brandName) : undefined,
    contactEmail: body.contactEmail !== undefined ? String(body.contactEmail) : undefined,
    language: body.language !== undefined ? String(body.language) : undefined,
    verified: body.verified !== undefined ? Boolean(body.verified) : undefined,
    hideFollowers: body.hideFollowers !== undefined ? Boolean(body.hideFollowers) : undefined,
    enableLikes: body.enableLikes !== undefined ? Boolean(body.enableLikes) : undefined,
    enableComments:
      body.enableComments !== undefined ? Boolean(body.enableComments) : undefined,
  });

  return NextResponse.json({ settings });
}
