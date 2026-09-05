"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { getDictionary, normalizeLocale, type Dictionary } from "@/lib/i18n";
import type { Conversation } from "@/lib/types";

type ConversationSummary = {
  id: string;
  googleId: string;
  name: string;
  email: string;
  image: string;
  updatedAt: string;
  preview: string;
  unread: number;
};

export default function AdminMessagesPage() {
  const [t, setT] = useState<Dictionary>(() => getDictionary("ar"));
  const [locale, setLocale] = useState("ar");
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const loadList = async () => {
    const [messagesRes, settingsRes] = await Promise.all([
      fetch("/api/messages"),
      fetch("/api/settings"),
    ]);
    const messagesData = await messagesRes.json();
    const settingsData = await settingsRes.json();
    const next = normalizeLocale(settingsData.settings?.language);
    setLocale(next);
    setT(getDictionary(next));
    setItems(messagesData.conversations || []);
  };

  useEffect(() => {
    loadList().catch(() => undefined);
  }, []);

  function openConversation(googleId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/messages?googleId=${encodeURIComponent(googleId)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.messageFailed);
        return;
      }
      setActive(data.conversation);
      setReply("");
      await loadList();
    });
  }

  function onReply(e: FormEvent) {
    e.preventDefault();
    if (!active || !reply.trim()) return;
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleId: active.googleId, text: reply }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.messageFailed);
        return;
      }
      setActive(data.conversation);
      setReply("");
      await loadList();
    });
  }

  return (
    <main className="admin-page">
      <nav className="admin-nav">
        <Link href="/admin">{t.overview}</Link>
        <Link href="/admin/posts">{t.posts}</Link>
        <Link href="/admin/stories">{t.stories}</Link>
        <Link href="/admin/messages" className="active">
          {t.messages}
        </Link>
        <Link href="/admin/settings">{t.settings}</Link>
        <Link href="/admin/followers">{t.followers}</Link>
        <Link href="/">{t.viewPage}</Link>
      </nav>

      {!active ? (
        <div className="panel">
          <h1>{t.inbox}</h1>
          <p className="lede">{t.inboxLede}</p>
          <div className="admin-list">
            {items.map((item) => (
              <button
                key={item.googleId}
                type="button"
                className="admin-item conversation-row"
                onClick={() => openConversation(item.googleId)}
              >
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" />
                ) : (
                  <span className="viewer-fallback">{(item.name || "?").slice(0, 1)}</span>
                )}
                <div>
                  <p style={{ margin: 0 }}>
                    {item.name}
                    {item.unread > 0 && (
                      <span className="unread-pill">
                        {t.unread}: {item.unread}
                      </span>
                    )}
                  </p>
                  <small style={{ color: "var(--muted)" }} dir="ltr">
                    {item.email}
                  </small>
                  <div>
                    <small style={{ color: "var(--muted)" }}>
                      {item.preview || t.noMessages}
                    </small>
                  </div>
                  <div>
                    <small style={{ color: "var(--muted)" }}>
                      {new Date(item.updatedAt).toLocaleString(locale)}
                    </small>
                  </div>
                </div>
              </button>
            ))}
            {!items.length && <p className="lede">{t.noMessages}</p>}
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="message-sheet-head">
            <div>
              <button type="button" className="btn-text" onClick={() => setActive(null)}>
                {t.backToInbox}
              </button>
              <h1 style={{ marginTop: "0.5rem" }}>
                {t.conversationWith} {active.name}
              </h1>
              <small style={{ color: "var(--muted)" }} dir="ltr">
                {active.email}
              </small>
            </div>
          </div>

          <div className="message-thread admin-thread">
            {active.messages.map((m) => (
              <div
                key={m.id}
                className={`bubble ${m.from === "owner" ? "mine" : "theirs"}`}
              >
                <p>{m.text}</p>
                <time dateTime={m.createdAt}>
                  {new Date(m.createdAt).toLocaleString(locale)}
                </time>
              </div>
            ))}
          </div>

          <form className="form-stack message-compose" onSubmit={onReply}>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={t.reply}
              required
              maxLength={1000}
              rows={3}
            />
            {error && <p className="hint">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={pending}>
              {pending ? t.loading : t.sendReply}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
