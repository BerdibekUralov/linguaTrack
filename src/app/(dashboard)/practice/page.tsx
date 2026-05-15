import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock, Star, ChevronRight, Zap, BookOpen, PenLine } from "lucide-react";

export default async function PracticePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id as string;

  const modules = await db.gameModule.findMany({
    orderBy: { order: "asc" },
    include: {
      units: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              progress: { where: { userId } },
              _count: { select: { questions: true } },
            },
          },
        },
      },
    },
  });

  // Build a flat list of all lessons in order for lock logic
  const allLessons: { id: string; unitId: string; moduleId: string }[] = [];
  for (const mod of modules) {
    for (const unit of mod.units) {
      for (const lesson of unit.lessons) {
        allLessons.push({ id: lesson.id, unitId: unit.id, moduleId: mod.id });
      }
    }
  }

  const completedIds = new Set(
    allLessons
      .filter((l) => {
        const mod = modules.find((m) => m.id === l.moduleId)!;
        const unit = mod.units.find((u) => u.id === l.unitId)!;
        const lesson = unit.lessons.find((ls) => ls.id === l.id)!;
        return lesson.progress[0]?.completed;
      })
      .map((l) => l.id),
  );

  // Lesson is unlocked if it's first, or previous in same unit is completed
  function isUnlocked(modIdx: number, unitIdx: number, lessonIdx: number): boolean {
    if (modIdx === 0 && unitIdx === 0 && lessonIdx === 0) return true;
    const mod = modules[modIdx];
    const unit = mod.units[unitIdx];
    // First lesson of a unit: check previous unit's last lesson
    if (lessonIdx === 0) {
      if (unitIdx === 0) {
        // First unit of module: previous module's last unit last lesson
        if (modIdx === 0) return true;
        const prevMod = modules[modIdx - 1];
        const prevUnit = prevMod.units[prevMod.units.length - 1];
        const prevLesson = prevUnit.lessons[prevUnit.lessons.length - 1];
        return completedIds.has(prevLesson.id);
      }
      const prevUnit = mod.units[unitIdx - 1];
      const prevLesson = prevUnit.lessons[prevUnit.lessons.length - 1];
      return completedIds.has(prevLesson.id);
    }
    // Otherwise: previous lesson in same unit must be completed
    const prevLesson = unit.lessons[lessonIdx - 1];
    return completedIds.has(prevLesson.id);
  }

  const MODULE_ICONS: Record<string, React.ElementType> = {
    vocabulary: BookOpen,
    grammar: PenLine,
  };

  const totalCompleted = completedIds.size;
  const totalLessons   = allLessons.length;
  const totalXp = modules.flatMap(m =>
    m.units.flatMap(u =>
      u.lessons.flatMap(l => l.progress.map(p => p.xpEarned))
    )
  ).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Practice</h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>
          Learn vocabulary and grammar step by step
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Lessons done", value: `${totalCompleted}/${totalLessons}`, color: "var(--primary)" },
          { label: "XP earned",    value: totalXp,                             color: "var(--accent)" },
          { label: "Modules",      value: modules.length,                      color: "var(--success)" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center rounded-2xl py-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Modules */}
      {modules.map((mod, modIdx) => {
        const ModIcon = MODULE_ICONS[mod.slug] ?? BookOpen;
        return (
          <div key={mod.id} className="space-y-5">
            {/* Module header */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                style={{ background: "var(--primary-bg)" }}
              >
                {mod.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>{mod.name}</h2>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  {mod.units.length} unit{mod.units.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Units */}
            <div className="space-y-4">
              {mod.units.map((unit, unitIdx) => {
                const unitCompleted = unit.lessons.filter(l => l.progress[0]?.completed).length;
                const unitTotal     = unit.lessons.length;
                const unitDone      = unitCompleted === unitTotal;

                return (
                  <div
                    key={unit.id}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    {/* Unit header */}
                    <div
                      className="flex items-center gap-3 px-5 py-3"
                      style={{ borderBottom: "1px solid var(--border)", background: `${unit.color}15` }}
                    >
                      <span className="text-xl">{unit.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{unit.title}</p>
                        <p className="text-xs" style={{ color: "var(--text-3)" }}>
                          {unitCompleted}/{unitTotal} completed
                        </p>
                      </div>
                      {unitDone && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#dcfce7", color: "#15803d" }}>
                          ✓ Done
                        </span>
                      )}
                    </div>

                    {/* Lesson path */}
                    <div className="px-5 py-4 flex flex-wrap gap-3 items-center">
                      {unit.lessons.map((lesson, lessonIdx) => {
                        const prog    = lesson.progress[0];
                        const done    = prog?.completed ?? false;
                        const stars   = prog?.stars ?? 0;
                        const unlocked = isUnlocked(modIdx, unitIdx, lessonIdx);
                        const isCurrent = !done && unlocked;

                        return (
                          <div key={lesson.id} className="flex flex-col items-center gap-1.5">
                            {done ? (
                              <Link
                                href={`/practice/${lesson.id}`}
                                className="relative flex h-16 w-16 flex-col items-center justify-center rounded-2xl text-2xl shadow-sm transition-transform hover:scale-105"
                                style={{
                                  background: unit.color,
                                  border: `2px solid ${unit.color}`,
                                }}
                                title={lesson.title}
                              >
                                <span>✅</span>
                                {/* Stars */}
                                <div className="flex gap-0.5 mt-0.5">
                                  {[1, 2, 3].map(n => (
                                    <Star
                                      key={n}
                                      className="h-2.5 w-2.5"
                                      fill={n <= stars ? "#fbbf24" : "transparent"}
                                      style={{ color: "#fbbf24" }}
                                    />
                                  ))}
                                </div>
                              </Link>
                            ) : unlocked ? (
                              <Link
                                href={`/practice/${lesson.id}`}
                                className="relative flex h-16 w-16 flex-col items-center justify-center rounded-2xl text-2xl shadow-md transition-transform hover:scale-105 animate-pulse-soft"
                                style={{
                                  background: `${unit.color}22`,
                                  border: `2.5px solid ${unit.color}`,
                                }}
                                title={lesson.title}
                              >
                                <span>🎯</span>
                                {isCurrent && (
                                  <span
                                    className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                                    style={{ background: unit.color }}
                                  >
                                    ▶
                                  </span>
                                )}
                              </Link>
                            ) : (
                              <div
                                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                                style={{
                                  background: "var(--surface-2)",
                                  border: "2px dashed var(--border)",
                                }}
                                title="Complete previous lesson to unlock"
                              >
                                <Lock className="h-5 w-5" style={{ color: "var(--text-3)" }} />
                              </div>
                            )}
                            <p
                              className="text-center text-[10px] font-medium max-w-[64px] leading-tight"
                              style={{ color: unlocked ? "var(--text-2)" : "var(--text-3)" }}
                            >
                              {lessonIdx + 1}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Lesson list (detail) */}
                    <div style={{ borderTop: "1px solid var(--border)" }}>
                      {unit.lessons.map((lesson, lessonIdx) => {
                        const prog     = lesson.progress[0];
                        const done     = prog?.completed ?? false;
                        const stars    = prog?.stars ?? 0;
                        const unlocked = isUnlocked(modIdx, unitIdx, lessonIdx);

                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 px-5 py-3"
                            style={{ borderBottom: "1px solid var(--border)", opacity: unlocked ? 1 : 0.45 }}
                          >
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm"
                              style={{
                                background: done ? unit.color : unlocked ? `${unit.color}22` : "var(--surface-2)",
                                color: done ? "#fff" : "var(--text-3)",
                              }}
                            >
                              {done ? "✓" : lessonIdx + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                                {lesson.title}
                              </p>
                              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                                {lesson._count.questions} questions · {lesson.xpReward} XP
                              </p>
                            </div>

                            {done && (
                              <div className="flex items-center gap-0.5 shrink-0">
                                {[1, 2, 3].map(n => (
                                  <Star
                                    key={n}
                                    className="h-3.5 w-3.5"
                                    fill={n <= stars ? "#fbbf24" : "transparent"}
                                    style={{ color: "#fbbf24" }}
                                  />
                                ))}
                              </div>
                            )}

                            {unlocked && (
                              <Link
                                href={`/practice/${lesson.id}`}
                                className="flex shrink-0 items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
                                style={{
                                  background: done ? "var(--surface-2)" : unit.color,
                                  color: done ? "var(--text-2)" : "#fff",
                                }}
                              >
                                {done ? "Replay" : "Start"}
                                <ChevronRight className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
