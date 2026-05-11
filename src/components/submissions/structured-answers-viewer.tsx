"use client";

import { CheckCircle } from "lucide-react";
import type { Task } from "@/types/skill-content";

/* ─── helpers ──────────────────────────────────────────────────────────────── */

function norm(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

/** Accept if any slash-separated variant matches */
function isCorrect(student: string, expected: string): boolean {
  const s = norm(student);
  return expected
    .split("/")
    .map((v) => norm(v))
    .some((v) => v === s);
}

/* ─── per-answer-type renderers ─────────────────────────────────────────────── */

/** Fill in the sentence gap highlighted */
function FillAnswerRow({
  sentence,
  studentAnswer,
  correctAnswer,
}: {
  sentence: string;
  studentAnswer: string;
  correctAnswer?: string;
}) {
  const ok = correctAnswer ? isCorrect(studentAnswer, correctAnswer) : null;

  // Replace ___ with the student's answer
  const parts = sentence.split("___");
  return (
    <div>
      <p className="text-sm mb-1 leading-relaxed" style={{ color: "var(--text-2)" }}>
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span
                className="inline-block mx-0.5 px-2 py-0.5 rounded font-semibold text-sm"
                style={{
                  background:
                    ok === null
                      ? "var(--surface-2)"
                      : ok
                      ? "var(--success-bg)"
                      : "var(--danger-bg, #fee2e2)",
                  color:
                    ok === null
                      ? "var(--text)"
                      : ok
                      ? "var(--success)"
                      : "var(--danger)",
                  border: "1px solid var(--border)",
                }}
              >
                {studentAnswer || "–"}
              </span>
            )}
          </span>
        ))}
      </p>
      {correctAnswer && !ok && studentAnswer && (
        <p className="text-[11px]" style={{ color: "var(--success)" }}>
          ✓ Expected: <em>{correctAnswer}</em>
        </p>
      )}
    </div>
  );
}

/** Word choice — sentence with [opt1/opt2] inline  */
function WordChoiceAnswerRow({
  sentence,
  studentAnswer,
  correctAnswer,
}: {
  sentence: string;
  studentAnswer: string;
  correctAnswer?: string;
}) {
  const ok = correctAnswer ? isCorrect(studentAnswer, correctAnswer) : null;
  const parts = sentence.split(/(\[[^\]]+\])/g);

  return (
    <div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
        {parts.map((part, i) => {
          const match = part.match(/^\[([^/\]]+)\/([^\]]+)\]$/);
          if (!match) return <span key={i}>{part}</span>;
          const [, opt1, opt2] = match;
          return (
            <span key={i} className="inline-flex gap-1 mx-0.5 align-middle">
              {[opt1, opt2].map((opt) => {
                const chosen = norm(opt) === norm(studentAnswer);
                const isRight = correctAnswer ? norm(opt) === norm(correctAnswer) : false;
                return (
                  <span
                    key={opt}
                    className="rounded-md border px-2 py-0.5 text-xs font-semibold"
                    style={{
                      borderColor: chosen
                        ? ok === false
                          ? "var(--danger)"
                          : "var(--primary)"
                        : isRight
                        ? "var(--success)"
                        : "var(--border)",
                      background: chosen
                        ? ok === false
                          ? "var(--danger-bg, #fee2e2)"
                          : "var(--primary-bg)"
                        : isRight && ok === false
                        ? "var(--success-bg)"
                        : "transparent",
                      color: chosen
                        ? ok === false
                          ? "var(--danger)"
                          : "var(--primary)"
                        : isRight && ok === false
                        ? "var(--success)"
                        : "var(--text-3)",
                    }}
                  >
                    {opt}
                  </span>
                );
              })}
            </span>
          );
        })}
      </p>
    </div>
  );
}

/** MCQ — show options, highlight chosen */
function MCQAnswerRow({
  options,
  studentAnswer,
  correctAnswer,
}: {
  options: string[];
  studentAnswer: string;
  correctAnswer?: string;
}) {
  return (
    <div className="space-y-1.5 mt-1">
      {options.map((opt, i) => {
        const chosen = norm(opt) === norm(studentAnswer);
        const isRight = correctAnswer ? norm(opt) === norm(correctAnswer) : false;
        const ok = chosen && isRight;
        const wrong = chosen && correctAnswer && !isRight;

        return (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-lg border px-3 py-2"
            style={{
              borderColor: chosen
                ? wrong
                  ? "var(--danger)"
                  : "var(--success)"
                : isRight && correctAnswer
                ? "var(--success)"
                : "var(--border)",
              background: chosen
                ? wrong
                  ? "var(--danger-bg, #fee2e2)"
                  : "var(--success-bg)"
                : isRight && correctAnswer
                ? "var(--success-bg)"
                : "transparent",
            }}
          >
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                background: chosen ? (wrong ? "var(--danger)" : "var(--success)") : "var(--border)",
                color: chosen ? "#fff" : "var(--text-3)",
              }}
            >
              {String.fromCharCode(65 + i)}
            </span>
            <span className="text-xs flex-1" style={{ color: "var(--text)" }}>
              {opt}
            </span>
            {chosen && !wrong && <span className="text-[10px] font-bold" style={{ color: "var(--success)" }}>✓</span>}
            {chosen && wrong && <span className="text-[10px] font-bold" style={{ color: "var(--danger)" }}>✗</span>}
            {!chosen && isRight && correctAnswer && (
              <span className="text-[10px] font-bold" style={{ color: "var(--success)" }}>← correct</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** TFNG */
const TFNG_OPTIONS = ["TRUE", "FALSE", "NOT GIVEN"] as const;
function TFNGAnswerRow({
  studentAnswer,
  correctAnswer,
}: {
  studentAnswer: string;
  correctAnswer?: string;
}) {
  const ok = correctAnswer ? norm(studentAnswer) === norm(correctAnswer) : null;
  return (
    <div className="flex gap-2 mt-1">
      {TFNG_OPTIONS.map((opt) => {
        const chosen = norm(opt) === norm(studentAnswer);
        const isRight = correctAnswer ? norm(opt) === norm(correctAnswer) : false;
        return (
          <span
            key={opt}
            className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
            style={{
              borderColor: chosen
                ? ok === false
                  ? "var(--danger)"
                  : "var(--success)"
                : isRight && ok === false
                ? "var(--success)"
                : "var(--border)",
              background: chosen
                ? ok === false
                  ? "var(--danger-bg, #fee2e2)"
                  : "var(--success-bg)"
                : isRight && ok === false
                ? "var(--success-bg)"
                : "transparent",
              color: chosen
                ? ok === false
                  ? "var(--danger)"
                  : "var(--success)"
                : isRight && ok === false
                ? "var(--success)"
                : "var(--text-3)",
            }}
          >
            {opt === "NOT GIVEN" ? "NG" : opt.charAt(0)}
          </span>
        );
      })}
    </div>
  );
}

/** question_answer — show what the student wrote */
function QAAnswerRow({
  studentQuestion,
  studentShortAnswer,
}: {
  studentQuestion: string;
  studentShortAnswer: string;
}) {
  return (
    <div className="space-y-1.5 mt-1">
      {studentQuestion && (
        <div
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
        >
          <span className="text-[10px] uppercase tracking-wide mr-2" style={{ color: "var(--text-3)" }}>Q:</span>
          {studentQuestion}
        </div>
      )}
      {studentShortAnswer && (
        <div
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
        >
          <span className="text-[10px] uppercase tracking-wide mr-2" style={{ color: "var(--text-3)" }}>A:</span>
          {studentShortAnswer}
        </div>
      )}
    </div>
  );
}

/* ─── TaskBlock ─────────────────────────────────────────────────────────────── */

function TaskBlock({
  task,
  taskAnswers,
}: {
  task: Task;
  taskAnswers: Record<string, string>;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      {/* Task header */}
      <div
        className="px-4 py-2.5"
        style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-2)" }}>
          {task.title}
        </p>
      </div>

      {/* Word bank */}
      {task.wordBank && task.wordBank.length > 0 && (
        <div
          className="flex flex-wrap gap-1.5 px-4 py-2.5"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--primary-bg)" }}
        >
          <span className="text-[10px] uppercase tracking-wide mr-1 self-center" style={{ color: "var(--text-3)" }}>
            Word bank:
          </span>
          {task.wordBank.map((w) => (
            <span
              key={w}
              className="rounded-md border px-2 py-0.5 text-[11px]"
              style={{ borderColor: "var(--border)", color: "var(--text-2)", background: "var(--surface)" }}
            >
              {w}
            </span>
          ))}
        </div>
      )}

      <div className="p-4 space-y-4">
        {task.questions.map((q, i) => {
          /* ── pull out student answers ── */
          const qAny = q as unknown as Record<string, unknown>;
          const correctAnswer =
            typeof qAny.answer === "string" ? qAny.answer : undefined;

          const studentAnswer =
            typeof taskAnswers[q.id] === "string" ? taskAnswers[q.id] : "";

          /* question_answer has two sub-keys */
          const studentQ = taskAnswers[`${q.id}-q`] ?? "";
          const studentA = taskAnswers[`${q.id}-a`] ?? "";

          const hasAnswer =
            task.type === "question_answer"
              ? studentQ.trim() || studentA.trim()
              : studentAnswer.trim();

          if (!hasAnswer) return null;

          /* ── question text ── */
          const questionText =
            typeof qAny.text === "string"
              ? qAny.text
              : typeof qAny.sentence === "string"
              ? (qAny.sentence as string).replace(/\[[^\]]+\]/g, "___ ") // clean for display
              : typeof qAny.prompt === "string"
              ? qAny.prompt
              : "";

          return (
            <div key={q.id} className="flex items-start gap-2">
              {/* Number bubble */}
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white mt-0.5"
                style={{ background: "var(--accent)" }}
              >
                {i + 1}
              </span>

              <div className="flex-1 min-w-0">
                {/* Question text (skip for word_choice — sentence shown inline) */}
                {task.type !== "word_choice" && (
                  <p className="text-xs mb-1.5 leading-relaxed" style={{ color: "var(--text-3)" }}>
                    {questionText}
                  </p>
                )}

                {/* ── Type-specific answer display ── */}
                {task.type === "mcq" &&
                  Array.isArray((qAny as { options?: string[] }).options) && (
                    <MCQAnswerRow
                      options={(qAny as { options: string[] }).options}
                      studentAnswer={studentAnswer}
                      correctAnswer={correctAnswer}
                    />
                  )}

                {task.type === "tfng" && (
                  <TFNGAnswerRow
                    studentAnswer={studentAnswer}
                    correctAnswer={correctAnswer}
                  />
                )}

                {(task.type === "fill" || task.type === "short" || task.type === "transform") && (
                  <FillAnswerRow
                    sentence={
                      typeof qAny.sentence === "string"
                        ? (qAny.sentence as string)
                        : typeof qAny.text === "string"
                        ? `___ ${qAny.text as string}`
                        : "___"
                    }
                    studentAnswer={studentAnswer}
                    correctAnswer={correctAnswer}
                  />
                )}

                {task.type === "word_choice" &&
                  typeof qAny.sentence === "string" && (
                    <WordChoiceAnswerRow
                      sentence={qAny.sentence as string}
                      studentAnswer={studentAnswer}
                      correctAnswer={correctAnswer}
                    />
                  )}

                {task.type === "question_answer" && (
                  <QAAnswerRow
                    studentQuestion={studentQ}
                    studentShortAnswer={studentA}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────────────────────── */

interface Props {
  content: { tasks: Task[] };
  /** submission.answers — Record<taskId, Record<qId, answer>> */
  answers: Record<string, unknown>;
  viewerRole?: "student" | "teacher";
}

export function StructuredAnswersViewer({
  content,
  answers,
  viewerRole = "teacher",
}: Props) {
  const tasks = content.tasks ?? [];

  const hasAny = tasks.some((task) => {
    const raw = answers[task.id];
    if (!raw || typeof raw !== "object") return false;
    return Object.values(raw as Record<string, unknown>).some(
      (v) => typeof v === "string" && v.trim()
    );
  });

  if (!hasAny) {
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
      {tasks.map((task) => {
        const raw = answers[task.id];
        const taskAnswers: Record<string, string> =
          raw && typeof raw === "object"
            ? (raw as Record<string, string>)
            : {};
        return <TaskBlock key={task.id} task={task} taskAnswers={taskAnswers} />;
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
