"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { signIn, useSession } from "next-auth/react";
import type { Dictionary } from "@/lib/i18n";

type Answer = {
  id: string;
  name: string;
  image?: string;
  text: string;
  createdAt: string;
};

export function DailyQuestionBox({
  labels,
  locale = "ar",
}: {
  labels: Pick<
    Dictionary,
    | "questionTitle"
    | "questionLede"
    | "questionPlaceholder"
    | "questionSubmit"
    | "questionLogin"
    | "questionEmpty"
    | "questionInactive"
    | "loading"
  >;
  locale?: string;
}) {
  const { data: session } = useSession();
  const [enabled, setEnabled] = useState(true);
  const [question, setQuestion] = useState("");
  const [active, setActive] = useState(true);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const load = () =>
    fetch("/api/question")
      .then((r) => r.json())
      .then((d) => {
        setEnabled(d.enabled !== false);
        setQuestion(d.question?.text || "");
        setActive(d.question?.active !== false);
        setAnswers(d.question?.answers || []);
      })
      .catch(() => undefined);

  useEffect(() => {
    load();
  }, [session]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!session?.user || session.user.role !== "follower") {
      void signIn("google", { callbackUrl: "/?question=1" });
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || labels.questionInactive);
        return;
      }
      setText("");
      await load();
    });
  }

  if (!enabled || !question) return null;

  return (
    <section className="community-section daily-question">
      <div className="section-title">
        <h2>{labels.questionTitle}</h2>
        <p className="lede">{labels.questionLede}</p>
      </div>

      <div className="question-bubble">
        <p>{question}</p>
      </div>

      {!active ? (
        <p className="lede">{labels.questionInactive}</p>
      ) : (
        <form className="community-form" onSubmit={onSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={labels.questionPlaceholder}
            maxLength={280}
            rows={3}
            required
          />
          {error ? <p className="hint">{error}</p> : null}
          <button className="btn btn-primary" type="submit" disabled={pending}>
            {pending
              ? labels.loading
              : session?.user?.role === "follower"
                ? labels.questionSubmit
                : labels.questionLogin}
          </button>
        </form>
      )}

      <div className="community-list">
        {answers.length === 0 ? <p className="lede">{labels.questionEmpty}</p> : null}
        {answers.map((answer) => (
          <article key={answer.id} className="community-card">
            <div className="community-card-head">
              {answer.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={answer.image} alt="" />
              ) : (
                <span className="community-avatar-fallback" aria-hidden>
                  {answer.name.slice(0, 1)}
                </span>
              )}
              <div>
                <strong>{answer.name}</strong>
                <time dateTime={answer.createdAt}>
                  {new Date(answer.createdAt).toLocaleString(locale)}
                </time>
              </div>
            </div>
            <p>{answer.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
