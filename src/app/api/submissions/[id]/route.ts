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

// ─── GET ──────────────────────────────────────────────────────────────────────
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

// ─── PATCH — teacher returns submission to student ────────────────────────────
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json() as { action: string; note?: string };

  if (body.action !== "return") {
    return NextResponse.json({ error: "Noto'g'ri amal" }, { status: 400 });
  }

  const submission = await db.submission.findUnique({
    where: { id },
    include: { assignment: { select: { teacherId: true, title: true, id: true } } },
  });

  if (!submission) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  if (submission.assignment.teacherId !== (session.user.id as string)) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }
  if (submission.status !== "SUBMITTED" && submission.status !== "GRADED") {
    return NextResponse.json({ error: "Faqat topshirilgan yoki baholangan ishlarni qaytarish mumkin" }, { status: 409 });
  }

  // Delete existing grade if any (teacher is sending back for revision)
  await db.grade.deleteMany({ where: { submissionId: id } });

  const updated = await db.submission.update({
    where: { id },
    data: { status: "RETURNED" },
  });

  // Notify student
  await db.notification.create({
    data: {
      userId: submission.studentId,
      type: "ASSIGNMENT_GRADED",
      title: "Vazifa qaytarildi",
      message: `"${submission.assignment.title}" vazifangiz qayta ko'rib chiqish uchun qaytarildi.${body.note ? ` Izoh: ${body.note}` : ""}`,
      link: `/assignments/${submission.assignment.id}`,
    },
  });

  return NextResponse.json(updated);
}

// ─── POST — student submits (from DRAFT or RETURNED) ─────────────────────────
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
  if (submission.status !== "DRAFT" && submission.status !== "RETURNED") {
    return NextResponse.json({ error: "Allaqachon topshirilgan" }, { status: 409 });
  }

  const isLate = submission.assignment.dueDate
    ? new Date() > new Date(submission.assignment.dueDate)
    : false;

  const isResubmit = submission.status === "RETURNED";

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
      attempt: isResubmit ? submission.attempt + 1 : submission.attempt,
      ...(answers ? { answers } : {}),
      ...(autoScore !== null ? { autoScore } : {}),
    },
  });

  // Auto-create grade for vocabulary
  if (submission.assignment.skillType === "VOCABULARY" && autoScore !== null) {
    await db.grade.upsert({
      where: { submissionId: id },
      create: {
        submissionId: id,
        teacherId: submission.assignment.teacherId,
        score: Math.round((autoScore / 100) * submission.assignment.maxScore),
        feedback: `Vocabulary quiz natijasi: ${autoScore}%`,
        gradedAt: new Date(),
      },
      update: {
        score: Math.round((autoScore / 100) * submission.assignment.maxScore),
        feedback: `Vocabulary quiz natijasi: ${autoScore}%`,
        gradedAt: new Date(),
      },
    });
  }

  // Teacher notification
  await db.notification.create({
    data: {
      userId: submission.assignment.teacherId,
      type: "SUBMISSION_RECEIVED",
      title: isResubmit ? "Qayta topshirildi" : "Yangi topshiriq",
      message: isResubmit
        ? `Student "${submission.assignment.title}" vazifasini qayta topshirdi.`
        : `Student "${submission.assignment.title}" vazifasini topshirdi.`,
      link: `/assignments/${submission.assignment.id}`,
    },
  });

  // Gamification (only on first submission or resubmit)
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
