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
            className="post-tile"
            style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
            onClick={() => setActiveId(post.id)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.imageUrl} alt={post.caption || labels.postAlt} />
            <span className="post-veil" />
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
            className="modal-sheet"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.imageUrl} alt={active.caption || labels.postAlt} />
            <div className="modal-body">
              <p>{active.caption || labels.noCaption}</p>
              <time dateTime={active.createdAt}>
                {new Date(active.createdAt).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>

              {enableLikes && (
                <div className="like-row">
                  <button
                    type="button"
                    className={`btn ${liked ? "btn-primary" : "btn-ghost"} like-btn`}
                    onClick={onLike}
                    disabled={pending || !visitorId}
                  >
                    {liked ? "♥" : "♡"} {liked ? labels.unlike : labels.like}
                  </button>
                  <span>
                    {active.likes || 0} {labels.likesCount}
                  </span>
                </div>
              )}

              {enableComments && (
                <div className="comments-box">
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

              <button type="button" className="btn btn-ghost" onClick={() => setActiveId(null)}>
                {labels.close}
              </button>
            </div>
          </article>
        </div>
      )}
    </>
  );
}
