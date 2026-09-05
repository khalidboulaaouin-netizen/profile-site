"use client";

import { useEffect, useRef } from "react";
import { normalizeAdSenseClient, normalizeAdSenseSlot } from "@/components/GoogleAdSense";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSenseUnit({
  clientId,
  slotId,
  format = "auto",
}: {
  clientId?: string;
  slotId?: string;
  format?: "auto" | "rectangle" | "horizontal";
}) {
  const client = normalizeAdSenseClient(clientId);
  const slot = normalizeAdSenseSlot(slotId);
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || !slot || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* ignore until AdSense approves the site */
    }
  }, [client, slot]);

  if (!client || !slot) return null;

  return (
    <div className="adsense-wrap" aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
