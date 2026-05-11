"use client";

import { CheckCircle, XCircle } from "lucide-react";
import type { VocabularyContent, VocabAnswers } from "@/types/skill-content";

interface Props {
  content: VocabularyContent;
  answers: VocabAnswers;
  viewerRole?: "student" | "teacher";
}

export function VocabAnswersViewer({ content, answers, viewerRole = "teacher" }: Props) {
  const { results, score } = answers;
  const wordMap = Object.fromEntries(content.words.map((w) => [w.id, w]));

  const correct = results.filter((r) => r.correct).length;
  const total = results.length;

  return (
    <div className="space-y-3">
      {/* Score summary */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            {correct} / {total} correct
          </span>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            ({score}%)
          </span>
        </div>
        {answers.timeMs && (
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            ⏱ {Math.round(answers.timeMs / 1000)}s
          </span>
        )}
      </div>

      {/* Per-word results */}
      <div className="space-y-2">
        {results.map((r, i) => {
          const word = wordMap[r.wordId];
          if (!word) return null;
          return (
            <div
              key={r.wordId}
              className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{
                background: r.correct ? "var(--success-bg)" : "var(--danger-bg, #fee2e2)",
                border: `1px solid ${r.correct ? "var(--success)" : "var(--danger)"}`,
              }}
            >
              <span className="mt-0.5 shrink-0">
                {r.correct ? (
                  <CheckCircle className="h-4 w-4" style={{ color: "var(--success)" }} />
                ) : (
                  <XCircle className="h-4 w-4" style={{ color: "var(--danger)" }} />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                    {word.word}
                  </span>
                  {word.pos && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--surface)", color: "var(--text-3)" }}>
                      {word.pos}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>{word.definition}</p>
                {!r.correct && (
                  <p className="text-[11px] mt-1" style={{ color: "var(--danger)" }}>
                    Student chose: <em>{r.chosen}</em>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {viewerRole === "student" && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: "var(--success-bg)", color: "var(--success)" }}
        >
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>Submitted — your teacher will review your results.</span>
        </div>
      )}
    </div>
  );
}
