"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Highlight, Profile, SiteSettings } from "@/lib/types";
import { LOCALES, getDictionary, normalizeLocale, type Dictionary } from "@/lib/i18n";

async function uploadFile(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [t, setT] = useState<Dictionary>(() => getDictionary("ar"));

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([p, s]) => {
      setProfile(p.profile);
      setSettings(s.settings);
      setHighlights(s.highlights || []);
      setT(getDictionary(s.settings?.language));
    });
  }, []);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setBusy(false);
    setMessage(res.ok ? t.savedProfile : t.saveFailed);
  }

  async function saveSettings(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setBusy(true);
    setMessage("");
    const nextLanguage = normalizeLocale(settings.language);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...settings,
        language: nextLanguage,
        seoKeywords:
          typeof settings.seoKeywords === "string"
            ? String(settings.seoKeywords)
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean)
            : settings.seoKeywords,
      }),
    });
    setBusy(false);
    if (res.ok) {
      const dict = getDictionary(nextLanguage);
      setT(dict);
      setMessage(dict.savedSettings);
      router.refresh();
      // Reload so <html lang/dir> updates for the whole app
      window.setTimeout(() => window.location.reload(), 400);
    } else {
      setMessage(t.saveFailed);
    }
  }

  async function saveHighlights(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ highlights }),
    });
    setBusy(false);
    setMessage(res.ok ? t.savedHighlights : t.saveFailed);
  }

  if (!profile || !settings) {
    return (
      <main className="admin-page">
        <div className="panel">{t.loadingSettings}</div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <nav className="admin-nav">
        <Link href="/admin">{t.overview}</Link>
        <Link href="/admin/posts">{t.posts}</Link>
        <Link href="/admin/settings" className="active">
          {t.settings}
        </Link>
        <Link href="/admin/followers">{t.followers}</Link>
        <Link href="/">{t.viewPage}</Link>
      </nav>

      {message && (
        <p className="panel" style={{ marginBottom: "1rem", color: "var(--accent-deep)" }}>
          {message}
        </p>
      )}

      <div className="panel">
        <h1>{t.profileSection}</h1>
        <p className="lede">{t.profileLede}</p>
        <form className="form-stack" onSubmit={saveProfile}>
          <label>
            {t.displayName}
            <input
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            />
          </label>
          <label>
            {t.username}
            <input
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              dir="ltr"
            />
          </label>
          <label>
            {t.bio}
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </label>
          <label>
            {t.location}
            <input
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            />
          </label>
          <label>
            {t.website}
            <input
              value={profile.website}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              dir="ltr"
            />
          </label>
          <label>
            {t.avatar}
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = await uploadFile(f);
                setProfile({ ...profile, avatarUrl: url });
              }}
            />
          </label>
          <label>
            {t.cover}
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = await uploadFile(f);
                setProfile({ ...profile, coverUrl: url });
              }}
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {t.saveProfile}
          </button>
        </form>
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2>{t.siteSettings}</h2>
        <p className="lede">{t.siteSettingsLede}</p>
        <form className="form-stack" onSubmit={saveSettings}>
          <label>
            {t.language}
            <select
              value={normalizeLocale(settings.language)}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            >
              {LOCALES.map((locale) => (
                <option key={locale.code} value={locale.code}>
                  {locale.nativeName} ({locale.name})
                </option>
              ))}
            </select>
          </label>
          <p className="lede" style={{ marginTop: "-0.35rem" }}>
            {t.languageHelp}
          </p>
          <label>
            {t.brandName}
            <input
              value={settings.brandName}
              onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
            />
          </label>
          <label>
            {t.siteTitle}
            <input
              value={settings.siteTitle}
              onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
            />
          </label>
          <label>
            {t.siteDescription}
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
            />
          </label>
          <label>
            {t.seoKeywords}
            <input
              value={settings.seoKeywords.join(", ")}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  seoKeywords: e.target.value
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={settings.allowFollow}
              onChange={(e) => setSettings({ ...settings, allowFollow: e.target.checked })}
            />
            {t.allowFollow}
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {t.saveSeo}
          </button>
        </form>
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2>{t.privacySection}</h2>
        <p className="lede">{t.privacyLede}</p>
        <form className="form-stack" onSubmit={saveSettings}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={Boolean(settings.verified)}
              onChange={(e) => setSettings({ ...settings, verified: e.target.checked })}
            />
            {t.verified}
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={Boolean(settings.hideFollowers)}
              onChange={(e) => setSettings({ ...settings, hideFollowers: e.target.checked })}
            />
            {t.hideFollowers}
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={settings.enableLikes !== false}
              onChange={(e) => setSettings({ ...settings, enableLikes: e.target.checked })}
            />
            {t.enableLikes}
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={settings.enableComments !== false}
              onChange={(e) => setSettings({ ...settings, enableComments: e.target.checked })}
            />
            {t.enableComments}
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {t.saveSeo}
          </button>
        </form>
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2>{t.highlightsSection}</h2>
        <form className="form-stack" onSubmit={saveHighlights}>
          {highlights.map((h, idx) => (
            <div key={h.id} className="form-stack" style={{ paddingBottom: "0.75rem" }}>
              <label>
                {t.highlightTitle}
                <input
                  value={h.title}
                  onChange={(e) => {
                    const next = [...highlights];
                    next[idx] = { ...h, title: e.target.value };
                    setHighlights(next);
                  }}
                />
              </label>
              <label>
                {t.highlightCover}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = await uploadFile(f);
                    const next = [...highlights];
                    next[idx] = { ...h, coverUrl: url };
                    setHighlights(next);
                  }}
                />
              </label>
            </div>
          ))}
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {t.saveHighlights}
          </button>
        </form>
      </div>
    </main>
  );
}
