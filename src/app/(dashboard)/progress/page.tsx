import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { TrendingUp, CheckCircle, Clock, AlertCircle, Award } from "lucide-react";
import Link from "next/link";

export default async function ProgressPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id as string;
  const role   = session.user.role as string;

  /* ── STUDENT ── */
  if (role === "STUDENT") {
    const submissions = await db.submission.findMany({
      where: { studentId: userId },
      include: {
        assignment: { select: { id: true, title: true, maxScore: true, dueDate: true, skillType: true } },
        grade: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const graded    = submissions.filter((s) => s.grade);
    const avgScore  = graded.length > 0 ? Math.round(graded.reduce((sum, s) => sum + (s.grade?.score ?? 0), 0) / graded.length) : 0;
    const completed = submissions.filter((s) => ["SUBMITTED", "GRADED"].includes(s.status)).length;
    const late      = submissions.filter((s) => s.isLate).length;
    const percent   = completed > 0 ? Math.round((graded.length / completed) * 100) : 0;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>My Progress</h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>Overall activity and results</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MiniStat icon={Award}        label="Average score"  value={`${avgScore}%`}     color="primary" />
          <MiniStat icon={CheckCircle}  label="Completed"       value={completed}          color="success" />
          <MiniStat icon={Clock}        label="Total"           value={submissions.length} color="accent" />
          <MiniStat icon={AlertCircle}  label="Late"            value={late}               color="danger" />
        </div>

        {/* Progress bar */}
        {graded.length > 0 && (
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Graded submissions</p>
              <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>{percent}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--text-3)" }}>
              {graded.length} graded · {completed - graded.length} pending
            </p>
          </div>
        )}

        {/* Submissions list */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-semibold" style={{ color: "var(--text)" }}>All submissions</h2>
          </div>
          {submissions.length === 0 ? (
            <div className="flex flex-col items-center py-14 gap-3">
              <TrendingUp className="h-10 w-10 opacity-20" style={{ color: "var(--text-3)" }} />
              <p className="text-sm" style={{ color: "var(--text-3)" }}>No submissions yet</p>
            </div>
          ) : (
            submissions.map((sub, i) => (
              <Link
                key={sub.id}
                href={`/assignments/${sub.assignment.id}`}
                className="flex items-center justify-between px-6 py-3.5 transition-colors animate-fade-slide-up"
                style={{ borderBottom: "1px solid var(--border)", animationDelay: `${i * 0.03}s` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                    style={{ background: "var(--primary-bg)" }}
                  >
                    {sub.grade ? "✅" : sub.status === "SUBMITTED" ? "⏳" : "📝"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                      {sub.assignment.title}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>
                      {sub.assignment.dueDate ? formatDate(sub.assignment.dueDate) : "—"}
                      {sub.isLate && " · Late"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {sub.grade ? (
                    <span
                      className="text-sm font-bold"
                      style={{ color: sub.grade.score >= 70 ? "var(--success)" : sub.grade.score >= 50 ? "var(--warning)" : "var(--danger)" }}
                    >
                      {sub.grade.score}/{sub.assignment.maxScore}
                    </span>
                  ) : sub.status === "SUBMITTED" ? (
                    <Badge variant="warning">Pending</Badge>
                  ) : (
                    <Badge variant="default">Draft</Badge>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    );
  }

  /* ── TEACHER ── */
  const students = await db.user.findMany({
    where: { role: "STUDENT", isActive: true },
    include: { submissions: { include: { grade: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Student Progress</h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>{students.length} students</p>
      </div>

      <div className="grid gap-3">
        {students.map((student, i) => {
          const graded    = student.submissions.filter((s) => s.grade);
          const avg       = graded.length > 0 ? Math.round(graded.reduce((sum, s) => sum + (s.grade?.score ?? 0), 0) / graded.length) : null;
          const completed = student.submissions.filter((s) => ["SUBMITTED", "GRADED"].includes(s.status)).length;
          const late      = student.submissions.filter((s) => s.isLate).length;
          const scoreColor = avg === null ? "var(--text-3)" : avg >= 70 ? "var(--success)" : avg >= 50 ? "var(--warning)" : "var(--danger)";

          return (
            <div
              key={student.id}
              className="flex items-center gap-4 rounded-2xl p-4 animate-fade-slide-up"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                animationDelay: `${i * 0.04}s`,
              }}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: "var(--primary)" }}
              >
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: "var(--text)" }}>{student.name}</p>
                <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{student.email}</p>
              </div>
              <div className="flex items-center gap-6 text-center shrink-0">
                <div>
                  <p className="text-lg font-bold" style={{ color: "var(--text)" }}>{completed}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-3)" }}>Completed</p>
                </div>
                <div>
                  <p className="text-lg font-bold" style={{ color: "var(--danger)" }}>{late}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-3)" }}>Late</p>
                </div>
                <div>
                  <p className="text-lg font-bold" style={{ color: scoreColor }}>
                    {avg !== null ? `${avg}%` : "—"}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-3)" }}>Average</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ICON_COLORS = {
  primary: { bg: "var(--primary-bg)",  icon: "var(--primary)" },
  success: { bg: "var(--success-bg)",  icon: "var(--success)" },
  danger:  { bg: "var(--danger-bg)",   icon: "var(--danger)" },
  accent:  { bg: "#f5f3ff",            icon: "var(--accent)" },
};

function MiniStat({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: keyof typeof ICON_COLORS;
}) {
  const c = ICON_COLORS[color];
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl p-4"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: c.bg }}>
        <Icon className="h-5 w-5" style={{ color: c.icon }} />
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: "var(--text)" }}>{value}</p>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>{label}</p>
      </div>
    </div>
  );
}
