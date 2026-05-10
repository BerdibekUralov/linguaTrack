"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
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

export default function NewAssignmentPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    instructions: "",
    type: "HOMEWORK",
    maxScore: 100,
    dueDate: "",
    allowLateSubmission: false,
    skillType: "WRITING",
  });
  const [skillContent, setSkillContent] = useState<SkillContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const save = async (status: "DRAFT" | "ACTIVE") => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        maxScore: Number(form.maxScore),
        dueDate: form.dueDate || null,
        skillContent: form.skillType === "WRITING" ? null : skillContent,
      }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const assignment = await res.json();

    if (status === "ACTIVE") {
      await fetch(`/api/assignments/${assignment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      });
    }

    setLoading(false);
    router.push("/assignments");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/assignments"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>New assignment</h1>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>Create an assignment for students</p>
        </div>
      </div>

      <Card>
        <CardBody className="space-y-5">
          <Input
            label="Title *"
            placeholder="e.g. Unit 5 — Reading comprehension"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <Textarea
            label="Description"
            placeholder="Brief overview of the assignment..."
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* Skill type selector */}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-2)" }}>Skill type</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(SKILL_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setForm({ ...form, skillType: key });
                    setSkillContent(null);
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

          {form.skillType !== "WRITING" && (
            <Textarea
              label="Instructions (optional)"
              placeholder="How to complete this assignment..."
              rows={2}
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            />
          )}

          {form.skillType === "WRITING" && (
            <Textarea
              label="Instructions"
              placeholder="How to complete this, format requirements..."
              rows={4}
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Assignment type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
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
              type="number"
              label="Max score"
              value={form.maxScore}
              onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })}
              min={1}
              max={1000}
            />
          </div>

          <Input
            type="datetime-local"
            label="Due date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.allowLateSubmission}
              onChange={(e) => setForm({ ...form, allowLateSubmission: e.target.checked })}
              className="h-4 w-4 rounded"
              style={{ accentColor: "var(--primary)" }}
            />
            <span className="text-sm" style={{ color: "var(--text-2)" }}>Allow late submissions</span>
          </label>

          {error && (
            <div className="rounded-xl p-3 text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" loading={loading} onClick={() => void save("DRAFT")}>
              Save as draft
            </Button>
            <Button loading={loading} onClick={() => void save("ACTIVE")}>
              Publish
            </Button>
          </div>
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
    </div>
  );
}
