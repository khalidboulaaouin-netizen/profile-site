"use client";

import { AdminNav } from "@/components/AdminNav";
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
      <AdminNav
        labels={{
          overview: t.overview,
          posts: t.posts,
          stories: t.stories,
          messages: t.messages,
          settings: t.settings,
          followers: t.followers,
          viewPage: t.viewPage,
          notifications: t.notifications,
          markAllRead: t.markAllRead,
          noNotifications: t.noNotifications,
          enableBrowserPush: t.enableBrowserPush,
        }}
      />

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
          <p className="lede">{t.socialLinksHelp}</p>
          <label>
            {t.instagramUrl}
            <input
              value={profile.instagramUrl || ""}
              onChange={(e) => setProfile({ ...profile, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/..."
              dir="ltr"
            />
          </label>
          <label>
            {t.facebookUrl}
            <input
              value={profile.facebookUrl || ""}
              onChange={(e) => setProfile({ ...profile, facebookUrl: e.target.value })}
              placeholder="https://facebook.com/..."
              dir="ltr"
            />
          </label>
          <label>
            {t.tiktokUrl}
            <input
              value={profile.tiktokUrl || ""}
              onChange={(e) => setProfile({ ...profile, tiktokUrl: e.target.value })}
              placeholder="https://tiktok.com/@..."
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
                if (!f || !profile) return;
                setBusy(true);
                setMessage("");
                try {
                  const url = await uploadFile(f);
                  const next = { ...profile, avatarUrl: url };
                  setProfile(next);
                  const res = await fetch("/api/profile", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(next),
                  });
                  setMessage(res.ok ? t.savedProfile : t.saveFailed);
                } catch {
                  setMessage(t.uploadFailed);
                } finally {
                  setBusy(false);
                }
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
                if (!f || !profile) return;
                setBusy(true);
                setMessage("");
                try {
                  const url = await uploadFile(f);
                  const next = { ...profile, coverUrl: url };
                  setProfile(next);
                  const res = await fetch("/api/profile", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(next),
                  });
                  setMessage(res.ok ? t.savedProfile : t.saveFailed);
                } catch {
                  setMessage(t.uploadFailed);
                } finally {
                  setBusy(false);
                }
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
          <label>
            {t.publicSiteUrl}
            <input
              value={settings.publicSiteUrl || ""}
              onChange={(e) => setSettings({ ...settings, publicSiteUrl: e.target.value })}
              placeholder="https://your-site.vercel.app"
              dir="ltr"
            />
          </label>
          <p className="lede" style={{ marginTop: "-0.35rem" }}>
            {t.publicSiteUrlHelp}
          </p>
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
        <h2>{t.appearanceSection}</h2>
        <p className="lede">{t.appearanceLede}</p>
        <form className="form-stack" onSubmit={saveSettings}>
          <div>
            <p className="theme-label">{t.themePresets}</p>
            <div className="theme-presets">
              {(
                [
                  ["teal", t.presetTeal, "#0d6e6e", "#eef2f4", "soft"],
                  ["ocean", t.presetOcean, "#1d6fbf", "#eef3f8", "waves"],
                  ["forest", t.presetForest, "#2f6b3c", "#eef3ee", "mesh"],
                  ["sunset", t.presetSunset, "#b85a2a", "#f6efe8", "soft"],
                  ["rose", t.presetRose, "#9b3d5a", "#f7eef1", "dots"],
                  ["ink", t.presetInk, "#243447", "#eef1f4", "none"],
                ] as const
              ).map(([id, label, accent, background, decoration]) => (
                <button
                  key={id}
                  type="button"
                  className={`theme-preset ${
                    settings.accentColor?.toLowerCase() === accent &&
                    settings.backgroundColor?.toLowerCase() === background
                      ? "active"
                      : ""
                  }`}
                  style={
                    {
                      "--preset-accent": accent,
                      "--preset-bg": background,
                    } as React.CSSProperties
                  }
                  onClick={() =>
                    setSettings({
                      ...settings,
                      accentColor: accent,
                      backgroundColor: background,
                      decoration,
                    })
                  }
                >
                  <span className="theme-preset-swatch" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="theme-colors">
            <label>
              {t.accentColor}
              <input
                type="color"
                value={settings.accentColor || "#0d6e6e"}
                onChange={(e) =>
                  setSettings({ ...settings, accentColor: e.target.value })
                }
              />
            </label>
            <label>
              {t.backgroundColor}
              <input
                type="color"
                value={settings.backgroundColor || "#eef2f4"}
                onChange={(e) =>
                  setSettings({ ...settings, backgroundColor: e.target.value })
                }
              />
            </label>
          </div>

          <label>
            {t.decorationStyle}
            <select
              value={settings.decoration || "soft"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  decoration: e.target.value as SiteSettings["decoration"],
                })
              }
            >
              <option value="soft">{t.decorationSoft}</option>
              <option value="mesh">{t.decorationMesh}</option>
              <option value="dots">{t.decorationDots}</option>
              <option value="waves">{t.decorationWaves}</option>
              <option value="none">{t.decorationNone}</option>
            </select>
          </label>

          <label>
            {t.colorModeDefault}
            <select
              value={settings.colorMode || "system"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  colorMode: e.target.value as SiteSettings["colorMode"],
                })
              }
            >
              <option value="system">{t.themeSystem}</option>
              <option value="light">{t.themeLight}</option>
              <option value="dark">{t.themeDark}</option>
            </select>
          </label>

          <button className="btn btn-primary" type="submit" disabled={busy}>
            {t.saveAppearance}
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
              checked={Boolean(settings.hideFollowing)}
              onChange={(e) => setSettings({ ...settings, hideFollowing: e.target.checked })}
            />
            {t.hideFollowing}
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
          <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={Boolean(settings.showReadReceipts)}
              onChange={(e) =>
                setSettings({ ...settings, showReadReceipts: e.target.checked })
              }
              style={{ marginTop: "0.2rem" }}
            />
            <span>
              {t.showReadReceipts}
              <span className="lede" style={{ display: "block", marginTop: "0.25rem" }}>
                {t.showReadReceiptsHelp}
              </span>
            </span>
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {t.saveSeo}
          </button>
        </form>
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2>{t.backupSection}</h2>
        <p className="lede">{t.backupLede}</p>
        <div className="form-stack backup-actions">
          <button
            className="btn btn-primary"
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setMessage("");
              try {
                const res = await fetch("/api/backup");
                if (!res.ok) throw new Error("export failed");
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `profile-backup-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                setMessage(t.backupExported);
              } catch {
                setMessage(t.backupFailed);
              } finally {
                setBusy(false);
              }
            }}
          >
            {t.exportBackup}
          </button>
          <label className="btn">
            {t.importBackup}
            <input
              type="file"
              accept="application/json,.json"
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setBusy(true);
                setMessage("");
                try {
                  const text = await file.text();
                  const parsed = JSON.parse(text);
                  const res = await fetch("/api/backup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(parsed),
                  });
                  if (!res.ok) throw new Error("import failed");
                  setMessage(t.backupImported);
                  window.setTimeout(() => window.location.reload(), 500);
                } catch {
                  setMessage(t.backupFailed);
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
        </div>
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
              <p className="lede" style={{ marginTop: "-0.35rem" }}>
                {(h.items?.length || 0)} {t.highlightItemsCount}
              </p>
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
