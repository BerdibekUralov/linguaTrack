"use client";

import { Mic, MessageSquare, Volume2, Video, CheckCircle } from "lucide-react";
import type { SpeakingContent } from "@/types/skill-content";

interface Props {
  content: SpeakingContent;
  answers: Record<string, unknown>;
  /** Student viewing their own submission vs teacher grading */
  viewerRole?: "student" | "teacher";
}

export function SpeakingAnswersViewer({ content, answers, viewerRole = "teacher" }: Props) {
  const questions = content.questions ?? [];
  const isLive    = content.mode === "live";

  /* ── LIVE MODE ─────────────────────────────────────────────────── */
  if (isLive) {
    const confirmedAttendance = Object.keys(answers).length === 0 ||
      !Object.values(answers).some((v) => typeof v === "string" && v.trim());

    return (
      <div
        className="flex items-start gap-3 rounded-xl p-4"
        style={{ background: "var(--primary-bg)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--primary)" }}
        >
          <Video className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Live session confirmed
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
            {confirmedAttendance
              ? viewerRole === "student"
                ? "You confirmed attendance. The session will be conducted via video."
                : "Student confirmed readiness for the live video session."
              : "Student submitted notes for the session."}
          </p>

          {/* If teacher left a topic/cue card */}
          {content.cueCard && (
            <p className="mt-2 text-xs" style={{ color: "var(--text-2)" }}>
              Cue card: <em>{content.cueCard}</em>
            </p>
          )}

          {/* Any notes student may have written */}
          {questions.length > 0 && Object.keys(answers).length > 0 && (
            <div className="mt-3 space-y-2">
              {questions.map((q, i) => {
                const note = answers[q.id];
                if (typeof note !== "string" || !note.trim()) return null;
                return (
                  <div key={q.id}>
                    <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "var(--text-3)" }}>
                      Note for topic {i + 1}
                    </p>
                    <p className="text-xs rounded-lg px-3 py-2 whitespace-pre-wrap"
                      style={{ background: "var(--surface)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
                      {note}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── ASYNC MODE ─────────────────────────────────────────────────── */
  if (questions.length === 0) {
    return <p className="text-sm" style={{ color: "var(--text-3)" }}>No questions in this assignment.</p>;
  }

  const answeredQuestions = questions.filter(
    (q) => (typeof answers[q.id] === "string" && (answers[q.id] as string).trim()) ||
            typeof answers[`${q.id}-audio`] === "string"
  );

  if (answeredQuestions.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-3)" }}>
        {viewerRole === "student"
          ? "Your answers were not recorded. Please re-submit if needed."
          : "No answers were submitted for this assignment."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((q, i) => {
        const textAnswer = typeof answers[q.id] === "string" ? (answers[q.id] as string).trim() : "";
        const audioUrl   = typeof answers[`${q.id}-audio`] === "string" ? answers[`${q.id}-audio`] as string : "";

        if (!textAnswer && !audioUrl) return null;

        return (
          <div key={q.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
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
                  <audio controls src={audioUrl} className="w-full rounded-lg" style={{ height: 40 }} />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {viewerRole === "student" && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: "var(--success-bg)", color: "var(--success)" }}
        >
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>Submitted — your teacher will review and grade your answers.</span>
        </div>
      )}
    </div>
  );
}
