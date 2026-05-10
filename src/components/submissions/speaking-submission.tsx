"use client";

import { useState } from "react";
import {
  CheckCircle,
  Loader2,
  Video,
  Mic,
  ExternalLink,
  Clock,
  MessageSquare,
} from "lucide-react";
import type { SpeakingContent } from "@/types/skill-content";

interface Props {
  content: SpeakingContent;
  submitted: boolean;
  onSubmit: (answers: Record<string, string>) => Promise<void>;
}

export function SpeakingSubmission({ content, submitted, onSubmit }: Props) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit(notes);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-5 py-4">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <p className="text-sm text-green-700 font-medium">
          {content.mode === "live"
            ? "Recorded! Your teacher will schedule the session."
            : "Your answers have been submitted! Your teacher will review them."}
        </p>
      </div>
    );
  }

  /* ─── LIVE MODE ─────────────────────────────────────────────── */
  if (content.mode === "live") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
              <Video className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-blue-900">Jonli dars (Live)</p>
              <p className="text-xs text-blue-500">O&apos;qituvchi siz bilan video dars o&apos;tkazadi</p>
            </div>
          </div>

          {content.scheduledAt && (
            <div className="flex items-center gap-2 mb-4 text-sm text-blue-700">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                Belgilangan vaqt:{" "}
                <strong>
                  {new Date(content.scheduledAt).toLocaleString("uz-UZ", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </span>
            </div>
          )}

          {content.meetLink ? (
            <a
              href={content.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              <Video className="h-4 w-4" />
              Google Meet ga kirish
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          ) : (
            <p className="rounded-lg bg-blue-100 px-4 py-3 text-sm text-blue-700 text-center">
              O&apos;qituvchi tez orada havola yuboradi
            </p>
          )}
        </div>

        {/* Questions preview */}
        {content.questions && content.questions.length > 0 && (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">Dars mavzulari</p>
            </div>
            <div className="divide-y divide-gray-50">
              {content.questions.map((q, i) => (
                <div key={q.id} className="px-5 py-3">
                  <p className="text-sm text-gray-700">
                    <span className="mr-2 text-gray-400 font-medium">{i + 1}.</span>
                    {q.text}
                  </p>
                  {q.hint && (
                    <p className="mt-1 text-xs text-gray-400 italic pl-5">{q.hint}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Qatnashishga tayyor
          </button>
        </div>
      </div>
    );
  }

  /* ─── ASYNC MODE ────────────────────────────────────────────── */
  const questions = content.questions ?? [];
  const answered = Object.values(notes).filter((v) => v.trim()).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Mic className="h-4 w-4 text-violet-600" />
          <p className="text-sm font-semibold text-violet-800">Asinxron Speaking</p>
        </div>
        <p className="text-xs text-violet-600">
          Savollarga yozma ravishda javob bering. O&apos;qituvchi tekshirib, baholaydi.
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
          O&apos;qituvchi savollarni hali qo&apos;shmagan
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-violet-50 px-5 py-3 border-b border-violet-100 flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-200 text-xs font-bold text-violet-700 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{q.text}</p>
                  {q.hint && <p className="text-xs text-gray-400 mt-1 italic">{q.hint}</p>}
                  {q.timeLimitSec && (
                    <p className="text-xs text-violet-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor(q.timeLimitSec / 60)} daqiqa
                    </p>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-300 pointer-events-none" />
                  <textarea
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 resize-none"
                    rows={4}
                    placeholder="Write your answer..."
                    value={notes[q.id] ?? ""}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{answered} / {questions.length} savol javoblandi</p>
        <button
          onClick={handleSubmit}
          disabled={loading || answered === 0}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          Topshirish
        </button>
      </div>
    </div>
  );
}
