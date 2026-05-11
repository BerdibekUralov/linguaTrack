import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate, isOverdue } from "@/lib/utils";
import { WeeklyChart } from "@/components/charts/weekly-chart";
import { ScoreChart } from "@/components/charts/score-chart";
import {
  BookOpen, CheckCircle, Clock, AlertCircle,
  TrendingUp, Users, ArrowRight, Sparkles,
  Shield, GraduationCap, UserCheck, UserX,
  Trophy, Flame, Star,
} from "lucide-react";
import { getLevelInfo, BADGE_META, type BadgeType } from "@/lib/gamification";
import { subDays, startOfDay, format } from "date-fns";

function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return { date: startOfDay(d), label: format(d, "MMM d") };
  });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id as string;
  const role = session.user.role as string;
  const days = last7Days();
  const weekAgo = days[0].date;

  /* ── ADMIN ── */
  if (role === "ADMIN") {
    const weekAgoDate = days[0].date;
    const [totalUsers, totalTeachers, totalStudents, totalAdmins, activeUsers, newThisWeek, recentUsers] =
      await Promise.all([
        db.user.count(),
        db.user.count({ where: { role: "TEACHER" } }),
        db.user.count({ where: { role: "STUDENT" } }),
        db.user.count({ where: { role: "ADMIN" } }),
        db.user.count({ where: { isActive: true } }),
        db.user.count({ where: { createdAt: { gte: weekAgoDate } } }),
        db.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 8,
          select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
        }),
      ]);

    const inactiveUsers = totalUsers - activeUsers;

    const ROLE_META = {
      ADMIN:   { label: "Admin",   bg: "#ede9fe", color: "#7c3aed" },
      TEACHER: { label: "Teacher", bg: "#dbeafe", color: "#2563eb" },
      STUDENT: { label: "Student", bg: "#dcfce7", color: "#16a34a" },
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              {getGreeting()}, {session.user.name}! 👋
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>Admin panel — platform overview</p>
          </div>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            <Users className="h-4 w-4" />
            Manage Users
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={Users}        label="Total users"      value={totalUsers}    color="primary" trend={null} />
          <StatCard icon={GraduationCap} label="Teachers"        value={totalTeachers} color="accent"  trend={null} />
          <StatCard icon={BookOpen}     label="Students"         value={totalStudents} color="success" trend={null} />
          <StatCard icon={Shield}       label="Admins"           value={totalAdmins}   color="warning" trend={null} />
        </div>

        {/* Active / Inactive + New this week */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={UserCheck} label="Active users"    value={activeUsers}   color="success" trend={null} />
          <StatCard icon={UserX}     label="Inactive users"  value={inactiveUsers} color="danger"  trend={inactiveUsers > 0 ? "up" : null} />
          <StatCard icon={Sparkles}  label="New this week"   value={newThisWeek}   color="primary" trend={newThisWeek > 0 ? "up" : null} />
        </div>

        {/* Role breakdown */}
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h2 className="font-semibold text-sm" style={{ color: "var(--text-2)" }}>Role breakdown</h2>
          {([
            { role: "STUDENT", count: totalStudents },
            { role: "TEACHER", count: totalTeachers },
            { role: "ADMIN",   count: totalAdmins },
          ] as const).map(({ role: r, count }) => {
            const meta = ROLE_META[r];
            const pct  = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
            return (
              <div key={r} className="space-y-1">
                <div className="flex justify-between text-xs" style={{ color: "var(--text-3)" }}>
                  <span style={{ color: meta.color, fontWeight: 600 }}>{meta.label}</span>
                  <span>{count} ({pct}%)</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: meta.color }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent users */}
        <Section title="Recently joined" href="/admin/users" hrefLabel="View all">
          {recentUsers.length === 0 ? (
            <EmptyState icon={Users} text="No users yet" />
          ) : (
            recentUsers.map((u, i) => {
              const meta = ROLE_META[u.role as keyof typeof ROLE_META];
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-3 px-6 py-3.5 animate-fade-slide-up"
                  style={{ borderBottom: "1px solid var(--border)", animationDelay: `${i * 0.03}s`, opacity: u.isActive ? 1 : 0.5 }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "var(--primary)" }}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{u.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: meta?.bg, color: meta?.color }}>
                      {meta?.label ?? u.role}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-3)" }}>
                      {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </Section>
      </div>
    );
  }

  /* ── TEACHER ── */
  if (role === "TEACHER") {
    const [assignmentCount, pendingGrading, enrollmentCount, recentAssignments, weeklySubmissions, scoreRows] =
      await Promise.all([
        db.assignment.count({ where: { teacherId: userId } }),
        db.submission.count({ where: { assignment: { teacherId: userId }, status: "SUBMITTED" } }),
        db.enrollment.count({ where: { teacherId: userId } }),
        db.assignment.findMany({
          where: { teacherId: userId },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { _count: { select: { submissions: true } } },
        }),
        db.submission.findMany({
          where: { assignment: { teacherId: userId }, createdAt: { gte: weekAgo } },
          select: { createdAt: true },
        }),
        db.grade.findMany({
          where: { submission: { assignment: { teacherId: userId } } },
          select: { score: true },
        }),
      ]);

    const weeklyChart = days.map(({ label, date }) => {
      const next = new Date(date.getTime() + 86_400_000);
      return { day: label, submissions: weeklySubmissions.filter((s) => s.createdAt >= date && s.createdAt < next).length };
    });

    const buckets = [
      { range: "0-20", min: 0, max: 20 }, { range: "20-40", min: 20, max: 40 },
      { range: "40-60", min: 40, max: 60 }, { range: "60-80", min: 60, max: 80 },
      { range: "80-100", min: 80, max: 101 },
    ];
    const scoreChart = buckets.map(({ range, min, max }) => ({
      range,
      count: scoreRows.filter((g) => g.score >= min && g.score < max).length,
    }));

    return (
      <div className="space-y-6">
        {/* Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              {getGreeting()}, {session.user.name}! 👋
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>
              Track your activity for today
            </p>
          </div>
          {/* Quick stats pills */}
          <div className="flex items-center gap-3">
            <StatPill icon="📚" value={assignmentCount} label="Assignments" />
            <StatPill icon="👥" value={enrollmentCount} label="Students" />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={BookOpen}  label="Total assignments"    value={assignmentCount} color="primary" trend={null} />
          <StatCard icon={Clock}     label="Pending grading"      value={pendingGrading}  color="warning" trend={pendingGrading > 0 ? "up" : null} />
          <StatCard icon={Users}     label="Active students"      value={enrollmentCount} color="success" trend={null} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WeeklyChart data={weeklyChart} title="Weekly submissions" />
          <ScoreChart data={scoreChart} />
        </div>

        {/* Recent assignments */}
        <Section title="Recent assignments" href="/assignments" hrefLabel="View all">
          {recentAssignments.length === 0 ? (
            <EmptyState icon={BookOpen} text="No assignments created yet" />
          ) : (
            recentAssignments.map((a, i) => (
              <Link
                key={a.id}
                href={`/assignments/${a.id}`}
                className="flex items-center justify-between px-6 py-3.5 transition-colors animate-fade-slide-up"
                style={{
                  borderBottom: "1px solid var(--border)",
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "var(--primary-bg)" }}
                  >
                    <BookOpen className="h-4 w-4" style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{a.title}</p>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>
                      {a._count.submissions} submissions · {a.dueDate ? formatDate(a.dueDate) : "No due date"}
                    </p>
                  </div>
                </div>
                <StatusBadge status={a.status} dueDate={a.dueDate} />
              </Link>
            ))
          )}
        </Section>
      </div>
    );
  }

  /* ── STUDENT ── */
  const [total, completed, late, weeklySubmissions, gamificationUser] = await Promise.all([
    db.assignment.count({ where: { status: "ACTIVE" } }),
    db.submission.count({ where: { studentId: userId, status: { in: ["SUBMITTED", "GRADED"] } } }),
    db.submission.count({ where: { studentId: userId, isLate: true } }),
    db.submission.findMany({
      where: { studentId: userId, createdAt: { gte: weekAgo } },
      select: { createdAt: true },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: {
        xp: true, level: true, streak: true, longestStreak: true,
        userBadges: { select: { badge: true, earnedAt: true }, orderBy: { earnedAt: "desc" }, take: 6 },
      },
    }),
  ]);

  const [activeAssignments, avgResult] = await Promise.all([
    db.assignment.findMany({
      where: { OR: [{ studentId: userId }, { studentId: null }], status: "ACTIVE" },
      orderBy: { dueDate: "asc" },
      take: 6,
      include: { submissions: { where: { studentId: userId }, take: 1 } },
    }),
    db.grade.aggregate({
      where: { submission: { studentId: userId } },
      _avg: { score: true },
    }),
  ]);

  const avgScore = avgResult._avg.score ?? 0;
  const levelInfo = getLevelInfo(gamificationUser?.xp ?? 0);
  const weeklyChart = days.map(({ label, date }) => {
    const next = new Date(date.getTime() + 86_400_000);
    return { day: label, submissions: weeklySubmissions.filter((s) => s.createdAt >= date && s.createdAt < next).length };
  });

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">
              {getGreeting()}, {session.user.name}! 👋
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Don&apos;t forget to complete your assignments today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PillBadge icon="✅" value={completed} label="Completed" />
            <PillBadge icon="⭐" value={`${Math.round(avgScore)}%`} label="Score" />
          </div>
        </div>
      </div>

      {/* Gamification card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-px"
          style={{ background: "var(--border)" }}
        >
          {/* XP */}
          <div className="flex flex-col items-center justify-center gap-1 py-4 px-3" style={{ background: "var(--surface)" }}>
            <Star className="h-5 w-5" style={{ color: "var(--primary)" }} />
            <p className="text-xl font-bold" style={{ color: "var(--text)" }}>{(gamificationUser?.xp ?? 0).toLocaleString()}</p>
            <p className="text-[11px]" style={{ color: "var(--text-3)" }}>XP earned</p>
          </div>
          {/* Level */}
          <div className="flex flex-col items-center justify-center gap-1 py-4 px-3" style={{ background: "var(--surface)" }}>
            <span className="text-2xl">{levelInfo.current.emoji}</span>
            <p className="text-xl font-bold" style={{ color: "var(--text)" }}>{gamificationUser?.level ?? 1}</p>
            <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{levelInfo.current.label}</p>
          </div>
          {/* Streak */}
          <div className="flex flex-col items-center justify-center gap-1 py-4 px-3" style={{ background: "var(--surface)" }}>
            <Flame className="h-5 w-5" style={{ color: "#f97316" }} />
            <p className="text-xl font-bold" style={{ color: "var(--text)" }}>{gamificationUser?.streak ?? 0}</p>
            <p className="text-[11px]" style={{ color: "var(--text-3)" }}>Day streak</p>
          </div>
          {/* Badges */}
          <div className="flex flex-col items-center justify-center gap-1 py-4 px-3" style={{ background: "var(--surface)" }}>
            <Trophy className="h-5 w-5" style={{ color: "#f59e0b" }} />
            <p className="text-xl font-bold" style={{ color: "var(--text)" }}>{gamificationUser?.userBadges.length ?? 0}</p>
            <p className="text-[11px]" style={{ color: "var(--text-3)" }}>Badges</p>
          </div>
        </div>

        {/* XP progress bar + badges row */}
        <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          {/* Progress bar */}
          {levelInfo.next ? (
            <div className="mb-2">
              <div className="flex justify-between text-[10px] mb-1" style={{ color: "var(--text-3)" }}>
                <span>Level {levelInfo.current.level} → {levelInfo.next.level}</span>
                <span>{gamificationUser?.xp ?? 0} / {levelInfo.next.minXp} XP ({levelInfo.progress}%)</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${levelInfo.progress}%`, background: "var(--primary)" }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs font-semibold text-center mb-2" style={{ color: "var(--primary)" }}>
              💎 Maximum level reached!
            </p>
          )}

          {/* Recent badges */}
          {(gamificationUser?.userBadges.length ?? 0) > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {gamificationUser!.userBadges.map(({ badge }) => {
                const meta = BADGE_META[badge as BadgeType];
                return (
                  <span
                    key={badge}
                    title={meta.desc}
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{ background: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}40` }}
                  >
                    {meta.emoji} {meta.label}
                  </span>
                );
              })}
              <Link
                href="/leaderboard"
                className="rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors hover:opacity-80"
                style={{ background: "var(--surface-2)", color: "var(--text-3)", border: "1px solid var(--border)" }}
              >
                View all →
              </Link>
            </div>
          ) : (
            <p className="text-xs text-center" style={{ color: "var(--text-3)" }}>
              Submit assignments to earn XP and badges! 🏆
            </p>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={BookOpen}    label="Active assignments" value={total}                      color="primary" trend={null} />
        <StatCard icon={CheckCircle} label="Completed"          value={completed}                  color="success" trend={null} />
        <StatCard icon={AlertCircle} label="Late"               value={late}                       color="danger"  trend={late > 0 ? "up" : null} />
        <StatCard icon={TrendingUp}  label="Average score"      value={`${Math.round(avgScore)}%`} color="accent"  trend={null} />
      </div>

      {/* Chart */}
      <WeeklyChart data={weeklyChart} title="My submissions (last 7 days)" />

      {/* Active assignments */}
      <Section title="Active assignments" href="/assignments" hrefLabel="View all">
        {activeAssignments.length === 0 ? (
          <EmptyState icon={Sparkles} text="No active assignments right now" />
        ) : (
          activeAssignments.map((a, i) => {
            const submitted = a.submissions.length > 0;
            const overdue   = isOverdue(a.dueDate);
            return (
              <Link
                key={a.id}
                href={`/assignments/${a.id}`}
                className="flex items-center justify-between px-6 py-3.5 transition-colors animate-fade-slide-up"
                style={{
                  borderBottom: "1px solid var(--border)",
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: submitted ? "var(--success-bg)" : overdue ? "var(--danger-bg)" : "var(--primary-bg)" }}
                  >
                    <BookOpen
                      className="h-4 w-4"
                      style={{ color: submitted ? "var(--success)" : overdue ? "var(--danger)" : "var(--primary)" }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{a.title}</p>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>
                      {a.dueDate ? formatDate(a.dueDate) : "No due date"}
                      {overdue && !submitted && " · ⚠️ Overdue"}
                    </p>
                  </div>
                </div>
                {submitted ? (
                  <Badge variant="success">Submitted</Badge>
                ) : overdue ? (
                  <Badge variant="danger">Overdue</Badge>
                ) : (
                  <Badge variant="warning">Pending</Badge>
                )}
              </Link>
            );
          })
        )}
      </Section>
    </div>
  );
}

/* ── Shared components ─────────────────────────────────────────── */

const COLORS = {
  primary: { bg: "var(--primary-bg)",  icon: "var(--primary)", border: "var(--primary-bg-2)" },
  success: { bg: "var(--success-bg)",  icon: "var(--success)", border: "#bbf7d0" },
  warning: { bg: "var(--warning-bg)",  icon: "var(--warning)", border: "#fde68a" },
  danger:  { bg: "var(--danger-bg)",   icon: "var(--danger)",  border: "#fecaca" },
  accent:  { bg: "#f5f3ff",            icon: "var(--accent)",  border: "#ddd6fe" },
};

function StatCard({
  icon: Icon, label, value, color, trend,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: keyof typeof COLORS;
  trend: "up" | "down" | null;
}) {
  const c = COLORS[color];
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl p-4 transition-all card-hover"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: c.bg }}
        >
          <Icon className="h-5 w-5" style={{ color: c.icon }} />
        </div>
        {trend && (
          <span className="text-[11px] font-medium" style={{ color: trend === "up" ? "var(--danger)" : "var(--success)" }}>
            {trend === "up" ? "↑" : "↓"}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: "var(--text)" }}>{value}</p>
        <p className="mt-0.5 text-xs" style={{ color: "var(--text-3)" }}>{label}</p>
      </div>
    </div>
  );
}

function StatPill({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-4 py-2.5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-sm font-bold leading-none" style={{ color: "var(--text)" }}>{value}</p>
        <p className="text-[10px]" style={{ color: "var(--text-3)" }}>{label}</p>
      </div>
    </div>
  );
}

function PillBadge({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5">
      <span className="text-base">{icon}</span>
      <div>
        <p className="text-sm font-bold text-white leading-none">{value}</p>
        <p className="text-[10px] text-white/70">{label}</p>
      </div>
    </div>
  );
}

function Section({
  title, href, hrefLabel, children,
}: {
  title: string;
  href: string;
  hrefLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h2 className="font-semibold" style={{ color: "var(--text)" }}>{title}</h2>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium transition-colors"
          style={{ color: "var(--primary)" }}
        >
          {hrefLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "var(--surface-2)" }}
      >
        <Icon className="h-7 w-7 opacity-30" style={{ color: "var(--text-3)" }} />
      </div>
      <p className="text-sm" style={{ color: "var(--text-3)" }}>{text}</p>
    </div>
  );
}

function StatusBadge({ status, dueDate }: { status: string; dueDate: Date | null }) {
  if (status === "CLOSED") return <Badge variant="default">Closed</Badge>;
  if (status === "DRAFT")  return <Badge variant="warning">Draft</Badge>;
  if (dueDate && isOverdue(dueDate)) return <Badge variant="danger">Overdue</Badge>;
  return <Badge variant="success">Active</Badge>;
}
