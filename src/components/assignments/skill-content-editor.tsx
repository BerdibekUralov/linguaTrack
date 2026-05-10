"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type {
  SpeakingContent, ReadingContent, ListeningContent,
  GrammarContent, VocabularyContent, Task, VocabWord,
} from "@/types/skill-content";

import type { SkillContent } from "@/types/skill-content";

interface Props {
  skillType: string;
  value: SkillContent | null;
  onChange: (v: SkillContent) => void;
}

const uid = () => Math.random().toString(36).slice(2, 8);

// ─── SPEAKING ─────────────────────────────────────────────────────────────────
function SpeakingEditor({ value, onChange }: { value: SpeakingContent; onChange: (v: SpeakingContent) => void }) {
  const set = (k: keyof SpeakingContent, v: unknown) => onChange({ ...value, [k]: v });
  const qs = value.questions ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {(["live", "async"] as const).map((m) => (
          <button key={m} type="button"
            onClick={() => set("mode", m)}
            className={`flex-1 rounded-xl border-2 py-3 text-sm font-medium transition ${
              value.mode === m ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}>
            {m === "live" ? "🎥 Live (Google Meet)" : "🎙️ Asinxron (savollar)"}
          </button>
        ))}
      </div>

      {value.mode === "live" && (
        <>
          <Field label="Google Meet havolasi">
            <input className={inp} placeholder="https://meet.google.com/xxx-yyyy-zzz"
              value={value.meetLink ?? ""} onChange={(e) => set("meetLink", e.target.value)} />
          </Field>
          <Field label="Dars vaqti (ixtiyoriy)">
            <input type="datetime-local" className={inp}
              value={value.scheduledAt ?? ""}
              onChange={(e) => set("scheduledAt", e.target.value)} />
          </Field>
        </>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            {value.mode === "live" ? "Lesson topics / questions" : "Questions the student needs to answer"}
          </label>
          <AddBtn onClick={() => set("questions", [...qs, { id: uid(), text: "", hint: "", timeLimitSec: 120 }])} />
        </div>
        {qs.map((q, i) => (
          <div key={q.id} className="mb-3 rounded-xl border border-gray-200 p-3 space-y-2">
            <div className="flex gap-2">
              <span className="mt-2.5 text-xs font-bold text-gray-400 w-5">{i + 1}.</span>
              <input className={`${inp} flex-1`} placeholder="Savol matni..."
                value={q.text} onChange={(e) => {
                  const updated = [...qs]; updated[i] = { ...q, text: e.target.value };
                  set("questions", updated);
                }} />
              <button type="button" onClick={() => set("questions", qs.filter((_, j) => j !== i))}
                className="mt-1.5 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
            <input className={inp} placeholder="Yordam (hint, ixtiyoriy)..."
              value={q.hint ?? ""} onChange={(e) => {
                const updated = [...qs]; updated[i] = { ...q, hint: e.target.value };
                set("questions", updated);
              }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VOCABULARY ────────────────────────────────────────────────────────────────
function VocabularyEditor({ value, onChange }: { value: VocabularyContent; onChange: (v: VocabularyContent) => void }) {
  const words = value.words ?? [];
  const setWords = (w: VocabWord[]) => onChange({ ...value, words: w });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{words.length} ta so&apos;z</label>
        <AddBtn label="So'z qo'shish" onClick={() =>
          setWords([...words, { id: uid(), word: "", definition: "", example: "", pos: "noun" }])} />
      </div>

      {words.map((w, i) => (
        <div key={w.id} className="rounded-xl border border-gray-200 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
            <input className={`${inp} flex-1 font-semibold`} placeholder="So'z (masalan: ephemeral)"
              value={w.word} onChange={(e) => {
                const u = [...words]; u[i] = { ...w, word: e.target.value }; setWords(u);
              }} />
            <select value={w.pos ?? "noun"} onChange={(e) => {
              const u = [...words]; u[i] = { ...w, pos: e.target.value }; setWords(u);
            }} className={`${inp} w-28`}>
              {["noun","verb","adj","adv","phrase","idiom"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button type="button" onClick={() => setWords(words.filter((_, j) => j !== i))}
              className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
          </div>
          <input className={inp} placeholder="Ta'rif (Definition)..."
            value={w.definition} onChange={(e) => {
              const u = [...words]; u[i] = { ...w, definition: e.target.value }; setWords(u);
            }} />
          <input className={inp} placeholder="Misol jumla (Example sentence)..."
            value={w.example ?? ""} onChange={(e) => {
              const u = [...words]; u[i] = { ...w, example: e.target.value }; setWords(u);
            }} />
          <input className={inp} placeholder="Talaffuz (masalan: /ɪˈfem.ər.əl/) — ixtiyoriy"
            value={w.pronunciation ?? ""} onChange={(e) => {
              const u = [...words]; u[i] = { ...w, pronunciation: e.target.value }; setWords(u);
            }} />
        </div>
      ))}
    </div>
  );
}

// ─── PASSAGE + TASKS (Reading & Listening) ────────────────────────────────────
function TasksEditor({
  tasks, onChange,
  header,
}: { tasks: Task[]; onChange: (t: Task[]) => void; header?: React.ReactNode }) {
  const [open, setOpen] = useState<string | null>(null);

  const addTask = (type: Task["type"]) => {
    const t: Task = { id: uid(), type, title: type === "mcq" ? "Ko'p tanlovli" : type === "tfng" ? "True/False/NG" : type === "fill" ? "Bo'sh joy to'ldirish" : "Qisqa javob", questions: [] };
    onChange([...tasks, t]);
    setOpen(t.id);
  };

  const updateTask = (i: number, t: Task) => { const u = [...tasks]; u[i] = t; onChange(u); };
  const removeTask = (i: number) => onChange(tasks.filter((_, j) => j !== i));

  return (
    <div className="space-y-3">
      {header}
      {tasks.map((task, ti) => (
        <div key={task.id} className="rounded-xl border border-gray-200 overflow-hidden">
          <button type="button" onClick={() => setOpen(open === task.id ? null : task.id)}
            className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left hover:bg-gray-100">
            <span className="text-sm font-medium">{task.title} <span className="ml-1 text-xs text-gray-400">({task.questions.length} savol)</span></span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); removeTask(ti); }}
                className="rounded p-1 text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
              {open === task.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </div>
          </button>

          {open === task.id && (
            <div className="p-4 space-y-3">
              <input className={inp} placeholder="Task sarlavhasi..." value={task.title}
                onChange={(e) => updateTask(ti, { ...task, title: e.target.value })} />

              {task.questions.map((q, qi) => (
                <div key={q.id} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-2">
                  <div className="flex gap-2">
                    <span className="mt-2.5 text-xs text-gray-400 w-5">{qi + 1}.</span>
                    <input className={`${inp} flex-1`}
                      placeholder={task.type === "fill" ? "Gapni yozing, bo'sh joyga ___ qo'ying" : "Savol..."}
                      value={"text" in q ? q.text : "sentence" in q ? q.sentence : ""}
                      onChange={(e) => {
                        const qs = [...task.questions] as typeof task.questions;
                        if ("text" in qs[qi]) (qs[qi] as { text: string }).text = e.target.value;
                        else if ("sentence" in qs[qi]) (qs[qi] as { sentence: string }).sentence = e.target.value;
                        updateTask(ti, { ...task, questions: qs });
                      }} />
                    <button type="button" onClick={() => updateTask(ti, { ...task, questions: task.questions.filter((_, j) => j !== qi) })}
                      className="text-red-400 hover:text-red-600 mt-1"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>

                  {/* MCQ options */}
                  {task.type === "mcq" && "options" in q && (
                    <div className="pl-7 space-y-1">
                      {(q.options as string[]).map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`correct-${q.id}`} checked={q.answer === opt}
                            onChange={() => {
                              const qs = [...task.questions] as typeof task.questions;
                              (qs[qi] as { answer: string }).answer = opt;
                              updateTask(ti, { ...task, questions: qs });
                            }} />
                          <input className={`${inp} flex-1`} placeholder={`Variant ${String.fromCharCode(65 + oi)}...`}
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
                        <button type="button" className="text-xs text-indigo-600 hover:underline"
                          onClick={() => {
                            const qs = [...task.questions] as typeof task.questions;
                            (qs[qi] as { options: string[] }).options.push("");
                            updateTask(ti, { ...task, questions: qs });
                          }}>+ Variant qo&apos;shish</button>
                      )}
                    </div>
                  )}

                  {/* TFNG */}
                  {task.type === "tfng" && "answer" in q && (
                    <div className="pl-7 flex gap-2">
                      {(["TRUE","FALSE","NOT GIVEN"] as const).map(ans => (
                        <button key={ans} type="button"
                          onClick={() => {
                            const qs = [...task.questions] as typeof task.questions;
                            (qs[qi] as { answer: string }).answer = ans;
                            updateTask(ti, { ...task, questions: qs });
                          }}
                          className={`rounded px-2 py-1 text-xs font-medium border transition ${
                            q.answer === ans ? "border-indigo-500 bg-indigo-100 text-indigo-700" : "border-gray-200 text-gray-500"
                          }`}>{ans}</button>
                      ))}
                    </div>
                  )}

                  {/* Fill / Short — just answer field */}
                  {(task.type === "fill" || task.type === "short") && "answer" in q && (
                    <div className="pl-7">
                      <input className={inp} placeholder="To'g'ri javob..."
                        value={q.answer as string}
                        onChange={(e) => {
                          const qs = [...task.questions] as typeof task.questions;
                          (qs[qi] as { answer: string }).answer = e.target.value;
                          updateTask(ti, { ...task, questions: qs });
                        }} />
                    </div>
                  )}
                </div>
              ))}

              {/* Add question */}
              <button type="button"
                onClick={() => {
                  const newQ =
                    task.type === "mcq"  ? { id: uid(), text: "", options: ["", "", ""], answer: "" } :
                    task.type === "tfng" ? { id: uid(), text: "", answer: "TRUE" as const } :
                    task.type === "fill" ? { id: uid(), sentence: "", answer: "" } :
                                          { id: uid(), text: "", answer: "" };
                  updateTask(ti, { ...task, questions: [...task.questions, newQ] as Task["questions"] });
                }}
                className="w-full rounded-lg border border-dashed border-gray-300 py-2 text-xs text-gray-400 hover:border-indigo-400 hover:text-indigo-600 transition">
                + Savol qo&apos;shish
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add task type */}
      <div className="flex flex-wrap gap-2">
        {([
          ["tfng",  "True/False/NG"],
          ["mcq",   "Ko'p tanlov"],
          ["fill",  "Bo'sh to'ldirish"],
          ["short", "Qisqa javob"],
        ] as const).map(([t, l]) => (
          <button key={t} type="button" onClick={() => addTask(t)}
            className="rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition">
            + {l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN DISPATCHER ──────────────────────────────────────────────────────────
export function SkillContentEditor({ skillType, value, onChange }: Props) {
  if (skillType === "WRITING") {
    return (
      <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
        ✍️ Writing — the student writes and submits a text. No additional structure needed.
      </p>
    );
  }

  if (skillType === "SPEAKING") {
    return <SpeakingEditor
      value={(value as SpeakingContent) ?? { mode: "live", questions: [] }}
      onChange={onChange as (v: SpeakingContent) => void} />;
  }

  if (skillType === "VOCABULARY") {
    return <VocabularyEditor
      value={(value as VocabularyContent) ?? { words: [] }}
      onChange={onChange as (v: VocabularyContent) => void} />;
  }

  if (skillType === "READING") {
    const v = (value as ReadingContent) ?? { passage: "", tasks: [] };
    return (
      <div className="space-y-4">
        <Field label="Matn (Passage)">
          <textarea className={`${inp} min-h-40`} placeholder="IELTS formatidagi matnni kiriting..."
            value={v.passage} onChange={(e) => onChange({ ...v, passage: e.target.value })} />
        </Field>
        <TasksEditor tasks={v.tasks} onChange={(t) => onChange({ ...v, tasks: t })} />
      </div>
    );
  }

  if (skillType === "LISTENING") {
    const v = (value as ListeningContent) ?? { audioUrl: "", tasks: [], showTranscriptAfter: false };
    return (
      <div className="space-y-4">
        <Field label="Audio URL (YouTube, SoundCloud, to'g'ridan-to'g'ri havola)">
          <input className={inp} placeholder="https://..." value={v.audioUrl}
            onChange={(e) => onChange({ ...v, audioUrl: e.target.value })} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={v.showTranscriptAfter}
            onChange={(e) => onChange({ ...v, showTranscriptAfter: e.target.checked })} />
          Topshirgandan keyin transkript ko&apos;rsatilsin
        </label>
        {v.showTranscriptAfter && (
          <Field label="Transkript (ixtiyoriy)">
            <textarea className={`${inp} min-h-24`} placeholder="Audio matni..."
              value={v.transcript ?? ""} onChange={(e) => onChange({ ...v, transcript: e.target.value })} />
          </Field>
        )}
        <TasksEditor tasks={v.tasks} onChange={(t) => onChange({ ...v, tasks: t })} />
      </div>
    );
  }

  if (skillType === "GRAMMAR") {
    const v = (value as GrammarContent) ?? { explanation: "", tasks: [] };
    return (
      <div className="space-y-4">
        <Field label="Grammatik tushuntirish (ixtiyoriy)">
          <textarea className={`${inp} min-h-24`}
            placeholder="Qoida va misol... (masalan: Present Perfect — qachon ishlatiladi)"
            value={v.explanation ?? ""} onChange={(e) => onChange({ ...v, explanation: e.target.value })} />
        </Field>
        <TasksEditor tasks={v.tasks} onChange={(t) => onChange({ ...v, tasks: t })} />
      </div>
    );
  }

  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inp = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function AddBtn({ onClick, label = "Qo'shish" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1 rounded-lg border border-dashed border-gray-300 px-2.5 py-1 text-xs text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition">
      <Plus className="h-3 w-3" />{label}
    </button>
  );
}
