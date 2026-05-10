import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type {
  StructuredAnswers,
  ReadingContent,
  ListeningContent,
  GrammarContent,
  Task,
} from "@/types/skill-content";

// ─── Auto-grading ─────────────────────────────────────────────────────────────
function autoGrade(
  skillType: string,
  skillContent: unknown,
  answers: StructuredAnswers
): number | null {
  const gradeable = ["READING", "LISTENING", "GRAMMAR"];
  if (!gradeable.includes(skillType) || !skillContent) return null;

  const content = skillContent as ReadingContent | ListeningContent | GrammarContent;
  if (!("tasks" in content)) return null;

  let correct = 0;
  let total = 0;

  for (const task of content.tasks as Task[]) {
    const taskAnswers = answers[task.id] ?? {};
    for (const q of task.questions) {
      total++;
      const studentAnswer = (taskAnswers[q.id] ?? "").trim().toLowerCase();
      const correctAnswer = ("answer" in q ? String(q.answer) : "").trim().toLowerCase();
      if (studentAnswer && studentAnswer === correctAnswer) correct++;
    }
  }

  if (total === 0) return null;
  return Math.round((correct / total) * 100);
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const userId = session.user.id as string;
  const role = session.user.role as string;

  const submissions = await db.submission.findMany({
    where: role === "STUDENT" ? { studentId: userId } : { assignment: { teacherId: userId } },
    include: {
      assignment: { select: { id: true, title: true, maxScore: true, dueDate: true } },
      student: { select: { id: true, name: true, avatar: true } },
      grade: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(submissions);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const body = await req.json();
  const { assignmentId, content, fileUrls, answers } = body;

  if (!assignmentId) {
    return NextResponse.json({ error: "assignmentId kiritilishi shart" }, { status: 400 });
  }

  // Verify student exists in DB (session could be stale after DB reset)
  const studentExists = await db.user.findUnique({
    where: { id: session.user.id as string },
    select: { id: true },
  });
  if (!studentExists) {
    return NextResponse.json(
      { error: "Sessiya muddati tugagan. Iltimos, qayta kiring." },
      { status: 401 }
    );
  }

  const assignment = await db.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.status !== "ACTIVE") {
    return NextResponse.json({ error: "Bu vazifa aktiv emas" }, { status: 400 });
  }

  // Compute auto-score if applicable
  const autoScore = answers
    ? autoGrade(
        assignment.skillType,
        assignment.skillContent,
        answers as StructuredAnswers
      )
    : null;

  const existing = await db.submission.findFirst({
    where: { assignmentId, studentId: session.user.id as string, status: { not: "RETURNED" } },
  });

  if (existing && existing.status !== "DRAFT") {
    return NextResponse.json({ error: "Siz bu vazifani allaqachon topshirgansiz" }, { status: 409 });
  }

  if (existing) {
    const updated = await db.submission.update({
      where: { id: existing.id },
      data: {
        content: content ?? existing.content,
        fileUrls: fileUrls ?? existing.fileUrls,
        answers: answers ?? existing.answers ?? undefined,
        autoScore: autoScore ?? existing.autoScore,
        attempt: existing.attempt + 1,
      },
    });
    return NextResponse.json(updated);
  }

  const submission = await db.submission.create({
    data: {
      assignmentId,
      studentId: session.user.id as string,
      content: content ?? "",
      fileUrls: fileUrls ?? [],
      answers: answers ?? undefined,
      autoScore: autoScore ?? undefined,
    },
  });

  return NextResponse.json(submission, { status: 201 });
}
