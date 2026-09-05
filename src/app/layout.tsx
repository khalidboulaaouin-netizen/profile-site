import type { Metadata } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { GoogleAdSense } from "@/components/GoogleAdSense";
import { Providers } from "@/components/Providers";
import { readStore } from "@/lib/db";
import { getLocaleMeta, getOgLocale } from "@/lib/i18n";
import { getPublicSiteUrl, toAbsoluteUrl } from "@/lib/site-url";
import { themeCssVars } from "@/lib/theme";
import "./globals.css";

export const dynamic = "force-dynamic";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["600", "700", "800"],
});

const ibm = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const store = await readStore();
  const title = store.settings.siteTitle;
  const description = store.settings.siteDescription;
  const siteUrl = getPublicSiteUrl(store.settings);
  const ogImages = [
    store.profile.coverUrl,
    store.profile.avatarUrl,
    ...store.posts.filter((p) => !p.hidden).slice(0, 4).map((p) => p.imageUrl),
  ]
    .filter(Boolean)
    .map((url) => ({ url: toAbsoluteUrl(String(url), siteUrl) }));

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${store.settings.brandName}`,
    },
    description,
    keywords: store.settings.seoKeywords,
    authors: [{ name: store.profile.displayName }],
    openGraph: {
      type: "profile",
      locale: getOgLocale(store.settings.language),
      title,
      description,
      siteName: store.settings.brandName,
      url: siteUrl,
      images: ogImages.length ? ogImages : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.length ? [ogImages[0].url] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    alternates: {
      canonical: "/",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = await readStore();
  const locale = getLocaleMeta(store.settings.language);
  const themeVars = themeCssVars(store.settings);
  const colorMode = store.settings.colorMode || "system";
  const gaId = store.settings.gaMeasurementId || "";
  const adsenseClient = store.settings.adsenseClientId || "";

  const colorBootScript = `
(function(){
  try {
    var saved = localStorage.getItem('hodouri-color-mode');
    var mode = (saved === 'light' || saved === 'dark' || saved === 'system') ? saved : ${JSON.stringify(colorMode)};
    var applied = mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    document.documentElement.dataset.colorMode = applied;
  } catch (e) {}
})();`;

  return (
    <html lang={locale.code} dir={locale.dir} data-color-mode={colorMode === "dark" ? "dark" : "light"}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: colorBootScript }} />
        {adsenseClient ? (
          <meta name="google-adsense-account" content={adsenseClient} />
        ) : null}
        <GoogleAnalytics measurementId={gaId} />
        <GoogleAdSense clientId={adsenseClient} />
      </head>
      <body
        className={`${cairo.variable} ${ibm.variable} antialiased`}
        data-decoration={themeVars["--decoration"]}
        data-color-mode={colorMode === "dark" ? "dark" : undefined}
        style={themeVars as React.CSSProperties}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
