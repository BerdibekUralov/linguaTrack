import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/users/teachers?q=name — search teachers (for students to enroll)
export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const teachers = await db.user.findMany({
    where: {
      role: "TEACHER",
      isActive: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true, avatar: true, bio: true },
    take: 20,
    orderBy: { name: "asc" },
  });

  // If student, mark which are already enrolled
  if (session.user.role === "STUDENT") {
    const myEnrollments = await db.enrollment.findMany({
      where: { studentId: session.user.id },
      select: { teacherId: true },
    });
    const enrolledIds = new Set(myEnrollments.map((e) => e.teacherId));
    return NextResponse.json(teachers.map((t) => ({ ...t, enrolled: enrolledIds.has(t.id) })));
  }

  return NextResponse.json(teachers.map((t) => ({ ...t, enrolled: false })));
}
