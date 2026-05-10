import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const students = await db.user.findMany({
    where: { role: "STUDENT", isActive: true },
    select: {
      id: true, name: true, email: true, avatar: true, createdAt: true,
      submissions: {
        select: { status: true, grade: { select: { score: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(students);
}
