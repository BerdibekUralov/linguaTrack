import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json([]);

  const userId = session.user.id as string;
  const role = session.user.role as string;

  const results: {
    id: string;
    type: "assignment" | "submission";
    title: string;
    subtitle: string;
    href: string;
  }[] = [];

  // Search assignments
  const assignments = await db.assignment.findMany({
    where: {
      title: { contains: q, mode: "insensitive" },
      ...(role === "TEACHER" ? { teacherId: userId } : { status: "ACTIVE" }),
    },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, skillType: true, dueDate: true },
  });

  for (const a of assignments) {
    results.push({
      id: `a-${a.id}`,
      type: "assignment",
      title: a.title,
      subtitle: `${a.skillType ?? "WRITING"} · ${a.dueDate ? new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No due date"}`,
      href: `/assignments/${a.id}`,
    });
  }

  // Search submissions (student only)
  if (role === "STUDENT") {
    const submissions = await db.submission.findMany({
      where: {
        studentId: userId,
        assignment: { title: { contains: q, mode: "insensitive" } },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        assignment: { select: { title: true } },
      },
    });

    for (const s of submissions) {
      results.push({
        id: `s-${s.id}`,
        type: "submission",
        title: s.assignment.title,
        subtitle: `Submission · ${s.status}`,
        href: `/submissions`,
      });
    }
  }

  return NextResponse.json(results);
}
