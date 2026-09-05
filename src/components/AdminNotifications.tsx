"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Note = {
  id: string;
  type: "follow" | "message";
  title: string;
  body: string;
  href?: string;
  createdAt: string;
  read: boolean;
};

export function AdminNotifications({
  labels,
}: {
  labels: {
    notifications: string;
    markAllRead: string;
    noNotifications: string;
    enableBrowserPush: string;
  };
}) {
  const [items, setItems] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const seenIds = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = (await res.json()) as { notifications?: Note[] };
    const next = data.notifications || [];

    if (primed.current && typeof Notification !== "undefined" && Notification.permission === "granted") {
      for (const note of next) {
        if (!note.read && !seenIds.current.has(note.id)) {
          try {
            new Notification(note.title, { body: note.body });
          } catch {
            /* ignore */
          }
        }
      }
    }

    for (const note of next) seenIds.current.add(note.id);
    primed.current = true;
    setItems(next);
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(load, 12000);
    return () => window.clearInterval(id);
  }, [load]);

  const unread = items.filter((n) => !n.read).length;

  async function markAll() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    await load();
  }

  async function enablePush() {
    if (!("Notification" in window)) return;
    await Notification.requestPermission();
  }

  return (
    <div className="notify-wrap">
      <button type="button" className="btn notify-btn" onClick={() => setOpen((v) => !v)}>
        {labels.notifications}
        {unread > 0 ? <span className="notify-badge">{unread}</span> : null}
      </button>
      {open ? (
        <div className="notify-panel">
          <div className="notify-actions">
            <button type="button" className="btn" onClick={enablePush}>
              {labels.enableBrowserPush}
            </button>
            <button type="button" className="btn" onClick={markAll} disabled={!unread}>
              {labels.markAllRead}
            </button>
          </div>
          {items.length === 0 ? (
            <p className="lede">{labels.noNotifications}</p>
          ) : (
            <ul className="notify-list">
              {items.slice(0, 20).map((n) => (
                <li key={n.id} className={n.read ? "read" : "unread"}>
                  {n.href ? (
                    <Link href={n.href} onClick={() => setOpen(false)}>
                      <strong>{n.title}</strong>
                      <span>{n.body}</span>
                    </Link>
                  ) : (
                    <>
                      <strong>{n.title}</strong>
                      <span>{n.body}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
