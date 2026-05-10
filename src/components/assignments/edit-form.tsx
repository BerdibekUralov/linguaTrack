"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Save, Trash2, AlertTriangle } from "lucide-react";
import { SkillContentEditor } from "@/components/assignments/skill-content-editor";
import type { SkillContent } from "@/types/skill-content";

const SKILL_LABELS: Record<string, string> = {
  WRITING: "✍️ Writing",
  SPEAKING: "🎤 Speaking",
  READING: "📖 Reading",
  LISTENING: "🎧 Listening",
  GRAMMAR: "📝 Grammar",
  VOCABULARY: "📚 Vocabulary",
};

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  dueDate: Date | null;
  maxScore: number;
  type: string;
  status: string;
  skillType: string;
  skillContent: unknown;
}

export function EditAssignmentForm({ assignment }: { assignment: Assignment }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: assignment.title,
    description: assignment.description ?? "",
    instructions: assignment.instructions ?? "",
    maxScore: assignment.maxScore.toString(),
    type: assignment.type,
    skillType: assignment.skillType ?? "WRITING",
    dueDate: assignment.dueDate
      ? new Date(assignment.dueDate).toISOString().slice(0, 16)
      : "",
  });
  const [skillContent, setSkillContent] = useState<SkillContent | null>(
    (assignment.skillContent as SkillContent) ?? null
  );
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/assignments/${assignment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxScore: Number(form.maxScore),
          dueDate: form.dueDate || null,
          skillContent: form.skillType === "WRITING" ? null : skillContent,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push(`/assignments/${assignment.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/assignments/${assignment.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/assignments");
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardBody className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />

          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
          />

          <Textarea
            label="Instructions"
            value={form.instructions}
            onChange={(e) => set("instructions", e.target.value)}
            rows={4}
          />

          {/* Skill type */}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-2)" }}>Skill type</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(SKILL_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    set("skillType", key);
                    if (key !== form.skillType) setSkillContent(null);
                  }}
                  className="rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition"
                  style={{
                    borderColor: form.skillType === key ? "var(--primary)" : "var(--border)",
                    background: form.skillType === key ? "var(--primary-bg)" : "var(--surface-2)",
                    color: form.skillType === key ? "var(--primary)" : "var(--text-2)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text-2)" }}>Assignment type</label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
              >
                <option value="HOMEWORK">Homework</option>
                <option value="TEST">Test</option>
                <option value="PROJECT">Project</option>
                <option value="READING">Reading</option>
              </select>
            </div>

            <Input
              label="Max score"
              type="number"
              min={1}
              max={1000}
              value={form.maxScore}
              onChange={(e) => set("maxScore", e.target.value)}
              required
            />
          </div>

          <Input
            label="Due date (optional)"
            type="datetime-local"
            value={form.dueDate}
            onChange={(e) => set("dueDate", e.target.value)}
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
          )}
        </CardBody>
      </Card>

      {/* Skill content editor */}
      {form.skillType !== "WRITING" && (
        <div>
          <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--text)" }}>
            {SKILL_LABELS[form.skillType]} — Content settings
          </h2>
          <SkillContentEditor
            skillType={form.skillType}
            value={skillContent}
            onChange={setSkillContent}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-600">Are you sure?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
            >
              {deleting ? "..." : "Yes, delete"}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-lg border px-3 py-1.5 text-xs transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text-2)" }}
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border px-4 py-2 text-sm transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-2)" }}
          >
            Cancel
          </button>
          <Button type="submit" loading={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
    </form>
  );
}
