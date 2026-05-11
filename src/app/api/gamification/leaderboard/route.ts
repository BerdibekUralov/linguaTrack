import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const students = await db.user.findMany({
    where: { role: "STUDENT", isActive: true },
    select: {
      id: true,
      name: true,
      avatar: true,
      xp: true,
      level: true,
      streak: true,
      longestStreak: true,
      userBadges: { select: { badge: true, earnedAt: true } },
      _count: {
        select: {
          submissions: { where: { status: "GRADED" } },
        },
      },
    },
    orderBy: { xp: "desc" },
    take: 50,
  });

  return NextResponse.json(students);
}
