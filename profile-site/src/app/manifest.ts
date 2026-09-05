import type { MetadataRoute } from "next";
import { readStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const store = await readStore();
  const name = store.settings.brandName || store.profile.displayName || "ملفي";
  const shortName = name.slice(0, 12);
  const lang = store.settings.language || "ar";

  return {
    id: "/",
    name,
    short_name: shortName,
    description:
      store.settings.siteDescription ||
      "افتح صفحتك كتطبيق على الهاتف للنشر والإعدادات مباشرة.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#fafafa",
    theme_color: "#0095f6",
    lang,
    dir: lang === "ar" || lang === "ur" ? "rtl" : "ltr",
    categories: ["social", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
