import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assignmentSchema } from "@/lib/validations/assignment";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { id } = await params;
  const assignment = await db.assignment.findUnique({
    where: { id },
    include: {
      teacher: { select: { id: true, name: true, avatar: true } },
      student: { select: { id: true, name: true, avatar: true } },
      submissions: {
        include: { grade: true, student: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!assignment) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  return NextResponse.json(assignment);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  // Allow partial update including status
  const { status, ...rest } = body;

  if (Object.keys(rest).length > 0) {
    const parsed = assignmentSchema.partial().safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }
  }

  const { dueDate, skillContent, ...updateData } = rest;

  const assignment = await db.assignment.update({
    where: { id, teacherId: session.user.id as string },
    data: {
      ...updateData,
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      ...(skillContent !== undefined ? { skillContent: skillContent ?? undefined } : {}),
      ...(status ? { status } : {}),
    },
  });

  return NextResponse.json(assignment);
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { id } = await params;

  await db.assignment.update({
    where: { id, teacherId: session.user.id as string },
    data: { status: "CLOSED" },
  });

  return NextResponse.json({ success: true });
}
