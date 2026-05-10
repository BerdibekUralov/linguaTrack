"use client";

import { useState } from "react";
import { CheckCircle, BookOpen, Loader2 } from "lucide-react";
import type { ReadingContent, StructuredAnswers, Task } from "@/types/skill-content";

interface Props {
  content: ReadingContent;
  assignmentId: string;
  submitted: boolean;
  onSubmit: (answers: StructuredAnswers) => Promise<void>;
}

function TaskForm({ task, answers, onChange }: {
  task: Task;
  answers: Record<string, string>;
  onChange: (qId: string, val: string) => void;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div className="px-5 py-3" style={{ background: "var(--primary-bg)", borderBottom: "1px solid var(--border)" }}>
        <h3 className="font-semibold text-sm" style={{ color: "var(--primary)" }}>{task.title}</h3>
      </div>
      <div className="p-4 space-y-3">
        {task.questions.map((q, i) => (
          <div key={q.id} className="pt-3 first:pt-0">
            <p className="mb-2 text-sm font-medium" style={{ color: "var(--text)" }}>
              <span className="mr-2" style={{ color: "var(--text-3)" }}>{i + 1}.</span>
              {"text" in q ? q.text : "sentence" in q ? q.sentence : ""}
            </p>

            {task.type === "tfng" && (
              <div className="flex gap-2 flex-wrap">
                {(["TRUE", "FALSE", "NOT GIVEN"] as const).map((opt) => {
                  const selected = answers[q.id] === opt;
                  const selectedBg =
                    opt === "TRUE" ? "var(--success-bg)" :
                    opt === "FALSE" ? "var(--danger-bg)" :
                    "var(--surface-2)";
                  const selectedColor =
                    opt === "TRUE" ? "var(--success)" :
                    opt === "FALSE" ? "var(--danger)" :
                    "var(--text-2)";
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onChange(q.id, opt)}
                      className="rounded-lg px-4 py-2 text-xs font-semibold border-2 transition"
                      style={{
                        borderColor: selected ? selectedColor : "var(--border)",
                        background: selected ? selectedBg : "transparent",
                        color: selected ? selectedColor : "var(--text-2)",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {task.type === "mcq" && "options" in q && (
              <div className="space-y-1.5">
                {(q.options as string[]).map((opt, oi) => (
                  <label
                    key={oi}
                    className="flex items-center gap-3 rounded-lg border-2 px-4 py-2.5 cursor-pointer transition"
                    style={{
                      borderColor: answers[q.id] === opt ? "var(--primary)" : "var(--border)",
                      background: answers[q.id] === opt ? "var(--primary-bg)" : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => onChange(q.id, opt)}
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <span className="text-sm" style={{ color: "var(--text)" }}>
                      <strong className="mr-1" style={{ color: "var(--text-3)" }}>{String.fromCharCode(65 + oi)}.</strong>
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {(task.type === "fill" || task.type === "short") && (
              <input
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color: "var(--text)",
                }}
                placeholder={task.type === "fill" ? "Fill in the blank..." : "Short answer..."}
                value={answers[q.id] ?? ""}
                onChange={(e) => onChange(q.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReadingSubmission({ content, submitted, onSubmit }: Props) {
  const [answers, setAnswers] = useState<StructuredAnswers>({});
  const [loading, setLoading] = useState(false);
  const [passageOpen, setPassageOpen] = useState(true);

  const passages = Array.isArray(content.passages) ? content.passages : [];

  const setAnswer = (taskId: string, qId: string, val: string) =>
    setAnswers((prev) => ({ ...prev, [taskId]: { ...prev[taskId], [qId]: val } }));

  const totalQ = content.tasks.reduce((s, t) => s + t.questions.length, 0);
  const answered = Object.values(answers).reduce((s, t) => s + Object.keys(t).length, 0);

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit(answers);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div
        className="flex items-center gap-3 rounded-xl px-5 py-4"
        style={{ background: "var(--success-bg)", border: "1px solid var(--success)" }}
      >
        <CheckCircle className="h-5 w-5" style={{ color: "var(--success)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--success)" }}>Submitted! Your teacher will review it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Passages */}
      {passages.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <button
            type="button"
            onClick={() => setPassageOpen((o) => !o)}
            className="flex w-full items-center justify-between px-5 py-3 text-left transition"
            style={{ background: "var(--primary-bg)" }}
          >
            <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--primary)" }}>
              <BookOpen className="h-4 w-4" /> Reading {passages.length > 1 ? "Passages" : "Passage"}
            </span>
            <span className="text-xs" style={{ color: "var(--primary)" }}>{passageOpen ? "Hide ▲" : "Show ▼"}</span>
          </button>
          {passageOpen && (
            <div className="divide-y" style={{ borderTop: "1px solid var(--border)" }}>
              {passages.map((p, i) => (
                <div key={p.id ?? i} className="p-5" style={{ background: "var(--surface)" }}>
                  {(p.title || passages.length > 1) && (
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                      {p.title ?? `Passage ${i + 1}`}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto" style={{ color: "var(--text-2)" }}>
                    {p.text}
                  </p>
                  {p.source && (
                    <p className="mt-2 text-xs italic" style={{ color: "var(--text-3)" }}>Source: {p.source}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tasks */}
      {content.tasks.map((task) => (
        <TaskForm
          key={task.id}
          task={task}
          answers={answers[task.id] ?? {}}
          onChange={(qId, val) => setAnswer(task.id, qId, val)}
        />
      ))}

      {/* Submit */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--text-3)" }}>{answered} / {totalQ} questions answered</p>
        <button
          onClick={handleSubmit}
          disabled={loading || answered === 0}
          className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition"
          style={{ background: "var(--primary)" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          Submit
        </button>
      </div>
    </div>
  );
}
