"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { Highlight, Profile, SiteSettings } from "@/lib/types";

async function uploadFile(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "فشل الرفع");
  return data.url as string;
}

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([p, s]) => {
      setProfile(p.profile);
      setSettings(s.settings);
      setHighlights(s.highlights || []);
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
    setMessage(res.ok ? "تم حفظ الملف الشخصي." : "تعذّر الحفظ.");
  }

  async function saveSettings(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...settings,
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
    setMessage(res.ok ? "تم حفظ إعدادات الموقع وSEO." : "تعذّر الحفظ.");
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
    setMessage(res.ok ? "تم حفظ أبرز اللحظات." : "تعذّر الحفظ.");
  }

  if (!profile || !settings) {
    return (
      <main className="admin-page">
        <div className="panel">تحميل الإعدادات...</div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <nav className="admin-nav">
        <Link href="/admin">نظرة عامة</Link>
        <Link href="/admin/posts">المنشورات</Link>
        <Link href="/admin/settings" className="active">
          الإعدادات
        </Link>
        <Link href="/admin/followers">المتابعون</Link>
        <Link href="/">عرض الصفحة</Link>
      </nav>

      {message && (
        <p className="panel" style={{ marginBottom: "1rem", color: "var(--accent-deep)" }}>
          {message}
        </p>
      )}

      <div className="panel">
        <h1>الملف الشخصي</h1>
        <p className="lede">الاسم، البايو، الصورة، والغلاف — كما في إنستغرام.</p>
        <form className="form-stack" onSubmit={saveProfile}>
          <label>
            الاسم الظاهر
            <input
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            />
          </label>
          <label>
            اسم المستخدم
            <input
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              dir="ltr"
            />
          </label>
          <label>
            النبذة
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </label>
          <label>
            الموقع
            <input
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            />
          </label>
          <label>
            الموقع الإلكتروني
            <input
              value={profile.website}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              dir="ltr"
            />
          </label>
          <label>
            صورة الملف
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
            صورة الغلاف
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
            حفظ الملف الشخصي
          </button>
        </form>
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2>إعدادات الموقع وGoogle</h2>
        <p className="lede">
          هذه الحقول تساعد Google على فهرسة صفحتك. بعد النشر على نطاقك، أضف الموقع في Google
          Search Console.
        </p>
        <form className="form-stack" onSubmit={saveSettings}>
          <label>
            اسم العلامة
            <input
              value={settings.brandName}
              onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
            />
          </label>
          <label>
            عنوان الصفحة (SEO)
            <input
              value={settings.siteTitle}
              onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
            />
          </label>
          <label>
            وصف Google
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
            />
          </label>
          <label>
            كلمات مفتاحية (مفصولة بفاصلة)
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
            السماح بالمتابعة عبر Google
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            حفظ إعدادات SEO
          </button>
        </form>
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2>أبرز اللحظات</h2>
        <form className="form-stack" onSubmit={saveHighlights}>
          {highlights.map((h, idx) => (
            <div key={h.id} className="form-stack" style={{ paddingBottom: "0.75rem" }}>
              <label>
                العنوان
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
                صورة الغلاف
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
            حفظ أبرز اللحظات
          </button>
        </form>
      </div>
    </main>
  );
}
