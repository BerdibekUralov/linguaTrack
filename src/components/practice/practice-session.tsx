"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Star, Heart, ArrowLeft, RotateCcw, Home, Zap, ChevronRight, CheckCircle, XCircle } from "lucide-react";

interface Question {
  id: string;
  type: string;
  question: string;
  options: string[];
  answer: string;
  hint?: string;
}

interface Lesson {
  id: string;
  title: string;
  xpReward: number;
  unitTitle: string;
  unitColor: string;
  moduleSlug: string;
  questions: Question[];
}

interface Props {
  lesson: Lesson;
  userId: string;
  previousStars: number | null;
}

type Phase = "intro" | "playing" | "answered" | "finished";

const MAX_HEARTS = 3;

export function PracticeSession({ lesson, userId, previousStars }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [saving, setSaving] = useState(false);

  const questions   = lesson.questions;
  const totalQ      = questions.length;
  const currentQ    = questions[currentIdx];
  const progress    = totalQ > 0 ? (currentIdx / totalQ) * 100 : 0;

  const stars = hearts === 3 ? 3 : hearts === 2 ? 2 : hearts === 1 ? 1 : 0;

  const handleSelect = useCallback(
    (option: string) => {
      if (phase !== "playing") return;
      const correct = option === currentQ.answer;
      setSelected(option);
      setIsCorrect(correct);
      setPhase("answered");
      if (!correct) {
        setHearts((h) => Math.max(0, h - 1));
        setWrongAnswers((w) => w + 1);
      }
    },
    [phase, currentQ],
  );

  const handleNext = useCallback(async () => {
    const isLast = currentIdx === totalQ - 1;
    if (isLast) {
      // Save progress
      setSaving(true);
      try {
        await fetch("/api/practice/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: lesson.id,
            stars,
            xpEarned: stars > 0 ? lesson.xpReward : 0,
          }),
        });
      } catch (_) {
        // fail silently
      } finally {
        setSaving(false);
        setPhase("finished");
      }
    } else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setIsCorrect(null);
      setPhase("playing");
    }
  }, [currentIdx, totalQ, lesson.id, lesson.xpReward, stars]);

  // ── INTRO SCREEN ────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 text-center">
        <div>
          <div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl text-4xl shadow-lg"
            style={{ background: lesson.unitColor }}
          >
            🎯
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>{lesson.title}</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>
            {lesson.unitTitle} · {totalQ} questions
          </p>
        </div>

        <div className="flex gap-6">
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-0.5">
              {[1, 2, 3].map(n => (
                <Heart key={n} className="h-5 w-5 fill-red-500 text-red-500" />
              ))}
            </div>
            <span className="text-xs" style={{ color: "var(--text-3)" }}>3 lives</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-0.5">
              {[1, 2, 3].map(n => (
                <Star key={n} className="h-5 w-5" fill="#fbbf24" style={{ color: "#fbbf24" }} />
              ))}
            </div>
            <span className="text-xs" style={{ color: "var(--text-3)" }}>Earn stars</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <Zap className="h-5 w-5" style={{ color: "var(--accent)" }} />
              <span className="font-bold text-sm" style={{ color: "var(--accent)" }}>+{lesson.xpReward}</span>
            </div>
            <span className="text-xs" style={{ color: "var(--text-3)" }}>XP reward</span>
          </div>
        </div>

        {previousStars !== null && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm" style={{ background: "var(--surface-2)" }}>
            <span style={{ color: "var(--text-3)" }}>Previous attempt:</span>
            <div className="flex gap-0.5">
              {[1, 2, 3].map(n => (
                <Star
                  key={n}
                  className="h-4 w-4"
                  fill={n <= previousStars ? "#fbbf24" : "transparent"}
                  style={{ color: "#fbbf24" }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/practice")}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:opacity-80"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={() => setPhase("playing")}
            className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 shadow-md"
            style={{ background: lesson.unitColor }}
          >
            Start
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── FINISHED SCREEN ─────────────────────────────────────────────────────────
  if (phase === "finished") {
    const earned = stars > 0 ? lesson.xpReward : 0;
    const starEmojis = ["💀", "⭐", "⭐⭐", "⭐⭐⭐"];

    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 text-center">
        {saving && (
          <div className="text-sm" style={{ color: "var(--text-3)" }}>Saving…</div>
        )}

        <div>
          <div className="mx-auto mb-4 text-6xl">{stars === 0 ? "💀" : stars === 3 ? "🎉" : "👏"}</div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            {stars === 0 ? "Try Again!" : stars === 3 ? "Perfect!" : "Well done!"}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>
            {wrongAnswers === 0
              ? "No mistakes! Amazing!"
              : `${wrongAnswers} mistake${wrongAnswers !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Stars */}
        <div className="flex gap-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex flex-col items-center gap-1">
              <Star
                className="h-10 w-10 transition-all"
                fill={n <= stars ? "#fbbf24" : "transparent"}
                style={{
                  color: "#fbbf24",
                  filter: n <= stars ? "drop-shadow(0 0 8px #fbbf24)" : "none",
                }}
              />
            </div>
          ))}
        </div>

        {/* XP */}
        {earned > 0 && (
          <div
            className="flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold"
            style={{ background: "var(--accent-bg, #f5f3ff)", color: "var(--accent)" }}
          >
            <Zap className="h-4 w-4" />
            +{earned} XP earned
          </div>
        )}

        {/* Hearts remaining */}
        <div className="flex items-center gap-1">
          {[1, 2, 3].map(n => (
            <Heart
              key={n}
              className="h-6 w-6"
              fill={n <= hearts ? "#ef4444" : "transparent"}
              style={{ color: "#ef4444" }}
            />
          ))}
          <span className="ml-2 text-sm" style={{ color: "var(--text-3)" }}>
            {hearts} heart{hearts !== 1 ? "s" : ""} remaining
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/practice")}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:opacity-80"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}
          >
            <Home className="h-4 w-4" />
            Map
          </button>
          <button
            onClick={() => {
              setCurrentIdx(0);
              setHearts(MAX_HEARTS);
              setSelected(null);
              setIsCorrect(null);
              setWrongAnswers(0);
              setPhase("playing");
            }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:opacity-80"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </button>
          {stars > 0 && (
            <button
              onClick={() => router.push("/practice")}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 shadow-md"
              style={{ background: lesson.unitColor }}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── PLAYING / ANSWERED SCREEN ────────────────────────────────────────────────
  const answerFeedback = phase === "answered" ? (isCorrect ? "correct" : "wrong") : null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/practice")}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:opacity-70"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <ArrowLeft className="h-4 w-4" style={{ color: "var(--text-3)" }} />
        </button>

        {/* Progress bar */}
        <div className="flex-1 overflow-hidden rounded-full h-3" style={{ background: "var(--surface-2)" }}>
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: lesson.unitColor }}
          />
        </div>

        {/* Hearts */}
        <div className="flex shrink-0 items-center gap-0.5">
          {[1, 2, 3].map(n => (
            <Heart
              key={n}
              className="h-5 w-5 transition-all"
              fill={n <= hearts ? "#ef4444" : "transparent"}
              style={{ color: "#ef4444", opacity: n <= hearts ? 1 : 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Question counter */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
          Question {currentIdx + 1} of {totalQ}
        </p>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>
          {lesson.unitTitle}
        </p>
      </div>

      {/* Question card */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {currentQ.type === "fill" ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: lesson.unitColor }}>
              Fill in the blank
            </p>
            <p className="text-lg font-semibold leading-relaxed" style={{ color: "var(--text)" }}>
              {currentQ.question.replace("___", "______")}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: lesson.unitColor }}>
              {currentQ.type === "match" ? "Match the meaning" : "Choose the correct answer"}
            </p>
            <p className="text-lg font-semibold leading-relaxed" style={{ color: "var(--text)" }}>
              {currentQ.question}
            </p>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid gap-3">
        {currentQ.options.map((option) => {
          const isSelected = selected === option;
          const isAnswer   = option === currentQ.answer;

          let bg = "var(--surface)";
          let border = "1px solid var(--border)";
          let color = "var(--text)";
          let icon: React.ReactNode = null;

          if (phase === "answered") {
            if (isAnswer) {
              bg = "#dcfce7"; border = "1.5px solid #16a34a"; color = "#15803d";
              icon = <CheckCircle className="h-5 w-5 shrink-0" style={{ color: "#16a34a" }} />;
            } else if (isSelected && !isAnswer) {
              bg = "#fee2e2"; border = "1.5px solid #dc2626"; color = "#b91c1c";
              icon = <XCircle className="h-5 w-5 shrink-0" style={{ color: "#dc2626" }} />;
            } else {
              color = "var(--text-3)";
            }
          } else if (phase === "playing") {
            bg = "var(--surface)";
          }

          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={phase === "answered"}
              className="flex items-center gap-3 rounded-2xl px-5 py-4 text-left text-sm font-medium transition-all hover:opacity-90"
              style={{
                background: bg,
                border,
                color,
                cursor: phase === "answered" ? "default" : "pointer",
              }}
            >
              {icon}
              <span className="flex-1">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback + Next */}
      {phase === "answered" && (
        <div
          className="rounded-2xl p-4 flex items-center justify-between gap-4"
          style={{
            background: isCorrect ? "#dcfce7" : "#fee2e2",
            border: `1px solid ${isCorrect ? "#16a34a" : "#dc2626"}`,
          }}
        >
          <div>
            <p className="font-bold text-sm" style={{ color: isCorrect ? "#15803d" : "#b91c1c" }}>
              {isCorrect ? "Correct! 🎉" : "Incorrect 😔"}
            </p>
            {!isCorrect && (
              <p className="text-xs mt-0.5" style={{ color: "#b91c1c" }}>
                Answer: <strong>{currentQ.answer}</strong>
              </p>
            )}
          </div>
          <button
            onClick={handleNext}
            className="flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: isCorrect ? "#16a34a" : "#dc2626" }}
          >
            {currentIdx === totalQ - 1 ? "Finish" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
