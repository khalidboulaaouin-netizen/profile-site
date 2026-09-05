import { MetadataRoute } from "next";
import { readStore } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const store = await readStore();
  const latest = store.posts[0]?.createdAt || new Date().toISOString();

  return [
    {
      url: base,
      lastModified: latest,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
