"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { Post } from "@/lib/types";
import { getDictionary, normalizeLocale, type Dictionary } from "@/lib/i18n";

async function uploadFile(
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

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [locale, setLocale] = useState("ar");
  const [t, setT] = useState<Dictionary>(() => getDictionary("ar"));

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

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError(t.chooseMedia);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const uploaded = await uploadFile(file);
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
      setCaption("");
      setFile(null);
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

  return (
    <main className="admin-page">
      <nav className="admin-nav">
        <Link href="/admin">{t.overview}</Link>
        <Link href="/admin/posts" className="active">
          {t.posts}
        </Link>
        <Link href="/admin/stories">{t.stories}</Link>
        <Link href="/admin/messages">{t.messages}</Link>
        <Link href="/admin/settings">{t.settings}</Link>
        <Link href="/admin/followers">{t.followers}</Link>
        <Link href="/">{t.viewPage}</Link>
      </nav>

      <div className="panel">
        <h1>{t.publishPost}</h1>
        <p className="lede">{t.publishLede}</p>

        <form className="form-stack" onSubmit={onCreate}>
          <label>
            {t.mediaFile}
            <input
              type="file"
              accept="image/*,video/mp4,video/webm,video/quicktime"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </label>
          <p className="lede" style={{ marginTop: "-0.35rem" }}>
            {t.mediaHelp}
          </p>
          <label>
            {t.caption}
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} />
          </label>
          {error && <p className="hint">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? t.publishing : t.publish}
          </button>
        </form>
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2>{t.currentPosts}</h2>
        <div className="admin-list">
          {posts.map((post) => (
            <div key={post.id} className="admin-item">
              {post.mediaType === "video" ? (
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
                  {post.caption || t.noCaption}
                </p>
                <small style={{ color: "var(--muted)" }}>
                  {new Date(post.createdAt).toLocaleString(locale)}
                </small>
              </div>
              <div className="actions">
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
