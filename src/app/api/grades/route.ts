import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const gradeSchema = z.object({
  submissionId: z.string(),
  score: z.number().min(0).max(1000),
  feedback: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = gradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });
  }

  const { submissionId, score, feedback } = parsed.data;

  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: true },
  });

  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (submission.assignment.teacherId !== (session.user.id as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (score > submission.assignment.maxScore) {
    return NextResponse.json(
      { error: `Score exceeds maximum (${submission.assignment.maxScore})` },
      { status: 400 }
    );
  }

  const grade = await db.grade.upsert({
    where: { submissionId },
    update: { score, feedback, teacherId: session.user.id as string, gradedAt: new Date() },
    create: { submissionId, score, feedback, teacherId: session.user.id as string },
  });

  await db.submission.update({
    where: { id: submissionId },
    data: { status: "GRADED" },
  });

  // Notify student — link goes to the assignment detail page where they can see their grade
  await db.notification.create({
    data: {
      userId: submission.studentId,
      type: "ASSIGNMENT_GRADED",
      title: "Assignment graded",
      message: `"${submission.assignment.title}" — you received ${score}/${submission.assignment.maxScore} points`,
      link: `/assignments/${submission.assignmentId}`,
    },
  });

  return NextResponse.json(grade, { status: 201 });
}
