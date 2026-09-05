"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import type { Comment, Post } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";

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

function previewText(text: string, max = 120) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max)}…`;
}

export function PostGrid({
  posts,
  labels,
  locale = "ar",
  enableLikes = true,
  enableComments = true,
}: {
  posts: Post[];
  labels: Pick<
    Dictionary,
    | "emptyPosts"
    | "noCaption"
    | "close"
    | "postAlt"
    | "like"
    | "unlike"
    | "likesCount"
    | "comments"
    | "addComment"
    | "commentName"
    | "commentText"
    | "sendComment"
    | "noComments"
    | "loading"
    | "delete"
    | "deleteCommentConfirm"
    | "reelBadge"
    | "articleBadge"
  >;
  locale?: string;
  enableLikes?: boolean;
  enableComments?: boolean;
}) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [items, setItems] = useState(posts);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState("");
  const [pending, startTransition] = useTransition();
  const [authorName, setAuthorName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(posts);
  }, [posts]);

  useEffect(() => {
    setVisitorId(getVisitorId());
    const savedName = window.localStorage.getItem("hodouri_comment_name");
    if (savedName) setAuthorName(savedName);
  }, []);

  const active = useMemo(
    () => items.find((p) => p.id === activeId) || null,
    [items, activeId],
  );

  const liked = Boolean(active && visitorId && active.likedBy?.includes(visitorId));

  function updatePost(next: Post) {
    setItems((prev) => prev.map((p) => (p.id === next.id ? next : p)));
  }

  function onLike() {
    if (!active || !visitorId || !enableLikes) return;
    startTransition(async () => {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: active.id, visitorId }),
      });
      const data = await res.json();
      if (!res.ok) return;
      updatePost({
        ...active,
        likes: data.likes,
        likedBy: data.likedBy || active.likedBy,
      });
    });
  }

  async function onComment(e: FormEvent) {
    e.preventDefault();
    if (!active || !enableComments) return;
    setError("");
    const name = authorName.trim();
    const text = commentText.trim();
    if (!name || !text) return;

    window.localStorage.setItem("hodouri_comment_name", name);
    startTransition(async () => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: active.id,
          authorName: name,
          text,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error");
        return;
      }
      updatePost({ ...active, comments: data.comments as Comment[] });
      setCommentText("");
    });
  }

  function onDeleteComment(commentId: string) {
    if (!active || !isAdmin) return;
    if (!window.confirm(labels.deleteCommentConfirm)) return;
    startTransition(async () => {
      const res = await fetch(
        `/api/comments?postId=${encodeURIComponent(active.id)}&commentId=${encodeURIComponent(commentId)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error");
        return;
      }
      updatePost({ ...active, comments: data.comments as Comment[] });
    });
  }

  if (items.length === 0) {
    return (
      <div className="empty-grid">
        <p>{labels.emptyPosts}</p>
      </div>
    );
  }

  return (
    <>
      <div className="post-grid">
        {items.map((post, index) => (
          <button
            key={post.id}
            type="button"
            className={`post-tile ${post.mediaType === "video" ? "is-reel" : ""} ${
              post.mediaType === "text" ? "is-text" : ""
            }`}
            style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
            onClick={() => setActiveId(post.id)}
          >
            {post.mediaType === "text" ? (
              <>
                {post.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.imageUrl} alt={post.caption || labels.postAlt} />
                ) : null}
                <span className="text-tile-preview">
                  <span className="article-mark" aria-hidden>
                    ✎
                  </span>
                  <span>{previewText(post.caption || labels.noCaption)}</span>
                </span>
              </>
            ) : post.mediaType === "video" ? (
              post.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverUrl}
                  alt={post.caption || labels.postAlt}
                />
              ) : (
                <video
                  src={post.imageUrl}
                  muted
                  playsInline
                  preload="metadata"
                  aria-label={post.caption || labels.postAlt}
                />
              )
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.imageUrl} alt={post.caption || labels.postAlt} />
            )}
            <span className="post-veil" />
            {post.mediaType === "video" && (
              <span className="reel-mark" aria-hidden>
                ▶
              </span>
            )}
            {(enableLikes || enableComments) && (
              <span className="post-meta">
                {enableLikes && <span>♥ {post.likes || 0}</span>}
                {enableComments && <span>💬 {post.comments?.length || 0}</span>}
              </span>
            )}
          </button>
        ))}
      </div>

      {active && (
        <div className="modal-backdrop" onClick={() => setActiveId(null)} role="presentation">
          <article
            className={`modal-sheet modal-ig ${active.mediaType === "video" ? "modal-reel" : ""} ${
              active.mediaType === "text" ? "modal-article" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-media">
              {active.mediaType === "text" ? (
                active.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={active.imageUrl} alt={active.caption || labels.postAlt} />
                ) : (
                  <div className="article-cover-fallback" aria-hidden>
                    ✎
                  </div>
                )
              ) : active.mediaType === "video" ? (
                <video
                  className="reel-player"
                  src={active.imageUrl}
                  poster={active.coverUrl || undefined}
                  controls
                  playsInline
                  autoPlay
                  preload="metadata"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={active.imageUrl} alt={active.caption || labels.postAlt} />
              )}
            </div>

            <div className="modal-body">
              {(enableLikes || enableComments) && (
                <div className="ig-actions">
                  {enableLikes && (
                    <button
                      type="button"
                      className={`ig-action ${liked ? "is-liked" : ""}`}
                      onClick={onLike}
                      disabled={pending || !visitorId}
                      aria-label={liked ? labels.unlike : labels.like}
                    >
                      {liked ? "♥" : "♡"}
                    </button>
                  )}
                  {enableComments && (
                    <a className="ig-action" href="#post-comments" aria-label={labels.comments}>
                      💬
                    </a>
                  )}
                  <button
                    type="button"
                    className="ig-action ig-close"
                    onClick={() => setActiveId(null)}
                    aria-label={labels.close}
                  >
                    ✕
                  </button>
                </div>
              )}

              {enableLikes && (
                <p className="ig-likes">
                  <strong>{active.likes || 0}</strong> {labels.likesCount}
                </p>
              )}

              {active.mediaType === "video" && (
                <span className="reel-badge">{labels.reelBadge}</span>
              )}
              {active.mediaType === "text" && (
                <span className="article-badge">{labels.articleBadge}</span>
              )}

              <p className={active.mediaType === "text" ? "article-body ig-caption" : "ig-caption"}>
                {active.caption || labels.noCaption}
              </p>
              <time dateTime={active.createdAt}>
                {new Date(active.createdAt).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>

              {enableComments && (
                <div className="comments-box" id="post-comments">
                  <h3>{labels.comments}</h3>
                  <div className="comments-list">
                    {(active.comments || []).length === 0 && (
                      <p className="hint">{labels.noComments}</p>
                    )}
                    {(active.comments || []).map((c) => (
                      <div key={c.id} className="comment-item">
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
                        <time dateTime={c.createdAt}>
                          {new Date(c.createdAt).toLocaleString(locale)}
                        </time>
                      </div>
                    ))}
                  </div>
                  <form className="form-stack comment-form" onSubmit={onComment}>
                    <label>
                      {labels.commentName}
                      <input
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        required
                        maxLength={60}
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
                      />
                    </label>
                    {error && <p className="hint">{error}</p>}
                    <button className="btn btn-primary" type="submit" disabled={pending}>
                      {pending ? labels.loading : labels.sendComment}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </article>
        </div>
      )}
    </>
  );
}
