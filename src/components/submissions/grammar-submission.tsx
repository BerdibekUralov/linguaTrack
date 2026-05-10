"use client";

import { useState } from "react";
import { CheckCircle, Loader2, BookOpen } from "lucide-react";
import type { GrammarContent, StructuredAnswers, Task } from "@/types/skill-content";

interface Props {
  content: GrammarContent;
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
      <div className="px-5 py-3" style={{ background: "var(--success-bg)", borderBottom: "1px solid var(--border)" }}>
        <h3 className="font-semibold text-sm" style={{ color: "var(--success)" }}>{task.title}</h3>
      </div>
      <div className="p-4 space-y-3">
        {task.questions.map((q, i) => (
          <div key={q.id} className="pt-3 first:pt-0">
            <p className="mb-2 text-sm font-medium" style={{ color: "var(--text)" }}>
              <span className="mr-2" style={{ color: "var(--text-3)" }}>{i + 1}.</span>
              {"text" in q ? q.text : "sentence" in q ? q.sentence : ""}
            </p>

            {task.type === "mcq" && "options" in q && (
              <div className="space-y-1.5">
                {(q.options as string[]).map((opt, oi) => (
                  <label
                    key={oi}
                    className="flex items-center gap-3 rounded-lg border-2 px-4 py-2.5 cursor-pointer transition"
                    style={{
                      borderColor: answers[q.id] === opt ? "var(--success)" : "var(--border)",
                      background: answers[q.id] === opt ? "var(--success-bg)" : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => onChange(q.id, opt)}
                      style={{ accentColor: "var(--success)" }}
                    />
                    <span className="text-sm" style={{ color: "var(--text)" }}>
                      <strong className="mr-1" style={{ color: "var(--text-3)" }}>{String.fromCharCode(65 + oi)}.</strong>
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {(task.type === "fill" || task.type === "short" || task.type === "transform") && (
              <input
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color: "var(--text)",
                }}
                placeholder={
                  task.type === "fill"
                    ? "Fill in the blank..."
                    : task.type === "transform"
                    ? "Transform the sentence..."
                    : "Write your answer..."
                }
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

export function GrammarSubmission({ content, submitted, onSubmit }: Props) {
  const [answers, setAnswers] = useState<StructuredAnswers>({});
  const [loading, setLoading] = useState(false);

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
      {/* Explanation */}
      {content.explanation && (
        <div
          className="rounded-xl p-4"
          style={{ border: "1px solid var(--border)", background: "var(--success-bg)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4" style={{ color: "var(--success)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--success)" }}>Grammar explanation</p>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-2)" }}>
            {content.explanation}
          </p>
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

      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--text-3)" }}>{answered} / {totalQ} questions answered</p>
        <button
          onClick={handleSubmit}
          disabled={loading || answered === 0}
          className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition"
          style={{ background: "var(--success)" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          Submit
        </button>
      </div>
    </div>
  );
}
