"use client";

import { AdminNav } from "@/components/AdminNav";
import { upload } from "@vercel/blob/client";
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
  mediaType?: "image" | "video";
  viewers?: Array<{
    googleId: string;
    name: string;
    email: string;
    image: string;
    viewedAt: string;
  }>;
};

const SERVER_UPLOAD_MAX = 3.5 * 1024 * 1024;

async function uploadViaApi(
  file: File,
): Promise<{ url: string; mediaType: "image" | "video" }> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  let data: { error?: string; url?: string; mediaType?: string } = {};
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    throw new Error(data.error || `فشل الرفع (${res.status})`);
  }
  if (!data.url) throw new Error("لم يُرجع الخادم رابط الملف");
  return {
    url: data.url,
    mediaType: data.mediaType === "video" ? "video" : "image",
  };
}

function isVideoFile(file: File) {
  const mime = (file.type || "").toLowerCase();
  if (mime.startsWith("video/")) return true;
  return /\.(mp4|webm|mov|m4v)$/i.test(file.name);
}

function resolveContentType(file: File, mediaType: "image" | "video") {
  const mime = (file.type || "").toLowerCase().trim();
  if (mime && mime !== "application/octet-stream") return mime;
  if (mediaType === "video") {
    if (/\.webm$/i.test(file.name)) return "video/webm";
    if (/\.mov$/i.test(file.name)) return "video/quicktime";
    if (/\.m4v$/i.test(file.name)) return "video/x-m4v";
    return "video/mp4";
  }
  if (/\.png$/i.test(file.name)) return "image/png";
  if (/\.webp$/i.test(file.name)) return "image/webp";
  if (/\.gif$/i.test(file.name)) return "image/gif";
  return "image/jpeg";
}

async function uploadViaClientBlob(
  file: File,
  mediaType: "image" | "video",
): Promise<{ url: string; mediaType: "image" | "video" }> {
  const ext =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    (mediaType === "video" ? "mp4" : "jpg");
  const pathname = `uploads/${crypto.randomUUID()}.${ext}`;
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
        contentType: resolveContentType(file, mediaType),
        multipart: file.size > 4 * 1024 * 1024,
      });
      if (!blob.url) throw new Error("لم يُرجع Blob رابطاً");
      return { url: blob.url, mediaType };
    } catch (err) {
      lastError = err;
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 400 + attempt * 600));
      }
    }
  }
  const message =
    lastError instanceof Error ? lastError.message : "فشل رفع الملف إلى Blob";
  throw new Error(message);
}

async function uploadFile(
  file: File,
): Promise<{ url: string; mediaType: "image" | "video" }> {
  const mediaType = isVideoFile(file) ? "video" : "image";
  // Direct-to-Blob for videos / larger files (avoids Vercel ~4.5MB API body limit).
  // Never silently fall back for those — the API route cannot accept them.
  if (mediaType === "video" || file.size > SERVER_UPLOAD_MAX) {
    return uploadViaClientBlob(file, mediaType);
  }

  try {
    return await uploadViaApi(file);
  } catch {
    return uploadViaClientBlob(file, mediaType);
  }
}


function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url || "");
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
      setError(t.chooseMedia);
      return;
    }
    setError("");
    setNotice("");
    startTransition(async () => {
      try {
        const uploaded = await uploadFile(file);
        const res = await fetch("/api/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: uploaded.url,
            caption,
            mediaType: uploaded.mediaType,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t.saveFailed);
        setCaption("");
        setFile(null);
        setNotice(t.storyPublished || t.publishStory);
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

  function persistHighlights(next: Highlight[]) {
    setHighlights(next);
    startTransition(async () => {
      try {
        const res = await fetch("/api/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ highlights: next }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t.saveFailed);
        setHighlights(data.highlights || next);
        setNotice(t.savedHighlights);
      } catch (err) {
        setError(err instanceof Error ? err.message : t.saveFailed);
        await load();
      }
    });
  }

  function onDeleteHighlight(id: string) {
    if (!confirm(t.deleteHighlightConfirm || t.delete)) return;
    persistHighlights(highlights.filter((h) => h.id !== id));
  }

  function onDeleteHighlightItem(highlightId: string, itemId: string) {
    if (!confirm(t.deleteHighlightItemConfirm || t.delete)) return;
    const next = highlights
      .map((h) => {
        if (h.id !== highlightId) return h;
        const items = (h.items || []).filter((i) => i.id !== itemId);
        const coverUrl =
          h.coverUrl && items.some((i) => i.imageUrl === h.coverUrl)
            ? h.coverUrl
            : items[0]?.imageUrl || h.coverUrl;
        return { ...h, items, coverUrl };
      })
      .filter((h) => (h.items?.length || 0) > 0 || h.title);
    // Keep empty highlights only if user didn't wipe all items — drop empties
    persistHighlights(next.filter((h) => (h.items?.length || 0) > 0));
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
          community: t.community,
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
            {t.chooseMedia}
            <input
              type="file"
              accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </label>
          {file && (
            <p className="hint">
              {file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB
            </p>
          )}
          <label>
            {t.caption}
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} />
          </label>
          {error && <p className="hint">{error}</p>}
          {notice && (
            <p className="hint" style={{ color: "var(--accent-deep, #0a5555)" }}>
              {notice}
            </p>
          )}
          <button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? t.publishing : t.publishStory}
          </button>
        </form>
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2>{t.activeStories}</h2>
        <div className="admin-list">
          {stories.map((story) => {
            const video =
              story.mediaType === "video" || isVideoUrl(story.imageUrl);
            return (
              <div key={story.id} className="admin-item story-admin-item">
                {video ? (
                  <video src={story.imageUrl} muted playsInline preload="metadata" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={story.imageUrl} alt="" />
                )}
                <div>
                  <p style={{ margin: 0 }}>{story.caption || t.noCaption}</p>
                  <small style={{ color: "var(--muted)" }}>
                    {video ? "فيديو · " : ""}
                    {new Date(story.createdAt).toLocaleString(locale)} · {t.expires}:{" "}
                    {new Date(story.expiresAt).toLocaleString(locale)}
                  </small>
                  <div style={{ marginTop: "0.4rem" }}>
                    <button
                      type="button"
                      className="btn-text"
                      onClick={() =>
                        setExpanded(expanded === story.id ? null : story.id)
                      }
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
                            <span className="viewer-fallback">
                              {v.name.slice(0, 1)}
                            </span>
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
                              {h.title} ({h.items?.length || 0}{" "}
                              {t.highlightItemsCount})
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
            );
          })}
          {!stories.length && <p className="lede">{t.noStories}</p>}
        </div>
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2>{t.highlightsSection}</h2>
        <p className="lede">{t.manageHighlightsLede}</p>
        <div className="admin-list">
          {highlights.map((h) => (
            <div key={h.id} className="admin-item" style={{ alignItems: "flex-start" }}>
              {isVideoUrl(h.coverUrl) ? (
                <video src={h.coverUrl} muted playsInline preload="metadata" />
              ) : h.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={h.coverUrl} alt="" />
              ) : (
                <span className="viewer-fallback">{h.title.slice(0, 1)}</span>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0 }}>
                  <strong>{h.title}</strong> · {(h.items?.length || 0)}{" "}
                  {t.highlightItemsCount}
                </p>
                <div className="highlight-items-admin" style={{ marginTop: "0.5rem" }}>
                  {(h.items || []).map((item) => {
                    const video =
                      item.mediaType === "video" || isVideoUrl(item.imageUrl);
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                          marginBottom: "0.35rem",
                        }}
                      >
                        {video ? (
                          <video
                            src={item.imageUrl}
                            muted
                            playsInline
                            preload="metadata"
                            style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8 }}
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt=""
                            style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8 }}
                          />
                        )}
                        <span style={{ flex: 1, fontSize: "0.85rem" }}>
                          {(item.caption || "").slice(0, 40) || (video ? "فيديو" : "صورة")}
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          disabled={pending}
                          onClick={() => onDeleteHighlightItem(h.id, item.id)}
                        >
                          {t.delete}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={pending}
                  onClick={() => onDeleteHighlight(h.id)}
                >
                  {t.deleteHighlight || t.delete}
                </button>
              </div>
            </div>
          ))}
          {!highlights.length && <p className="lede">{t.noHighlightsYet}</p>}
        </div>
      </div>
    </main>
  );
}
