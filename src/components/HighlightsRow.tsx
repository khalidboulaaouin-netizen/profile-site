"use client";

import { useEffect, useState } from "react";
import type { Highlight } from "@/lib/types";

const SLIDE_MS = 5000;

export function HighlightsRow({
  highlights,
  label,
  emptyHint,
  closeLabel,
}: {
  highlights: Highlight[];
  label: string;
  emptyHint?: string;
  closeLabel: string;
}) {
  const playable = highlights.filter((h) => (h.items?.length || 0) > 0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  const active = playable.find((h) => h.id === activeId) || null;
  const slides = active?.items || [];
  const slide = slides[index] || null;

  useEffect(() => {
    if (!active || !slide) return;
    const timer = window.setTimeout(() => {
      setIndex((i) => {
        if (i >= slides.length - 1) {
          setActiveId(null);
          return 0;
        }
        return i + 1;
      });
    }, SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [activeId, index, slides.length, slide?.id]);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
      if (e.key === "ArrowRight") {
        setIndex((i) => Math.min(i + 1, Math.max(slides.length - 1, 0)));
      }
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, slides.length]);

  if (!playable.length) {
    if (!emptyHint) return null;
    return (
      <section className="highlights highlights-empty" aria-label={label}>
        <p className="hint">{emptyHint}</p>
      </section>
    );
  }

  return (
    <>
      <section className="highlights" aria-label={label}>
        {playable.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={`highlight ${item.items?.length ? "has-stories" : ""}`}
            style={{ animationDelay: `${i * 80}ms` }}
            onClick={() => {
              setActiveId(item.id);
              setIndex(0);
            }}
          >
            <div className="highlight-cover">
              {item.coverUrl || item.items?.[0]?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.coverUrl || item.items[0].imageUrl} alt="" />
              ) : (
                <span>{item.title.slice(0, 1)}</span>
              )}
            </div>
            <p>{item.title}</p>
          </button>
        ))}
      </section>

      {active && slide && (
        <div
          className="story-viewer highlight-viewer"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveId(null)}
        >
          <div className="story-viewer-inner" onClick={(e) => e.stopPropagation()}>
            <div className="story-progress">
              {slides.map((s, i) => (
                <span key={s.id} className={i <= index ? "on" : ""} />
              ))}
            </div>
            <div className="story-viewer-head">
              <strong>{active.title}</strong>
              <button type="button" className="btn btn-ghost" onClick={() => setActiveId(null)}>
                {closeLabel}
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.imageUrl} alt={slide.caption || active.title} className="story-media" />
            {slide.caption ? <p className="story-caption">{slide.caption}</p> : null}
            <button
              type="button"
              className="story-tap prev"
              aria-label="prev"
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            />
            <button
              type="button"
              className="story-tap next"
              aria-label="next"
              onClick={() =>
                setIndex((i) => {
                  if (i >= slides.length - 1) {
                    setActiveId(null);
                    return 0;
                  }
                  return i + 1;
                })
              }
            />
          </div>
        </div>
      )}
    </>
  );
}
