"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { AdminNav } from "@/components/AdminNav";
import { getDictionary, normalizeLocale, type Dictionary } from "@/lib/i18n";

type Entry = {
  id: string;
  name: string;
  email: string;
  image: string;
  text: string;
  createdAt: string;
  hidden: boolean;
};

export default function AdminCommunityPage() {
  const [t, setT] = useState<Dictionary>(() => getDictionary("ar"));
  const [questionText, setQuestionText] = useState("");
  const [questionActive, setQuestionActive] = useState(true);
  const [answers, setAnswers] = useState<Entry[]>([]);
  const [guestbook, setGuestbook] = useState<Entry[]>([]);
  const [siteUrl, setSiteUrl] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const qrSrc = useMemo(() => {
    if (!siteUrl) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=12&data=${encodeURIComponent(siteUrl)}`;
  }, [siteUrl]);

  const load = async () => {
    const [qRes, gRes, sRes] = await Promise.all([
      fetch("/api/question"),
      fetch("/api/guestbook"),
      fetch("/api/settings"),
    ]);
    const qData = await qRes.json();
    const gData = await gRes.json();
    const sData = await sRes.json();
    const next = normalizeLocale(sData.settings?.language);
    setT(getDictionary(next));
    setQuestionText(qData.question?.text || "");
    setQuestionActive(qData.question?.active !== false);
    setAnswers(qData.question?.answers || []);
    setGuestbook(gData.entries || []);
    setSiteUrl(
      String(sData.settings?.publicSiteUrl || window.location.origin).replace(/\/$/, ""),
    );
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  function saveQuestion(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    startTransition(async () => {
      const res = await fetch("/api/question", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: questionText, active: questionActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || t.saveFailed);
        return;
      }
      setMessage(t.questionSaved);
      await load();
    });
  }

  function resetAnswers() {
    if (!confirm(t.questionResetConfirm)) return;
    startTransition(async () => {
      await fetch("/api/question", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetAnswers: true }),
      });
      await load();
    });
  }

  function toggleHidden(kind: "guestbook" | "answer", id: string, hidden: boolean) {
    startTransition(async () => {
      const url = kind === "guestbook" ? "/api/guestbook" : "/api/question";
      await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, hidden: !hidden }),
      });
      await load();
    });
  }

  function removeItem(kind: "guestbook" | "answer", id: string) {
    if (!confirm(t.delete)) return;
    startTransition(async () => {
      const url =
        kind === "guestbook"
          ? `/api/guestbook?id=${encodeURIComponent(id)}`
          : `/api/question?id=${encodeURIComponent(id)}`;
      await fetch(url, { method: "DELETE" });
      await load();
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
          community: t.community,
          viewPage: t.viewPage,
          notifications: t.notifications,
          markAllRead: t.markAllRead,
          noNotifications: t.noNotifications,
          enableBrowserPush: t.enableBrowserPush,
        }}
      />

      <div className="panel">
        <h1>{t.community}</h1>
        <p className="lede">{t.communityLede}</p>
        {message ? <p className="hint">{message}</p> : null}
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2>{t.qrTitle}</h2>
        <p className="lede">{t.qrLede}</p>
        {qrSrc ? (
          <div className="qr-card-body">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="qr-image" src={qrSrc} alt="" width={220} height={220} />
            <div className="qr-actions">
              <a className="btn btn-primary" href={qrSrc} download="hodouri-qr.png" target="_blank" rel="noreferrer">
                {t.qrDownload}
              </a>
              <a className="btn btn-ghost" href={siteUrl} target="_blank" rel="noreferrer">
                {t.qrOpen}
              </a>
            </div>
            <p className="lede" dir="ltr">
              {siteUrl}
            </p>
          </div>
        ) : null}
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2>{t.questionTitle}</h2>
        <form className="form-stack" onSubmit={saveQuestion}>
          <label>
            {t.questionAdminLabel}
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              maxLength={200}
              required
            />
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={questionActive}
              onChange={(e) => setQuestionActive(e.target.checked)}
            />
            {t.questionActiveLabel}
          </label>
          <div className="actions">
            <button className="btn btn-primary" type="submit" disabled={pending}>
              {t.saveQuestion}
            </button>
            <button className="btn btn-ghost" type="button" disabled={pending} onClick={resetAnswers}>
              {t.questionReset}
            </button>
          </div>
        </form>

        <h3 style={{ marginTop: "1.25rem" }}>{t.questionAnswers}</h3>
        <div className="admin-list">
          {answers.map((a) => (
            <div key={a.id} className={`admin-item ${a.hidden ? "is-hidden" : ""}`}>
              <div>
                <p style={{ margin: 0 }}>
                  <strong>{a.name}</strong> — {a.text}
                </p>
                <small>{a.email}</small>
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={pending}
                  onClick={() => toggleHidden("answer", a.id, a.hidden)}
                >
                  {a.hidden ? t.showPost : t.hidePost}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={pending}
                  onClick={() => removeItem("answer", a.id)}
                >
                  {t.delete}
                </button>
              </div>
            </div>
          ))}
          {!answers.length ? <p className="lede">{t.questionEmpty}</p> : null}
        </div>
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2>{t.guestbookTitle}</h2>
        <div className="admin-list">
          {guestbook.map((g) => (
            <div key={g.id} className={`admin-item ${g.hidden ? "is-hidden" : ""}`}>
              <div>
                <p style={{ margin: 0 }}>
                  <strong>{g.name}</strong> — {g.text}
                </p>
                <small>{g.email}</small>
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={pending}
                  onClick={() => toggleHidden("guestbook", g.id, g.hidden)}
                >
                  {g.hidden ? t.showPost : t.hidePost}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={pending}
                  onClick={() => removeItem("guestbook", g.id)}
                >
                  {t.delete}
                </button>
              </div>
            </div>
          ))}
          {!guestbook.length ? <p className="lede">{t.guestbookEmpty}</p> : null}
        </div>
      </div>
    </main>
  );
}
