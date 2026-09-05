"use client";

import { AdminNav } from "@/components/AdminNav";
import { FormEvent, useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import type { Post } from "@/lib/types";
import { getDictionary, normalizeLocale, type Dictionary } from "@/lib/i18n";

async function uploadViaApi(
  file: File,
): Promise<{ url: string; mediaType: "image" | "video" }> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return {
    url: data.url as string,
    mediaType: data.mediaType === "video" ? "video" : "image",
  };
}

function isVideoFile(file: File) {
  const mime = (file.type || "").toLowerCase();
  if (mime.startsWith("video/")) return true;
  return /\.(mp4|webm|mov|m4v)$/i.test(file.name);
}

async function uploadFile(
  file: File,
): Promise<{ url: string; mediaType: "image" | "video" }> {
  const mediaType = isVideoFile(file) ? "video" : "image";
  // Direct-to-Blob for videos / larger files (avoids Vercel ~4.5MB API body limit)
  const useClientBlob = mediaType === "video" || file.size > 3.5 * 1024 * 1024;

  if (useClientBlob) {
    try {
      const ext =
        file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
        (mediaType === "video" ? "mp4" : "jpg");
      const pathname = `uploads/${crypto.randomUUID()}.${ext}`;
      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
        contentType:
          file.type || (mediaType === "video" ? "video/mp4" : "image/jpeg"),
        multipart: file.size > 8 * 1024 * 1024,
      });
      return { url: blob.url, mediaType };
    } catch {
      return uploadViaApi(file);
    }
  }

  return uploadViaApi(file);
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
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: uploaded.url,
            mediaType: uploaded.mediaType,
            caption,
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
                <video src={post.imageUrl} muted playsInline preload="metadata" />
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
