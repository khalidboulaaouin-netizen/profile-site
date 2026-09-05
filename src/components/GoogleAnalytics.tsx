import Script from "next/script";

/** Free Google Analytics 4 loader — only renders when a Measurement ID is set. */
export function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  const id = String(measurementId || "").trim().toUpperCase();
  if (!/^G-[A-Z0-9]+$/.test(id)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-inline" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
