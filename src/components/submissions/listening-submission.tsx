"use client";

import { useState, useRef } from "react";
import { Play, Pause, CheckCircle, Loader2, Volume2, ExternalLink } from "lucide-react";
import type { ListeningContent, StructuredAnswers, Task } from "@/types/skill-content";

interface Props {
  content: ListeningContent;
  submitted: boolean;
  onSubmit: (answers: StructuredAnswers) => Promise<void>;
}

// Simple audio player for direct URLs; YouTube iframes for YT links
function AudioPlayer({ url }: { url: string }) {
  const isYouTube = /youtube\.com|youtu\.be/.test(url);
  const isSoundCloud = /soundcloud\.com/.test(url);

  if (isYouTube) {
    const videoId = url.match(/(?:v=|youtu\.be\/)([^&?]+)/)?.[1];
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="w-full rounded-xl aspect-video border border-gray-200"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (isSoundCloud) {
    return (
      <iframe
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%236366f1&auto_play=false`}
        className="w-full rounded-xl border border-gray-200"
        style={{ height: 120 }}
      />
    );
  }

  // Direct audio file
  return (
    <audio controls src={url} className="w-full rounded-xl">
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-indigo-600 hover:underline">
        <ExternalLink className="h-4 w-4" /> Audioni tashqi havoladan tinglang
      </a>
    </audio>
  );
}

function TaskForm({ task, answers, onChange }: {
  task: Task; answers: Record<string, string>; onChange: (qId: string, val: string) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-purple-50 px-5 py-3 border-b border-purple-100">
        <h3 className="font-semibold text-purple-800 text-sm">{task.title}</h3>
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
                    answers[q.id] === opt ? "border-purple-500 bg-purple-50" : "border-gray-100 hover:border-gray-200"
                  }`}>
                    <input type="radio" name={`q-${q.id}`} value={opt}
                      checked={answers[q.id] === opt} onChange={() => onChange(q.id, opt)} className="accent-purple-600" />
                    <span className="text-sm"><strong className="text-gray-400 mr-1">{String.fromCharCode(65 + oi)}.</strong> {opt}</span>
                  </label>
                ))}
              </div>
            )}

            {(task.type === "fill" || task.type === "short") && (
              <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                placeholder="Javob yozing..." value={answers[q.id] ?? ""}
                onChange={(e) => onChange(q.id, e.target.value)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListeningSubmission({ content, submitted, onSubmit }: Props) {
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
      {/* Audio */}
      <div className="rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="h-4 w-4 text-purple-600" />
          <p className="text-sm font-semibold text-purple-800">Audio tinglang, so&apos;ng savollarga javob bering</p>
        </div>
        <AudioPlayer url={content.audioUrl} />
      </div>

      {/* Tasks */}
      {content.tasks.map((task) => (
        <TaskForm key={task.id} task={task}
          answers={answers[task.id] ?? {}}
          onChange={(qId, val) => setAnswer(task.id, qId, val)} />
      ))}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{answered} / {totalQ} savol javoblandi</p>
        <button onClick={handleSubmit} disabled={loading || answered === 0}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          Topshirish
        </button>
      </div>
    </div>
  );
}
