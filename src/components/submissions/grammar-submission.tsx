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
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100">
        <h3 className="font-semibold text-emerald-800 text-sm">{task.title}</h3>
      </div>
      <div className="p-4 space-y-3">
        {task.questions.map((q, i) => (
          <div key={q.id} className="pt-3 first:pt-0">
            <p className="mb-2 text-sm text-gray-800 font-medium">
              <span className="mr-2 text-gray-400">{i + 1}.</span>
              {"text" in q ? q.text : "sentence" in q ? q.sentence : ""}
            </p>

            {task.type === "mcq" && "options" in q && (
              <div className="space-y-1.5">
                {(q.options as string[]).map((opt, oi) => (
                  <label key={oi} className={`flex items-center gap-3 rounded-lg border-2 px-4 py-2.5 cursor-pointer transition ${
                    answers[q.id] === opt
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => onChange(q.id, opt)}
                      className="accent-emerald-600"
                    />
                    <span className="text-sm">
                      <strong className="text-gray-400 mr-1">{String.fromCharCode(65 + oi)}.</strong>
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {(task.type === "fill" || task.type === "short" || task.type === "transform") && (
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder={
                  task.type === "fill"
                    ? "Bo'sh joyni to'ldiring..."
                    : task.type === "transform"
                    ? "Gapni o'zgartiring..."
                    : "Javob yozing..."
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
      <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-5 py-4">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <p className="text-sm text-green-700 font-medium">Topshirildi! O&apos;qituvchi tekshiradi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Explanation */}
      {content.explanation && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-800">Grammatika izoh</p>
          </div>
          <p className="text-sm text-emerald-900 leading-relaxed whitespace-pre-wrap">
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
        <p className="text-xs text-gray-400">{answered} / {totalQ} savol javoblandi</p>
        <button
          onClick={handleSubmit}
          disabled={loading || answered === 0}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          Topshirish
        </button>
      </div>
    </div>
  );
}
