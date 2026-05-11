import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LessonActions } from "@/components/lessons/lesson-actions";

type Params = { params: Promise<{ id: string }> };

function statusMeta(status: string) {
  switch (status) {
    case "LIVE":      return { label: "Live now 🔴", variant: "danger"   as const };
    case "SCHEDULED": return { label: "Upcoming",    variant: "warning"  as const };
    case "ENDED":     return { label: "Ended",        variant: "default"  as const };
    case "CANCELLED": return { label: "Cancelled",    variant: "default"  as const };
    default:          return { label: status,          variant: "default"  as const };
  }
}

export default async function LessonDetailPage({ params }: Params) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const lesson = await db.liveLesson.findUnique({
    where: { id },
    include: { teacher: { select: { id: true, name: true } } },
  });

  if (!lesson) notFound();

  const userId    = session.user.id as string;
  const role      = session.user.role as string;
  const isTeacher = role === "TEACHER";

  // Students can only view lessons from their enrolled teachers
  if (!isTeacher) {
    const enrollment = await db.enrollment.findFirst({
      where: { studentId: userId, teacherId: lesson.teacherId, status: "ACTIVE" },
    });
    if (!enrollment) notFound();
  }

  // Teachers can only view their own lessons
  if (isTeacher && lesson.teacherId !== userId) notFound();

  const meta    = statusMeta(lesson.status);
  const isLive  = lesson.status === "LIVE";
  const canJoin = (isLive || lesson.status === "SCHEDULED") && !!lesson.roomUrl;

  const scheduledDate = new Date(lesson.scheduledAt);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link
          href="/lessons"
          className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:opacity-80"
          style={{ background: "var(--surface-2)", color: "var(--text-3)" }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold truncate" style={{ color: "var(--text)" }}>
          {lesson.title}
        </h1>
        <Badge variant={meta.variant}>{meta.label}</Badge>
      </div>

      {/* Info card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center gap-2 px-5 py-3.5"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}
        >
          <Video className="h-4 w-4" style={{ color: "var(--primary)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>Lesson info</span>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {/* Teacher */}
          <div className="flex items-center gap-3 px-5 py-4">
            <User className="h-4 w-4 shrink-0" style={{ color: "var(--text-3)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Teacher</p>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{lesson.teacher.name}</p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-3 px-5 py-4">
            <Calendar className="h-4 w-4 shrink-0" style={{ color: "var(--text-3)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Scheduled</p>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {scheduledDate.toLocaleDateString("en-US", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Time + Duration */}
          <div className="flex items-center gap-3 px-5 py-4">
            <Clock className="h-4 w-4 shrink-0" style={{ color: "var(--text-3)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Time</p>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {scheduledDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                {" · "}{lesson.duration} minutes
              </p>
            </div>
          </div>

          {/* Description */}
          {lesson.description && (
            <div className="px-5 py-4">
              <p className="text-xs mb-1" style={{ color: "var(--text-3)" }}>Description</p>
              <p className="text-sm" style={{ color: "var(--text-2)" }}>{lesson.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Video call section */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center gap-2 px-5 py-3.5"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}
        >
          <Video className="h-4 w-4" style={{ color: isLive ? "var(--danger)" : "var(--primary)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>Video call</span>
          {isLive && (
            <span
              className="ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-bold animate-pulse"
              style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
            >
              LIVE
            </span>
          )}
        </div>

        <div className="p-5">
          {canJoin ? (
            <LessonVideoPanel
              roomUrl={lesson.roomUrl!}
              title={lesson.title}
              isLive={isLive}
            />
          ) : lesson.status === "SCHEDULED" && !lesson.roomUrl ? (
            <div
              className="flex flex-col items-center gap-3 rounded-xl py-10 text-center"
              style={{ background: "var(--surface-2)" }}
            >
              <Video className="h-8 w-8 opacity-20" style={{ color: "var(--text-3)" }} />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                  Room not created yet
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-3)" }}>
                  {isTeacher
                    ? "Use the controls below to create a room or start the lesson."
                    : "The teacher will create the room before the lesson starts."}
                </p>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center gap-3 rounded-xl py-10 text-center"
              style={{ background: "var(--surface-2)" }}
            >
              <Video className="h-8 w-8 opacity-20" style={{ color: "var(--text-3)" }} />
              <p className="text-sm" style={{ color: "var(--text-3)" }}>
                {lesson.status === "ENDED" ? "This lesson has ended." : "This lesson was cancelled."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Teacher controls */}
      {isTeacher && (
        <LessonActions
          lessonId={lesson.id}
          status={lesson.status}
          roomUrl={lesson.roomUrl}
        />
      )}
    </div>
  );
}

/* ── Client wrapper for video panel ─────────────────────────────────────── */
import { VideoJoinButton } from "@/components/video/video-call";

function LessonVideoPanel({
  roomUrl,
  title,
  isLive,
}: {
  roomUrl: string;
  title: string;
  isLive: boolean;
}) {
  return (
    <div className="space-y-3">
      {isLive && (
        <p className="text-sm text-center font-medium" style={{ color: "var(--danger)" }}>
          🔴 Lesson is live — join now!
        </p>
      )}
      <div className="flex justify-center">
        <VideoJoinButton roomUrl={roomUrl} label={isLive ? "Join live lesson" : "Join video room"} />
      </div>
    </div>
  );
}
