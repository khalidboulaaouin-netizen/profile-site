"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDictionary, normalizeLocale, type Dictionary } from "@/lib/i18n";

function LoginForm({ t }: { t: Dictionary }) {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("admin-credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t.loginError);
      return;
    }

    router.push(params.get("callbackUrl") || "/admin");
    router.refresh();
  }

  return (
    <div className="panel">
      <h1>{t.ownerLogin}</h1>
      <p className="lede">{t.ownerLoginLede}</p>

      <form className="form-stack" onSubmit={onSubmit}>
        <label>
          {t.email}
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
          />
        </label>
        <label>
          {t.password}
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            dir="ltr"
          />
        </label>
        {error && <p className="hint">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? t.loggingIn : t.loginSubmit}
        </button>
      </form>
    </div>
  );
}

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
        <LoginForm t={t} />
      </Suspense>
    </main>
  );
}
