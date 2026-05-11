"use client";

import { CheckCircle, XCircle, MessageSquare, Volume2 } from "lucide-react";
import type { ListeningContent, Task } from "@/types/skill-content";

interface Props {
  content: ListeningContent;
  /** submission.answers — Record<taskId, Record<questionId, answer>> */
  answers: Record<string, unknown>;
  viewerRole?: "student" | "teacher";
}

/** Render a single task's questions with the student's answers */
function TaskAnswerBlock({
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
        <p className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>
          {task.title}
        </p>
      </div>

      <div className="p-4 space-y-3">
        {task.questions.map((q, i) => {
          const answer = taskAnswers[q.id] ?? "";
          const hasAnswer = answer.trim().length > 0;

          // Try to get the correct answer for feedback (teacher review)
          const correctAnswer =
            "answer" in q && typeof (q as { answer: string }).answer === "string"
              ? (q as { answer: string }).answer
              : null;

          return (
            <div key={q.id} className="flex items-start gap-2">
              {/* Question number */}
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white mt-0.5"
                style={{ background: "var(--accent)" }}
              >
                {i + 1}
              </span>

              <div className="flex-1 min-w-0">
                {/* Question text */}
                <p className="text-xs mb-1.5" style={{ color: "var(--text-3)" }}>
                  {"text" in q
                    ? (q as { text: string }).text
                    : "sentence" in q
                    ? (q as { sentence: string }).sentence
                    : ""}
                </p>

                {/* Student's answer */}
                {hasAnswer ? (
                  <div className="flex items-start gap-1.5">
                    <MessageSquare
                      className="h-3.5 w-3.5 mt-0.5 shrink-0"
                      style={{ color: "var(--text-3)" }}
                    />
                    <p
                      className="rounded-lg px-3 py-1.5 text-sm flex-1"
                      style={{
                        background: "var(--surface-2)",
                        color: "var(--text)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {answer}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs italic" style={{ color: "var(--text-3)" }}>
                    — not answered
                  </p>
                )}

                {/* Show correct answer for teacher */}
                {correctAnswer && (
                  <p className="text-[11px] mt-1" style={{ color: "var(--success)" }}>
                    ✓ Expected: <em>{correctAnswer}</em>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ListeningAnswersViewer({
  content,
  answers,
  viewerRole = "teacher",
}: Props) {
  const tasks = content.tasks ?? [];

  // Check if any answers were submitted
  const hasAnyAnswer = tasks.some((task) => {
    const taskAnswers = answers[task.id];
    if (!taskAnswers || typeof taskAnswers !== "object") return false;
    return Object.values(taskAnswers as Record<string, unknown>).some(
      (v) => typeof v === "string" && v.trim()
    );
  });

  if (!hasAnyAnswer) {
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
      {/* Audio reference (shared mode) */}
      {content.audioMode !== "per-task" && content.audioUrl && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs"
          style={{ background: "var(--primary-bg)", border: "1px solid var(--border)" }}
        >
          <Volume2 className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--accent)" }} />
          <span style={{ color: "var(--text-2)" }}>Audio: </span>
          <a
            href={content.audioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline truncate"
            style={{ color: "var(--primary)" }}
          >
            {content.audioUrl}
          </a>
        </div>
      )}

      {/* Per-task answers */}
      {tasks.map((task) => {
        const raw = answers[task.id];
        const taskAnswers: Record<string, string> =
          raw && typeof raw === "object"
            ? (raw as Record<string, string>)
            : {};

        const hasTaskAnswer = Object.values(taskAnswers).some(
          (v) => typeof v === "string" && v.trim()
        );

        if (!hasTaskAnswer) return null;

        return (
          <div key={task.id} className="space-y-2">
            {/* Per-task audio link */}
            {content.audioMode === "per-task" && task.audioUrl && (
              <div
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs"
                style={{ background: "var(--primary-bg)", border: "1px solid var(--border)" }}
              >
                <Volume2
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: "var(--accent)" }}
                />
                <span style={{ color: "var(--text-2)" }}>Task audio:</span>
                <a
                  href={task.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline truncate"
                  style={{ color: "var(--primary)" }}
                >
                  {task.audioUrl}
                </a>
              </div>
            )}
            <TaskAnswerBlock task={task} taskAnswers={taskAnswers} />
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
