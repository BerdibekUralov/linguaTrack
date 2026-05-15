import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const { lessonId, stars, xpEarned } = await req.json();

  if (!lessonId || typeof stars !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Upsert progress — keep best stars
  const existing = await db.gameProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  const bestStars = Math.max(stars, existing?.stars ?? 0);
  const addedXp   = existing?.completed ? 0 : xpEarned; // Only grant XP first time

  await db.gameProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: {
      userId,
      lessonId,
      completed:   stars > 0,
      stars:       bestStars,
      xpEarned:    xpEarned,
      completedAt: stars > 0 ? new Date() : null,
    },
    update: {
      completed: stars > 0 ? true : undefined,
      stars:     bestStars,
      completedAt: stars > 0 && !existing?.completed ? new Date() : undefined,
    },
  });

  // Grant XP to user (first completion only)
  if (addedXp > 0) {
    await db.user.update({
      where: { id: userId },
      data:  { xp: { increment: addedXp } },
    });
    await db.xpLog.create({
      data: {
        userId,
        points: addedXp,
        reason: "practice_lesson",
        meta:   { lessonId, stars },
      },
    });
  }

  return NextResponse.json({ ok: true, bestStars, xpEarned: addedXp });
}
