import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { FileText, CheckCircle, Clock, AlertCircle, Star, TrendingUp } from "lucide-react";

const statusMeta: Record<string, { label: string; variant: "success" | "warning" | "info" | "default" | "danger" }> = {
  DRAFT:     { label: "Draft",     variant: "default" },
  SUBMITTED: { label: "Submitted", variant: "info" },
  GRADED:    { label: "Graded",    variant: "success" },
  RETURNED:  { label: "Returned",  variant: "warning" },
};

export default async function SubmissionsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id as string;
  const role   = session.user.role as string;

  const submissions = await db.submission.findMany({
    where: role === "STUDENT" ? { studentId: userId } : { assignment: { teacherId: userId } },
    include: {
      assignment: { select: { id: true, title: true, maxScore: true, skillType: true } },
      student:    { select: { id: true, name: true, avatar: true } },
      grade:      true,
    },
    orderBy: { createdAt: "desc" },
  });

  const gradedCount  = submissions.filter((s) => s.status === "GRADED").length;
  const pendingCount = submissions.filter((s) => s.status === "SUBMITTED").length;
  const withGrade    = submissions.filter((s) => s.grade);
  const avgScore     = withGrade.length > 0
    ? Math.round(withGrade.reduce((sum, s) => sum + (s.grade?.score ?? 0), 0) / withGrade.length)
    : null;

  const statCards = [
    { icon: FileText,    label: "Total",         value: submissions.length,                     color: "primary" as const },
    { icon: CheckCircle, label: "Graded",         value: gradedCount,                            color: "success" as const },
    { icon: Clock,       label: "Pending",        value: pendingCount,                           color: "warning" as const },
    { icon: Star,        label: "Average score",  value: avgScore !== null ? `${avgScore}%` : "—", color: "accent" as const },
  ];

  const ICON_COLORS = {
    primary: { bg: "var(--primary-bg)",  icon: "var(--primary)" },
    success: { bg: "var(--success-bg)",  icon: "var(--success)" },
    warning: { bg: "var(--warning-bg)",  icon: "var(--warning)" },
    accent:  { bg: "#f5f3ff",            icon: "var(--accent)" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          {role === "STUDENT" ? "My Submissions" : "Student Submissions"}
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>
          {role === "STUDENT" ? "All your submitted assignments" : "Submissions received from students"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map(({ icon: Icon, label, value, color }) => {
          const c = ICON_COLORS[color];
          return (
            <div
              key={label}
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
        })}
      </div>

      {/* Score progress (student only) */}
      {role === "STUDENT" && avgScore !== null && (
        <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" style={{ color: "var(--primary)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Average score</p>
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>{avgScore}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${avgScore}%` }} />
          </div>
        </div>
      )}

      {/* List */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="font-semibold" style={{ color: "var(--text)" }}>All submissions</h2>
        </div>

        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "var(--surface-2)" }}>
              <FileText className="h-7 w-7 opacity-20" style={{ color: "var(--text-3)" }} />
            </div>
            <div className="text-center">
              <p className="text-sm" style={{ color: "var(--text-3)" }}>No submissions yet</p>
              <Link href="/assignments" className="mt-1.5 inline-block text-sm font-medium" style={{ color: "var(--primary)" }}>
                Browse assignments →
              </Link>
            </div>
          </div>
        ) : (
          submissions.map((s, i) => {
            const meta = statusMeta[s.status] ?? statusMeta.DRAFT;
            const scorePercent = s.grade ? Math.round((s.grade.score / s.assignment.maxScore) * 100) : null;

            return (
              <Link
                key={s.id}
                href={`/assignments/${s.assignmentId}`}
                className="flex items-start gap-4 px-6 py-4 transition-colors animate-fade-slide-up"
                style={{ borderBottom: "1px solid var(--border)", animationDelay: `${i * 0.03}s` }}
              >
                {/* Icon */}
                <div
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                  style={{ background: "var(--primary-bg)" }}
                >
                  {s.status === "GRADED" ? "✅" : s.status === "SUBMITTED" ? "⏳" : "📝"}
                </div>

                {/* Main */}
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate" style={{ color: "var(--text)" }}>
                    {s.assignment.title}
                  </p>
                  {role === "TEACHER" && (
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>{s.student.name}</p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--text-3)" }}>
                    <span>{formatDate(s.createdAt)}</span>
                    {s.submittedAt && <span>Submitted: {formatDateTime(s.submittedAt)}</span>}
                    {s.isLate && (
                      <span className="flex items-center gap-1" style={{ color: "var(--danger)" }}>
                        <AlertCircle className="h-3 w-3" />
                        Late
                      </span>
                    )}
                  </div>
                  {/* Score bar inline (for graded) */}
                  {scorePercent !== null && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="progress-track flex-1 max-w-[120px]">
                        <div className="progress-fill" style={{ width: `${scorePercent}%` }} />
                      </div>
                      <span className="text-xs font-medium" style={{ color: scorePercent >= 70 ? "var(--success)" : scorePercent >= 50 ? "var(--warning)" : "var(--danger)" }}>
                        {scorePercent}%
                      </span>
                    </div>
                  )}
                  {s.grade?.feedback && (
                    <p className="mt-1.5 truncate text-xs italic" style={{ color: "var(--text-3)" }}>
                      💬 {s.grade.feedback}
                    </p>
                  )}
                </div>

                {/* Right */}
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                  {s.grade ? (
                    <span className="text-sm font-bold" style={{ color: "var(--text)" }}>
                      {s.grade.score}
                      <span className="text-xs font-normal" style={{ color: "var(--text-3)" }}>/{s.assignment.maxScore}</span>
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--text-3)" }}>—/{s.assignment.maxScore}</span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
