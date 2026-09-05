"use client";

import { useMemo, useState } from "react";
import type { Dictionary } from "@/lib/i18n";

export function QrShareCard({
  url,
  labels,
}: {
  url: string;
  labels: Pick<
    Dictionary,
    "qrTitle" | "qrLede" | "qrDownload" | "qrOpen" | "linkCopied" | "qrCopy"
  >;
}) {
  const [copied, setCopied] = useState(false);
  const qrSrc = useMemo(() => {
    const data = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=12&data=${data}`;
  }, [url]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="community-section qr-share-card">
      <div className="section-title">
        <h2>{labels.qrTitle}</h2>
        <p className="lede">{labels.qrLede}</p>
      </div>
      <div className="qr-card-body">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="qr-image" src={qrSrc} alt={labels.qrTitle} width={240} height={240} />
        <div className="qr-actions">
          <a className="btn btn-primary" href={qrSrc} download="hodouri-qr.png" target="_blank" rel="noreferrer">
            {labels.qrDownload}
          </a>
          <button type="button" className="btn btn-ghost" onClick={copyLink}>
            {copied ? labels.linkCopied : labels.qrCopy}
          </button>
          <a className="btn btn-ghost" href={url} target="_blank" rel="noreferrer">
            {labels.qrOpen}
          </a>
        </div>
      </div>
    </section>
  );
}
