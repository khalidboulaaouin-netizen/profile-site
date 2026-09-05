import { readStore } from "@/lib/db";
import { normalizeAdSenseClient } from "@/components/GoogleAdSense";

export const dynamic = "force-dynamic";

/** Required by Google AdSense for publisher verification (free). */
export async function GET() {
  const store = await readStore();
  const client = normalizeAdSenseClient(store.settings.adsenseClientId);
  const pub = client.replace(/^ca-/, "");

  const body = pub
    ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
    : "# Add your AdSense publisher ID in admin settings to enable ads.txt\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
