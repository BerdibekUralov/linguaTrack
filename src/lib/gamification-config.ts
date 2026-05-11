// CLIENT-SAFE — no Node.js or Prisma imports. Safe for "use client" components.

// ─── BADGE TYPE (mirrors Prisma enum — no import needed) ──────────────────────

export type BadgeType =
  | "FIRST_STEP"
  | "SUBMISSIONS_10"
  | "SUBMISSIONS_50"
  | "PERFECT_SCORE"
  | "HIGH_ACHIEVER"
  | "STREAK_3"
  | "STREAK_7"
  | "STREAK_30"
  | "WRITING_PRO"
  | "READING_PRO"
  | "GRAMMAR_PRO"
  | "SCHOLAR"
  | "MASTER"
  | "LEGEND"
  | "EARLY_BIRD"
  | "SPEED_DEMON";

// ─── LEVEL THRESHOLDS ─────────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1, minXp: 0,    label: "Beginner",  emoji: "🌱" },
  { level: 2, minXp: 100,  label: "Learner",   emoji: "📖" },
  { level: 3, minXp: 250,  label: "Explorer",  emoji: "🔍" },
  { level: 4, minXp: 500,  label: "Scholar",   emoji: "🎓" },
  { level: 5, minXp: 1000, label: "Expert",    emoji: "⭐" },
  { level: 6, minXp: 2000, label: "Master",    emoji: "🏆" },
  { level: 7, minXp: 3500, label: "Champion",  emoji: "👑" },
  { level: 8, minXp: 5000, label: "Legend",    emoji: "💎" },
] as const;

export function getLevelInfo(xp: number) {
  let current: typeof LEVELS[number] = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXp) current = l;
    else break;
  }
  const nextIndex = LEVELS.findIndex((l) => l.level === current.level) + 1;
  const next = LEVELS[nextIndex] ?? null;
  const progress = next
    ? Math.min(100, Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100))
    : 100;
  return { current, next, progress, xp };
}

// ─── XP REWARDS ───────────────────────────────────────────────────────────────

export const XP_REWARDS = {
  SUBMIT:        10,
  SUBMIT_ONTIME:  5,
  GRADE_50:      10,
  GRADE_70:      20,
  GRADE_90:      35,
  GRADE_100:     50,
  STREAK_DAY:     5,
} as const;

// ─── BADGE METADATA ───────────────────────────────────────────────────────────

export const BADGE_META: Record<BadgeType, { label: string; desc: string; emoji: string; color: string }> = {
  FIRST_STEP:     { label: "First Step",    desc: "Submit your first assignment",           emoji: "👶", color: "#22c55e" },
  SUBMISSIONS_10: { label: "Dedicated",     desc: "Submit 10 assignments",                  emoji: "📚", color: "#3b82f6" },
  SUBMISSIONS_50: { label: "Hard Worker",   desc: "Submit 50 assignments",                  emoji: "💪", color: "#8b5cf6" },
  PERFECT_SCORE:  { label: "Perfect Score", desc: "Get 100% on any assignment",             emoji: "💯", color: "#f59e0b" },
  HIGH_ACHIEVER:  { label: "High Achiever", desc: "Score 90%+ on three assignments",        emoji: "🌟", color: "#f97316" },
  STREAK_3:       { label: "On a Roll",     desc: "Maintain a 3-day streak",                emoji: "🔥", color: "#ef4444" },
  STREAK_7:       { label: "Week Warrior",  desc: "Maintain a 7-day streak",                emoji: "⚡", color: "#eab308" },
  STREAK_30:      { label: "Unstoppable",   desc: "Maintain a 30-day streak",               emoji: "🚀", color: "#a855f7" },
  WRITING_PRO:    { label: "Writing Pro",   desc: "Pass 5 writing assignments (≥70%)",      emoji: "✍️", color: "#06b6d4" },
  READING_PRO:    { label: "Reading Pro",   desc: "Pass 5 reading assignments (≥70%)",      emoji: "📖", color: "#10b981" },
  GRAMMAR_PRO:    { label: "Grammar Pro",   desc: "Pass 5 grammar assignments (≥70%)",      emoji: "📝", color: "#6366f1" },
  SCHOLAR:        { label: "Scholar",       desc: "Reach Level 4",                          emoji: "🎓", color: "#0ea5e9" },
  MASTER:         { label: "Master",        desc: "Reach Level 6",                          emoji: "🏆", color: "#d97706" },
  LEGEND:         { label: "Legend",        desc: "Reach Level 8",                          emoji: "💎", color: "#7c3aed" },
  EARLY_BIRD:     { label: "Early Bird",    desc: "Submit 24h before deadline (3 times)",   emoji: "🐦", color: "#84cc16" },
  SPEED_DEMON:    { label: "Speed Demon",   desc: "Submit within 1h of assignment publish", emoji: "⚡", color: "#ec4899" },
};
