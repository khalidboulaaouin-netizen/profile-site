"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { signIn, useSession } from "next-auth/react";
import type { Dictionary } from "@/lib/i18n";
import type { ChatMessage, Conversation } from "@/lib/types";
import { VoiceRecorder } from "@/components/VoiceRecorder";

function lastFollowerMessageId(messages: ChatMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].from === "follower") return messages[i].id;
  }
  return null;
}

async function uploadVoice(blob: Blob): Promise<string> {
  const form = new FormData();
  const ext = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
  form.append("file", blob, `voice.${ext}`);
  const res = await fetch("/api/messages/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "upload failed");
  return data.url as string;
}

export function MessageButton({
  labels,
}: {
  labels: Pick<
    Dictionary,
    | "openChat"
    | "yourMessages"
    | "writeMessage"
    | "sendMessage"
    | "messageLoginRequired"
    | "messageLoginCta"
    | "loading"
    | "close"
    | "messageSent"
    | "messageFailed"
    | "noMessages"
    | "messageSeen"
    | "recordVoice"
    | "stopRecording"
    | "recording"
    | "voiceUnsupported"
    | "voicePermissionDenied"
    | "voiceMessage"
    | "sendingVoice"
  >;
}) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const load = () =>
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => setConversation(d.conversation || null))
      .catch(() => setConversation(null));

  useEffect(() => {
    if (open && session?.user?.role === "follower") {
      load();
      const timer = window.setInterval(load, 8000);
      return () => window.clearInterval(timer);
    }
  }, [open, session?.user?.role]);

  function openChat() {
    setError("");
    if (status === "loading") return;
    if (!session || session.user.role !== "follower") {
      void signIn("google", { callbackUrl: "/?message=1" });
      return;
    }
    setOpen(true);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("message") === "1" && session?.user?.role === "follower") {
      setOpen(true);
      window.history.replaceState({}, "", "/");
    }
  }, [session?.user?.role]);

  function sendPayload(payload: { text?: string; audioUrl?: string }) {
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || labels.messageFailed);
        return;
      }
      setConversation(data.conversation as Conversation);
      setText("");
    });
  }

  function onSend(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    sendPayload({ text });
  }

  async function onVoice(blob: Blob) {
    setError("");
    startTransition(async () => {
      try {
        const audioUrl = await uploadVoice(blob);
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioUrl }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || labels.messageFailed);
          return;
        }
        setConversation(data.conversation as Conversation);
      } catch (err) {
        setError(err instanceof Error ? err.message : labels.messageFailed);
      }
    });
  }

  const messages: ChatMessage[] = conversation?.messages || [];
  const seenMessageId = lastFollowerMessageId(messages);

  return (
    <>
      <button type="button" className="btn btn-ghost message-btn" onClick={openChat}>
        {labels.openChat}
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)} role="presentation">
          <div
            className="modal-sheet message-sheet"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="message-sheet-head">
              <h2>{labels.yourMessages}</h2>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                {labels.close}
              </button>
            </div>

            <div className="message-thread">
              {messages.length === 0 && <p className="hint">{labels.noMessages}</p>}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`bubble ${m.from === "follower" ? "mine" : "theirs"}`}
                >
                  {m.audioUrl && (
                    <audio className="voice-player" controls preload="metadata" src={m.audioUrl}>
                      {labels.voiceMessage}
                    </audio>
                  )}
                  {m.text ? <p>{m.text}</p> : null}
                  {!m.text && !m.audioUrl ? <p>{labels.noMessages}</p> : null}
                  <time dateTime={m.createdAt}>
                    {new Date(m.createdAt).toLocaleString()}
                  </time>
                  {m.from === "follower" &&
                    m.id === seenMessageId &&
                    m.readByOwner && (
                      <span className="read-receipt">{labels.messageSeen}</span>
                    )}
                </div>
              ))}
            </div>

            <form className="form-stack message-compose" onSubmit={onSend}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={labels.writeMessage}
                maxLength={1000}
                rows={3}
              />
              <VoiceRecorder
                disabled={pending}
                labels={labels}
                onRecorded={onVoice}
              />
              {error && <p className="hint">{error}</p>}
              <button
                className="btn btn-primary"
                type="submit"
                disabled={pending || !text.trim()}
              >
                {pending ? labels.loading : labels.sendMessage}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
