import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Video, Calendar, Clock, Plus, PlayCircle, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isDailyConfigured } from "@/lib/daily";

function statusMeta(status: string) {
  switch (status) {
    case "LIVE":      return { label: "Live now 🔴", variant: "danger"   as const };
    case "SCHEDULED": return { label: "Upcoming",   variant: "warning"  as const };
    case "ENDED":     return { label: "Ended",       variant: "default"  as const };
    case "CANCELLED": return { label: "Cancelled",   variant: "default"  as const };
    default:          return { label: status,         variant: "default"  as const };
  }
}

export default async function LessonsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id as string;
  const role   = session.user.role as string;

  const isTeacher = role === "TEACHER";
  const dailyConfigured = isDailyConfigured();

  let lessons: {
    id: string;
    title: string;
    description: string | null;
    scheduledAt: Date;
    duration: number;
    roomUrl: string | null;
    status: string;
    teacher: { id: string; name: string };
  }[] = [];

  if (isTeacher) {
    lessons = await db.liveLesson.findMany({
      where: { teacherId: userId },
      orderBy: { scheduledAt: "desc" },
      include: { teacher: { select: { id: true, name: true } } },
    });
  } else {
    const enrollments = await db.enrollment.findMany({
      where: { studentId: userId, status: "ACTIVE" },
      select: { teacherId: true },
    });
    const teacherIds = enrollments.map((e) => e.teacherId);
    lessons = await db.liveLesson.findMany({
      where: { teacherId: { in: teacherIds } },
      orderBy: { scheduledAt: "desc" },
      include: { teacher: { select: { id: true, name: true } } },
    });
  }

  const upcoming = lessons.filter((l) => l.status === "SCHEDULED" || l.status === "LIVE");
  const past     = lessons.filter((l) => l.status === "ENDED" || l.status === "CANCELLED");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "var(--primary-bg)" }}
          >
            <Video className="h-5 w-5" style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Live Lessons</h1>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              {isTeacher ? "Schedule and manage your video lessons" : "Join live lessons with your teacher"}
            </p>
          </div>
        </div>
        {isTeacher && (
          <Link
            href="/lessons/new"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "var(--primary)" }}
          >
            <Plus className="h-4 w-4" />
            Schedule lesson
          </Link>
        )}
      </div>

      {/* Daily.co not configured warning */}
      {isTeacher && !dailyConfigured && (
        <div
          className="flex items-start gap-3 rounded-2xl p-4 text-sm"
          style={{ background: "var(--warning-bg)", border: "1px solid var(--warning)", color: "var(--warning)" }}
        >
          <Video className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Daily.co not configured</p>
            <p className="mt-0.5 text-xs opacity-80">
              Add <code>DAILY_API_KEY</code> and <code>NEXT_PUBLIC_DAILY_DOMAIN</code> to .env to enable automatic room creation.
              You can still create lessons and add the room link manually.
            </p>
          </div>
        </div>
      )}

      {/* Upcoming / Live */}
      <LessonSection
        title="Upcoming & Live"
        icon={PlayCircle}
        lessons={upcoming}
        isTeacher={isTeacher}
        empty="No upcoming lessons"
      />

      {/* Past */}
      <LessonSection
        title="Past lessons"
        icon={CheckCircle}
        lessons={past}
        isTeacher={isTeacher}
        empty="No past lessons yet"
        muted
      />
    </div>
  );
}

function LessonSection({
  title, icon: Icon, lessons, isTeacher, empty, muted = false,
}: {
  title: string;
  icon: React.ElementType;
  lessons: { id: string; title: string; description: string | null; scheduledAt: Date; duration: number; roomUrl: string | null; status: string; teacher: { id: string; name: string } }[];
  isTeacher: boolean;
  empty: string;
  muted?: boolean;
}) {
  const { label: _l, ...rest } = { label: "", ...{} };
  void _l; void rest;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3.5"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}
      >
        <Icon className="h-4 w-4" style={{ color: muted ? "var(--text-3)" : "var(--primary)" }} />
        <span className="text-sm font-semibold" style={{ color: muted ? "var(--text-3)" : "var(--text)" }}>
          {title}
        </span>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold"
          style={{ background: "var(--primary-bg)", color: "var(--primary)" }}
        >
          {lessons.length}
        </span>
      </div>

      {lessons.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12">
          <XCircle className="h-8 w-8 opacity-20" style={{ color: "var(--text-3)" }} />
          <p className="text-sm" style={{ color: "var(--text-3)" }}>{empty}</p>
        </div>
      ) : (
        lessons.map((lesson, i) => {
          const meta = statusMeta(lesson.status);
          const isLive = lesson.status === "LIVE";
          return (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:opacity-90 animate-fade-slide-up"
              style={{
                borderBottom: "1px solid var(--border)",
                animationDelay: `${i * 0.04}s`,
                background: isLive ? "var(--danger-bg)" : "transparent",
              }}
            >
              {/* Date block */}
              <div
                className="flex w-14 flex-col items-center justify-center rounded-xl py-2 shrink-0"
                style={{ background: isLive ? "var(--danger)" : "var(--primary-bg)" }}
              >
                <p className="text-[10px] font-semibold uppercase" style={{ color: isLive ? "#fff" : "var(--primary)" }}>
                  {new Date(lesson.scheduledAt).toLocaleDateString("en-US", { month: "short" })}
                </p>
                <p className="text-2xl font-bold leading-none" style={{ color: isLive ? "#fff" : "var(--primary)" }}>
                  {new Date(lesson.scheduledAt).getDate()}
                </p>
                <p className="text-[10px]" style={{ color: isLive ? "rgba(255,255,255,.7)" : "var(--text-3)" }}>
                  {new Date(lesson.scheduledAt).toLocaleDateString("en-US", { weekday: "short" })}
                </p>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: "var(--text)" }}>
                  {lesson.title}
                </p>
                {!isTeacher && (
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    {lesson.teacher.name}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-3)" }}>
                    <Clock className="h-3 w-3" />
                    {new Date(lesson.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    {" · "}{lesson.duration} min
                  </span>
                </div>
              </div>

              {/* Status */}
              <Badge variant={meta.variant}>{meta.label}</Badge>
            </Link>
          );
        })
      )}
    </div>
  );
}
