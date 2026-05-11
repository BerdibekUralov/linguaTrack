"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Video, ArrowLeft, Calendar, Clock, AlignLeft, Loader2, CheckCircle } from "lucide-react";

export default function NewLessonPage() {
  const router = useRouter();

  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration]     = useState(60);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          scheduledAt: new Date(scheduledAt).toISOString(),
          duration,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Failed to create lesson");
      }

      const lesson = await res.json() as { id: string };
      router.push(`/lessons/${lesson.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const durationOptions = [15, 30, 45, 60, 90, 120];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/lessons"
          className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:opacity-80"
          style={{ background: "var(--surface-2)", color: "var(--text-3)" }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "var(--primary-bg)" }}
          >
            <Video className="h-5 w-5" style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Schedule lesson</h1>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>Create a new live video session</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>Lesson details</p>
        </div>

        <div className="space-y-5 p-6">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
              Title *
            </label>
            <input
              type="text"
              required
              maxLength={200}
              placeholder="e.g. Present Perfect Deep Dive"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                color: "var(--text)",
              }}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
              <AlignLeft className="h-3 w-3" />
              Description
            </label>
            <textarea
              rows={3}
              maxLength={1000}
              placeholder="What will students learn in this lesson?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                color: "var(--text)",
              }}
            />
          </div>

          {/* Scheduled at */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
              <Calendar className="h-3 w-3" />
              Date &amp; Time *
            </label>
            <input
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                color: "var(--text)",
              }}
            />
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
              <Clock className="h-3 w-3" />
              Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {durationOptions.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className="rounded-xl px-4 py-2 text-sm font-medium transition"
                  style={{
                    background: duration === d ? "var(--primary)" : "var(--surface-2)",
                    color: duration === d ? "#fff" : "var(--text-2)",
                    border: `1px solid ${duration === d ? "var(--primary)" : "var(--border)"}`,
                  }}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}
        >
          <Link
            href="/lessons"
            className="rounded-xl px-5 py-2.5 text-sm font-medium transition hover:opacity-80"
            style={{ color: "var(--text-2)" }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !title.trim() || !scheduledAt}
            className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--primary)" }}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Schedule lesson
          </button>
        </div>
      </form>

      {/* Info note */}
      <p className="text-center text-xs" style={{ color: "var(--text-3)" }}>
        A video room will be created automatically if Daily.co is configured.
        Enrolled students will receive a notification.
      </p>
    </div>
  );
}
