"use client";

import { CheckCircle, XCircle, Trophy, Clock } from "lucide-react";
import type { VocabularyContent, VocabAnswers } from "@/types/skill-content";

interface Props {
  content: VocabularyContent;
  answers: VocabAnswers;
  viewerRole?: "student" | "teacher";
}

export function VocabAnswersViewer({ content, answers, viewerRole = "teacher" }: Props) {
  const { results, score } = answers;
  const wordMap = Object.fromEntries(content.words.map((w) => [w.id, w]));

  const correct  = results.filter((r) => r.correct);
  const wrong    = results.filter((r) => !r.correct);
  const totalMs  = answers.timeMs ?? 0;
  const minutes  = Math.floor(totalMs / 60000);
  const seconds  = Math.round((totalMs % 60000) / 1000);

  return (
    <div className="space-y-4">
      {/* ── Summary row ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Score */}
        <div
          className="flex flex-col items-center justify-center rounded-xl py-4 gap-1"
          style={{ background: "var(--primary-bg)", border: "1px solid var(--border)" }}
        >
          <Trophy className="h-5 w-5 mb-0.5" style={{ color: "var(--primary)" }} />
          <span className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{score}%</span>
          <span className="text-[11px]" style={{ color: "var(--text-3)" }}>Umumiy ball</span>
        </div>

        {/* Correct */}
        <div
          className="flex flex-col items-center justify-center rounded-xl py-4 gap-1"
          style={{ background: "var(--success-bg)", border: "1px solid var(--success)" }}
        >
          <CheckCircle className="h-5 w-5 mb-0.5" style={{ color: "var(--success)" }} />
          <span className="text-2xl font-bold" style={{ color: "var(--success)" }}>{correct.length}</span>
          <span className="text-[11px]" style={{ color: "var(--success)" }}>To'g'ri</span>
        </div>

        {/* Wrong */}
        <div
          className="flex flex-col items-center justify-center rounded-xl py-4 gap-1"
          style={{
            background: wrong.length === 0 ? "var(--surface-2)" : "var(--danger-bg, #fee2e2)",
            border: `1px solid ${wrong.length === 0 ? "var(--border)" : "var(--danger)"}`,
          }}
        >
          <XCircle
            className="h-5 w-5 mb-0.5"
            style={{ color: wrong.length === 0 ? "var(--text-3)" : "var(--danger)" }}
          />
          <span
            className="text-2xl font-bold"
            style={{ color: wrong.length === 0 ? "var(--text-3)" : "var(--danger)" }}
          >
            {wrong.length}
          </span>
          <span
            className="text-[11px]"
            style={{ color: wrong.length === 0 ? "var(--text-3)" : "var(--danger)" }}
          >
            Xato
          </span>
        </div>
      </div>

      {/* Time */}
      {totalMs > 0 && (
        <div className="flex items-center gap-2" style={{ color: "var(--text-3)" }}>
          <Clock className="h-3.5 w-3.5" />
          <span className="text-xs">
            Sarflangan vaqt: {minutes > 0 ? `${minutes}d ` : ""}{seconds}s
          </span>
        </div>
      )}

      {/* ── Correct words ─────────────────────────────────── */}
      {correct.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--success)" }}>
            ✓ To'g'ri topilgan ({correct.length} ta)
          </p>
          <div className="flex flex-wrap gap-2">
            {correct.map((r) => {
              const word = wordMap[r.wordId];
              if (!word) return null;
              return (
                <span
                  key={r.wordId}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                  style={{
                    borderColor: "var(--success)",
                    background: "var(--success-bg)",
                    color: "var(--success)",
                  }}
                >
                  <CheckCircle className="h-3 w-3" />
                  {word.word}
                  {word.pos && (
                    <span className="opacity-60 font-normal">({word.pos})</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Wrong words ────────────────────────────────────── */}
      {wrong.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--danger)" }}>
            ✗ Xato ({wrong.length} ta) — o'rganish kerak
          </p>
          <div className="space-y-2">
            {wrong.map((r) => {
              const word = wordMap[r.wordId];
              if (!word) return null;
              return (
                <div
                  key={r.wordId}
                  className="flex items-start gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: "var(--danger-bg, #fee2e2)",
                    border: "1px solid var(--danger)",
                  }}
                >
                  <XCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--danger)" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                        {word.word}
                      </span>
                      {word.pos && (
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px]"
                          style={{ background: "var(--surface)", color: "var(--text-3)" }}
                        >
                          {word.pos}
                        </span>
                      )}
                    </div>
                    <p className="text-xs mb-1.5" style={{ color: "var(--text-2)" }}>
                      {word.definition}
                    </p>
                    {word.example && (
                      <p className="text-[11px] italic mb-1.5" style={{ color: "var(--text-3)" }}>
                        "{word.example}"
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] flex-wrap">
                      <span style={{ color: "var(--danger)" }}>
                        Student tanladi: <em className="font-medium">{r.chosen || "—"}</em>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Perfect score message */}
      {wrong.length === 0 && correct.length > 0 && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3"
          style={{ background: "var(--success-bg)", color: "var(--success)" }}
        >
          <Trophy className="h-4 w-4 shrink-0" />
          <span className="text-sm font-semibold">Mukammal natija! Barcha so'zlar to'g'ri.</span>
        </div>
      )}

      {viewerRole === "student" && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: "var(--success-bg)", color: "var(--success)" }}
        >
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>Natijangiz saqlandi — o'qituvchingiz ko'rib chiqadi.</span>
        </div>
      )}
    </div>
  );
}
