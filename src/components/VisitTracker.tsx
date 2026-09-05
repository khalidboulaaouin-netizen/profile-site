"use client";

import { useEffect } from "react";

const STORAGE_KEY = "hodouri-visitor-id";

function getVisitorId(): string {
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 8) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return `v-${Date.now()}`;
  }
}

/** Fire-and-forget free page-view tracker for the public profile. */
export function VisitTracker() {
  useEffect(() => {
    const visitorId = getVisitorId();
    const key = `hodouri-visit-${new Date().toISOString().slice(0, 10)}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      /* continue */
    }

    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId }),
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  return null;
}
