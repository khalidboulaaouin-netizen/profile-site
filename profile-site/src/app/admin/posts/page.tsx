"use client";

import { AdminNav } from "@/components/AdminNav";
import { FormEvent, useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import type { Post } from "@/lib/types";
import { getDictionary, normalizeLocale, type Dictionary } from "@/lib/i18n";

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

type PublishKind = "media" | "text";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [kind, setKind] = useState<PublishKind>("media");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [locale, setLocale] = useState("ar");
  const [t, setT] = useState<Dictionary>(() => getDictionary("ar"));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoCoverInputRef = useRef<HTMLInputElement>(null);
  const [videoCoverFile, setVideoCoverFile] = useState<File | null>(null);

  const load = () =>
    fetch("/api/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []));

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

  function resolveSelectedFile(input: HTMLInputElement | null): File | null {
    const fromDom = input?.files?.[0] || null;
    if (fromDom) {
      setFile(fromDom);
      return fromDom;
    }
    return file;
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (kind === "text") {
        const text = caption.trim();
        if (!text) {
          setError(t.chooseArticleText);
          setBusy(false);
          return;
        }
        const selected = resolveSelectedFile(coverInputRef.current);
        let imageUrl = "";
        if (selected) {
          const uploaded = await uploadFile(selected);
          imageUrl = uploaded.url;
        }
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl,
            mediaType: "text",
            caption: text,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || t.saveFailed);
        }
      } else {
        const selected = resolveSelectedFile(fileInputRef.current);
        if (!selected || selected.size <= 0) {
          setError(t.chooseMedia);
          setBusy(false);
          return;
        }
        const uploaded = await uploadFile(selected);
        let coverUrl = "";
        if (uploaded.mediaType === "video") {
          const coverSelected =
            videoCoverFile || resolveSelectedFile(videoCoverInputRef.current);
          if (coverSelected && coverSelected.size > 0) {
            if (isVideoFile(coverSelected)) {
              throw new Error(t.videoCoverOptional);
            }
            const coverUploaded = await uploadFile(coverSelected);
            coverUrl = coverUploaded.url;
          }
        }
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: uploaded.url,
            mediaType: uploaded.mediaType,
            caption,
            coverUrl: coverUrl || undefined,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || t.saveFailed);
        }
      }
      setCaption("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (coverInputRef.current) coverInputRef.current.value = "";
      if (videoCoverInputRef.current) videoCoverInputRef.current.value = "";
      setVideoCoverFile(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.saveFailed);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm(t.delete)) return;
    await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
    await load();
  }

  async function onToggleHidden(post: Post) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, hidden: !post.hidden }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.saveFailed);
      setPosts((prev) => prev.map((p) => (p.id === post.id ? data.post : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.saveFailed);
    } finally {
      setBusy(false);
    }
  }

  function switchKind(next: PublishKind) {
    setKind(next);
    setFile(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
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
        <h1>{t.publishPost}</h1>
        <p className="lede">{t.publishLede}</p>

        <form className="form-stack" onSubmit={onCreate}>
          <fieldset className="publish-kind">
            <legend>{t.publishKind}</legend>
            <label className="publish-kind-option">
              <input
                type="radio"
                name="publishKind"
                checked={kind === "media"}
                onChange={() => switchKind("media")}
              />
              {t.publishKindMedia}
            </label>
            <label className="publish-kind-option">
              <input
                type="radio"
                name="publishKind"
                checked={kind === "text"}
                onChange={() => switchKind("text")}
              />
              {t.publishKindText}
            </label>
          </fieldset>

          {kind === "media" ? (
            <>
              <label>
                {t.mediaFile}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              {file ? (
                <p className="lede" style={{ marginTop: "-0.35rem" }}>
                  ✓ {file.name} (
                  {file.size >= 1024 * 1024
                    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                    : `${Math.max(1, Math.round(file.size / 1024))} KB`}
                  )
                </p>
              ) : null}
              <p className="lede" style={{ marginTop: "-0.35rem" }}>
                {t.mediaHelp}
              </p>
              {file && isVideoFile(file) ? (
                <>
                  <label>
                    {t.videoCoverOptional}
                    <input
                      ref={videoCoverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setVideoCoverFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {videoCoverFile ? (
                    <p className="lede" style={{ marginTop: "-0.35rem" }}>
                      ✓ {videoCoverFile.name}
                    </p>
                  ) : null}
                  <p className="lede" style={{ marginTop: "-0.35rem" }}>
                    {t.videoCoverHelp}
                  </p>
                </>
              ) : null}
              <label>
                {t.caption}
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  maxLength={2200}
                />
              </label>
            </>
          ) : (
            <>
              <label>
                {t.articleBody}
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={12}
                  maxLength={20000}
                  required
                  placeholder={t.articlePlaceholder}
                />
              </label>
              <p className="lede" style={{ marginTop: "-0.35rem" }}>
                {t.articleHelp}
              </p>
              <label>
                {t.articleCoverOptional}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </>
          )}

          {error ? <p className="hint">{error}</p> : null}
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? t.publishing : t.publish}
          </button>
        </form>
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2>{t.currentPosts}</h2>
        <div className="admin-list">
          {posts.map((post) => (
            <div key={post.id} className={`admin-item ${post.hidden ? "is-hidden" : ""}`}>
              {post.mediaType === "text" ? (
                post.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.imageUrl} alt="" />
                ) : (
                  <div className="admin-text-thumb" aria-hidden>
                    ✎
                  </div>
                )
              ) : post.mediaType === "video" ? (
                post.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverUrl} alt="" />
                ) : (
                  <video src={post.imageUrl} muted playsInline preload="metadata" />
                )
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.imageUrl} alt="" />
              )}
              <div>
                <p style={{ margin: 0 }}>
                  {post.mediaType === "video" && (
                    <span className="reel-badge">{t.reelBadge}</span>
                  )}{" "}
                  {post.mediaType === "text" && (
                    <span className="article-badge">{t.articleBadge}</span>
                  )}{" "}
                  {post.hidden && <span className="hidden-badge">{t.hiddenBadge}</span>}{" "}
                  {post.caption
                    ? post.caption.length > 140
                      ? `${post.caption.slice(0, 140)}…`
                      : post.caption
                    : t.noCaption}
                </p>
                <small style={{ color: "var(--muted)" }}>
                  {new Date(post.createdAt).toLocaleString(locale)}
                </small>
              </div>
              <div className="actions">
                <button
                  className="btn btn-ghost"
                  type="button"
                  disabled={busy}
                  onClick={() => onToggleHidden(post)}
                >
                  {post.hidden ? t.showPost : t.hidePost}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => onDelete(post.id)}>
                  {t.delete}
                </button>
              </div>
            </div>
          ))}
          {!posts.length && <p className="lede">{t.noPostsYet}</p>}
        </div>
      </div>
    </main>
  );
}
