"use client";

import { Suspense, useEffect, useState } from "react";
import { getDictionary, normalizeLocale, type Dictionary } from "@/lib/i18n";
import { LoginForm } from "./login-form";

const OWNER_EMAIL = "KhalidBoulaaouin@gmail.com";

export default function LoginPage() {
  const [brand, setBrand] = useState("حضوري");
  const [t, setT] = useState<Dictionary>(() => getDictionary("ar"));

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.brandName) setBrand(d.settings.brandName);
        setT(getDictionary(normalizeLocale(d.settings?.language)));
      })
      .catch(() => undefined);
  }, []);

  return (
    <main className="auth-page">
      <p className="brand-mark" style={{ fontSize: "2.4rem", marginBottom: "1rem" }}>
        {brand}
      </p>
      <Suspense fallback={<div className="panel">{t.loading}</div>}>
        <LoginForm t={t} ownerEmail={OWNER_EMAIL} />
      </Suspense>
    </main>
  );
}
