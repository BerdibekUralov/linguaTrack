"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle, StopCircle, XCircle, Trash2, Loader2, Video } from "lucide-react";

interface Props {
  lessonId: string;
  status: string;
  roomUrl: string | null;
}

export function LessonActions({ lessonId, status, roomUrl }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const patch = async (body: Record<string, unknown>, actionKey: string) => {
    setLoading(actionKey);
    setError(null);
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Failed to update lesson");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const del = async () => {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    setLoading("delete");
    setError(null);
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Failed to delete lesson");
      }
      router.push("/lessons");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  };

  const isScheduled  = status === "SCHEDULED";
  const isLive       = status === "LIVE";
  const isTerminated = status === "ENDED" || status === "CANCELLED";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3.5"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}
      >
        <PlayCircle className="h-4 w-4" style={{ color: "var(--primary)" }} />
        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>Teacher controls</span>
      </div>

      <div className="flex flex-wrap gap-3 p-5">
        {/* Create Room (if no room yet) */}
        {!roomUrl && !isTerminated && (
          <button
            onClick={() => patch({ createRoom: true }, "create-room")}
            disabled={!!loading}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--primary-bg)", color: "var(--primary)", border: "1px solid var(--primary)" }}
          >
            {loading === "create-room" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
            Create room
          </button>
        )}

        {/* Go Live */}
        {isScheduled && (
          <button
            onClick={() => patch({ status: "LIVE" }, "go-live")}
            disabled={!!loading}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--danger)" }}
          >
            {loading === "go-live" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            Start lesson
          </button>
        )}

        {/* End lesson */}
        {isLive && (
          <button
            onClick={() => patch({ status: "ENDED" }, "end")}
            disabled={!!loading}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--warning)" }}
          >
            {loading === "end" ? <Loader2 className="h-4 w-4 animate-spin" /> : <StopCircle className="h-4 w-4" />}
            End lesson
          </button>
        )}

        {/* Cancel */}
        {isScheduled && (
          <button
            onClick={() => patch({ status: "CANCELLED" }, "cancel")}
            disabled={!!loading}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}
          >
            {loading === "cancel" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Cancel
          </button>
        )}

        {/* Delete */}
        {isTerminated && (
          <button
            onClick={del}
            disabled={!!loading}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger)" }}
          >
            {loading === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete lesson
          </button>
        )}
      </div>

      {error && (
        <p
          className="mx-5 mb-5 rounded-xl px-4 py-3 text-sm"
          style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
