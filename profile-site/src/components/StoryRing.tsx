"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import type { Comment } from "@/lib/types";
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
  likes?: number;
  likedBy?: string[];
  comments?: Comment[];
};

type StoriesResponse = {
  stories: PublicStory[];
  profile: { displayName: string; avatarUrl: string };
  googleConfigured: boolean;
  enableLikes?: boolean;
  enableComments?: boolean;
};

function getVisitorId() {
  if (typeof window === "undefined") return "";
  const key = "hodouri_visitor_id";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(key, id);
  }
  return id;
}

export function StoryRing({
  labels,
  enableLikes = true,
  enableComments = true,
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
    | "like"
    | "unlike"
    | "likesCount"
    | "comments"
    | "addComment"
    | "commentName"
    | "commentText"
    | "sendComment"
    | "noComments"
    | "delete"
    | "deleteCommentConfirm"
  >;
  enableLikes?: boolean;
  enableComments?: boolean;
}) {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [data, setData] = useState<StoriesResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [visitorId, setVisitorId] = useState("");
  const [paused, setPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");

  const isAdmin = session?.user?.role === "admin";
  const likesEnabled = enableLikes && data?.enableLikes !== false;
  const commentsEnabled = enableComments && data?.enableComments !== false;

  const load = () =>
    fetch("/api/stories")
      .then((r) => r.json())
      .then((payload: StoriesResponse) => setData(payload))
      .catch(() => setData(null));

  useEffect(() => {
    load();
    setVisitorId(getVisitorId());
    const saved = window.localStorage.getItem("hodouri_comment_name");
    if (saved) setAuthorName(saved);
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
  const liked = Boolean(active && visitorId && active.likedBy?.includes(visitorId));

  function patchActive(patch: Partial<PublicStory>) {
    if (!active) return;
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        stories: prev.stories.map((s) => (s.id === active.id ? { ...s, ...patch } : s)),
      };
    });
  }

  function closeViewer() {
    setOpen(false);
    setShowComments(false);
    setPaused(false);
    setError("");
  }

  function goNext() {
    setShowComments(false);
    setPaused(false);
    setIndex((i) => {
      if (i >= stories.length - 1) {
        setOpen(false);
        return i;
      }
      return i + 1;
    });
  }

  function goPrev() {
    setShowComments(false);
    setPaused(false);
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

  function onLike() {
    if (!active || !visitorId || !likesEnabled) return;
    startTransition(async () => {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "like",
          storyId: active.id,
          visitorId,
        }),
      });
      const payload = await res.json();
      if (!res.ok) return;
      patchActive({
        likes: payload.likes,
        likedBy: payload.likedBy || [],
      });
    });
  }

  async function onComment(e: FormEvent) {
    e.preventDefault();
    if (!active || !commentsEnabled) return;
    setError("");
    const name = authorName.trim();
    const text = commentText.trim();
    if (!name || !text) return;
    window.localStorage.setItem("hodouri_comment_name", name);
    startTransition(async () => {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "comment",
          storyId: active.id,
          authorName: name,
          text,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error || "Error");
        return;
      }
      patchActive({ comments: payload.comments || [] });
      setCommentText("");
    });
  }

  function onDeleteComment(commentId: string) {
    if (!active || !isAdmin) return;
    if (!window.confirm(labels.deleteCommentConfirm)) return;
    startTransition(async () => {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteComment",
          storyId: active.id,
          commentId,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error || "Error");
        return;
      }
      patchActive({ comments: payload.comments || [] });
    });
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
      if (paused || showComments) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, stories.length, paused, showComments]);

  const isVideo =
    active?.mediaType === "video" ||
    /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(active?.imageUrl || "");

  useEffect(() => {
    if (!open || !active || paused || showComments) return;
    if (isVideo) {
      const timer = window.setTimeout(goNext, 60_000);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(goNext, STORY_MS);
    return () => window.clearTimeout(timer);
  }, [open, active?.id, stories.length, isVideo, paused, showComments]);

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
        {stories.length > 1 && <span className="story-count-pill">{stories.length}</span>}
        {message && <p className="hint">{message}</p>}
      </section>

      {open && active && (
        <div
          className={`story-viewer ${showComments ? "is-paused" : ""}`}
          role="dialog"
          aria-modal="true"
        >
          <div className="story-progress">
            {stories.map((story, i) => (
              <span
                key={story.id}
                className={`story-progress-bar ${
                  i < index ? "done" : i === index ? "active" : ""
                } ${paused || showComments ? "paused" : ""}`}
              >
                <i />
              </span>
            ))}
          </div>

          <div className="story-stage">
            {isVideo ? (
              <video
                key={active.id}
                className="story-media"
                src={active.imageUrl}
                autoPlay
                playsInline
                controls={false}
                onEnded={() => {
                  if (!paused && !showComments) goNext();
                }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.imageUrl}
                alt={active.caption || labels.stories}
                className="story-media"
              />
            )}

            <div className="story-top">
              <div className="story-owner">
                <strong>{data?.profile.displayName}</strong>
                {stories.length > 1 && (
                  <span className="story-index">
                    {index + 1}/{stories.length}
                  </span>
                )}
                {pending && <span>{labels.loading}</span>}
              </div>
              <button type="button" className="story-close" onClick={closeViewer}>
                ×
              </button>
            </div>

            {active.caption ? <p className="story-caption">{active.caption}</p> : null}

            {(likesEnabled || commentsEnabled) && (
              <div className="story-ig-bar">
                {likesEnabled && (
                  <button
                    type="button"
                    className={`story-ig-btn ${liked ? "is-liked" : ""}`}
                    onClick={onLike}
                    disabled={pending || !visitorId}
                    aria-label={liked ? labels.unlike : labels.like}
                  >
                    {liked ? "♥" : "♡"}
                  </button>
                )}
                {commentsEnabled && (
                  <button
                    type="button"
                    className="story-ig-btn"
                    onClick={() => {
                      setShowComments((v) => {
                        const next = !v;
                        setPaused(next);
                        return next;
                      });
                    }}
                    aria-label={labels.comments}
                  >
                    💬
                  </button>
                )}
                {likesEnabled && (
                  <span className="story-ig-count">
                    {active.likes || 0} {labels.likesCount}
                  </span>
                )}
                {commentsEnabled && (
                  <span className="story-ig-count">
                    {active.comments?.length || 0} {labels.comments}
                  </span>
                )}
              </div>
            )}
          </div>

          {showComments && commentsEnabled && (
            <div className="story-comments-panel">
              <div className="story-comments-head">
                <strong>{labels.comments}</strong>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowComments(false);
                    setPaused(false);
                  }}
                >
                  {labels.close}
                </button>
              </div>
              <div className="story-comments-list">
                {(active.comments || []).length === 0 && (
                  <p className="hint">{labels.noComments}</p>
                )}
                {(active.comments || []).map((c) => (
                  <div key={c.id} className="story-comment-item">
                    <div className="comment-head">
                      <strong>{c.authorName}</strong>
                      {isAdmin && (
                        <button
                          type="button"
                          className="comment-delete"
                          onClick={() => onDeleteComment(c.id)}
                          disabled={pending}
                        >
                          {labels.delete}
                        </button>
                      )}
                    </div>
                    <p>{c.text}</p>
                  </div>
                ))}
              </div>
              <form className="form-stack story-comment-form" onSubmit={onComment}>
                <label>
                  {labels.commentName}
                  <input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                    maxLength={60}
                    onFocus={() => setPaused(true)}
                  />
                </label>
                <label>
                  {labels.addComment}
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={labels.commentText}
                    required
                    maxLength={500}
                    onFocus={() => setPaused(true)}
                  />
                </label>
                {error && <p className="hint">{error}</p>}
                <button className="btn btn-primary" type="submit" disabled={pending}>
                  {pending ? labels.loading : labels.sendComment}
                </button>
              </form>
            </div>
          )}

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
