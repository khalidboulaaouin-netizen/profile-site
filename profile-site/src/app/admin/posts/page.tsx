"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { Post } from "@/lib/types";

async function uploadFile(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "فشل الرفع");
  return data.url as string;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    fetch("/api/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []));

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("اختر صورة للمنشور");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const imageUrl = await uploadFile(file);
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, caption }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل النشر");
      }
      setCaption("");
      setFile(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ غير متوقع");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("حذف هذا المنشور؟")) return;
    await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <main className="admin-page">
      <nav className="admin-nav">
        <Link href="/admin">نظرة عامة</Link>
        <Link href="/admin/posts" className="active">
          المنشورات
        </Link>
        <Link href="/admin/settings">الإعدادات</Link>
        <Link href="/admin/followers">المتابعون</Link>
        <Link href="/">عرض الصفحة</Link>
      </nav>

      <div className="panel">
        <h1>نشر محتوى جديد</h1>
        <p className="lede">أضف صوراً مع وصف كما في إنستغرام. تظهر فوراً في صفحتك العامة.</p>

        <form className="form-stack" onSubmit={onCreate}>
          <label>
            الصورة
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </label>
          <label>
            الوصف
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} />
          </label>
          {error && <p className="hint">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? "جارٍ النشر..." : "نشر"}
          </button>
        </form>
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2>المنشورات الحالية</h2>
        <div className="admin-list">
          {posts.map((post) => (
            <div key={post.id} className="admin-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.imageUrl} alt="" />
              <div>
                <p style={{ margin: 0 }}>{post.caption || "بدون وصف"}</p>
                <small style={{ color: "var(--muted)" }}>
                  {new Date(post.createdAt).toLocaleString("ar")}
                </small>
              </div>
              <div className="actions">
                <button className="btn btn-ghost" type="button" onClick={() => onDelete(post.id)}>
                  حذف
                </button>
              </div>
            </div>
          ))}
          {!posts.length && <p className="lede">لا منشورات بعد.</p>}
        </div>
      </div>
    </main>
  );
}
