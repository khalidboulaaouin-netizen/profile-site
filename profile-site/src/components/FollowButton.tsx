"use client";

import { useEffect, useState, useTransition } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

type FollowState = {
  count: number;
  following: boolean;
  googleConfigured: boolean;
  allowFollow: boolean;
};

export function FollowButton() {
  const { data: session, status } = useSession();
  const [state, setState] = useState<FollowState | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/follow")
      .then((r) => r.json())
      .then(setState)
      .catch(() => setState(null));
  }, [session]);

  const refresh = () =>
    fetch("/api/follow")
      .then((r) => r.json())
      .then(setState);

  const handleFollow = () => {
    setMessage("");
    startTransition(async () => {
      if (!state?.googleConfigured) {
        setMessage("فعّل تسجيل Google أولاً من إعدادات المالك.");
        return;
      }

      if (!session || session.user.role !== "follower") {
        await signIn("google", { callbackUrl: "/?follow=1" });
        return;
      }

      if (state.following) {
        await fetch("/api/follow", { method: "DELETE" });
      } else {
        await fetch("/api/follow", { method: "POST" });
      }
      await refresh();
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("follow") === "1" && session?.user?.role === "follower") {
      startTransition(async () => {
        await fetch("/api/follow", { method: "POST" });
        await refresh();
        window.history.replaceState({}, "", "/");
      });
    }
  }, [session]);

  if (!state?.allowFollow) return null;

  const label = state?.following ? "إلغاء المتابعة" : "متابعة عبر Google";

  return (
    <div className="follow-block">
      <button
        type="button"
        className={`btn ${state?.following ? "btn-ghost" : "btn-primary"}`}
        onClick={handleFollow}
        disabled={pending || status === "loading"}
      >
        {pending ? "جارٍ..." : label}
      </button>
      {session?.user?.role === "follower" && (
        <button
          type="button"
          className="btn-text"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          تسجيل خروج المتابع
        </button>
      )}
      {message && <p className="hint">{message}</p>}
    </div>
  );
}
