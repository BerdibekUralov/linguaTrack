import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/enrollments — list my enrollments
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const role = session.user.role;

  if (role === "TEACHER") {
    const enrollments = await db.enrollment.findMany({
      where: { teacherId: userId, status: "ACTIVE" },
      include: {
        student: {
          select: { id: true, name: true, email: true, avatar: true, createdAt: true },
        },
      },
      orderBy: { startDate: "desc" },
    });

    // Enrich with submission/grade stats per student
    const enriched = await Promise.all(
      enrollments.map(async (e) => {
        const [submissions, grades] = await Promise.all([
          db.submission.count({ where: { studentId: e.studentId, status: "SUBMITTED" } }),
          db.grade.findMany({
            where: { submission: { studentId: e.studentId } },
            select: { score: true },
          }),
        ]);
        const avgScore =
          grades.length > 0
            ? Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length)
            : null;
        return {
          ...e,
          stats: { submissionCount: submissions, avgScore, gradeCount: grades.length },
        };
      })
    );

    return NextResponse.json(enriched);
  }

  // STUDENT: my teacher enrollments
  const enrollments = await db.enrollment.findMany({
    where: { studentId: userId },
    include: {
      teacher: { select: { id: true, name: true, email: true, avatar: true, bio: true } },
    },
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json(enrollments);
}

// POST /api/enrollments — student requests to enroll with a teacher
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can enroll" }, { status: 403 });
  }

  try {
    const { teacherId } = await req.json();
    if (!teacherId) return NextResponse.json({ error: "teacherId is required" }, { status: 400 });

    const teacher = await db.user.findFirst({ where: { id: teacherId, role: "TEACHER" } });
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    const existing = await db.enrollment.findUnique({
      where: { studentId_teacherId: { studentId: session.user.id, teacherId } },
    });
    if (existing) return NextResponse.json({ error: "Already enrolled" }, { status: 409 });

    const enrollment = await db.enrollment.create({
      data: { studentId: session.user.id, teacherId },
    });
    return NextResponse.json(enrollment, { status: 201 });
  } catch (err) {
    console.error("[enrollments POST]", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

// DELETE /api/enrollments?teacherId=xxx — unenroll
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get("teacherId");
  if (!teacherId) return NextResponse.json({ error: "teacherId kerak" }, { status: 400 });

  await db.enrollment.deleteMany({
    where: { studentId: session.user.id, teacherId },
  });
  return NextResponse.json({ ok: true });
}
