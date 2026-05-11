import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardXp, updateStreak, checkAndAwardBadges } from "@/lib/gamification";
import type {
  StructuredAnswers,
  ReadingContent,
  ListeningContent,
  GrammarContent,
  Task,
} from "@/types/skill-content";

type Params = { params: Promise<{ id: string }> };

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

export async function GET(_: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { id } = await params;
  const submission = await db.submission.findUnique({
    where: { id },
    include: {
      assignment: { select: { id: true, title: true, maxScore: true, dueDate: true, teacherId: true } },
      student: { select: { id: true, name: true, avatar: true } },
      grade: true,
    },
  });

  if (!submission) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  return NextResponse.json(submission);
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, answers } = body;

  if (action !== "submit") {
    return NextResponse.json({ error: "Noto'g'ri amal" }, { status: 400 });
  }

  const submission = await db.submission.findUnique({
    where: { id, studentId: session.user.id as string },
    include: { assignment: true },
  });

  if (!submission) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  if (submission.status !== "DRAFT") {
    return NextResponse.json({ error: "Allaqachon topshirilgan" }, { status: 409 });
  }

  const isLate = submission.assignment.dueDate
    ? new Date() > new Date(submission.assignment.dueDate)
    : false;

  // Compute auto-score from answers (prefer body answers, fall back to stored)
  const effectiveAnswers = (answers ?? submission.answers) as StructuredAnswers | null;
  const autoScore = effectiveAnswers
    ? autoGrade(
        submission.assignment.skillType,
        submission.assignment.skillContent,
        effectiveAnswers
      )
    : null;

  const updated = await db.submission.update({
    where: { id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      isLate,
      ...(answers ? { answers } : {}),
      ...(autoScore !== null ? { autoScore } : {}),
    },
  });

  // Auto-create grade for vocabulary (score from quiz)
  if (submission.assignment.skillType === "VOCABULARY" && submission.autoScore !== null) {
    const vocabScore = Math.round(
      ((submission.autoScore ?? 0) / 100) * submission.assignment.maxScore
    );
    await db.grade.create({
      data: {
        submissionId: id,
        teacherId: submission.assignment.teacherId,
        score: vocabScore,
        feedback: `Vocabulary quiz natijasi: ${submission.autoScore ?? 0}%`,
        gradedAt: new Date(),
      },
    }).catch(() => {/* ignore if already graded */});
  }

  // Teacher notification
  await db.notification.create({
    data: {
      userId: submission.assignment.teacherId,
      type: "SUBMISSION_RECEIVED",
      title: "New submission",
      message: `A student submitted: "${submission.assignment.title}"`,
      link: `/assignments/${submission.assignment.id}`,
    },
  });

  // Gamification: XP for submitting + streak + early bird bonus
  const studentId = session.user.id as string;
  await awardXp(studentId, "SUBMIT", { assignmentId: submission.assignmentId });

  if (!isLate && submission.assignment.dueDate) {
    const hoursLeft = (new Date(submission.assignment.dueDate).getTime() - Date.now()) / 3_600_000;
    if (hoursLeft >= 24) {
      await awardXp(studentId, "SUBMIT_ONTIME", { assignmentId: submission.assignmentId });
    }
  }

  await updateStreak(studentId);
  await checkAndAwardBadges(studentId);

  return NextResponse.json(updated);
}
