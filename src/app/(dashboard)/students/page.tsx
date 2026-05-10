import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getInitials, formatDate } from "@/lib/utils";
import { Users, MessageSquare, TrendingUp } from "lucide-react";
import { TeacherSearch } from "@/components/students/teacher-search";

export default async function StudentsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id as string;
  const role   = session.user.role as string;

  /* ── TEACHER ── */
  if (role === "TEACHER") {
    const enrollments = await db.enrollment.findMany({
      where: { teacherId: userId, status: "ACTIVE" },
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true, createdAt: true } },
      },
      orderBy: { startDate: "desc" },
    });

    const enriched = await Promise.all(
      enrollments.map(async (e) => {
        const [subCount, grades] = await Promise.all([
          db.submission.count({ where: { studentId: e.studentId, status: { in: ["SUBMITTED", "GRADED"] } } }),
          db.grade.findMany({ where: { submission: { studentId: e.studentId } }, select: { score: true } }),
        ]);
        const avgScore = grades.length > 0 ? Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length) : null;
        return { ...e, stats: { subCount, avgScore } };
      })
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Students</h1>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>
              {enriched.length} active {enriched.length === 1 ? "student" : "students"}
            </p>
          </div>
        </div>

        {enriched.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-2xl py-20 gap-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "var(--surface-2)" }}
            >
              <Users className="h-8 w-8 opacity-20" style={{ color: "var(--text-3)" }} />
            </div>
            <p style={{ color: "var(--text-3)" }}>No students yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enriched.map(({ student, stats, startDate }, i) => {
              const scoreColor =
                stats.avgScore === null ? "var(--text-3)"
                : stats.avgScore >= 70 ? "var(--success)"
                : stats.avgScore >= 50 ? "var(--warning)"
                : "var(--danger)";

              return (
                <div
                  key={student.id}
                  className="flex flex-col rounded-2xl overflow-hidden animate-fade-slide-up card-hover"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    animationDelay: `${i * 0.06}s`,
                  }}
                >
                  {/* Top section */}
                  <div className="flex items-start gap-3.5 p-5">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
                      style={{ background: "var(--primary)" }}
                    >
                      {getInitials(student.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate" style={{ color: "var(--text)" }}>{student.name}</p>
                      <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{student.email}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-3)" }}>
                        Joined: {formatDate(startDate)}
                      </p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div
                    className="grid grid-cols-2 mx-5 mb-4 overflow-hidden rounded-xl"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <div
                      className="flex flex-col items-center py-3 text-center"
                      style={{ borderRight: "1px solid var(--border)" }}
                    >
                      <p className="text-lg font-bold" style={{ color: "var(--primary)" }}>{stats.subCount}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-3)" }}>Submissions</p>
                    </div>
                    <div className="flex flex-col items-center py-3 text-center">
                      <p className="text-lg font-bold" style={{ color: scoreColor }}>
                        {stats.avgScore !== null ? `${stats.avgScore}%` : "—"}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-3)" }}>Avg score</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 px-5 pb-4">
                    <Link
                      href={`/messages/${student.id}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition-colors"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        color: "var(--text-2)",
                      }}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Message
                    </Link>
                    <Link
                      href={`/progress?student=${student.id}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition-colors"
                      style={{
                        background: "var(--primary-bg)",
                        color: "var(--primary)",
                      }}
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      Progress
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ── STUDENT: Teachers ── */
  const myEnrollments = await db.enrollment.findMany({
    where: { studentId: userId },
    include: {
      teacher: { select: { id: true, name: true, email: true, avatar: true, bio: true } },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Teachers</h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>
          Search for a teacher or view your current ones
        </p>
      </div>

      <TeacherSearch myEnrollmentIds={myEnrollments.map((e) => e.teacherId)} />

      {myEnrollments.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold" style={{ color: "var(--text-2)" }}>
            My teachers
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {myEnrollments.map(({ teacher, startDate, id }, i) => (
              <div
                key={id}
                className="flex items-center gap-4 rounded-2xl p-4 animate-fade-slide-up"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
                  style={{ background: "var(--primary)" }}
                >
                  {getInitials(teacher.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold" style={{ color: "var(--text)" }}>{teacher.name}</p>
                  <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{teacher.bio ?? teacher.email}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-3)" }}>Joined: {formatDate(startDate)}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant="success">Active</Badge>
                  <Link
                    href={`/messages/${teacher.id}`}
                    className="rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors"
                    style={{ background: "var(--primary-bg)", color: "var(--primary)" }}
                  >
                    Message
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
