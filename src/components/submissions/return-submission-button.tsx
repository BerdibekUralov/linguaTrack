"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2, X } from "lucide-react";

interface Props {
  submissionId: string;
  studentName: string;
}

export function ReturnSubmissionButton({ submissionId, studentName }: Props) {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [note, setNote]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleReturn = async () => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "return", note: note.trim() || undefined }),
    });
    setLoading(false);
    if (!res.ok) {
      const json = await res.json() as { error?: string };
      setError(json.error ?? "Xato yuz berdi");
      return;
    }
    setOpen(false);
    setNote("");
    router.refresh();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
        style={{ borderColor: "var(--border)", color: "var(--text-2)", background: "var(--surface)" }}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Qaytarish
      </button>
    );
  }

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: "var(--warning-bg, #fffbeb)", border: "1px solid var(--warning)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: "var(--warning)" }}>
          {studentName} ga qaytarish
        </p>
        <button onClick={() => setOpen(false)} style={{ color: "var(--text-3)" }}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-xs" style={{ color: "var(--text-2)" }}>
        Ishni qaytarsangiz, student uni qayta ko'rib, qayta topshirishi mumkin bo'ladi.
      </p>

      <textarea
        rows={2}
        placeholder="Izoh (ixtiyoriy) — nima o'zgartirilishi kerakligi..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
        style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
      />

      {error && <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg px-4 py-2 text-xs font-medium"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}
        >
          Bekor
        </button>
        <button
          onClick={() => void handleReturn()}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--warning)" }}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          Qaytarish
        </button>
      </div>
    </div>
  );
}
