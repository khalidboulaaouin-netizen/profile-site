import Script from "next/script";

/** Loads AdSense only when a free publisher client ID is configured. */
export function GoogleAdSense({ clientId }: { clientId?: string }) {
  const client = normalizeAdSenseClient(clientId);
  if (!client) return null;

  return (
    <Script
      id="adsense-loader"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

export function normalizeAdSenseClient(value?: string | null): string {
  const raw = String(value || "").trim().toLowerCase();
  const match = raw.match(/ca-pub-\d{10,20}/);
  return match ? match[0] : "";
}

export function normalizeAdSenseSlot(value?: string | null): string {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 6 ? digits.slice(0, 16) : "";
}
