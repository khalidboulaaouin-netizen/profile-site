import type { Metadata } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Providers } from "@/components/Providers";
import { readStore } from "@/lib/db";
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
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

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
      locale: "ar_AR",
      title,
      description,
      siteName: store.settings.brandName,
      images: store.profile.avatarUrl
        ? [{ url: store.profile.avatarUrl }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} ${ibm.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
