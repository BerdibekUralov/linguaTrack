import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getLevelInfo } from "@/lib/gamification";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      xp: true,
      level: true,
      streak: true,
      longestStreak: true,
      userBadges: {
        select: { badge: true, earnedAt: true },
        orderBy: { earnedAt: "desc" },
      },
      xpLogs: {
        select: { points: true, reason: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const levelInfo = getLevelInfo(user.xp);

  // Rank among all students
  const rank = await db.user.count({
    where: { role: "STUDENT", isActive: true, xp: { gt: user.xp } },
  });

  return NextResponse.json({
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    longestStreak: user.longestStreak,
    rank: rank + 1,
    levelInfo,
    badges: user.userBadges,
    recentXp: user.xpLogs,
  });
}
