"use client";

import { AdminNav } from "@/components/AdminNav";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { getDictionary, normalizeLocale, type Dictionary } from "@/lib/i18n";
import type { Conversation } from "@/lib/types";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { isChatVideoMessage, uploadChatMedia } from "@/lib/chatMediaUpload";

type ConversationSummary = {
  id: string;
  googleId: string;
  name: string;
  email: string;
  image: string;
  updatedAt: string;
  preview: string;
  unread: number;
};

async function uploadVoice(blob: Blob): Promise<string> {
  const form = new FormData();
  const ext = blob.type.includes("mp4")
    ? "m4a"
    : blob.type.includes("ogg")
      ? "ogg"
      : "webm";
  form.append("file", blob, `voice.${ext}`);
  const res = await fetch("/api/messages/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "upload failed");
  return data.url as string;
}

function previewLabel(preview: string, t: Dictionary) {
  if (preview === "__voice__") return t.voiceMessage;
  if (preview === "__image__") return t.photoMessage;
  if (preview === "__video__") return t.videoMessage;
  return preview || t.noMessages;
}

export default function AdminMessagesPage() {
  const [t, setT] = useState<Dictionary>(() => getDictionary("ar"));
  const [locale, setLocale] = useState("ar");
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [reply, setReply] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadList = async () => {
    const [messagesRes, settingsRes] = await Promise.all([
      fetch("/api/messages"),
      fetch("/api/settings"),
    ]);
    const messagesData = await messagesRes.json();
    const settingsData = await settingsRes.json();
    const next = normalizeLocale(settingsData.settings?.language);
    setLocale(next);
    setT(getDictionary(next));
    setItems(messagesData.conversations || []);
  };

  useEffect(() => {
    loadList().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  function clearAttachment() {
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openConversation(googleId: string) {
    startTransition(async () => {
      const res = await fetch(
        `/api/messages?googleId=${encodeURIComponent(googleId)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.messageFailed);
        return;
      }
      setActive(data.conversation);
      setReply("");
      clearAttachment();
      await loadList();
    });
  }

  function onReply(e: FormEvent) {
    e.preventDefault();
    if (!active || (!reply.trim() && !pendingFile)) return;
    setError("");
    startTransition(async () => {
      try {
        let mediaUrl: string | undefined;
        let mediaType: "image" | "video" | undefined;
        if (pendingFile) {
          const uploaded = await uploadChatMedia(pendingFile);
          mediaUrl = uploaded.url;
          mediaType = uploaded.mediaType;
        }
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            googleId: active.googleId,
            text: reply.trim() || undefined,
            mediaUrl,
            mediaType,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || t.messageFailed);
          return;
        }
        setActive(data.conversation);
        setReply("");
        clearAttachment();
        await loadList();
      } catch (err) {
        setError(err instanceof Error ? err.message : t.messageFailed);
      }
    });
  }

  function onVoice(blob: Blob) {
    if (!active) return;
    setError("");
    startTransition(async () => {
      try {
        const audioUrl = await uploadVoice(blob);
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ googleId: active.googleId, audioUrl }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || t.messageFailed);
          return;
        }
        setActive(data.conversation);
        await loadList();
      } catch (err) {
        setError(err instanceof Error ? err.message : t.messageFailed);
      }
    });
  }

  const pendingIsVideo = pendingFile
    ? pendingFile.type.startsWith("video/") ||
      /\.(mp4|webm|mov|m4v)$/i.test(pendingFile.name)
    : false;

  return (
    <main className="admin-page">
      <AdminNav
        labels={{
          overview: t.overview,
          posts: t.posts,
          stories: t.stories,
          messages: t.messages,
          settings: t.settings,
          followers: t.followers,
          stats: t.stats,
          community: t.community,
          viewPage: t.viewPage,
          notifications: t.notifications,
          markAllRead: t.markAllRead,
          noNotifications: t.noNotifications,
          enableBrowserPush: t.enableBrowserPush,
        }}
      />

      {!active ? (
        <div className="panel">
          <h1>{t.inbox}</h1>
          <p className="lede">{t.inboxLede}</p>
          <div className="admin-list">
            {items.map((item) => (
              <button
                key={item.googleId}
                type="button"
                className="admin-item conversation-row"
                onClick={() => openConversation(item.googleId)}
              >
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" />
                ) : (
                  <span className="viewer-fallback">
                    {(item.name || "?").slice(0, 1)}
                  </span>
                )}
                <div>
                  <p style={{ margin: 0 }}>
                    {item.name}
                    {item.unread > 0 && (
                      <span className="unread-pill">
                        {t.unread}: {item.unread}
                      </span>
                    )}
                  </p>
                  <small style={{ color: "var(--muted)" }} dir="ltr">
                    {item.email}
                  </small>
                  <div>
                    <small style={{ color: "var(--muted)" }}>
                      {previewLabel(item.preview, t)}
                    </small>
                  </div>
                  <div>
                    <small style={{ color: "var(--muted)" }}>
                      {new Date(item.updatedAt).toLocaleString(locale)}
                    </small>
                  </div>
                </div>
              </button>
            ))}
            {!items.length && <p className="lede">{t.noMessages}</p>}
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="message-sheet-head">
            <div>
              <button
                type="button"
                className="btn-text"
                onClick={() => {
                  setActive(null);
                  clearAttachment();
                }}
              >
                {t.backToInbox}
              </button>
              <h1 style={{ marginTop: "0.5rem" }}>
                {t.conversationWith} {active.name}
              </h1>
              <small style={{ color: "var(--muted)" }} dir="ltr">
                {active.email}
              </small>
            </div>
          </div>

          <div className="message-thread admin-thread">
            {active.messages.map((m) => {
              const video = isChatVideoMessage(m.mediaType, m.mediaUrl);
              return (
                <div
                  key={m.id}
                  className={`bubble ${m.from === "owner" ? "mine" : "theirs"}`}
                >
                  {m.mediaUrl ? (
                    video ? (
                      <video
                        className="chat-media"
                        src={m.mediaUrl}
                        controls
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="chat-media" src={m.mediaUrl} alt="" />
                    )
                  ) : null}
                  {m.audioUrl && (
                    <audio
                      className="voice-player"
                      controls
                      preload="metadata"
                      src={m.audioUrl}
                    >
                      {t.voiceMessage}
                    </audio>
                  )}
                  {m.text ? <p>{m.text}</p> : null}
                  <time dateTime={m.createdAt}>
                    {new Date(m.createdAt).toLocaleString(locale)}
                  </time>
                </div>
              );
            })}
          </div>

          <form className="form-stack message-compose" onSubmit={onReply}>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={t.reply}
              maxLength={1000}
              rows={3}
            />
            {previewUrl && (
              <div className="chat-attach-preview">
                {pendingIsVideo ? (
                  <video
                    src={previewUrl}
                    muted
                    playsInline
                    controls
                    preload="metadata"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="" />
                )}
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={clearAttachment}
                  disabled={pending}
                >
                  {t.removeAttachment}
                </button>
              </div>
            )}
            <div className="message-compose-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
                hidden
                onChange={(e) => {
                  setPendingFile(e.target.files?.[0] || null);
                  setError("");
                }}
              />
              <button
                type="button"
                className="btn btn-ghost"
                disabled={pending}
                onClick={() => fileInputRef.current?.click()}
              >
                {t.attachMedia}
              </button>
              <VoiceRecorder
                disabled={pending}
                labels={t}
                onRecorded={onVoice}
              />
            </div>
            {error && <p className="hint">{error}</p>}
            <button
              className="btn btn-primary"
              type="submit"
              disabled={pending || (!reply.trim() && !pendingFile)}
            >
              {pending
                ? pendingFile
                  ? t.sendingMedia
                  : t.loading
                : t.sendReply}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
