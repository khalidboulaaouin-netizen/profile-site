"use client";

import { AdminNav } from "@/components/AdminNav";
import { useEffect, useState, useTransition } from "react";
import { getDictionary, normalizeLocale, type Dictionary } from "@/lib/i18n";

type Person = {
  googleId: string;
  name: string;
  email: string;
  image: string;
  followedAt?: string;
  blockedAt?: string;
};

export default function AdminFollowersPage() {
  const [t, setT] = useState<Dictionary>(() => getDictionary("ar"));
  const [locale, setLocale] = useState("ar");
  const [followers, setFollowers] = useState<Person[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<Person[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const load = async () => {
    const [followersRes, blockedRes, settingsRes] = await Promise.all([
      fetch("/api/followers"),
      fetch("/api/block"),
      fetch("/api/settings"),
    ]);
    const followersData = await followersRes.json();
    const blockedData = await blockedRes.json();
    const settingsData = await settingsRes.json();
    const next = normalizeLocale(settingsData.settings?.language);
    setLocale(next);
    setT(getDictionary(next));
    setFollowers(followersData.followers || []);
    setBlockedUsers(blockedData.blockedUsers || []);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  function onBlock(person: Person) {
    if (!confirm(t.blockConfirm)) return;
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: person.googleId,
          name: person.name,
          email: person.email,
          image: person.image,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.saveFailed);
        return;
      }
      await load();
    });
  }

  function onUnblock(googleId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/block?googleId=${encodeURIComponent(googleId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t.saveFailed);
        return;
      }
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
          viewPage: t.viewPage,
          notifications: t.notifications,
          markAllRead: t.markAllRead,
          noNotifications: t.noNotifications,
          enableBrowserPush: t.enableBrowserPush,
        }}
      />

      <div className="panel">
        <h1>{t.followersTitle}</h1>
        <p className="lede">{t.followersLede}</p>
        {error && <p className="hint">{error}</p>}
        <div className="admin-list">
          {followers.map((f) => (
            <div key={f.googleId} className="admin-item">
              {f.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.image} alt="" />
              ) : (
                <span className="viewer-fallback">{(f.name || "?").slice(0, 1)}</span>
              )}
              <div>
                <p style={{ margin: 0 }}>{f.name}</p>
                <small style={{ color: "var(--muted)" }} dir="ltr">
                  {f.email}
                </small>
                {f.followedAt && (
                  <div>
                    <small style={{ color: "var(--muted)" }}>
                      {t.since} {new Date(f.followedAt).toLocaleString(locale)}
                    </small>
                  </div>
                )}
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => onBlock(f)}
                  disabled={pending}
                >
                  {t.block}
                </button>
              </div>
            </div>
          ))}
          {!followers.length && <p className="lede">{t.noFollowers}</p>}
        </div>
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2>{t.blockedUsers}</h2>
        <p className="lede">{t.blockedUsersLede}</p>
        <div className="admin-list">
          {blockedUsers.map((u) => (
            <div key={u.googleId} className="admin-item">
              {u.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.image} alt="" />
              ) : (
                <span className="viewer-fallback">{(u.name || "?").slice(0, 1)}</span>
              )}
              <div>
                <p style={{ margin: 0 }}>{u.name}</p>
                <small style={{ color: "var(--muted)" }} dir="ltr">
                  {u.email}
                </small>
                {u.blockedAt && (
                  <div>
                    <small style={{ color: "var(--muted)" }}>
                      {t.since} {new Date(u.blockedAt).toLocaleString(locale)}
                    </small>
                  </div>
                )}
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => onUnblock(u.googleId)}
                  disabled={pending}
                >
                  {t.unblock}
                </button>
              </div>
            </div>
          ))}
          {!blockedUsers.length && <p className="lede">{t.noBlockedUsers}</p>}
        </div>
      </div>
    </main>
  );
}
