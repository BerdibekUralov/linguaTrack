"use client";

import { useState, useCallback, useEffect } from "react";
import { RotateCcw, CheckCircle, XCircle, Trophy, Brain } from "lucide-react";
import type { VocabWord, VocabResult } from "@/types/skill-content";

interface Props {
  words: VocabWord[];
  assignmentId: string;
  existingSubmission?: { id: string; answers?: unknown };
  onComplete: (answers: object, score: number) => void;
}

type Phase = "study" | "quiz" | "result";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── FLASHCARD ────────────────────────────────────────────────────────────────
function FlashCard({ word, onKnow, onLearn, index, total }: {
  word: VocabWord; onKnow: () => void; onLearn: () => void; index: number; total: number;
}) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => setFlipped(false), [word.id]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress */}
      <div className="flex w-full items-center gap-3">
        <span className="text-xs" style={{ color: "var(--text-3)" }}>{index + 1} / {total}</span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${((index + 1) / total) * 100}%`, background: "var(--primary)" }} />
        </div>
      </div>

      {/* Card */}
      <div className="relative w-full cursor-pointer select-none" style={{ perspective: 1000 }}
        onClick={() => setFlipped((f) => !f)}>
        <div className="relative transition-all duration-500"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
          {/* Front */}
          <div className="rounded-3xl p-8 text-center shadow-lg min-h-52 flex flex-col items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", backfaceVisibility: "hidden" }}>
            <p className="mb-2 text-sm font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.7)" }}>{word.pos ?? "word"}</p>
            <h2 className="text-4xl font-bold text-white">{word.word}</h2>
            {word.pronunciation && <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{word.pronunciation}</p>}
            <p className="mt-6 text-xs animate-pulse" style={{ color: "rgba(255,255,255,0.6)" }}>👆 Click to flip</p>
          </div>
          {/* Back */}
          <div className="absolute inset-0 rounded-3xl p-8 text-center shadow-lg min-h-52 flex flex-col items-center justify-center gap-3"
            style={{ background: "var(--surface)", border: "2px solid var(--border)", backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <p className="text-lg font-semibold" style={{ color: "var(--text)" }}>{word.definition}</p>
            {word.example && (
              <p className="text-sm italic text-left w-full pl-3" style={{ color: "var(--text-2)", borderLeft: "2px solid var(--primary)" }}>
                &ldquo;{word.example}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className={`flex gap-4 w-full transition-opacity duration-300 ${flipped ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <button onClick={onLearn}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition"
          style={{ borderColor: "var(--warning)", background: "var(--warning-bg)", color: "var(--warning)" }}>
          <XCircle className="h-4 w-4" /> Still learning
        </button>
        <button onClick={onKnow}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition"
          style={{ borderColor: "var(--success)", background: "var(--success-bg)", color: "var(--success)" }}>
          <CheckCircle className="h-4 w-4" /> I know it!
        </button>
      </div>
    </div>
  );
}

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
function QuizView({ words, onFinish }: { words: VocabWord[]; onFinish: (results: VocabResult[]) => void }) {
  const [queue] = useState(() => shuffle(words));
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [results, setResults] = useState<VocabResult[]>([]);

  const current = queue[index];
  const options = useState(() =>
    queue.map((w, i) => {
      const others = queue.filter((_, j) => j !== i);
      return shuffle([w.word, ...shuffle(others).slice(0, 3).map((o) => o.word)]);
    })
  )[0];

  const pick = (opt: string) => {
    if (chosen !== null) return;
    setChosen(opt);
    const correct = opt === current.word;
    setTimeout(() => {
      const newResults = [...results, { wordId: current.id, correct, chosen: opt }];
      if (index + 1 >= queue.length) onFinish(newResults);
      else { setResults(newResults); setIndex((i) => i + 1); setChosen(null); }
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-xs" style={{ color: "var(--text-3)" }}>{index + 1} / {queue.length}</span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${((index + 1) / queue.length) * 100}%`, background: "var(--accent)" }} />
        </div>
        <span className="text-xs font-medium" style={{ color: "var(--success)" }}>{results.filter((r) => r.correct).length} ✓</span>
      </div>

      <div className="rounded-3xl p-8 text-center shadow-lg"
        style={{ background: "linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)" }}>
        <p className="mb-2 text-sm uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.7)" }}>Which word?</p>
        <p className="text-xl font-semibold text-white leading-relaxed">{current.definition}</p>
        {current.example && <p className="mt-4 text-sm italic" style={{ color: "rgba(255,255,255,0.7)" }}>&ldquo;{current.example}&rdquo;</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options[index].map((opt) => {
          const isCorrect = opt === current.word;
          const isChosen = opt === chosen;
          let borderColor = "var(--border)";
          let bg = "var(--surface-2)";
          let color = "var(--text)";
          if (chosen !== null) {
            if (isCorrect) { borderColor = "var(--success)"; bg = "var(--success-bg)"; color = "var(--success)"; }
            else if (isChosen) { borderColor = "var(--danger)"; bg = "var(--danger-bg)"; color = "var(--danger)"; }
            else { borderColor = "var(--border)"; bg = "transparent"; color = "var(--text-3)"; }
          }
          return (
            <button key={opt} onClick={() => pick(opt)}
              className="rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition"
              style={{ borderColor, background: bg, color }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── RESULT ───────────────────────────────────────────────────────────────────
function ResultView({ results, words, score, onSubmit, onRetry, submitting }: {
  results: VocabResult[]; words: VocabWord[]; score: number;
  onSubmit: () => void; onRetry: () => void; submitting: boolean;
}) {
  const correct = results.filter((r) => r.correct).length;
  const wrong = results.filter((r) => !r.correct);
  const emoji = score >= 90 ? "🏆" : score >= 70 ? "🎉" : score >= 50 ? "👍" : "💪";

  return (
    <div className="space-y-6 text-center">
      <div className="rounded-3xl p-10 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)" }}>
        <div className="text-6xl mb-3">{emoji}</div>
        <div className="text-6xl font-bold mb-1">{score}%</div>
        <p style={{ color: "rgba(255,255,255,0.7)" }}>{correct} / {results.length} correct</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.15)" }}>
            <div className="text-2xl font-bold text-white">{correct}</div>
            <div style={{ color: "rgba(255,255,255,0.7)" }}>Correct</div>
          </div>
          <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.15)" }}>
            <div className="text-2xl font-bold text-white">{wrong.length}</div>
            <div style={{ color: "rgba(255,255,255,0.7)" }}>Wrong</div>
          </div>
        </div>
      </div>

      {wrong.length > 0 && (
        <div className="text-left rounded-xl p-4" style={{ background: "var(--danger-bg)", border: "1px solid var(--danger)" }}>
          <p className="mb-3 text-sm font-semibold" style={{ color: "var(--danger)" }}>Review these words:</p>
          {wrong.map((r) => {
            const w = words.find((x) => x.id === r.wordId);
            return w ? (
              <div key={r.wordId} className="mb-2 flex items-start gap-3">
                <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--danger)" }} />
                <div>
                  <span className="font-semibold" style={{ color: "var(--text)" }}>{w.word}</span>
                  <span className="mx-2" style={{ color: "var(--text-3)" }}>—</span>
                  <span className="text-sm" style={{ color: "var(--text-2)" }}>{w.definition}</span>
                </div>
              </div>
            ) : null;
          })}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm transition"
          style={{ border: "1px solid var(--border)", color: "var(--text-2)", background: "var(--surface-2)" }}>
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
        <button onClick={onSubmit} disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 transition"
          style={{ background: "var(--primary)" }}>
          <Trophy className="h-4 w-4" />
          {submitting ? "Saving..." : "Save result"}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export function VocabularyGame({ words, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("study");
  const [studyIndex, setStudyIndex] = useState(0);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<VocabResult[]>([]);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const currentWord = words[studyIndex];

  const handleKnow = () => {
    setKnown((k) => new Set([...k, currentWord.id]));
    if (studyIndex + 1 >= words.length) setPhase("quiz");
    else setStudyIndex((i) => i + 1);
  };
  const handleLearn = () => {
    if (studyIndex + 1 >= words.length) setPhase("quiz");
    else setStudyIndex((i) => i + 1);
  };
  const handleQuizFinish = useCallback((res: VocabResult[]) => {
    const s = Math.round((res.filter((r) => r.correct).length / res.length) * 100);
    setResults(res); setScore(s); setPhase("result");
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onComplete({ results, score, timeMs: Date.now() }, score);
    setSubmitting(false);
  };
  const retry = () => { setPhase("study"); setStudyIndex(0); setKnown(new Set()); setResults([]); setScore(0); };

  const PHASE_LABELS: Record<Phase, string> = { study: "📖 Study", quiz: "🧠 Quiz", result: "🏆 Result" };

  return (
    <div className="max-w-lg mx-auto">
      {/* Phase tabs */}
      <div className="mb-6 flex gap-1 rounded-xl p-1" style={{ background: "var(--surface-3)" }}>
        {(["study", "quiz", "result"] as Phase[]).map((p) => (
          <div key={p}
            className="flex-1 rounded-lg py-2 text-center text-xs font-medium transition"
            style={{
              background: phase === p ? "var(--surface)" : "transparent",
              color: phase === p ? "var(--text)" : "var(--text-3)",
              boxShadow: phase === p ? "var(--shadow-xs)" : undefined,
            }}>
            {PHASE_LABELS[p]}
          </div>
        ))}
      </div>

      {phase === "study" && (
        <div>
          <div className="mb-4 flex items-center justify-between text-sm" style={{ color: "var(--text-3)" }}>
            <span><Brain className="inline h-4 w-4 mr-1" style={{ color: "var(--primary)" }} />{words.length} words</span>
            <span>{known.size} memorized</span>
          </div>
          <FlashCard word={currentWord} index={studyIndex} total={words.length} onKnow={handleKnow} onLearn={handleLearn} />
          {studyIndex > 0 && (
            <button onClick={() => setPhase("quiz")}
              className="mt-4 w-full text-center text-xs hover:underline" style={{ color: "var(--primary)" }}>
              Skip to quiz →
            </button>
          )}
        </div>
      )}
      {phase === "quiz" && <QuizView words={words} onFinish={handleQuizFinish} />}
      {phase === "result" && (
        <ResultView results={results} words={words} score={score} onSubmit={handleSubmit} onRetry={retry} submitting={submitting} />
      )}
    </div>
  );
}
