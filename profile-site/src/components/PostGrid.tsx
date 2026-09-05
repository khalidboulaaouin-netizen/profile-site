"use client";

import { useState } from "react";
import type { Post } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";

export function PostGrid({
  posts,
  labels,
  locale = "ar",
}: {
  posts: Post[];
  labels: Pick<Dictionary, "emptyPosts" | "noCaption" | "close" | "postAlt">;
  locale?: string;
}) {
  const [active, setActive] = useState<Post | null>(null);

  if (posts.length === 0) {
    return (
      <div className="empty-grid">
        <p>{labels.emptyPosts}</p>
      </div>
    );
  }

  return (
    <>
      <div className="post-grid">
        {posts.map((post, index) => (
          <button
            key={post.id}
            type="button"
            className="post-tile"
            style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
            onClick={() => setActive(post)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.imageUrl} alt={post.caption || labels.postAlt} />
            <span className="post-veil" />
          </button>
        ))}
      </div>

      {active && (
        <div className="modal-backdrop" onClick={() => setActive(null)} role="presentation">
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
              <button type="button" className="btn btn-ghost" onClick={() => setActive(null)}>
                {labels.close}
              </button>
            </div>
          </article>
        </div>
      )}
    </>
  );
}
