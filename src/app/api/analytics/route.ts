import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subDays, startOfDay, format } from "date-fns";

function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return { date: startOfDay(d), label: format(d, "MMM d") };
  });
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const userId = session.user.id as string;
  const role = session.user.role as string;
  const days = last7Days();
  const weekAgo = days[0].date;

  if (role === "STUDENT") {
    const [submissions, gradeAgg, weeklySubmissions] = await Promise.all([
      db.submission.findMany({
        where: { studentId: userId },
        include: {
          grade: true,
          assignment: { select: { title: true, maxScore: true, dueDate: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      db.grade.aggregate({
        where: { submission: { studentId: userId } },
        _avg: { score: true },
        _count: true,
      }),
      db.submission.findMany({
        where: { studentId: userId, createdAt: { gte: weekAgo } },
        select: { createdAt: true },
      }),
    ]);

    // Build daily chart data
    const weeklyChart = days.map(({ label, date }) => {
      const next = new Date(date.getTime() + 86_400_000);
      return {
        day: label,
        submissions: weeklySubmissions.filter(
          (s) => s.createdAt >= date && s.createdAt < next
        ).length,
      };
    });

    const completed = submissions.filter(
      (s) => s.status === "GRADED" || s.status === "SUBMITTED"
    ).length;
    const late = submissions.filter((s) => s.isLate).length;

    return NextResponse.json({
      totalSubmissions: submissions.length,
      completed,
      late,
      averageScore: Math.round(gradeAgg._avg.score ?? 0),
      gradedCount: gradeAgg._count,
      recentSubmissions: submissions.slice(0, 10),
      weeklyChart,
    });
  }

  // Teacher analytics
  const [
    totalAssignments,
    totalSubmissions,
    pendingGrading,
    gradedAgg,
    weeklySubmissions,
    scoreDistribution,
    enrollmentCount,
  ] = await Promise.all([
    db.assignment.count({ where: { teacherId: userId } }),
    db.submission.count({ where: { assignment: { teacherId: userId } } }),
    db.submission.count({
      where: { assignment: { teacherId: userId }, status: "SUBMITTED" },
    }),
    db.grade.aggregate({
      where: { submission: { assignment: { teacherId: userId } } },
      _avg: { score: true },
    }),
    db.submission.findMany({
      where: { assignment: { teacherId: userId }, createdAt: { gte: weekAgo } },
      select: { createdAt: true },
    }),
    db.grade.findMany({
      where: { submission: { assignment: { teacherId: userId } } },
      select: { score: true },
    }),
    db.enrollment.count({ where: { teacherId: userId, status: "ACTIVE" } }),
  ]);

  // Weekly submissions chart
  const weeklyChart = days.map(({ label, date }) => {
    const next = new Date(date.getTime() + 86_400_000);
    return {
      day: label,
      submissions: weeklySubmissions.filter(
        (s) => s.createdAt >= date && s.createdAt < next
      ).length,
    };
  });

  // Score distribution — 5 buckets: 0-20, 20-40, 40-60, 60-80, 80-100
  const buckets = [
    { range: "0-20", min: 0, max: 20 },
    { range: "20-40", min: 20, max: 40 },
    { range: "40-60", min: 40, max: 60 },
    { range: "60-80", min: 60, max: 80 },
    { range: "80-100", min: 80, max: 101 },
  ];
  const scoreChart = buckets.map(({ range, min, max }) => ({
    range,
    count: scoreDistribution.filter((g) => g.score >= min && g.score < max).length,
  }));

  return NextResponse.json({
    totalAssignments,
    totalSubmissions,
    pendingGrading,
    students: enrollmentCount,
    averageScore: Math.round(gradedAgg._avg.score ?? 0),
    submissionRate:
      totalAssignments > 0 && enrollmentCount > 0
        ? Math.round((totalSubmissions / (totalAssignments * enrollmentCount)) * 100)
        : 0,
    weeklyChart,
    scoreChart,
  });
}
