import type { SiteSettings } from "./types";

/** Prefer free public URL from settings, else env, else localhost. */
export function getPublicSiteUrl(settings?: Pick<SiteSettings, "publicSiteUrl"> | null): string {
  const fromSettings = String(settings?.publicSiteUrl || "").trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(fromSettings)) return fromSettings;
  const fromEnv = String(process.env.NEXTAUTH_URL || "").trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(fromEnv)) return fromEnv;
  return "http://localhost:3000";
}

export function toAbsoluteUrl(pathOrUrl: string, base: string): string {
  const value = String(pathOrUrl || "").trim();
  if (!value) return base;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${base}${value}`;
  return `${base}/${value}`;
}
