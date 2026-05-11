import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createRoom, isDailyConfigured } from "@/lib/daily";
import type { LessonStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const lesson = await db.liveLesson.findUnique({
    where: { id },
    include: { teacher: { select: { id: true, name: true } } },
  });

  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(lesson);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const lesson = await db.liveLesson.findUnique({ where: { id } });
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (lesson.teacherId !== (session.user.id as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as {
    status?: LessonStatus;
    title?: string;
    description?: string;
    scheduledAt?: string;
    duration?: number;
    createRoom?: boolean;
  };

  let roomUrl  = lesson.roomUrl  ?? undefined;
  let roomName = lesson.roomName ?? undefined;

  // Teacher explicitly requests a room creation (or status going LIVE)
  if ((body.createRoom || body.status === "LIVE") && !lesson.roomUrl && isDailyConfigured()) {
    try {
      const slug = `lesson-${id}`;
      const room = await createRoom(slug);
      roomUrl  = room.url;
      roomName = room.name;
    } catch (err) {
      console.warn("[lessons PATCH] Daily.co room creation failed:", err);
    }
  }

  const updated = await db.liveLesson.update({
    where: { id },
    data: {
      ...(body.title       ? { title: body.title }                       : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.scheduledAt ? { scheduledAt: new Date(body.scheduledAt) } : {}),
      ...(body.duration    ? { duration: body.duration }                 : {}),
      ...(body.status      ? { status: body.status }                     : {}),
      roomUrl,
      roomName,
    },
    include: { teacher: { select: { id: true, name: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const lesson = await db.liveLesson.findUnique({ where: { id } });
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (lesson.teacherId !== (session.user.id as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.liveLesson.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
