"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
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
      setError("البريد أو كلمة المرور غير صحيحة.");
      return;
    }

    router.push(params.get("callbackUrl") || "/admin");
    router.refresh();
  }

  return (
    <div className="panel">
      <h1>دخول المالك</h1>
      <p className="lede">
        هذه الصفحة لك وحدك. الزوار لا يسجّلون حساباً هنا — يتابعون عبر Google فقط من الصفحة
        العامة.
      </p>

      <form className="form-stack" onSubmit={onSubmit}>
        <label>
          البريد الإلكتروني
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
          كلمة المرور
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
          {loading ? "جارٍ الدخول..." : "دخول لوحة التحكم"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="auth-page">
      <p className="brand-mark" style={{ fontSize: "2.4rem", marginBottom: "1rem" }}>
        حضوري
      </p>
      <Suspense fallback={<div className="panel">تحميل...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
