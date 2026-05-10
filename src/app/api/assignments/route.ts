import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assignmentSchema } from "@/lib/validations/assignment";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const userId = session.user.id as string;
  const role = session.user.role as string;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where =
    role === "TEACHER"
      ? { teacherId: userId, ...(status ? { status: status as "DRAFT" | "ACTIVE" | "CLOSED" } : {}) }
      : {
          OR: [{ studentId: userId }, { studentId: null }],
          status: "ACTIVE" as const,
        };

  const assignments = await db.assignment.findMany({
    where,
    include: {
      teacher: { select: { id: true, name: true, avatar: true } },
      student: { select: { id: true, name: true, avatar: true } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assignments);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = assignmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });
  }

  const { dueDate, skillContent, ...rest } = parsed.data;

  const assignment = await db.assignment.create({
    data: {
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : null,
      teacherId: session.user.id as string,
      skillContent: skillContent ?? undefined,
    },
  });

  return NextResponse.json(assignment, { status: 201 });
}
