"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { signIn, useSession } from "next-auth/react";
import type { Dictionary } from "@/lib/i18n";

type Entry = {
  id: string;
  name: string;
  image?: string;
  text: string;
  createdAt: string;
};

export function GuestbookWall({
  labels,
  locale = "ar",
}: {
  labels: Pick<
    Dictionary,
    | "guestbookTitle"
    | "guestbookLede"
    | "guestbookPlaceholder"
    | "guestbookSubmit"
    | "guestbookLogin"
    | "guestbookEmpty"
    | "loading"
    | "guestbookDisabled"
  >;
  locale?: string;
}) {
  const { data: session } = useSession();
  const [enabled, setEnabled] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const load = () =>
    fetch("/api/guestbook")
      .then((r) => r.json())
      .then((d) => {
        setEnabled(d.enabled !== false);
        setEntries(d.entries || []);
      })
      .catch(() => undefined);

  useEffect(() => {
    load();
  }, [session]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!session?.user || session.user.role !== "follower") {
      void signIn("google", { callbackUrl: "/?guestbook=1" });
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || labels.guestbookDisabled);
        return;
      }
      setText("");
      await load();
    });
  }

  if (!enabled) return null;

  return (
    <section className="community-section guestbook-wall">
      <div className="section-title">
        <h2>{labels.guestbookTitle}</h2>
        <p className="lede">{labels.guestbookLede}</p>
      </div>

      <form className="community-form" onSubmit={onSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={labels.guestbookPlaceholder}
          maxLength={280}
          rows={3}
          required
        />
        {error ? <p className="hint">{error}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending
            ? labels.loading
            : session?.user?.role === "follower"
              ? labels.guestbookSubmit
              : labels.guestbookLogin}
        </button>
      </form>

      <div className="community-list">
        {entries.length === 0 ? <p className="lede">{labels.guestbookEmpty}</p> : null}
        {entries.map((entry) => (
          <article key={entry.id} className="community-card">
            <div className="community-card-head">
              {entry.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={entry.image} alt="" />
              ) : (
                <span className="community-avatar-fallback" aria-hidden>
                  {entry.name.slice(0, 1)}
                </span>
              )}
              <div>
                <strong>{entry.name}</strong>
                <time dateTime={entry.createdAt}>
                  {new Date(entry.createdAt).toLocaleString(locale)}
                </time>
              </div>
            </div>
            <p>{entry.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
