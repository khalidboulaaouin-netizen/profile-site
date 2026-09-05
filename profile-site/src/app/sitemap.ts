import type { MetadataRoute } from "next";
import { readStore } from "@/lib/db";
import { getPublicSiteUrl, toAbsoluteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const store = await readStore();
  const base = getPublicSiteUrl(store.settings);
  const publicPosts = store.posts.filter((p) => !p.hidden);
  const latest =
    publicPosts[0]?.createdAt ||
    store.stories[0]?.createdAt ||
    new Date().toISOString();

  const images = [
    store.profile.avatarUrl,
    store.profile.coverUrl,
    ...publicPosts.map((p) => p.imageUrl),
    ...store.highlights.flatMap((h) => [h.coverUrl, ...h.items.map((i) => i.imageUrl)]),
  ]
    .filter(Boolean)
    .map((url) => toAbsoluteUrl(String(url), base));

  return [
    {
      url: base,
      lastModified: latest,
      changeFrequency: "daily",
      priority: 1,
      // Next.js typed sitemap supports images in newer versions; keep as extra fields for crawlers
      images: images.slice(0, 50),
    } as MetadataRoute.Sitemap[number],
  ];
}
