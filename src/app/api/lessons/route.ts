import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { createRoom, isDailyConfigured } from "@/lib/daily";

const lessonSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  scheduledAt: z.string().datetime(),
  duration:    z.number().int().min(15).max(240).default(60),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const role   = session.user.role as string;

  if (role === "TEACHER") {
    const lessons = await db.liveLesson.findMany({
      where: { teacherId: userId },
      orderBy: { scheduledAt: "asc" },
      include: { teacher: { select: { id: true, name: true } } },
    });
    return NextResponse.json(lessons);
  }

  // STUDENT — see lessons from enrolled teachers
  const enrollments = await db.enrollment.findMany({
    where: { studentId: userId, status: "ACTIVE" },
    select: { teacherId: true },
  });
  const teacherIds = enrollments.map((e) => e.teacherId);

  const lessons = await db.liveLesson.findMany({
    where: {
      teacherId: { in: teacherIds },
      status:    { in: ["SCHEDULED", "LIVE"] },
    },
    orderBy: { scheduledAt: "asc" },
    include: { teacher: { select: { id: true, name: true } } },
  });

  return NextResponse.json(lessons);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = lessonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { title, description, scheduledAt, duration } = parsed.data;
  const teacherId = session.user.id as string;

  // Attempt to create a Daily.co room
  let roomUrl:  string | undefined;
  let roomName: string | undefined;

  if (isDailyConfigured()) {
    try {
      const slug = `lesson-${Date.now()}`;
      const room = await createRoom(slug, 86_400 * 7); // 7 days
      roomUrl  = room.url;
      roomName = room.name;
    } catch (err) {
      console.warn("[lessons POST] Daily.co room creation failed:", err);
      // Continue without video — teacher can add later
    }
  }

  const lesson = await db.liveLesson.create({
    data: {
      teacherId,
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      duration,
      roomUrl,
      roomName,
    },
    include: { teacher: { select: { id: true, name: true } } },
  });

  // Notify enrolled students
  const enrollments = await db.enrollment.findMany({
    where: { teacherId, status: "ACTIVE" },
    select: { studentId: true },
  });

  if (enrollments.length > 0) {
    await db.notification.createMany({
      data: enrollments.map((e) => ({
        userId:  e.studentId,
        type:    "SYSTEM" as const,
        title:   "New live lesson scheduled 📅",
        message: `${session.user.name} scheduled: "${title}" — ${new Date(scheduledAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}`,
        link:    `/lessons/${lesson.id}`,
      })),
    });
  }

  return NextResponse.json(lesson, { status: 201 });
}
