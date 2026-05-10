"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface GradeFormProps {
  submissionId: string;
  maxScore: number;
  suggestedScore?: number; // auto-computed from answers
}

export function GradeForm({ submissionId, maxScore, suggestedScore }: GradeFormProps) {
  const router = useRouter();
  const [score, setScore] = useState(suggestedScore !== undefined ? String(suggestedScore) : "");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, score: Number(score), feedback }),
    });
    setLoading(false);
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Something went wrong");
      return;
    }
    setOpen(false);
    router.refresh();
  };

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        Grade
      </Button>
    );
  }

  return (
    <div
      className="space-y-3 rounded-lg p-4"
      style={{ background: "var(--primary-bg)", border: "1px solid var(--border)" }}
    >
      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>Enter score (max: {maxScore})</p>

      {suggestedScore !== undefined && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--primary)" }} />
          <p className="text-xs" style={{ color: "var(--text-2)" }}>
            Auto-calculated score:{" "}
            <strong style={{ color: "var(--text)" }}>{suggestedScore}/{maxScore}</strong> — you can confirm or adjust
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          placeholder={`0–${maxScore}`}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          min={0}
          max={maxScore}
        />
      </div>
      <Textarea
        placeholder="Feedback (optional)..."
        rows={3}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
        <Button size="sm" loading={loading} disabled={!score} onClick={submit}>
          Save
        </Button>
      </div>
    </div>
  );
}
