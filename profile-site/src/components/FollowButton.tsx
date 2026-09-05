"use client";

import { useEffect, useState, useTransition } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import type { Dictionary } from "@/lib/i18n";

type FollowState = {
  count: number;
  following: boolean;
  blocked: boolean;
  googleConfigured: boolean;
  allowFollow: boolean;
};

export function FollowButton({
  labels,
}: {
  labels: Pick<
    Dictionary,
    | "followGoogle"
    | "unfollow"
    | "followerSignOut"
    | "loading"
    | "enableGoogleFirst"
    | "youAreBlocked"
  >;
  locale?: string;
}) {
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
        setMessage(labels.enableGoogleFirst);
        return;
      }

      if (!session || session.user.role !== "follower") {
        await signIn("google", { callbackUrl: "/?follow=1" });
        return;
      }

      if (state.blocked) {
        setMessage(labels.youAreBlocked);
        return;
      }

      if (state.following) {
        await fetch("/api/follow", { method: "DELETE" });
      } else {
        const res = await fetch("/api/follow", { method: "POST" });
        if (!res.ok) {
          const data = await res.json();
          setMessage(data.error || labels.youAreBlocked);
          return;
        }
      }
      await refresh();
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("follow") === "1" && session?.user?.role === "follower") {
      startTransition(async () => {
        const res = await fetch("/api/follow", { method: "POST" });
        if (!res.ok) {
          const data = await res.json();
          setMessage(data.error || labels.youAreBlocked);
        }
        await refresh();
        window.history.replaceState({}, "", "/");
      });
    }
  }, [session]);

  if (!state?.allowFollow) return null;

  if (state.blocked) {
    return (
      <div className="follow-block">
        <p className="hint">{labels.youAreBlocked}</p>
        {session?.user?.role === "follower" && (
          <button
            type="button"
            className="btn-text"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            {labels.followerSignOut}
          </button>
        )}
      </div>
    );
  }

  const label = state?.following ? labels.unfollow : labels.followGoogle;

  return (
    <div className="follow-block">
      <button
        type="button"
        className={`btn ${state?.following ? "btn-ghost" : "btn-primary"}`}
        onClick={handleFollow}
        disabled={pending || status === "loading"}
      >
        {pending ? labels.loading : label}
      </button>
      {session?.user?.role === "follower" && (
        <button
          type="button"
          className="btn-text"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          {labels.followerSignOut}
        </button>
      )}
      {message && <p className="hint">{message}</p>}
    </div>
  );
}
