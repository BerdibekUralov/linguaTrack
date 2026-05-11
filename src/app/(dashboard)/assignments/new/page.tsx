"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { SkillContentEditor } from "@/components/assignments/skill-content-editor";
import type { SkillContent } from "@/types/skill-content";
import {
  FRAMEWORK_LABELS,
  FRAMEWORK_LEVELS,
  FRAMEWORK_SKILLS,
  SKILL_LABELS,
  type Framework,
} from "@/types/skill-content";

const FRAMEWORK_ICONS: Record<Framework, string> = {
  IELTS:     "🎓",
  CEFR:      "🇪🇺",
  TOEFL:     "🏫",
  CAMBRIDGE: "🎩",
  DUOLINGO:  "🦜",
  GENERAL:   "📘",
};

const FRAMEWORK_DESC: Record<Framework, string> = {
  IELTS:     "Academic & General Training",
  CEFR:      "A1 → C2 European framework",
  TOEFL:     "iBT — US university entry",
  CAMBRIDGE: "KET / PET / FCE / CAE / CPE",
  DUOLINGO:  "Duolingo English Test",
  GENERAL:   "Custom course material",
};

type Step = "framework" | "details";

export default function NewAssignmentPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("framework");
  const [framework, setFramework]   = useState<Framework>("GENERAL");
  const [level, setLevel]           = useState("");
  const [skillType, setSkillType]   = useState("WRITING");
  const [skillContent, setSkillContent] = useState<SkillContent | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    instructions: "",
    type: "HOMEWORK",
    maxScore: 100,
    dueDate: "",
    allowLateSubmission: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const availableSkills = FRAMEWORK_SKILLS[framework];
  const levels          = FRAMEWORK_LEVELS[framework];

  // When framework changes reset level & skill
  const handleFramework = (f: Framework) => {
    setFramework(f);
    setLevel("");
    setSkillType(FRAMEWORK_SKILLS[f][0]);
    setSkillContent(null);
  };

  const handleSkill = (s: string) => {
    setSkillType(s);
    setSkillContent(null);
  };

  const save = async (status: "DRAFT" | "ACTIVE") => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        framework,
        level: level || null,
        skillType,
        maxScore: Number(form.maxScore),
        dueDate: form.dueDate || null,
        skillContent: skillType === "WRITING" ? null : skillContent,
      }),
    });

    if (!res.ok) {
      const json = await res.json() as { error?: string };
      setError(json.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const assignment = await res.json() as { id: string };

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

  /* ── STEP 1: Choose Framework ──────────────────────────────── */
  if (step === "framework") {
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
            <p className="text-sm" style={{ color: "var(--text-3)" }}>Step 1 of 2 — Choose framework</p>
          </div>
        </div>

        {/* Framework grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(Object.keys(FRAMEWORK_LABELS) as Framework[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => handleFramework(f)}
              className="flex flex-col items-start gap-2 rounded-2xl p-4 text-left transition-all"
              style={{
                background:   framework === f ? "var(--primary-bg)"  : "var(--surface)",
                border:       `2px solid ${framework === f ? "var(--primary)" : "var(--border)"}`,
                boxShadow:    framework === f ? "var(--shadow)" : undefined,
              }}
            >
              <span className="text-2xl">{FRAMEWORK_ICONS[f]}</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: framework === f ? "var(--primary)" : "var(--text)" }}>
                  {FRAMEWORK_LABELS[f]}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                  {FRAMEWORK_DESC[f]}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Level selector */}
        <Card>
          <CardBody className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                Target level <span style={{ color: "var(--text-3)" }}>(optional)</span>
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
              >
                <option value="">— Any level —</option>
                {levels.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep("details")} className="gap-2">
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  /* ── STEP 2: Assignment Details ────────────────────────────── */
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setStep("framework")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>New assignment</h1>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>Step 2 of 2 — Assignment details</p>
        </div>
        {/* Framework badge */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-1.5"
          style={{ background: "var(--primary-bg)", border: "1px solid var(--border)" }}
        >
          <span>{FRAMEWORK_ICONS[framework]}</span>
          <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
            {FRAMEWORK_LABELS[framework]}{level ? ` · ${level}` : ""}
          </span>
        </div>
      </div>

      {/* Skill selector */}
      <Card>
        <CardBody className="space-y-2">
          <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Skill type</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {availableSkills.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSkill(s)}
                className="rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition"
                style={{
                  borderColor: skillType === s ? "var(--primary)" : "var(--border)",
                  background:  skillType === s ? "var(--primary-bg)" : "var(--surface-2)",
                  color:       skillType === s ? "var(--primary)" : "var(--text-2)",
                }}
              >
                {SKILL_LABELS[s]}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Main form */}
      <Card>
        <CardBody className="space-y-5">
          <Input
            label="Title *"
            placeholder={`e.g. ${framework === "IELTS" ? "IELTS Writing Task 2 — Opinion Essay" : framework === "CEFR" ? "B2 Reading — Newspaper Article" : "Unit 5 — Reading comprehension"}`}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <Textarea
            label="Description"
            placeholder="Brief overview of the assignment..."
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {skillType === "WRITING" && (
            <Textarea
              label="Instructions"
              placeholder={
                framework === "IELTS"
                  ? "You should spend about 40 minutes on this task. Write at least 250 words..."
                  : framework === "TOEFL"
                  ? "You have 30 minutes to plan and write your response..."
                  : "How to complete this assignment..."
              }
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
                <option value="TEST">Test / Mock exam</option>
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
            <div className="rounded-xl p-3 text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
              {error}
            </div>
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
      {skillType !== "WRITING" && (
        <div>
          <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--text)" }}>
            {SKILL_LABELS[skillType]} — Content
          </h2>
          <SkillContentEditor
            framework={framework}
            skillType={skillType}
            value={skillContent}
            onChange={setSkillContent}
          />
        </div>
      )}

    </div>
  );
}
