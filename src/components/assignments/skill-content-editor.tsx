"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type {
  SpeakingContent, ReadingContent, ListeningContent,
  GrammarContent, VocabularyContent, UseOfEnglishContent,
  WritingContent, Task, VocabWord, Framework,
} from "@/types/skill-content";
import type { SkillContent } from "@/types/skill-content";

interface Props {
  framework:  Framework;
  skillType:  string;
  value:      SkillContent | null;
  onChange:   (v: SkillContent) => void;
}

const uid = () => Math.random().toString(36).slice(2, 8);

// ─── WRITING EDITOR ───────────────────────────────────────────────────────────
function WritingEditor({ framework, value, onChange }: {
  framework: Framework;
  value: WritingContent;
  onChange: (v: WritingContent) => void;
}) {
  const set = (k: keyof WritingContent, v: unknown) => onChange({ ...value, [k]: v });

  if (framework === "IELTS") {
    return (
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-2)" }}>Task type</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              ["task1_academic", "Task 1 Academic"],
              ["task1_general",  "Task 1 General"],
              ["task2",          "Task 2 Essay"],
            ] as const).map(([val, label]) => (
              <button key={val} type="button"
                onClick={() => set("taskType", val)}
                className="rounded-xl border-2 py-2.5 text-sm font-medium transition"
                style={{
                  borderColor: value.taskType === val ? "var(--primary)" : "var(--border)",
                  background:  value.taskType === val ? "var(--primary-bg)" : "var(--surface-2)",
                  color:       value.taskType === val ? "var(--primary)" : "var(--text-2)",
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {value.taskType === "task1_academic" && (
          <Field label="Graph / Chart / Diagram URL (optional)">
            <input className={inp} placeholder="https://... (image URL)"
              value={value.imageUrl ?? ""} onChange={(e) => set("imageUrl", e.target.value)} />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label={`Word limit (min ${value.taskType === "task2" ? "250" : "150"})`}>
            <input className={inp} type="number" placeholder={value.taskType === "task2" ? "250" : "150"}
              value={value.wordLimit ?? ""} onChange={(e) => set("wordLimit", Number(e.target.value))} />
          </Field>
          <Field label="Time limit (minutes)">
            <input className={inp} type="number" placeholder={value.taskType === "task2" ? "40" : "20"}
              value={value.timeLimit ?? ""} onChange={(e) => set("timeLimit", Number(e.target.value))} />
          </Field>
        </div>
        <Field label="Sample answer (optional — shown after grading)">
          <textarea className={`${inp} min-h-24`} placeholder="Model answer..."
            value={value.sampleAnswer ?? ""} onChange={(e) => set("sampleAnswer", e.target.value)} />
        </Field>
      </div>
    );
  }

  if (framework === "TOEFL") {
    return (
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-2)" }}>Task type</label>
          <div className="grid grid-cols-2 gap-2">
            {([["integrated", "Integrated Writing"], ["independent", "Independent Writing"]] as const).map(([val, label]) => (
              <button key={val} type="button" onClick={() => set("toeflType", val)}
                className="rounded-xl border-2 py-2.5 text-sm font-medium transition"
                style={{
                  borderColor: value.toeflType === val ? "var(--primary)" : "var(--border)",
                  background:  value.toeflType === val ? "var(--primary-bg)" : "var(--surface-2)",
                  color:       value.toeflType === val ? "var(--primary)" : "var(--text-2)",
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {value.toeflType === "integrated" && (
          <>
            <Field label="Reading passage">
              <textarea className={`${inp} min-h-32`} placeholder="Paste the reading passage..."
                value={value.readingPassage ?? ""} onChange={(e) => set("readingPassage", e.target.value)} />
            </Field>
            <Field label="Lecture audio URL">
              <input className={inp} placeholder="https://..." value={value.audioUrl ?? ""}
                onChange={(e) => set("audioUrl", e.target.value)} />
            </Field>
            <Field label="Audio transcript (optional)">
              <textarea className={`${inp} min-h-24`} placeholder="Lecture transcript..."
                value={value.audioScript ?? ""} onChange={(e) => set("audioScript", e.target.value)} />
            </Field>
          </>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Word limit">
            <input className={inp} type="number" placeholder="150"
              value={value.wordLimit ?? ""} onChange={(e) => set("wordLimit", Number(e.target.value))} />
          </Field>
          <Field label="Time limit (minutes)">
            <input className={inp} type="number" placeholder={value.toeflType === "integrated" ? "20" : "30"}
              value={value.timeLimit ?? ""} onChange={(e) => set("timeLimit", Number(e.target.value))} />
          </Field>
        </div>
      </div>
    );
  }

  // CEFR / Cambridge / General writing
  const writingTypes = framework === "CAMBRIDGE"
    ? ["essay", "letter", "email", "report", "review", "proposal", "article"]
    : ["essay", "email", "letter", "report", "review", "story", "article", "proposal"];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-2)" }}>Writing type</label>
        <div className="flex flex-wrap gap-2">
          {writingTypes.map((t) => (
            <button key={t} type="button" onClick={() => set("writingType", t)}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition"
              style={{
                borderColor: value.writingType === t ? "var(--primary)" : "var(--border)",
                background:  value.writingType === t ? "var(--primary-bg)" : "transparent",
                color:       value.writingType === t ? "var(--primary)" : "var(--text-2)",
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Word limit">
          <input className={inp} type="number" placeholder="200"
            value={value.wordLimit ?? ""} onChange={(e) => set("wordLimit", Number(e.target.value))} />
        </Field>
        <Field label="Time limit (minutes)">
          <input className={inp} type="number" placeholder="45"
            value={value.timeLimit ?? ""} onChange={(e) => set("timeLimit", Number(e.target.value))} />
        </Field>
      </div>
      <Field label="Format requirements (optional)">
        <input className={inp} placeholder="e.g. Start with Dear Sir/Madam, use formal register"
          value={value.format ?? ""} onChange={(e) => set("format", e.target.value)} />
      </Field>
    </div>
  );
}

// ─── SPEAKING EDITOR ──────────────────────────────────────────────────────────
function SpeakingEditor({ framework, value, onChange }: {
  framework: Framework;
  value: SpeakingContent;
  onChange: (v: SpeakingContent) => void;
}) {
  const set = (k: keyof SpeakingContent, v: unknown) => onChange({ ...value, [k]: v });
  const qs = value.questions ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {(["live", "async"] as const).map((m) => (
          <button key={m} type="button" onClick={() => set("mode", m)}
            className="flex-1 rounded-xl border-2 py-3 text-sm font-medium transition"
            style={{
              borderColor: value.mode === m ? "var(--primary)" : "var(--border)",
              background:  value.mode === m ? "var(--primary-bg)" : "transparent",
              color:       value.mode === m ? "var(--primary)" : "var(--text-2)",
            }}>
            {m === "live" ? "🎥 Live (Google Meet)" : "🎙️ Async (written notes)"}
          </button>
        ))}
      </div>

      {value.mode === "live" && (
        <>
          <Field label="Google Meet link">
            <input className={inp} placeholder="https://meet.google.com/xxx-yyyy-zzz"
              value={value.meetLink ?? ""} onChange={(e) => set("meetLink", e.target.value)} />
          </Field>
          <Field label="Scheduled time (optional)">
            <input type="datetime-local" className={inp}
              value={value.scheduledAt ?? ""} onChange={(e) => set("scheduledAt", e.target.value)} />
          </Field>
        </>
      )}

      {framework === "IELTS" && (
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-2)" }}>
          <input type="checkbox" checked={value.ieltsParts ?? false}
            onChange={(e) => set("ieltsParts", e.target.checked)}
            style={{ accentColor: "var(--primary)" }} />
          Use IELTS Part 1 / Part 2 / Part 3 structure
        </label>
      )}

      {(value.ieltsParts && framework === "IELTS") && (
        <Field label="Part 2 — Cue card">
          <textarea className={`${inp} min-h-20`}
            placeholder="Describe a place you have visited. You should say: where it is, when you went there, what you did..."
            value={value.cueCard ?? ""} onChange={(e) => set("cueCard", e.target.value)} />
        </Field>
      )}

      {framework === "TOEFL" && (
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-2)" }}>Task type</label>
          <div className="grid grid-cols-2 gap-2">
            {([["integrated", "Integrated"], ["independent", "Independent"]] as const).map(([val, label]) => (
              <button key={val} type="button" onClick={() => set("toeflType", val)}
                className="rounded-xl border-2 py-2 text-sm font-medium transition"
                style={{
                  borderColor: value.toeflType === val ? "var(--primary)" : "var(--border)",
                  background:  value.toeflType === val ? "var(--primary-bg)" : "var(--surface-2)",
                  color:       value.toeflType === val ? "var(--primary)" : "var(--text-2)",
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            {value.mode === "live" ? "Topics / questions" : "Questions to answer"}
          </label>
          <AddBtn onClick={() => set("questions", [...qs, { id: uid(), text: "", hint: "", timeLimitSec: 120 }])} />
        </div>
        {qs.map((q, i) => (
          <div key={q.id} className="mb-3 rounded-xl p-3 space-y-2" style={{ border: "1px solid var(--border)" }}>
            <div className="flex gap-2">
              <span className="mt-2.5 text-xs font-bold w-5" style={{ color: "var(--text-3)" }}>{i + 1}.</span>
              <input className={`${inp} flex-1`} placeholder="Question text..."
                value={q.text} onChange={(e) => {
                  const u = [...qs]; u[i] = { ...q, text: e.target.value }; set("questions", u);
                }} />
              <button type="button" onClick={() => set("questions", qs.filter((_, j) => j !== i))}
                className="mt-1.5" style={{ color: "var(--danger)" }}><Trash2 className="h-4 w-4" /></button>
            </div>
            <input className={inp} placeholder="Hint (optional)..."
              value={q.hint ?? ""} onChange={(e) => {
                const u = [...qs]; u[i] = { ...q, hint: e.target.value }; set("questions", u);
              }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VOCABULARY EDITOR ────────────────────────────────────────────────────────
function VocabularyEditor({ value, onChange }: { value: VocabularyContent; onChange: (v: VocabularyContent) => void }) {
  const words = value.words ?? [];
  const setWords = (w: VocabWord[]) => onChange({ ...value, words: w });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>{words.length} words</label>
        <AddBtn label="Add word" onClick={() =>
          setWords([...words, { id: uid(), word: "", definition: "", example: "", pos: "noun" }])} />
      </div>
      {words.map((w, i) => (
        <div key={w.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {/* Header row */}
          <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "var(--primary)" }}>{i + 1}</span>
            <select value={w.pos ?? "noun"}
              onChange={(e) => { const u = [...words]; u[i] = { ...w, pos: e.target.value }; setWords(u); }}
              className="rounded-lg px-2 py-1 text-xs font-medium outline-none"
              style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-2)" }}>
              {["noun","verb","adjective","adverb","phrase","idiom"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button type="button" onClick={() => setWords(words.filter((_, j) => j !== i))}
              className="ml-auto rounded-lg p-1 transition hover:opacity-70" style={{ color: "var(--danger)" }}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          {/* Fields */}
          <div className="p-4 space-y-2.5">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Word *</label>
              <input className={`${inp} font-semibold text-base`} placeholder="e.g. afraid"
                value={w.word} onChange={(e) => { const u = [...words]; u[i] = { ...w, word: e.target.value }; setWords(u); }} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Definition *</label>
              <input className={inp} placeholder="e.g. feeling fear or being scared"
                value={w.definition} onChange={(e) => { const u = [...words]; u[i] = { ...w, definition: e.target.value }; setWords(u); }} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Example sentence</label>
              <input className={inp} placeholder="e.g. I am afraid of big dogs."
                value={w.example ?? ""} onChange={(e) => { const u = [...words]; u[i] = { ...w, example: e.target.value }; setWords(u); }} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Pronunciation — optional</label>
              <input className={inp} placeholder="e.g. /əˈfreɪd/"
                value={w.pronunciation ?? ""} onChange={(e) => { const u = [...words]; u[i] = { ...w, pronunciation: e.target.value }; setWords(u); }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PASSAGE + TASKS EDITOR (Reading / Listening / Grammar) ──────────────────
function TasksEditor({ tasks, onChange, showTaskAudio = false }: {
  tasks: Task[];
  onChange: (t: Task[]) => void;
  showTaskAudio?: boolean;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const TASK_LABELS: Record<string, string> = {
    mcq: "Multiple choice", tfng: "True/False/NG", fill: "Fill in blanks",
    short: "Short answer", transform: "Key word transformation",
    word_choice: "Word choice (A / B)", question_answer: "Question formation",
  };
  const addTask = (type: Task["type"]) => {
    const t: Task = { id: uid(), type, title: TASK_LABELS[type] ?? type, questions: [] };
    onChange([...tasks, t]);
    setOpen(t.id);
  };
  const updateTask = (i: number, t: Task) => { const u = [...tasks]; u[i] = t; onChange(u); };
  const removeTask = (i: number) => onChange(tasks.filter((_, j) => j !== i));

  return (
    <div className="space-y-3">
      {tasks.map((task, ti) => (
        <div key={task.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <button type="button" onClick={() => setOpen(open === task.id ? null : task.id)}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition"
            style={{ background: "var(--surface-2)" }}>
            <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
              {task.title} <span className="ml-1 text-xs" style={{ color: "var(--text-3)" }}>({task.questions.length} questions)</span>
            </span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); removeTask(ti); }}
                className="rounded p-1" style={{ color: "var(--danger)" }}><Trash2 className="h-3.5 w-3.5" /></button>
              {open === task.id
                ? <ChevronUp className="h-4 w-4" style={{ color: "var(--text-3)" }} />
                : <ChevronDown className="h-4 w-4" style={{ color: "var(--text-3)" }} />}
            </div>
          </button>

          {open === task.id && (
            <div className="p-4 space-y-3">
              <input className={inp} placeholder="Task title..."
                value={task.title} onChange={(e) => updateTask(ti, { ...task, title: e.target.value })} />

              {showTaskAudio && (
                <input className={inp} placeholder="Audio URL for this task..."
                  value={task.audioUrl ?? ""}
                  onChange={(e) => updateTask(ti, { ...task, audioUrl: e.target.value })} />
              )}

              {/* Word bank (for fill tasks) */}
              {task.type === "fill" && (
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
                    Word bank — optional (comma-separated)
                  </p>
                  <input className={inp}
                    placeholder="e.g. carry, collect, help, invite, love, stay, tidy, travel"
                    value={(task.wordBank ?? []).join(", ")}
                    onChange={(e) => {
                      const words = e.target.value.split(",").map((w) => w.trim()).filter(Boolean);
                      updateTask(ti, { ...task, wordBank: words.length ? words : undefined });
                    }} />
                  {(task.wordBank ?? []).length > 0 && (
                    <p className="mt-1 text-[10px]" style={{ color: "var(--text-3)" }}>
                      Preview: {task.wordBank!.map((w) => `• ${w}`).join("  ")}
                    </p>
                  )}
                </div>
              )}

              {/* word_choice: hint about format */}
              {task.type === "word_choice" && (
                <p className="rounded-lg px-3 py-2 text-xs" style={{ background: "var(--primary-bg)", color: "var(--primary)" }}>
                  In the sentence, write the two options as <strong>[word1/word2]</strong>.
                  Example: <em>My cousins arrived a week [last/ago].</em>
                </p>
              )}

              {/* question_answer: hint */}
              {task.type === "question_answer" && (
                <p className="rounded-lg px-3 py-2 text-xs" style={{ background: "var(--primary-bg)", color: "var(--primary)" }}>
                  Provide the prompt (e.g. &quot;Suzy / listen / to your new song?&quot;). Students write the question AND the short answer.
                </p>
              )}

              {task.questions.map((q, qi) => (
                <div key={q.id} className="rounded-lg p-3 space-y-2" style={{ border: "1px solid var(--border)", background: "var(--surface-2)" }}>
                  <div className="flex gap-2">
                    <span className="mt-2.5 text-xs w-5 shrink-0" style={{ color: "var(--text-3)" }}>{qi + 1}.</span>
                    <input className={`${inp} flex-1`}
                      placeholder={
                        task.type === "fill"            ? "Sentence with ___ blank, e.g. My dad ___ coins." :
                        task.type === "transform"       ? "Original sentence..." :
                        task.type === "word_choice"     ? "Sentence with [opt1/opt2], e.g. arrived a week [last/ago]." :
                        task.type === "question_answer" ? "Prompt, e.g. Suzy / listen / to your new song?" :
                        "Question..."
                      }
                      value={"text" in q ? q.text : "sentence" in q ? q.sentence : "prompt" in q ? q.prompt : ""}
                      onChange={(e) => {
                        const qs = [...task.questions] as typeof task.questions;
                        if ("text" in qs[qi])   (qs[qi] as { text: string }).text = e.target.value;
                        else if ("sentence" in qs[qi]) (qs[qi] as { sentence: string }).sentence = e.target.value;
                        else if ("prompt" in qs[qi])   (qs[qi] as { prompt: string }).prompt = e.target.value;
                        updateTask(ti, { ...task, questions: qs });
                      }} />
                    <button type="button" onClick={() => updateTask(ti, { ...task, questions: task.questions.filter((_, j) => j !== qi) })}
                      className="mt-1 shrink-0" style={{ color: "var(--danger)" }}><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>

                  {/* MCQ options */}
                  {task.type === "mcq" && "options" in q && (
                    <div className="pl-7 space-y-1">
                      {(q.options as string[]).map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`correct-${q.id}`} checked={q.answer === opt}
                            onChange={() => { const qs = [...task.questions] as typeof task.questions; (qs[qi] as { answer: string }).answer = opt; updateTask(ti, { ...task, questions: qs }); }}
                            style={{ accentColor: "var(--primary)" }} />
                          <input className={`${inp} flex-1`} placeholder={`Option ${String.fromCharCode(65 + oi)}...`}
                            value={opt} onChange={(e) => {
                              const qs = [...task.questions] as typeof task.questions;
                              const o = [...(qs[qi] as { options: string[] }).options];
                              o[oi] = e.target.value;
                              (qs[qi] as { options: string[] }).options = o;
                              updateTask(ti, { ...task, questions: qs });
                            }} />
                        </div>
                      ))}
                      {(q.options as string[]).length < 5 && (
                        <button type="button" className="text-xs hover:underline" style={{ color: "var(--primary)" }}
                          onClick={() => { const qs = [...task.questions] as typeof task.questions; (qs[qi] as { options: string[] }).options.push(""); updateTask(ti, { ...task, questions: qs }); }}>
                          + Add option
                        </button>
                      )}
                    </div>
                  )}

                  {/* TFNG */}
                  {task.type === "tfng" && "answer" in q && (
                    <div className="pl-7 flex gap-2">
                      {(["TRUE","FALSE","NOT GIVEN"] as const).map(ans => (
                        <button key={ans} type="button"
                          onClick={() => { const qs = [...task.questions] as typeof task.questions; (qs[qi] as { answer: string }).answer = ans; updateTask(ti, { ...task, questions: qs }); }}
                          className="rounded px-2 py-1 text-xs font-medium border transition"
                          style={{
                            borderColor: q.answer === ans ? "var(--primary)" : "var(--border)",
                            background:  q.answer === ans ? "var(--primary-bg)" : "transparent",
                            color:       q.answer === ans ? "var(--primary)" : "var(--text-2)",
                          }}>{ans}</button>
                      ))}
                    </div>
                  )}

                  {/* Fill / Short / Transform — correct answer field */}
                  {(task.type === "fill" || task.type === "short" || task.type === "transform") && "answer" in q && (
                    <div className="pl-7">
                      <input className={inp}
                        placeholder={task.type === "transform" ? "Transformed sentence..." : "Correct answer..."}
                        value={q.answer as string}
                        onChange={(e) => { const qs = [...task.questions] as typeof task.questions; (qs[qi] as { answer: string }).answer = e.target.value; updateTask(ti, { ...task, questions: qs }); }} />
                      {task.type === "transform" && "keyword" in q && (
                        <input className={`${inp} mt-1`} placeholder="Keyword..."
                          value={(q as { keyword?: string }).keyword ?? ""}
                          onChange={(e) => { const qs = [...task.questions] as typeof task.questions; (qs[qi] as { keyword: string }).keyword = e.target.value; updateTask(ti, { ...task, questions: qs }); }} />
                      )}
                    </div>
                  )}

                  {/* Word choice — correct answer picker */}
                  {task.type === "word_choice" && "sentence" in q && (() => {
                    const match = (q.sentence as string).match(/\[([^/\]]+)\/([^\]]+)\]/);
                    const [opt1, opt2] = match ? [match[1], match[2]] : ["", ""];
                    return opt1 && opt2 ? (
                      <div className="pl-7 flex items-center gap-2">
                        <span className="text-xs" style={{ color: "var(--text-3)" }}>Correct:</span>
                        {[opt1, opt2].map((o) => (
                          <button key={o} type="button"
                            onClick={() => { const qs = [...task.questions] as typeof task.questions; (qs[qi] as { answer: string }).answer = o; updateTask(ti, { ...task, questions: qs }); }}
                            className="rounded px-3 py-1 text-xs font-medium border transition"
                            style={{
                              borderColor: q.answer === o ? "var(--primary)" : "var(--border)",
                              background:  q.answer === o ? "var(--primary-bg)" : "transparent",
                              color:       q.answer === o ? "var(--primary)" : "var(--text-2)",
                            }}>{o}</button>
                        ))}
                      </div>
                    ) : (
                      <p className="pl-7 text-xs" style={{ color: "var(--text-3)" }}>Add [opt1/opt2] to the sentence to select the correct answer.</p>
                    );
                  })()}

                  {/* Question formation — yes/no guide */}
                  {task.type === "question_answer" && "answerYesNo" in q && (
                    <div className="pl-7 flex items-center gap-2">
                      <span className="text-xs" style={{ color: "var(--text-3)" }}>Expected short answer:</span>
                      {(["yes","no"] as const).map((yn) => (
                        <button key={yn} type="button"
                          onClick={() => { const qs = [...task.questions] as typeof task.questions; (qs[qi] as { answerYesNo: string }).answerYesNo = yn; updateTask(ti, { ...task, questions: qs }); }}
                          className="rounded px-3 py-1 text-xs font-medium border capitalize transition"
                          style={{
                            borderColor: (q as { answerYesNo?: string }).answerYesNo === yn ? "var(--primary)" : "var(--border)",
                            background:  (q as { answerYesNo?: string }).answerYesNo === yn ? "var(--primary-bg)" : "transparent",
                            color:       (q as { answerYesNo?: string }).answerYesNo === yn ? "var(--primary)" : "var(--text-2)",
                          }}>{yn}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <button type="button"
                onClick={() => {
                  const newQ =
                    task.type === "mcq"            ? { id: uid(), text: "", options: ["", "", ""], answer: "" } :
                    task.type === "tfng"           ? { id: uid(), text: "", answer: "TRUE" as const } :
                    task.type === "fill"           ? { id: uid(), sentence: "", answer: "" } :
                    task.type === "transform"      ? { id: uid(), sentence: "", keyword: "", answer: "" } :
                    task.type === "word_choice"    ? { id: uid(), sentence: "", answer: "" } :
                    task.type === "question_answer"? { id: uid(), prompt: "", answerYesNo: "yes" as const } :
                                                    { id: uid(), text: "", answer: "" };
                  updateTask(ti, { ...task, questions: [...task.questions, newQ] as Task["questions"] });
                }}
                className="w-full rounded-lg border border-dashed py-2 text-xs transition"
                style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
                + Add question
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        {([
          ["tfng",           "True/False/NG"],
          ["mcq",            "Multiple choice"],
          ["fill",           "Fill in blanks"],
          ["word_choice",    "Word choice (A/B)"],
          ["question_answer","Question formation"],
          ["short",          "Short answer"],
          ["transform",      "Key word transform"],
        ] as const).map(([t, l]) => (
          <button key={t} type="button" onClick={() => addTask(t)}
            className="rounded-lg border border-dashed px-3 py-1.5 text-xs transition"
            style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
            + {l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── USE OF ENGLISH EDITOR (Cambridge) ───────────────────────────────────────
function UseOfEnglishEditor({ value, onChange }: { value: UseOfEnglishContent; onChange: (v: UseOfEnglishContent) => void }) {
  const set = (k: keyof UseOfEnglishContent, v: unknown) => onChange({ ...value, [k]: v });
  const types = [
    ["multiple_choice_cloze",  "Multiple choice cloze"],
    ["open_cloze",             "Open cloze"],
    ["word_formation",         "Word formation"],
    ["key_word_transformation","Key word transformation"],
    ["multiple_matching",      "Multiple matching"],
  ] as const;

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-2)" }}>Part type</label>
        <div className="flex flex-wrap gap-2">
          {types.map(([val, label]) => (
            <button key={val} type="button" onClick={() => set("type", val)}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium transition"
              style={{
                borderColor: value.type === val ? "var(--primary)" : "var(--border)",
                background:  value.type === val ? "var(--primary-bg)" : "transparent",
                color:       value.type === val ? "var(--primary)" : "var(--text-2)",
              }}>{label}</button>
          ))}
        </div>
      </div>
      <Field label="Text (with gaps if applicable)">
        <textarea className={`${inp} min-h-32`}
          placeholder="For open cloze: use ___ for gaps. For word formation: write [BASE WORD] in brackets."
          value={value.text ?? ""} onChange={(e) => set("text", e.target.value)} />
      </Field>
      <TasksEditor tasks={value.tasks} onChange={(t) => set("tasks", t)} />
    </div>
  );
}

// ─── MAIN DISPATCHER ──────────────────────────────────────────────────────────
export function SkillContentEditor({ framework, skillType, value, onChange }: Props) {

  if (skillType === "WRITING") {
    const v = (value as WritingContent) ?? {};
    return <WritingEditor framework={framework} value={v} onChange={onChange as (v: WritingContent) => void} />;
  }

  if (skillType === "SPEAKING") {
    return <SpeakingEditor
      framework={framework}
      value={(value as SpeakingContent) ?? { mode: "live", questions: [] }}
      onChange={onChange as (v: SpeakingContent) => void} />;
  }

  if (skillType === "VOCABULARY") {
    return <VocabularyEditor
      value={(value as VocabularyContent) ?? { words: [] }}
      onChange={onChange as (v: VocabularyContent) => void} />;
  }

  if (skillType === "USE_OF_ENGLISH") {
    return <UseOfEnglishEditor
      value={(value as UseOfEnglishContent) ?? { type: "multiple_choice_cloze", tasks: [] }}
      onChange={onChange as (v: UseOfEnglishContent) => void} />;
  }

  if (skillType === "READING") {
    const v = (value as ReadingContent) ?? { passages: [{ id: uid(), text: "" }], tasks: [] };
    return (
      <div className="space-y-4">
        {v.passages.map((p, i) => (
          <div key={p.id}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                {v.passages.length > 1 ? `Passage ${i + 1}` : "Reading passage"}
              </label>
              {v.passages.length > 1 && (
                <button type="button" onClick={() => onChange({ ...v, passages: v.passages.filter((_, j) => j !== i) })}
                  className="text-xs" style={{ color: "var(--danger)" }}>Remove</button>
              )}
            </div>
            <input className={`${inp} mb-2`} placeholder="Passage title (optional)"
              value={p.title ?? ""} onChange={(e) => {
                const ps = [...v.passages]; ps[i] = { ...p, title: e.target.value };
                onChange({ ...v, passages: ps });
              }} />
            <textarea className={`${inp} min-h-40`}
              placeholder={framework === "IELTS" ? "Paste the IELTS reading passage..." : "Paste the reading text..."}
              value={p.text} onChange={(e) => {
                const ps = [...v.passages]; ps[i] = { ...p, text: e.target.value };
                onChange({ ...v, passages: ps });
              }} />
            <input className={inp} placeholder="Source (e.g. The Guardian, 2023) — optional"
              value={p.source ?? ""} onChange={(e) => {
                const ps = [...v.passages]; ps[i] = { ...p, source: e.target.value };
                onChange({ ...v, passages: ps });
              }} />
          </div>
        ))}
        {framework === "IELTS" && v.passages.length < 3 && (
          <button type="button" onClick={() => onChange({ ...v, passages: [...v.passages, { id: uid(), text: "" }] })}
            className="rounded-lg border border-dashed w-full py-2 text-xs transition"
            style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
            + Add passage {v.passages.length + 1}
          </button>
        )}
        <TasksEditor tasks={v.tasks} onChange={(t) => onChange({ ...v, tasks: t })} />
      </div>
    );
  }

  if (skillType === "LISTENING") {
    const v = (value as ListeningContent) ?? { audioUrl: "", audioMode: "shared", tasks: [], showTranscriptAfter: false };
    const mode = v.audioMode ?? "shared";
    return (
      <div className="space-y-4">
        {/* Audio mode toggle */}
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-2)" }}>Audio mode</label>
          <div className="flex gap-2">
            {(["shared", "per-task"] as const).map((m) => (
              <button key={m} type="button"
                onClick={() => onChange({ ...v, audioMode: m })}
                className="flex-1 rounded-xl border-2 py-2.5 text-sm font-medium transition"
                style={{
                  borderColor: mode === m ? "var(--primary)" : "var(--border)",
                  background:  mode === m ? "var(--primary-bg)" : "transparent",
                  color:       mode === m ? "var(--primary)" : "var(--text-2)",
                }}>
                {m === "shared" ? "🎵 One shared audio" : "📂 Per-task audio"}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs" style={{ color: "var(--text-3)" }}>
            {mode === "shared"
              ? "Single audio plays for all tasks (IELTS section, podcast, etc.)"
              : "Each task has its own audio clip (different conversations, sections)"}
          </p>
        </div>

        {/* Shared audio URL */}
        {mode === "shared" && (
          <Field label="Audio URL (YouTube, SoundCloud, direct link)">
            <input className={inp} placeholder="https://..." value={v.audioUrl}
              onChange={(e) => onChange({ ...v, audioUrl: e.target.value })} />
          </Field>
        )}

        {framework === "IELTS" && (
          <Field label="Section type">
            <select className={inp} value={v.sectionType ?? ""}
              onChange={(e) => onChange({ ...v, sectionType: e.target.value as ListeningContent["sectionType"] })}>
              <option value="">— Select —</option>
              <option value="section1">Section 1 — Social conversation</option>
              <option value="section2">Section 2 — Public announcement</option>
              <option value="section3">Section 3 — Academic discussion</option>
              <option value="section4">Section 4 — Academic lecture</option>
            </select>
          </Field>
        )}
        {framework === "TOEFL" && (
          <Field label="Lecture type">
            <select className={inp} value={v.sectionType ?? ""}
              onChange={(e) => onChange({ ...v, sectionType: e.target.value as ListeningContent["sectionType"] })}>
              <option value="">— Select —</option>
              <option value="conversation">Conversation</option>
              <option value="lecture">Lecture</option>
            </select>
          </Field>
        )}
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-2)" }}>
          <input type="checkbox" checked={v.showTranscriptAfter}
            onChange={(e) => onChange({ ...v, showTranscriptAfter: e.target.checked })}
            style={{ accentColor: "var(--primary)" }} />
          Show transcript after submission
        </label>
        {v.showTranscriptAfter && (
          <Field label="Transcript (optional)">
            <textarea className={`${inp} min-h-24`} placeholder="Audio transcript..."
              value={v.transcript ?? ""} onChange={(e) => onChange({ ...v, transcript: e.target.value })} />
          </Field>
        )}
        <TasksEditor
          tasks={v.tasks}
          onChange={(t) => onChange({ ...v, tasks: t })}
          showTaskAudio={mode === "per-task"}
        />
      </div>
    );
  }

  if (skillType === "GRAMMAR") {
    const v = (value as GrammarContent) ?? { explanation: "", tasks: [] };
    return (
      <div className="space-y-4">
        <Field label="Grammar point (optional)">
          <input className={inp} placeholder="e.g. Present Perfect vs. Past Simple"
            value={v.grammarPoint ?? ""} onChange={(e) => onChange({ ...v, grammarPoint: e.target.value })} />
        </Field>
        <Field label="Explanation (optional)">
          <textarea className={`${inp} min-h-24`}
            placeholder="Rule and examples..."
            value={v.explanation ?? ""} onChange={(e) => onChange({ ...v, explanation: e.target.value })} />
        </Field>
        <TasksEditor tasks={v.tasks} onChange={(t) => onChange({ ...v, tasks: t })} />
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 text-sm text-center" style={{ background: "var(--surface-2)", color: "var(--text-3)" }}>
      Content editor for this skill type is coming soon.
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inp = "theme-inp w-full rounded-lg px-3 py-2 text-sm transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-2)" }}>{label}</label>
      {children}
    </div>
  );
}

function AddBtn({ onClick, label = "Add" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1 rounded-lg border border-dashed px-2.5 py-1 text-xs transition"
      style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
      <Plus className="h-3 w-3" />{label}
    </button>
  );
}
