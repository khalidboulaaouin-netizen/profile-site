"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";

const STORY_MS = 5000;

type PublicStory = {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  expiresAt: string;
  viewerCount: number;
  viewedByMe: boolean;
  mediaType?: "image" | "video";
};

type StoriesResponse = {
  stories: PublicStory[];
  profile: { displayName: string; avatarUrl: string };
  googleConfigured: boolean;
};

export function StoryRing({
  labels,
}: {
  labels: Pick<
    Dictionary,
    | "stories"
    | "yourStory"
    | "viewStory"
    | "storyLoginRequired"
    | "storyLoginCta"
    | "close"
    | "loading"
    | "noStories"
    | "storyViewers"
  >;
}) {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [data, setData] = useState<StoriesResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const load = () =>
    fetch("/api/stories")
      .then((r) => r.json())
      .then((payload: StoriesResponse) => setData(payload))
      .catch(() => setData(null));

  useEffect(() => {
    load();
  }, [session]);

  useEffect(() => {
    if (searchParams.get("story") === "1" && (data?.stories?.length || 0) > 0) {
      if (session?.user?.role === "follower") {
        setOpen(true);
        setIndex(0);
      }
    }
  }, [searchParams, data?.stories?.length, session?.user?.role]);

  const stories = data?.stories || [];
  const active = stories[index] || null;
  const hasUnseen = useMemo(() => stories.some((s) => !s.viewedByMe), [stories]);

  function closeViewer() {
    setOpen(false);
  }

  function goNext() {
    setIndex((i) => {
      if (i >= stories.length - 1) {
        setOpen(false);
        return i;
      }
      return i + 1;
    });
  }

  function goPrev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  function openStories() {
    setMessage("");
    if (!stories.length) return;
    if (status === "loading") return;

    if (!session || session.user.role !== "follower") {
      if (!data?.googleConfigured) {
        setMessage(labels.storyLoginRequired);
        return;
      }
      void signIn("google", { callbackUrl: "/?story=1" });
      return;
    }

    setOpen(true);
    setIndex(0);
  }

  useEffect(() => {
    if (!open || !active || session?.user?.role !== "follower") return;
    startTransition(async () => {
      await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "view", storyId: active.id }),
      });
      await load();
    });
  }, [open, active?.id, session?.user?.role]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, stories.length]);

  const isVideo = active?.mediaType === "video" || /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(active?.imageUrl || "");

  useEffect(() => {
    if (!open || !active) return;
    // Videos advance on ended (with a long safety timeout). Images use the fixed timer.
    if (isVideo) {
      const timer = window.setTimeout(goNext, 60_000);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(goNext, STORY_MS);
    return () => window.clearTimeout(timer);
  }, [open, active?.id, stories.length, isVideo]);

  if (!stories.length) return null;

  return (
    <>
      <section className="story-ring" aria-label={labels.stories}>
        <button type="button" className="story-avatar-btn" onClick={openStories}>
          <span className={`story-ring-border ${hasUnseen ? "unseen" : "seen"}`}>
            <span className="story-avatar">
              {data?.profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.profile.avatarUrl} alt="" />
              ) : (
                <span>{(data?.profile.displayName || "S").slice(0, 1)}</span>
              )}
            </span>
          </span>
          <span className="story-label">{labels.yourStory}</span>
        </button>
        {message && <p className="hint">{message}</p>}
      </section>

      {open && active && (
        <div className="story-viewer" role="dialog" aria-modal="true">
          <div className="story-progress">
            {stories.map((story, i) => (
              <span
                key={story.id}
                className={`story-progress-bar ${
                  i < index ? "done" : i === index ? "active" : ""
                }`}
              >
                <i />
              </span>
            ))}
          </div>

          {isVideo ? (
            <video
              key={active.id}
              className="story-media"
              src={active.imageUrl}
              autoPlay
              playsInline
              controls={false}
              onEnded={goNext}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={active.imageUrl} alt={active.caption || labels.stories} className="story-media" />
          )}

          <div className="story-top">
            <div className="story-owner">
              <strong>{data?.profile.displayName}</strong>
              {pending && <span>{labels.loading}</span>}
            </div>
            <button type="button" className="story-close" onClick={closeViewer}>
              ×
            </button>
          </div>

          {active.caption && <p className="story-caption">{active.caption}</p>}

          <button
            type="button"
            className="story-nav prev"
            aria-label="prev"
            onClick={goPrev}
            disabled={index === 0}
          />
          <button type="button" className="story-nav next" aria-label="next" onClick={goNext} />
        </div>
      )}
    </>
  );
}
