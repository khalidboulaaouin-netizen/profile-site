"use client";

import { useEffect, useState } from "react";

function isIos() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone) || window.matchMedia("(display-mode: standalone)").matches;
}

export function InstallAppPrompt({
  labels,
}: {
  labels: {
    title: string;
    body: string;
    steps: string;
    dismiss: string;
    openLogin: string;
  };
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      }
    } catch {
      /* ignore */
    }

    const dismissed = window.localStorage.getItem("hodouri-pwa-dismissed");
    if (dismissed === "1") return;
    if (isStandalone()) return;
    const mobile = isIos() || /Android/i.test(navigator.userAgent);
    if (mobile) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="install-prompt" role="dialog" aria-label={labels.title}>
      <div className="install-prompt-inner">
        <strong>{labels.title}</strong>
        <p>{labels.body}</p>
        <p className="install-steps">{labels.steps}</p>
        <div className="install-actions">
          <a className="btn btn-primary" href="/login">
            {labels.openLogin}
          </a>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              window.localStorage.setItem("hodouri-pwa-dismissed", "1");
              setShow(false);
            }}
          >
            {labels.dismiss}
          </button>
        </div>
      </div>
    </div>
  );
}
