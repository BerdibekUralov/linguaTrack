"use client";

import { useState, useRef, useEffect } from "react";
import {
  CheckCircle, Loader2, Video, Mic, ExternalLink,
  Clock, MessageSquare, Square, Circle, Play, Trash2,
} from "lucide-react";
import type { SpeakingContent } from "@/types/skill-content";
import { VideoJoinButton } from "@/components/video/video-call";

function isDailyUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".daily.co");
  } catch {
    return false;
  }
}

/* ── Audio recorder for a single question ─────────────────────────── */
function AudioRecorder({
  onAudioReady,
  audioUrl,
  onClear,
}: {
  onAudioReady: (url: string, blob: Blob) => void;
  audioUrl?: string;
  onClear: () => void;
}) {
  const [recording, setRecording]   = useState(false);
  const [elapsed, setElapsed]       = useState(0);   // seconds
  const mediaRef  = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const MAX_SECS = 180; // 3 minutes

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: getSupportedMime() });
      chunksRef.current = [];

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType });
        const url  = URL.createObjectURL(blob);
        onAudioReady(url, blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start(250);
      mediaRef.current = mr;
      setRecording(true);
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((s) => {
          if (s + 1 >= MAX_SECS) { stopRecording(); return MAX_SECS; }
          return s + 1;
        });
      }, 1000);
    } catch {
      alert("Microphone access denied. Please allow microphone and try again.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    mediaRef.current?.stop();
    setRecording(false);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (audioUrl) {
    return (
      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "var(--success-bg)", border: "1px solid var(--success)" }}>
        <Play className="h-4 w-4 shrink-0" style={{ color: "var(--success)" }} />
        <audio src={audioUrl} controls className="flex-1 h-8" style={{ minWidth: 0 }} />
        <button type="button" onClick={onClear} className="shrink-0 rounded-lg p-1 hover:opacity-70 transition" style={{ color: "var(--danger)" }}>
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {recording ? (
        <>
          <button type="button" onClick={stopRecording}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "var(--danger)" }}>
            <Square className="h-3.5 w-3.5" /> Stop
          </button>
          <span className="flex items-center gap-1.5 text-sm font-mono" style={{ color: "var(--danger)" }}>
            <Circle className="h-2 w-2 animate-pulse" style={{ fill: "var(--danger)", color: "var(--danger)" }} />
            {fmt(elapsed)} / {fmt(MAX_SECS)}
          </span>
        </>
      ) : (
        <button type="button" onClick={startRecording}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition hover:opacity-80"
          style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
          <Mic className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} /> Record audio
        </button>
      )}
    </div>
  );
}

function getSupportedMime(): string {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

/* ── Main component ────────────────────────────────────────────────── */
interface Props {
  content: SpeakingContent;
  submitted: boolean;
  onSubmit: (answers: Record<string, string>) => Promise<void>;
}

export function SpeakingSubmission({ content, submitted, onSubmit }: Props) {
  const [notes, setNotes]   = useState<Record<string, string>>({});
  // blobUrls: object URL for preview; blobs: actual Blob for upload
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});
  const [blobs, setBlobs]       = useState<Record<string, Blob>>({});
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    // Upload audio blobs → get server URLs
    const audioUrls: Record<string, string> = {};
    for (const [qId, blob] of Object.entries(blobs)) {
      try {
        const fd = new FormData();
        fd.append("file", blob, `audio-${qId}.webm`);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (res.ok) {
          const { url } = await res.json() as { url: string };
          audioUrls[`${qId}-audio`] = url;
        }
      } catch (err) { console.error("Audio upload failed for", qId, err); }
    }

    await onSubmit({ ...notes, ...audioUrls });
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
  const answered  = questions.filter((q) => (notes[q.id] ?? "").trim() || blobs[q.id]).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4" style={{ background: "var(--primary-bg-2)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-1">
          <Mic className="h-4 w-4" style={{ color: "var(--accent)" }} />
          <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>Async Speaking</p>
        </div>
        <p className="text-xs" style={{ color: "var(--text-2)" }}>
          Answer each question by typing and / or recording your voice.
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
              {/* Question header */}
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
                      {Math.floor(q.timeLimitSec / 60)} minutes suggested
                    </p>
                  )}
                </div>
              </div>

              {/* Answer area */}
              <div className="p-4 space-y-3" style={{ background: "var(--surface)" }}>
                {/* Text answer */}
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
                    Written answer
                  </p>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 pointer-events-none" style={{ color: "var(--text-3)" }} />
                    <textarea
                      className="w-full rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none resize-none"
                      style={{ border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)" }}
                      rows={3}
                      placeholder="Write your answer... (optional if you record audio)"
                      value={notes[q.id] ?? ""}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Audio answer */}
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
                    Voice answer — optional, max 3 min
                  </p>
                  <AudioRecorder
                    audioUrl={blobUrls[q.id]}
                    onAudioReady={(url, blob) => {
                      setBlobUrls((p) => ({ ...p, [q.id]: url }));
                      setBlobs((p) => ({ ...p, [q.id]: blob }));
                    }}
                    onClear={() => {
                      setBlobUrls((p) => { const n = { ...p }; delete n[q.id]; return n; });
                      setBlobs((p) => { const n = { ...p }; delete n[q.id]; return n; });
                    }}
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
          {loading ? "Uploading…" : "Submit"}
        </button>
      </div>
    </div>
  );
}
