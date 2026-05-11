"use client";

import { Mic, MessageSquare, Volume2 } from "lucide-react";
import type { SpeakingContent } from "@/types/skill-content";

interface Props {
  content: SpeakingContent;
  answers: Record<string, string>;
}

export function SpeakingAnswersViewer({ content, answers }: Props) {
  const questions = content.questions ?? [];

  if (questions.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-3)" }}>No questions in this assignment.</p>
    );
  }

  const hasAnyAnswer = questions.some(
    (q) => answers[q.id]?.trim() || answers[`${q.id}-audio`]
  );

  if (!hasAnyAnswer) {
    return (
      <p className="text-sm" style={{ color: "var(--text-3)" }}>No answers submitted.</p>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((q, i) => {
        const textAnswer  = answers[q.id]?.trim() ?? "";
        const audioUrl    = answers[`${q.id}-audio`] ?? "";

        if (!textAnswer && !audioUrl) return null;

        return (
          <div
            key={q.id}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            {/* Question */}
            <div
              className="flex items-start gap-2.5 px-4 py-3"
              style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white mt-0.5"
                style={{ background: "var(--accent)" }}
              >
                {i + 1}
              </span>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{q.text}</p>
            </div>

            {/* Answers */}
            <div className="p-4 space-y-3">
              {textAnswer && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MessageSquare className="h-3.5 w-3.5" style={{ color: "var(--text-3)" }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
                      Written answer
                    </span>
                  </div>
                  <p
                    className="rounded-lg px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
                  >
                    {textAnswer}
                  </p>
                </div>
              )}

              {audioUrl && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Volume2 className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
                      Voice answer
                    </span>
                  </div>
                  <audio
                    controls
                    src={audioUrl}
                    className="w-full rounded-lg"
                    style={{ height: 40 }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
