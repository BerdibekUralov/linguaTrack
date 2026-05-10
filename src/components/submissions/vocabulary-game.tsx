"use client";

import { useState, useCallback, useEffect } from "react";
import { RotateCcw, CheckCircle, XCircle, ChevronLeft, ChevronRight, Trophy, Brain } from "lucide-react";
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
        <span className="text-xs text-gray-400">{index + 1} / {total}</span>
        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
      </div>

      {/* Card */}
      <div
        className="relative w-full cursor-pointer select-none"
        style={{ perspective: 1000 }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative transition-all duration-500"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-center shadow-lg min-h-52 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: "hidden" }}>
            <p className="mb-2 text-sm font-medium text-indigo-200 uppercase tracking-wider">{word.pos ?? "word"}</p>
            <h2 className="text-4xl font-bold text-white">{word.word}</h2>
            {word.pronunciation && <p className="mt-3 text-indigo-200 text-sm">{word.pronunciation}</p>}
            <p className="mt-6 text-xs text-indigo-300 animate-pulse">👆 Kartani ag&apos;daring</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 rounded-3xl bg-white border-2 border-indigo-100 p-8 text-center shadow-lg min-h-52 flex flex-col items-center justify-center gap-3"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <p className="text-lg font-semibold text-gray-800">{word.definition}</p>
            {word.example && (
              <p className="text-sm text-gray-500 italic border-l-2 border-indigo-300 pl-3 text-left w-full">
                &ldquo;{word.example}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Buttons (visible only after flip) */}
      <div className={`flex gap-4 w-full transition-opacity duration-300 ${flipped ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <button onClick={onLearn}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-orange-200 bg-orange-50 py-3 text-sm font-medium text-orange-600 hover:bg-orange-100 transition">
          <XCircle className="h-4 w-4" /> Hali eslamadim
        </button>
        <button onClick={onKnow}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-green-200 bg-green-50 py-3 text-sm font-medium text-green-600 hover:bg-green-100 transition">
          <CheckCircle className="h-4 w-4" /> Bilaman!
        </button>
      </div>
    </div>
  );
}

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
function QuizView({ words, onFinish }: {
  words: VocabWord[];
  onFinish: (results: VocabResult[]) => void;
}) {
  const [queue] = useState(() => shuffle(words));
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [results, setResults] = useState<VocabResult[]>([]);

  const current = queue[index];

  // 4 options: current + 3 random wrong
  const options = useState(() =>
    queue.map((w, i) => {
      const others = queue.filter((_, j) => j !== i);
      const wrong = shuffle(others).slice(0, 3).map((o) => o.word);
      return shuffle([w.word, ...wrong]);
    })
  )[0];

  const pick = (opt: string) => {
    if (chosen !== null) return;
    setChosen(opt);
    const correct = opt === current.word;
    const result: VocabResult = { wordId: current.id, correct, chosen: opt };

    setTimeout(() => {
      const newResults = [...results, result];
      if (index + 1 >= queue.length) {
        onFinish(newResults);
      } else {
        setResults(newResults);
        setIndex((i) => i + 1);
        setChosen(null);
      }
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">{index + 1} / {queue.length}</span>
        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${((index + 1) / queue.length) * 100}%` }} />
        </div>
        <span className="text-xs font-medium text-green-600">{results.filter((r) => r.correct).length} ✓</span>
      </div>

      {/* Question — definition shown, pick word */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 p-8 text-center shadow-lg">
        <p className="mb-2 text-sm text-purple-200 uppercase tracking-wider">Qaysi so&apos;z?</p>
        <p className="text-xl font-semibold text-white leading-relaxed">{current.definition}</p>
        {current.example && (
          <p className="mt-4 text-sm text-purple-200 italic">&ldquo;{current.example}&rdquo;</p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {options[index].map((opt) => {
          const isCorrect = opt === current.word;
          const isChosen = opt === chosen;
          return (
            <button key={opt} onClick={() => pick(opt)}
              className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${
                chosen === null
                  ? "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50"
                  : isCorrect
                    ? "border-green-400 bg-green-50 text-green-700"
                    : isChosen
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-gray-100 bg-gray-50 text-gray-400"
              }`}>
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
      <div className="rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-10 text-white shadow-lg">
        <div className="text-6xl mb-3">{emoji}</div>
        <div className="text-6xl font-bold mb-1">{score}%</div>
        <p className="text-indigo-200">{correct} / {results.length} to&apos;g&apos;ri</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-white/10 p-3">
            <div className="text-2xl font-bold text-green-300">{correct}</div>
            <div className="text-indigo-200">To&apos;g&apos;ri</div>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <div className="text-2xl font-bold text-red-300">{wrong.length}</div>
            <div className="text-indigo-200">Xato</div>
          </div>
        </div>
      </div>

      {/* Wrong words review */}
      {wrong.length > 0 && (
        <div className="text-left rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="mb-3 text-sm font-semibold text-red-700">Qayta o&apos;rganing:</p>
          {wrong.map((r) => {
            const w = words.find((x) => x.id === r.wordId);
            return w ? (
              <div key={r.wordId} className="mb-2 flex items-start gap-3">
                <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-400" />
                <div>
                  <span className="font-semibold text-gray-800">{w.word}</span>
                  <span className="mx-2 text-gray-400">—</span>
                  <span className="text-sm text-gray-600">{w.definition}</span>
                </div>
              </div>
            ) : null;
          })}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm text-gray-600 hover:bg-gray-50">
          <RotateCcw className="h-4 w-4" /> Qaytadan
        </button>
        <button onClick={onSubmit} disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
          <Trophy className="h-4 w-4" />
          {submitting ? "Saqlanmoqda..." : "Natijani saqlash"}
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
    setResults(res);
    setScore(s);
    setPhase("result");
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    const answers = { results, score, timeMs: Date.now() };
    await onComplete(answers, score);
    setSubmitting(false);
  };

  const retry = () => {
    setPhase("study");
    setStudyIndex(0);
    setKnown(new Set());
    setResults([]);
    setScore(0);
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Phase tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1">
        {(["study", "quiz", "result"] as Phase[]).map((p, i) => (
          <div key={p}
            className={`flex-1 rounded-lg py-2 text-center text-xs font-medium transition ${
              phase === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
            }`}>
            {i === 0 ? "📖 O'rganish" : i === 1 ? "🧠 Quiz" : "🏆 Natija"}
          </div>
        ))}
      </div>

      {phase === "study" && (
        <div>
          <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
            <span><Brain className="inline h-4 w-4 text-indigo-500" /> {words.length} ta so&apos;z</span>
            <span>{known.size} ta yodlandi</span>
          </div>
          <FlashCard
            word={currentWord}
            index={studyIndex}
            total={words.length}
            onKnow={handleKnow}
            onLearn={handleLearn}
          />
          {/* Skip to quiz */}
          {studyIndex > 0 && (
            <button onClick={() => setPhase("quiz")}
              className="mt-4 w-full text-center text-xs text-indigo-600 hover:underline">
              Quiz bosqichiga o&apos;tish →
            </button>
          )}
        </div>
      )}

      {phase === "quiz" && (
        <QuizView words={words} onFinish={handleQuizFinish} />
      )}

      {phase === "result" && (
        <ResultView
          results={results}
          words={words}
          score={score}
          onSubmit={handleSubmit}
          onRetry={retry}
          submitting={submitting}
        />
      )}
    </div>
  );
}
