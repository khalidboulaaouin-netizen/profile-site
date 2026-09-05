"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { getDictionary, normalizeLocale, type Dictionary } from "@/lib/i18n";

type StoryItem = {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  expiresAt: string;
  viewerCount: number;
  viewers?: Array<{
    googleId: string;
    name: string;
    email: string;
    image: string;
    viewedAt: string;
  }>;
};

async function uploadFile(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

export default function AdminStoriesPage() {
  const [t, setT] = useState<Dictionary>(() => getDictionary("ar"));
  const [locale, setLocale] = useState("ar");
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = () =>
    fetch("/api/stories")
      .then((r) => r.json())
      .then((d) => setStories(d.stories || []));

  useEffect(() => {
    load();
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        const next = normalizeLocale(d.settings?.language);
        setLocale(next);
        setT(getDictionary(next));
      })
      .catch(() => undefined);
  }, []);

  function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError(t.chooseImage);
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        const imageUrl = await uploadFile(file);
        const res = await fetch("/api/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl, caption }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t.saveFailed);
        setCaption("");
        setFile(null);
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : t.saveFailed);
      }
    });
  }

  function onDelete(id: string) {
    if (!confirm(t.delete)) return;
    startTransition(async () => {
      await fetch(`/api/stories?id=${id}`, { method: "DELETE" });
      await load();
    });
  }

  return (
    <main className="admin-page">
      <nav className="admin-nav">
        <Link href="/admin">{t.overview}</Link>
        <Link href="/admin/posts">{t.posts}</Link>
        <Link href="/admin/stories" className="active">
          {t.stories}
        </Link>
        <Link href="/admin/settings">{t.settings}</Link>
        <Link href="/admin/followers">{t.followers}</Link>
        <Link href="/">{t.viewPage}</Link>
      </nav>

      <div className="panel">
        <h1>{t.publishStory}</h1>
        <p className="lede">{t.publishStoryLede}</p>
        <form className="form-stack" onSubmit={onCreate}>
          <label>
            {t.image}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </label>
          <label>
            {t.caption}
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} />
          </label>
          {error && <p className="hint">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? t.publishing : t.publishStory}
          </button>
        </form>
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2>{t.activeStories}</h2>
        <div className="admin-list">
          {stories.map((story) => (
            <div key={story.id} className="admin-item story-admin-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={story.imageUrl} alt="" />
              <div>
                <p style={{ margin: 0 }}>{story.caption || t.noCaption}</p>
                <small style={{ color: "var(--muted)" }}>
                  {new Date(story.createdAt).toLocaleString(locale)} · {t.expires}:{" "}
                  {new Date(story.expiresAt).toLocaleString(locale)}
                </small>
                <div style={{ marginTop: "0.4rem" }}>
                  <button
                    type="button"
                    className="btn-text"
                    onClick={() => setExpanded(expanded === story.id ? null : story.id)}
                  >
                    {t.storyViewers}: {story.viewerCount}
                  </button>
                </div>
                {expanded === story.id && (
                  <div className="viewer-list">
                    {(story.viewers || []).length === 0 && (
                      <p className="hint">{t.noStoryViewers}</p>
                    )}
                    {(story.viewers || []).map((v) => (
                      <div key={v.googleId} className="viewer-row">
                        {v.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={v.image} alt="" />
                        ) : (
                          <span className="viewer-fallback">{v.name.slice(0, 1)}</span>
                        )}
                        <div>
                          <strong>{v.name}</strong>
                          <small dir="ltr">{v.email}</small>
                          <div>
                            <small>
                              {t.since} {new Date(v.viewedAt).toLocaleString(locale)}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="actions">
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => onDelete(story.id)}
                  disabled={pending}
                >
                  {t.delete}
                </button>
              </div>
            </div>
          ))}
          {!stories.length && <p className="lede">{t.noStories}</p>}
        </div>
      </div>
    </main>
  );
}
