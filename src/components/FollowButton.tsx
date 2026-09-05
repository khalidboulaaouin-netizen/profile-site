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

type SocialLinks = {
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
};

export function FollowButton({
  labels,
  social,
}: {
  labels: Pick<
    Dictionary,
    | "followGoogle"
    | "unfollow"
    | "followerSignOut"
    | "loading"
    | "enableGoogleFirst"
    | "youAreBlocked"
    | "chooseFollowPlatform"
    | "followOneTapHint"
    | "instagram"
    | "facebook"
    | "tiktok"
    | "google"
  >;
  social?: SocialLinks;
  locale?: string;
}) {
  const { data: session, status } = useSession();
  const [state, setState] = useState<FollowState | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const instagramUrl = social?.instagramUrl?.trim() || "";
  const facebookUrl = social?.facebookUrl?.trim() || "";
  const tiktokUrl = social?.tiktokUrl?.trim() || "";
  const hasSocial = Boolean(instagramUrl || facebookUrl || tiktokUrl);

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

  const handleGoogleFollow = () => {
    setMessage("");
    startTransition(async () => {
      if (!state?.googleConfigured) {
        setMessage(labels.enableGoogleFirst);
        return;
      }

      if (!session || session.user.role !== "follower") {
        // One tap: Google consent, then return and follow — no account on this site
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

  const showGoogle = Boolean(state?.allowFollow && state?.googleConfigured);
  if (!showGoogle && !hasSocial) return null;

  if (state?.blocked) {
    return (
      <div className="follow-chooser">
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

  return (
    <div className="follow-chooser">
      <p className="follow-chooser-title">{labels.chooseFollowPlatform}</p>
      <p className="follow-chooser-hint">{labels.followOneTapHint}</p>
      <div className="follow-platforms">
        {showGoogle && (
          <button
            type="button"
            className={`btn follow-platform ${state?.following ? "btn-ghost" : "btn-primary"}`}
            onClick={handleGoogleFollow}
            disabled={pending || status === "loading"}
          >
            {pending
              ? labels.loading
              : state?.following
                ? labels.unfollow
                : labels.google}
          </button>
        )}
        {instagramUrl && (
          <a
            className="btn btn-ghost follow-platform"
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
          >
            {labels.instagram}
          </a>
        )}
        {facebookUrl && (
          <a
            className="btn btn-ghost follow-platform"
            href={facebookUrl}
            target="_blank"
            rel="noreferrer"
          >
            {labels.facebook}
          </a>
        )}
        {tiktokUrl && (
          <a
            className="btn btn-ghost follow-platform"
            href={tiktokUrl}
            target="_blank"
            rel="noreferrer"
          >
            {labels.tiktok}
          </a>
        )}
      </div>
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
