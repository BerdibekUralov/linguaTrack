"use client";

import { useState } from "react";
import { CheckCircle, Loader2, BookOpen } from "lucide-react";
import type { GrammarContent, StructuredAnswers, Task } from "@/types/skill-content";

interface Props {
  content: GrammarContent;
  submitted: boolean;
  onSubmit: (answers: StructuredAnswers) => Promise<void>;
}

/* ── Render one sentence with [opt1/opt2] as inline clickable buttons ── */
function WordChoiceSentence({
  sentence,
  chosen,
  onChoose,
}: {
  sentence: string;
  chosen: string;
  onChoose: (val: string) => void;
}) {
  const parts = sentence.split(/(\[[^\]]+\])/g);
  return (
    <span className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
      {parts.map((part, i) => {
        const match = part.match(/^\[([^/\]]+)\/([^\]]+)\]$/);
        if (!match) return <span key={i}>{part}</span>;
        const [, opt1, opt2] = match;
        return (
          <span key={i} className="inline-flex gap-1 mx-0.5 align-middle">
            {[opt1, opt2].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChoose(opt)}
                className="rounded-md border px-2 py-0.5 text-xs font-semibold transition"
                style={{
                  borderColor: chosen === opt ? "var(--primary)" : "var(--border)",
                  background:  chosen === opt ? "var(--primary)" : "var(--surface-2)",
                  color:       chosen === opt ? "#fff" : "var(--text-2)",
                }}
              >
                {opt}
              </button>
            ))}
          </span>
        );
      })}
    </span>
  );
}

function TaskForm({
  task,
  answers,
  onChange,
}: {
  task: Task;
  answers: Record<string, string>;
  onChange: (qId: string, val: string) => void;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div className="px-5 py-3" style={{ background: "var(--success-bg)", borderBottom: "1px solid var(--border)" }}>
        <h3 className="font-semibold text-sm" style={{ color: "var(--success)" }}>{task.title}</h3>
      </div>

      {/* Word bank */}
      {task.wordBank && task.wordBank.length > 0 && (
        <div
          className="flex flex-wrap gap-2 px-5 py-3"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}
        >
          {task.wordBank.map((w) => (
            <span
              key={w}
              className="rounded-lg border px-2.5 py-0.5 text-xs font-medium"
              style={{ borderColor: "var(--border)", color: "var(--text-2)", background: "var(--surface)" }}
            >
              {w}
            </span>
          ))}
        </div>
      )}

      <div className="p-4 space-y-3">
        {task.questions.map((q, i) => (
          <div key={q.id} className="pt-3 first:pt-0">
            <div className="flex items-start gap-2 mb-2">
              <span className="mt-0.5 text-sm shrink-0" style={{ color: "var(--text-3)" }}>{i + 1}.</span>

              {/* ── Word choice ──────────────────────── */}
              {task.type === "word_choice" && "sentence" in q && (
                <WordChoiceSentence
                  sentence={q.sentence as string}
                  chosen={answers[q.id] ?? ""}
                  onChoose={(v) => onChange(q.id, v)}
                />
              )}

              {/* ── Question formation ───────────────── */}
              {task.type === "question_answer" && "prompt" in q && (
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                    {(q as { prompt: string }).prompt}
                  </p>
                  <input
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)" }}
                    placeholder="Write the question..."
                    value={answers[`${q.id}-q`] ?? ""}
                    onChange={(e) => onChange(`${q.id}-q`, e.target.value)}
                  />
                  <input
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)" }}
                    placeholder="Short answer (e.g. Yes, she did.)"
                    value={answers[`${q.id}-a`] ?? ""}
                    onChange={(e) => onChange(`${q.id}-a`, e.target.value)}
                  />
                </div>
              )}

              {/* ── MCQ ──────────────────────────────── */}
              {task.type === "mcq" && "text" in q && (
                <div className="flex-1">
                  <p className="mb-2 text-sm font-medium" style={{ color: "var(--text)" }}>{q.text}</p>
                  <div className="space-y-1.5">
                    {("options" in q ? q.options as string[] : []).map((opt, oi) => (
                      <label
                        key={oi}
                        className="flex items-center gap-3 rounded-lg border-2 px-4 py-2.5 cursor-pointer transition"
                        style={{
                          borderColor: answers[q.id] === opt ? "var(--success)" : "var(--border)",
                          background:  answers[q.id] === opt ? "var(--success-bg)" : "transparent",
                        }}
                      >
                        <input type="radio" name={`q-${q.id}`} value={opt}
                          checked={answers[q.id] === opt} onChange={() => onChange(q.id, opt)}
                          style={{ accentColor: "var(--success)" }} />
                        <span className="text-sm" style={{ color: "var(--text)" }}>
                          <strong className="mr-1" style={{ color: "var(--text-3)" }}>{String.fromCharCode(65 + oi)}.</strong>
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Fill / Short / Transform ─────────── */}
              {(task.type === "fill" || task.type === "short" || task.type === "transform") && (
                <div className="flex-1">
                  <p className="mb-2 text-sm" style={{ color: "var(--text)" }}>
                    {"text" in q ? q.text : "sentence" in q ? q.sentence : ""}
                  </p>
                  <input
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)" }}
                    placeholder={
                      task.type === "fill"      ? "Fill in the blank..." :
                      task.type === "transform" ? "Transform the sentence..." :
                      "Write your answer..."
                    }
                    value={answers[q.id] ?? ""}
                    onChange={(e) => onChange(q.id, e.target.value)}
                  />
                </div>
              )}
            </div>
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

  // Count answered questions (question_answer counts 2 fields per question)
  const totalQ = content.tasks.reduce((s, t) => {
    return s + t.questions.reduce((qs, q) => {
      return qs + (t.type === "question_answer" ? 2 : 1);
    }, 0);
  }, 0);

  const answered = content.tasks.reduce((s, task) => {
    const taskAnswers = answers[task.id] ?? {};
    return s + Object.values(taskAnswers).filter((v) => v.trim()).length;
  }, 0);

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit(answers);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-xl px-5 py-4"
        style={{ background: "var(--success-bg)", border: "1px solid var(--success)" }}>
        <CheckCircle className="h-5 w-5" style={{ color: "var(--success)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--success)" }}>Submitted! Your teacher will review it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {content.explanation && (
        <div className="rounded-xl p-4" style={{ border: "1px solid var(--border)", background: "var(--success-bg)" }}>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4" style={{ color: "var(--success)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--success)" }}>Grammar explanation</p>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-2)" }}>
            {content.explanation}
          </p>
        </div>
      )}

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
        <button onClick={handleSubmit} disabled={loading || answered === 0}
          className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition"
          style={{ background: "var(--success)" }}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          Submit
        </button>
      </div>
    </div>
  );
}
