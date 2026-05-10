import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, isOverdue } from "@/lib/utils";
import { Plus, BookOpen, Calendar, Hash, ArrowRight } from "lucide-react";

const SKILL_META: Record<string, { label: string; emoji: string; bg: string; color: string }> = {
  WRITING:    { label: "Writing",    emoji: "✍️",  bg: "#dbeafe", color: "#2563eb" },
  READING:    { label: "Reading",    emoji: "📖",  bg: "#dcfce7", color: "#15803d" },
  LISTENING:  { label: "Listening",  emoji: "🎧",  bg: "#fef3c7", color: "#92400e" },
  GRAMMAR:    { label: "Grammar",    emoji: "📝",  bg: "#d1fae5", color: "#065f46" },
  SPEAKING:   { label: "Speaking",   emoji: "🎤",  bg: "#ede9fe", color: "#6d28d9" },
  VOCABULARY: { label: "Vocabulary", emoji: "📚",  bg: "#fce7f3", color: "#9d174d" },
};

export default async function AssignmentsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id as string;
  const role   = session.user.role as string;

  const assignments = await db.assignment.findMany({
    where:
      role === "TEACHER"
        ? { teacherId: userId }
        : { OR: [{ studentId: userId }, { studentId: null }], status: "ACTIVE" },
    include: {
      teacher:     { select: { id: true, name: true } },
      student:     { select: { id: true, name: true } },
      _count:      { select: { submissions: true } },
      submissions: role === "STUDENT" ? { where: { studentId: userId }, take: 1 } : false,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Assignments</h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>
            {assignments.length} {assignments.length === 1 ? "assignment" : "assignments"} found
          </p>
        </div>
        {role === "TEACHER" && (
          <Link href="/assignments/new">
            <Button>
              <Plus className="h-4 w-4" />
              New assignment
            </Button>
          </Link>
        )}
      </div>

      {/* List */}
      {assignments.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl py-20 gap-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "var(--surface-2)" }}
          >
            <BookOpen className="h-8 w-8 opacity-20" style={{ color: "var(--text-3)" }} />
          </div>
          <div className="text-center">
            <p className="font-medium" style={{ color: "var(--text-2)" }}>No assignments yet</p>
            {role === "TEACHER" && (
              <Link href="/assignments/new" className="mt-3 inline-block">
                <Button size="sm">Create your first assignment</Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {assignments.map((a, i) => {
            const overdue   = isOverdue(a.dueDate);
            const submitted = role === "STUDENT" && "submissions" in a && Array.isArray(a.submissions) && a.submissions.length > 0;
            const skill     = SKILL_META[a.skillType ?? "WRITING"] ?? SKILL_META.WRITING;

            return (
              <Link
                key={a.id}
                href={`/assignments/${a.id}`}
                className="group flex items-start gap-4 rounded-2xl p-5 transition-all card-hover animate-fade-slide-up"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                {/* Skill icon */}
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ background: skill.bg }}
                >
                  {skill.emoji}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{ background: skill.bg, color: skill.color }}
                    >
                      {skill.label}
                    </span>
                    {a.status === "DRAFT"  && <Badge variant="warning">Draft</Badge>}
                    {a.status === "CLOSED" && <Badge variant="default">Closed</Badge>}
                  </div>

                  <h3 className="font-semibold truncate" style={{ color: "var(--text)" }}>
                    {a.title}
                  </h3>

                  {a.description && (
                    <p className="mt-1 text-sm line-clamp-1" style={{ color: "var(--text-3)" }}>
                      {a.description}
                    </p>
                  )}

                  <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--text-3)" }}>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {a.dueDate ? formatDate(a.dueDate) : "No due date"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Hash className="h-3.5 w-3.5" />
                      {a.maxScore} pts
                    </span>
                    {role === "TEACHER" && (
                      <span>{a._count.submissions} {a._count.submissions === 1 ? "submission" : "submissions"}</span>
                    )}
                    {a.student && <span>👤 {a.student.name}</span>}
                  </div>
                </div>

                {/* Right badge + arrow */}
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {role === "STUDENT" ? (
                    submitted ? (
                      <Badge variant="success">Submitted</Badge>
                    ) : overdue ? (
                      <Badge variant="danger">Overdue</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )
                  ) : a.status === "ACTIVE" && overdue ? (
                    <Badge variant="danger">Overdue</Badge>
                  ) : null}
                  <ArrowRight
                    className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--text-3)" }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
