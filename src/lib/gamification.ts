// SERVER-ONLY — imports Prisma (db). Never import this in "use client" components.
// For client-safe constants use "@/lib/gamification-config" instead.

import { db } from "./db";
import { getLevelInfo, XP_REWARDS, BADGE_META, type BadgeType } from "./gamification-config";

// Re-export everything from config so server code can use one import
export * from "./gamification-config";

// ─── AWARD XP ─────────────────────────────────────────────────────────────────

export async function awardXp(
  userId: string,
  reason: keyof typeof XP_REWARDS,
  meta?: Record<string, string | number | boolean | null>
): Promise<{ xpGained: number; newXp: number; newLevel: number; leveledUp: boolean }> {
  const points = XP_REWARDS[reason];

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true },
  });
  if (!user) return { xpGained: 0, newXp: 0, newLevel: 1, leveledUp: false };

  const newXp    = user.xp + points;
  const newLevel = getLevelInfo(newXp).current.level;
  const leveledUp = newLevel > user.level;

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { xp: newXp, level: newLevel },
    }),
    db.xpLog.create({
      data: { userId, points, reason, meta: meta ?? undefined },
    }),
  ]);

  if (leveledUp) {
    const levelInfo = getLevelInfo(newXp);
    await db.notification.create({
      data: {
        userId,
        type: "SYSTEM",
        title: "Level up! 🎉",
        message: `You reached Level ${newLevel} — ${levelInfo.current.label} ${levelInfo.current.emoji}`,
        link: "/leaderboard",
      },
    });
  }

  return { xpGained: points, newXp, newLevel, leveledUp };
}

// ─── UPDATE STREAK ────────────────────────────────────────────────────────────

export async function updateStreak(userId: string): Promise<number> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { streak: true, longestStreak: true, lastActivityDate: true },
  });
  if (!user) return 0;

  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last  = user.lastActivityDate
    ? new Date(
        user.lastActivityDate.getFullYear(),
        user.lastActivityDate.getMonth(),
        user.lastActivityDate.getDate()
      )
    : null;

  let newStreak = user.streak;

  if (!last) {
    newStreak = 1;
  } else {
    const diffDays = Math.round((today.getTime() - last.getTime()) / 86_400_000);
    if (diffDays === 0) return user.streak;   // already active today
    else if (diffDays === 1) newStreak = user.streak + 1;
    else newStreak = 1;
  }

  const newLongest = Math.max(newStreak, user.longestStreak);

  await db.user.update({
    where: { id: userId },
    data: { streak: newStreak, longestStreak: newLongest, lastActivityDate: now },
  });

  if (newStreak > 1) {
    await awardXp(userId, "STREAK_DAY");
  }

  return newStreak;
}

// ─── CHECK & AWARD BADGES ─────────────────────────────────────────────────────

export async function checkAndAwardBadges(userId: string): Promise<BadgeType[]> {
  const [user, existing] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        xp: true, level: true, streak: true, longestStreak: true,
        submissions: {
          where: { status: { in: ["GRADED", "SUBMITTED"] } },
          include: { assignment: { select: { skillType: true, maxScore: true } }, grade: true },
        },
        userBadges: { select: { badge: true } },
      },
    }),
    db.userBadge.findMany({ where: { userId }, select: { badge: true } }),
  ]);

  if (!user) return [];

  const earned = new Set(existing.map((b) => b.badge));
  const toAward: BadgeType[] = [];

  const totalSubs  = user.submissions.length;
  const gradedSubs = user.submissions.filter((s) => s.grade);

  const check = (badge: BadgeType, cond: boolean) => {
    if (cond && !earned.has(badge)) toAward.push(badge);
  };

  check("FIRST_STEP",     totalSubs >= 1);
  check("SUBMISSIONS_10", totalSubs >= 10);
  check("SUBMISSIONS_50", totalSubs >= 50);

  const hasPerfect = gradedSubs.some(
    (s) => s.grade && s.assignment.maxScore > 0 && s.grade.score >= s.assignment.maxScore
  );
  const highCount = gradedSubs.filter(
    (s) => s.grade && s.assignment.maxScore > 0 && s.grade.score / s.assignment.maxScore >= 0.9
  ).length;

  check("PERFECT_SCORE", hasPerfect);
  check("HIGH_ACHIEVER", highCount >= 3);

  check("STREAK_3",  user.longestStreak >= 3);
  check("STREAK_7",  user.longestStreak >= 7);
  check("STREAK_30", user.longestStreak >= 30);

  const skillPass = (skill: string) =>
    gradedSubs.filter(
      (s) =>
        s.assignment.skillType === skill &&
        s.grade &&
        s.assignment.maxScore > 0 &&
        s.grade.score / s.assignment.maxScore >= 0.7
    ).length >= 5;

  check("WRITING_PRO", skillPass("WRITING"));
  check("READING_PRO", skillPass("READING"));
  check("GRAMMAR_PRO", skillPass("GRAMMAR"));

  check("SCHOLAR", user.level >= 4);
  check("MASTER",  user.level >= 6);
  check("LEGEND",  user.level >= 8);

  if (toAward.length === 0) return [];

  await db.$transaction([
    db.userBadge.createMany({
      data: toAward.map((badge) => ({ userId, badge })),
      skipDuplicates: true,
    }),
    ...toAward.map((badge) =>
      db.notification.create({
        data: {
          userId,
          type: "SYSTEM",
          title: `Badge unlocked: ${BADGE_META[badge].label} ${BADGE_META[badge].emoji}`,
          message: BADGE_META[badge].desc,
          link: "/leaderboard",
        },
      })
    ),
  ]);

  return toAward;
}
