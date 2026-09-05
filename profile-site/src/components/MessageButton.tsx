"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { signIn, useSession } from "next-auth/react";
import type { Dictionary } from "@/lib/i18n";
import type { ChatMessage, Conversation } from "@/lib/types";

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

  function onSend(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
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

  const messages: ChatMessage[] = conversation?.messages || [];

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
                  <p>{m.text}</p>
                  <time dateTime={m.createdAt}>
                    {new Date(m.createdAt).toLocaleString()}
                  </time>
                </div>
              ))}
            </div>

            <form className="form-stack message-compose" onSubmit={onSend}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={labels.writeMessage}
                required
                maxLength={1000}
                rows={3}
              />
              {error && <p className="hint">{error}</p>}
              <button className="btn btn-primary" type="submit" disabled={pending}>
                {pending ? labels.loading : labels.sendMessage}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
