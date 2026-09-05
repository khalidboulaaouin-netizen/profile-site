"use client";

import { useState } from "react";

export function ShareButton({
  url,
  title,
  labels,
}: {
  url: string;
  title: string;
  labels: {
    share: string;
    copied: string;
    shareFailed: string;
  };
}) {
  const [note, setNote] = useState("");

  async function onShare() {
    setNote("");
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, url, text: title });
        return;
      }
      await navigator.clipboard.writeText(url);
      setNote(labels.copied);
      setTimeout(() => setNote(""), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setNote(labels.copied);
        setTimeout(() => setNote(""), 2000);
      } catch {
        setNote(labels.shareFailed);
      }
    }
  }

  return (
    <div className="share-wrap">
      <button type="button" className="btn share-btn" onClick={onShare}>
        {labels.share}
      </button>
      {note ? <span className="share-note">{note}</span> : null}
    </div>
  );
}
