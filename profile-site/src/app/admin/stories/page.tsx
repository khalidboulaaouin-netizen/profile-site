"use client";

import { AdminNav } from "@/components/AdminNav";
import { FormEvent, useEffect, useState, useTransition } from "react";
import type { Highlight } from "@/lib/types";
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
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pinFor, setPinFor] = useState<string | null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [pending, startTransition] = useTransition();

  const load = async () => {
    const [storiesRes, settingsRes] = await Promise.all([
      fetch("/api/stories"),
      fetch("/api/settings"),
    ]);
    const storiesData = await storiesRes.json();
    const settingsData = await settingsRes.json();
    setStories(storiesData.stories || []);
    setHighlights(settingsData.highlights || []);
    const next = normalizeLocale(settingsData.settings?.language);
    setLocale(next);
    setT(getDictionary(next));
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError(t.chooseImage);
      return;
    }
    setError("");
    setNotice("");
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

  function onSaveToHighlight(storyId: string) {
    setError("");
    setNotice("");
    startTransition(async () => {
      try {
        const body =
          selectedHighlight === "__new__" || !selectedHighlight
            ? {
                action: "saveToHighlight",
                storyId,
                newTitle: newTitle.trim() || undefined,
              }
            : {
                action: "saveToHighlight",
                storyId,
                highlightId: selectedHighlight,
              };

        if ((selectedHighlight === "__new__" || !selectedHighlight) && !newTitle.trim() && selectedHighlight === "__new__") {
          // allow default title from API
        }

        const res = await fetch("/api/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            selectedHighlight && selectedHighlight !== "__new__"
              ? { action: "saveToHighlight", storyId, highlightId: selectedHighlight }
              : {
                  action: "saveToHighlight",
                  storyId,
                  newTitle: newTitle.trim() || undefined,
                },
          ),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t.saveFailed);
        setHighlights(data.highlights || []);
        setNotice(t.storySavedToHighlight);
        setPinFor(null);
        setSelectedHighlight("");
        setNewTitle("");
      } catch (err) {
        setError(err instanceof Error ? err.message : t.saveFailed);
      }
    });
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
          stats: t.stats,
          viewPage: t.viewPage,
          notifications: t.notifications,
          markAllRead: t.markAllRead,
          noNotifications: t.noNotifications,
          enableBrowserPush: t.enableBrowserPush,
        }}
      />

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
          {notice && <p className="hint" style={{ color: "var(--accent-deep, #0a5555)" }}>{notice}</p>}
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pinFor === story.id && (
                  <div className="form-stack" style={{ marginTop: "0.75rem" }}>
                    <label>
                      {t.chooseHighlight}
                      <select
                        value={selectedHighlight}
                        onChange={(e) => setSelectedHighlight(e.target.value)}
                      >
                        <option value="__new__">{t.createNewHighlight}</option>
                        {highlights.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.title} ({h.items?.length || 0} {t.highlightItemsCount})
                          </option>
                        ))}
                      </select>
                    </label>
                    {(selectedHighlight === "__new__" || !selectedHighlight) && (
                      <label>
                        {t.newHighlightTitle}
                        <input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder={t.newHighlightTitle}
                        />
                      </label>
                    )}
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={pending}
                      onClick={() => onSaveToHighlight(story.id)}
                    >
                      {t.saveStoryToHighlight}
                    </button>
                  </div>
                )}
              </div>
              <div className="actions">
                <button
                  className="btn btn-ghost"
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setPinFor(pinFor === story.id ? null : story.id);
                    setSelectedHighlight(highlights[0]?.id || "__new__");
                    setNotice("");
                    setError("");
                  }}
                >
                  {t.saveStoryToHighlight}
                </button>
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
