import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  readStore,
  updateSettings,
  setHighlights,
  StoreUnavailableError,
} from "@/lib/db";
import { normalizeDecoration } from "@/lib/theme";

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

  try {
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
      hideFollowing: body.hideFollowing !== undefined ? Boolean(body.hideFollowing) : undefined,
      enableLikes: body.enableLikes !== undefined ? Boolean(body.enableLikes) : undefined,
      enableComments:
        body.enableComments !== undefined ? Boolean(body.enableComments) : undefined,
      accentColor: body.accentColor !== undefined ? String(body.accentColor) : undefined,
      backgroundColor:
        body.backgroundColor !== undefined ? String(body.backgroundColor) : undefined,
      decoration:
        body.decoration !== undefined ? normalizeDecoration(String(body.decoration)) : undefined,
      showReadReceipts:
        body.showReadReceipts !== undefined ? Boolean(body.showReadReceipts) : undefined,
      publicSiteUrl:
        body.publicSiteUrl !== undefined ? String(body.publicSiteUrl).trim() : undefined,
      colorMode:
        body.colorMode === "light" || body.colorMode === "dark" || body.colorMode === "system"
          ? body.colorMode
          : undefined,
      gaMeasurementId:
        body.gaMeasurementId !== undefined ? String(body.gaMeasurementId).trim() : undefined,
      adsenseClientId:
        body.adsenseClientId !== undefined ? String(body.adsenseClientId).trim() : undefined,
      adsenseSlotId:
        body.adsenseSlotId !== undefined ? String(body.adsenseSlotId).trim() : undefined,
      enableGuestbook:
        body.enableGuestbook !== undefined ? Boolean(body.enableGuestbook) : undefined,
      enableDailyQuestion:
        body.enableDailyQuestion !== undefined ? Boolean(body.enableDailyQuestion) : undefined,
    });

    return NextResponse.json({ settings });
  } catch (err) {
    const message =
      err instanceof StoreUnavailableError
        ? err.message
        : err instanceof Error
          ? err.message
          : "تعذّر الحفظ";
    const status = err instanceof StoreUnavailableError ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
