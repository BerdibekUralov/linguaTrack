import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime, isOverdue } from "@/lib/utils";
import { ArrowLeft, Calendar, Hash, User, Pencil, Clock, AlertCircle } from "lucide-react";
import { SkillSubmission } from "@/components/submissions/skill-submission";
import { GradeForm } from "@/components/submissions/grade-form";
import { PublishButton } from "@/components/assignments/publish-button";
import { SubmissionViewer } from "@/components/submissions/submission-viewer";
import { SpeakingAnswersViewer } from "@/components/submissions/speaking-answers-viewer";
import type { SpeakingContent } from "@/types/skill-content";
import type { SkillContent } from "@/types/skill-content";
import { FRAMEWORK_LABELS } from "@/types/skill-content";

type Props = { params: Promise<{ id: string }> };

const SKILL_META: Record<string, { label: string; emoji: string; bg: string; color: string }> = {
  WRITING:        { label: "Writing",        emoji: "✍️",  bg: "#dbeafe", color: "#2563eb" },
  READING:        { label: "Reading",        emoji: "📖",  bg: "#dcfce7", color: "#15803d" },
  LISTENING:      { label: "Listening",      emoji: "🎧",  bg: "#fef3c7", color: "#92400e" },
  GRAMMAR:        { label: "Grammar",        emoji: "📝",  bg: "#d1fae5", color: "#065f46" },
  SPEAKING:       { label: "Speaking",       emoji: "🎤",  bg: "#ede9fe", color: "#6d28d9" },
  VOCABULARY:     { label: "Vocabulary",     emoji: "📚",  bg: "#fce7f3", color: "#9d174d" },
  MIXED:          { label: "Mixed",          emoji: "🔀",  bg: "#e0f2fe", color: "#0369a1" },
  USE_OF_ENGLISH: { label: "Use of English", emoji: "🔤",  bg: "#fdf4ff", color: "#7e22ce" },
};

export default async function AssignmentDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const assignment = await db.assignment.findUnique({
    where: { id },
    include: {
      teacher: { select: { id: true, name: true } },
      student: { select: { id: true, name: true } },
      submissions: {
        include: { grade: true, student: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!assignment) notFound();

  const userId  = session.user.id as string;
  const role    = session.user.role as string;
  const overdue = isOverdue(assignment.dueDate);
  const skillType = assignment.skillType ?? "WRITING";
  const skillMeta = SKILL_META[skillType] ?? SKILL_META.WRITING;
  const skillContent = (assignment.skillContent as SkillContent) ?? null;
  const mySubmission = role === "STUDENT"
    ? assignment.submissions.find((s) => s.studentId === userId) ?? null
    : null;

  const typeLabels: Record<string, string> = {
    HOMEWORK: "Homework", TEST: "Test", PROJECT: "Project", READING: "Reading",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <Link
          href="/assignments"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="flex-1 truncate font-bold text-lg" style={{ color: "var(--text)" }}>
          {assignment.title}
        </h1>
        {role === "TEACHER" && assignment.teacherId === userId && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/assignments/${assignment.id}/edit`}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
            {assignment.status === "DRAFT" && <PublishButton assignmentId={assignment.id} />}
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        {/* Skill banner */}
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ background: skillMeta.bg, borderBottom: "1px solid rgba(0,0,0,.08)" }}
        >
          <span className="text-2xl">{skillMeta.emoji}</span>
          <div>
            <p className="font-bold text-sm" style={{ color: skillMeta.color }}>{skillMeta.label}</p>
            <p className="text-xs opacity-70" style={{ color: skillMeta.color }}>{typeLabels[assignment.type] ?? assignment.type}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant={assignment.status === "ACTIVE" ? "success" : assignment.status === "DRAFT" ? "warning" : "default"}>
              {assignment.status === "ACTIVE" ? "Active" : assignment.status === "DRAFT" ? "Draft" : "Closed"}
            </Badge>
            {overdue && assignment.status === "ACTIVE" && <Badge variant="danger">Overdue</Badge>}
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-3 gap-px" style={{ borderBottom: "1px solid var(--border)", background: "var(--border)" }}>
          {[
            { icon: Calendar, label: "Due date",   value: assignment.dueDate ? formatDate(assignment.dueDate) : "Not set" },
            { icon: Hash,     label: "Max score",  value: `${assignment.maxScore}` },
            { icon: User,     label: "Teacher",    value: assignment.teacher.name },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2.5 px-5 py-3.5" style={{ background: "var(--surface)" }}>
              <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--text-3)" }} />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{label}</p>
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Framework / level badge row */}
        {assignment.framework && (
          <div className="flex items-center gap-2 px-6 py-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
            <span className="text-xs font-medium" style={{ color: "var(--text-3)" }}>Framework:</span>
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: "var(--primary-bg)", color: "var(--primary)" }}>
              {FRAMEWORK_LABELS[assignment.framework as keyof typeof FRAMEWORK_LABELS] ?? assignment.framework}
            </span>
            {assignment.level && (
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
                {assignment.level}
              </span>
            )}
          </div>
        )}

        {/* Description / instructions */}
        {(assignment.description || assignment.instructions) && (
          <div className="px-6 py-5 space-y-4">
            {assignment.description && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-3)" }}>Description</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-2)" }}>{assignment.description}</p>
              </div>
            )}
            {assignment.instructions && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-3)" }}>Instructions</p>
                <div className="rounded-xl p-4 text-sm whitespace-pre-wrap" style={{ background: "var(--surface-2)", color: "var(--text-2)" }}>
                  {assignment.instructions}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* STUDENT: submit */}
      {role === "STUDENT" && assignment.status === "ACTIVE" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-semibold" style={{ color: "var(--text)" }}>Submit your work</h2>
          </div>
          <div className="p-6">
            <SkillSubmission
              assignmentId={assignment.id}
              skillType={skillType}
              skillContent={skillContent}
              maxScore={assignment.maxScore}
              dueDate={assignment.dueDate}
              allowLate={assignment.allowLateSubmission}
              submission={
                mySubmission
                  ? {
                      id: mySubmission.id,
                      status: mySubmission.status,
                      content: mySubmission.content,
                      answers: mySubmission.answers ?? undefined,
                      autoScore: (mySubmission as { autoScore?: number | null }).autoScore ?? null,
                    }
                  : null
              }
            />
          </div>
        </div>
      )}

      {/* STUDENT: grade result */}
      {role === "STUDENT" && mySubmission?.grade && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-semibold" style={{ color: "var(--text)" }}>Grade result</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold" style={{ color: "var(--primary)" }}>{mySubmission.grade.score}</span>
              <span className="mb-1 text-lg" style={{ color: "var(--text-3)" }}>/ {assignment.maxScore}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.round((mySubmission.grade.score / assignment.maxScore) * 100)}%` }} />
            </div>
            {mySubmission.grade.feedback && (
              <div className="rounded-xl p-4 mt-2" style={{ background: "var(--surface-2)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-3)" }}>Teacher feedback</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-2)" }}>{mySubmission.grade.feedback}</p>
              </div>
            )}
            <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-3)" }}>
              <Clock className="h-3.5 w-3.5" />
              {formatDateTime(mySubmission.grade.gradedAt)}
            </p>
          </div>
        </div>
      )}

      {/* TEACHER: submissions list */}
      {role === "TEACHER" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-semibold" style={{ color: "var(--text)" }}>Submissions</h2>
            <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: "var(--primary-bg)", color: "var(--primary)" }}>
              {assignment.submissions.length}
            </span>
          </div>

          {assignment.submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <AlertCircle className="h-10 w-10 opacity-20" style={{ color: "var(--text-3)" }} />
              <p className="text-sm" style={{ color: "var(--text-3)" }}>No submissions yet</p>
            </div>
          ) : (
            assignment.submissions.map((sub, i) => {
              const subExt = sub as typeof sub & { autoScore?: number | null };
              return (
                <div
                  key={sub.id}
                  className="px-6 py-4 space-y-3 animate-fade-slide-up"
                  style={{ borderBottom: "1px solid var(--border)", animationDelay: `${i * 0.04}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ background: "var(--primary)" }}
                      >
                        {sub.student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: "var(--text)" }}>{sub.student.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-3)" }}>
                          {sub.submittedAt ? formatDateTime(sub.submittedAt) : "Not submitted"}
                          {sub.isLate && " · ⚠️ Late"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sub.isLate && <Badge variant="danger">Late</Badge>}
                      {subExt.autoScore != null && <Badge variant="info">Auto: {subExt.autoScore}%</Badge>}
                      {sub.grade
                        ? <Badge variant="success">{sub.grade.score}/{assignment.maxScore}</Badge>
                        : sub.status === "SUBMITTED"
                        ? <Badge variant="warning">Pending grade</Badge>
                        : <Badge variant="default">{sub.status}</Badge>}
                    </div>
                  </div>

                  {/* Speaking async — show text + audio answers */}
                  {skillType === "SPEAKING" &&
                   skillContent &&
                   (skillContent as SpeakingContent).mode === "async" &&
                   sub.answers ? (
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{ border: "1px solid var(--border)" }}
                    >
                      <div
                        className="flex items-center gap-2 px-4 py-2.5"
                        style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}
                      >
                        <span className="text-xs font-semibold" style={{ color: "var(--text-3)" }}>
                          Speaking answers
                        </span>
                      </div>
                      <div className="p-4">
                        <SpeakingAnswersViewer
                          content={skillContent as SpeakingContent}
                          answers={sub.answers as Record<string, string>}
                        />
                      </div>
                    </div>
                  ) : sub.content ? (
                    <SubmissionViewer content={sub.content} skillType={skillType} />
                  ) : null}

                  {sub.status === "SUBMITTED" && !sub.grade && (
                    <GradeForm
                      submissionId={sub.id}
                      assignmentId={assignment.id}
                      maxScore={assignment.maxScore}
                      skillType={skillType}
                      suggestedScore={subExt.autoScore != null ? Math.round((subExt.autoScore / 100) * assignment.maxScore) : undefined}
                    />
                  )}

                  {sub.grade?.feedback && (
                    <p className="text-xs italic" style={{ color: "var(--text-3)" }}>💬 {sub.grade.feedback}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
