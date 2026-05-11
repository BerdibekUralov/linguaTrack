import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getLevelInfo, BADGE_META, LEVELS, type BadgeType } from "@/lib/gamification";
import { Trophy, Flame, Medal, Crown, Star } from "lucide-react";

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const currentUserId = session.user.id as string;

  const students = await db.user.findMany({
    where: { role: "STUDENT", isActive: true },
    select: {
      id: true,
      name: true,
      xp: true,
      level: true,
      streak: true,
      longestStreak: true,
      userBadges: { select: { badge: true }, orderBy: { earnedAt: "desc" } },
      _count: { select: { submissions: { where: { status: "GRADED" } } } },
    },
    orderBy: { xp: "desc" },
    take: 50,
  });

  // Current user's own stats (if student)
  const myRank = students.findIndex((s) => s.id === currentUserId) + 1;
  const me = students.find((s) => s.id === currentUserId);

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5" style={{ color: "#f59e0b" }} />;
    if (rank === 2) return <Medal className="h-5 w-5" style={{ color: "#94a3b8" }} />;
    if (rank === 3) return <Medal className="h-5 w-5" style={{ color: "#b45309" }} />;
    return <span className="text-sm font-bold w-5 text-center" style={{ color: "var(--text-3)" }}>{rank}</span>;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "var(--primary-bg)" }}
        >
          <Trophy className="h-5 w-5" style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Leaderboard</h1>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>Top students ranked by XP</p>
        </div>
      </div>

      {/* Level guide */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-3)" }}>
          Level progression
        </p>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <div
              key={l.level}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <span className="text-sm">{l.emoji}</span>
              <span className="text-[11px] font-medium" style={{ color: "var(--text-2)" }}>
                Lv{l.level} · {l.label}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-3)" }}>
                {l.minXp}+ XP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* My stats card (students only) */}
      {me && (
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--primary-bg)", border: "2px solid var(--primary)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--primary)" }}>
            Your stats
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Rank",          value: `#${myRank}`,        icon: Trophy },
              { label: "XP",            value: me.xp.toLocaleString(), icon: Star },
              { label: "Level",         value: `${getLevelInfo(me.xp).current.emoji} ${me.level}`, icon: null },
              { label: "Streak",        value: `🔥 ${me.streak} days`, icon: null },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[11px]" style={{ color: "var(--primary)" }}>{label}</p>
                <p className="text-lg font-bold" style={{ color: "var(--text)" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* XP progress bar */}
          {(() => {
            const info = getLevelInfo(me.xp);
            if (!info.next) return null;
            return (
              <div className="mt-3">
                <div className="flex justify-between text-[10px] mb-1" style={{ color: "var(--text-3)" }}>
                  <span>Level {info.current.level}</span>
                  <span>{me.xp} / {info.next.minXp} XP → Level {info.next.level}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${info.progress}%`, background: "var(--primary)" }}
                  />
                </div>
              </div>
            );
          })()}

          {/* My badges */}
          {me.userBadges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {me.userBadges.map(({ badge }) => {
                const meta = BADGE_META[badge as BadgeType];
                return (
                  <span
                    key={badge}
                    title={meta.desc}
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{ background: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}40` }}
                  >
                    {meta.emoji} {meta.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Top 3 podium */}
      {students.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[students[1], students[0], students[2]].map((s, i) => {
            const podiumRank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const isFirst = podiumRank === 1;
            const levelInfo = getLevelInfo(s.xp);
            return (
              <div
                key={s.id}
                className={`rounded-2xl p-4 text-center ${isFirst ? "ring-2" : ""}`}
                style={{
                  background: isFirst ? "var(--primary-bg)" : "var(--surface)",
                  border: `1px solid ${isFirst ? "var(--primary)" : "var(--border)"}`,
                  marginTop: isFirst ? 0 : 16,
                }}
              >
                <div className="flex justify-center mb-2">
                  {podiumRank === 1 && <Crown className="h-6 w-6" style={{ color: "#f59e0b" }} />}
                  {podiumRank === 2 && <Medal className="h-5 w-5" style={{ color: "#94a3b8" }} />}
                  {podiumRank === 3 && <Medal className="h-5 w-5" style={{ color: "#b45309" }} />}
                </div>
                <div
                  className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full font-bold text-white text-sm"
                  style={{ background: "var(--primary)" }}
                >
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold text-sm truncate" style={{ color: "var(--text)" }}>{s.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--primary)" }}>
                  {levelInfo.current.emoji} {s.xp} XP
                </p>
                {s.streak > 0 && (
                  <p className="text-[10px] mt-0.5" style={{ color: "#f97316" }}>
                    🔥 {s.streak}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="px-5 py-3 grid grid-cols-12 gap-3 text-[10px] font-semibold uppercase tracking-wider"
          style={{ borderBottom: "1px solid var(--border)", color: "var(--text-3)", background: "var(--surface-2)" }}
        >
          <span className="col-span-1">#</span>
          <span className="col-span-5">Student</span>
          <span className="col-span-2 text-right">XP</span>
          <span className="col-span-2 text-right">Streak</span>
          <span className="col-span-2 text-right">Grades</span>
        </div>

        {students.length === 0 ? (
          <div className="py-16 text-center">
            <Trophy className="mx-auto h-10 w-10 mb-3 opacity-20" style={{ color: "var(--text-3)" }} />
            <p className="text-sm" style={{ color: "var(--text-3)" }}>No students yet</p>
          </div>
        ) : (
          students.map((s, idx) => {
            const rank = idx + 1;
            const isMe = s.id === currentUserId;
            const levelInfo = getLevelInfo(s.xp);
            return (
              <div
                key={s.id}
                className="px-5 py-3.5 grid grid-cols-12 gap-3 items-center"
                style={{
                  borderBottom: "1px solid var(--border)",
                  background: isMe ? "var(--primary-bg)" : "transparent",
                }}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center">
                  {rankIcon(rank)}
                </div>

                {/* Student info */}
                <div className="col-span-5 flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: isMe ? "var(--primary)" : "var(--text-3)" }}
                  >
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>
                      {s.name} {isMe && <span style={{ color: "var(--primary)" }}>(you)</span>}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
                      {levelInfo.current.emoji} Lv{s.level} {levelInfo.current.label}
                    </p>
                  </div>
                </div>

                {/* XP */}
                <div className="col-span-2 text-right">
                  <p className="text-sm font-bold" style={{ color: "var(--primary)" }}>
                    {s.xp.toLocaleString()}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-3)" }}>XP</p>
                </div>

                {/* Streak */}
                <div className="col-span-2 text-right">
                  {s.streak > 0 ? (
                    <p className="flex items-center justify-end gap-0.5 text-sm font-semibold" style={{ color: "#f97316" }}>
                      <Flame className="h-3.5 w-3.5" />{s.streak}
                    </p>
                  ) : (
                    <p className="text-sm" style={{ color: "var(--text-3)" }}>—</p>
                  )}
                  <p className="text-[10px]" style={{ color: "var(--text-3)" }}>days</p>
                </div>

                {/* Graded count */}
                <div className="col-span-2 text-right">
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    {s._count.submissions}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-3)" }}>graded</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Badge legend */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-3)" }}>
          All badges
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(Object.entries(BADGE_META) as [BadgeType, typeof BADGE_META[BadgeType]][]).map(([, meta]) => (
            <div
              key={meta.label}
              className="flex items-center gap-2.5 rounded-xl p-3"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <span className="text-xl shrink-0">{meta.emoji}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--text)" }}>{meta.label}</p>
                <p className="text-[10px] leading-tight" style={{ color: "var(--text-3)" }}>{meta.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
