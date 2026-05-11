"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Video, Mic, ExternalLink, Clock, MessageSquare } from "lucide-react";
import type { SpeakingContent } from "@/types/skill-content";
import { VideoJoinButton } from "@/components/video/video-call";

function isDailyUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return hostname.endsWith(".daily.co");
  } catch {
    return false;
  }
}

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
      <div className="flex items-center gap-3 rounded-xl px-5 py-4"
        style={{ background: "var(--success-bg)", border: "1px solid var(--success)" }}>
        <CheckCircle className="h-5 w-5" style={{ color: "var(--success)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--success)" }}>
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
        <div className="rounded-xl p-5" style={{ background: "var(--primary-bg)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--primary)" }}>
              <Video className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--text)" }}>Live session</p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Your teacher will conduct a video session with you</p>
            </div>
          </div>

          {content.scheduledAt && (
            <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: "var(--text-2)" }}>
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                Scheduled:{" "}
                <strong style={{ color: "var(--text)" }}>
                  {new Date(content.scheduledAt).toLocaleString("en-US", {
                    weekday: "long", year: "numeric", month: "long",
                    day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </strong>
              </span>
            </div>
          )}

          {content.meetLink ? (
            isDailyUrl(content.meetLink) ? (
              <div className="flex justify-center">
                <VideoJoinButton roomUrl={content.meetLink} label="Join video call" />
              </div>
            ) : (
              <a href={content.meetLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition"
                style={{ background: "var(--primary)" }}>
                <Video className="h-4 w-4" />
                Join video call
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            )
          ) : (
            <p className="rounded-lg px-4 py-3 text-sm text-center"
              style={{ background: "var(--surface-2)", color: "var(--text-2)" }}>
              Your teacher will send the link soon
            </p>
          )}
        </div>

        {content.questions && content.questions.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div className="px-5 py-3" style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>Topics for discussion</p>
            </div>
            <div>
              {content.questions.map((q, i) => (
                <div key={q.id} className="px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                  <p className="text-sm" style={{ color: "var(--text)" }}>
                    <span className="mr-2 font-medium" style={{ color: "var(--text-3)" }}>{i + 1}.</span>
                    {q.text}
                  </p>
                  {q.hint && <p className="mt-1 text-xs italic pl-5" style={{ color: "var(--text-3)" }}>{q.hint}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition"
            style={{ background: "var(--primary)" }}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Ready to attend
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
      <div className="rounded-xl p-4" style={{ background: "var(--primary-bg-2)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-1">
          <Mic className="h-4 w-4" style={{ color: "var(--accent)" }} />
          <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>Async Speaking</p>
        </div>
        <p className="text-xs" style={{ color: "var(--text-2)" }}>
          Answer the questions in writing. Your teacher will review and grade your responses.
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-xl p-8 text-center text-sm border-dashed"
          style={{ border: "2px dashed var(--border)", color: "var(--text-3)" }}>
          Your teacher hasn&apos;t added questions yet
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <div className="px-5 py-3 flex items-start gap-3"
                style={{ background: "var(--primary-bg-2)", borderBottom: "1px solid var(--border)" }}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white mt-0.5"
                  style={{ background: "var(--accent)" }}>
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{q.text}</p>
                  {q.hint && <p className="text-xs mt-1 italic" style={{ color: "var(--text-3)" }}>{q.hint}</p>}
                  {q.timeLimitSec && (
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--accent)" }}>
                      <Clock className="h-3 w-3" />
                      {Math.floor(q.timeLimitSec / 60)} minutes
                    </p>
                  )}
                </div>
              </div>
              <div className="p-4" style={{ background: "var(--surface)" }}>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 pointer-events-none" style={{ color: "var(--text-3)" }} />
                  <textarea
                    className="w-full rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none resize-none"
                    style={{ border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)" }}
                    rows={4}
                    placeholder="Write your answer..."
                    value={notes[q.id] ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--text-3)" }}>{answered} / {questions.length} questions answered</p>
        <button onClick={handleSubmit} disabled={loading || answered === 0}
          className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition"
          style={{ background: "var(--accent)" }}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          Submit
        </button>
      </div>
    </div>
  );
}
