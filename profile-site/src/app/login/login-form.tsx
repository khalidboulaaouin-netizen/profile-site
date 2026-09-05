"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";

export function LoginForm({
  t,
  ownerEmail,
}: {
  t: Dictionary;
  ownerEmail: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("admin-credentials", {
      email: ownerEmail,
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
            value={ownerEmail}
            readOnly
            required
            dir="ltr"
            aria-readonly="true"
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
