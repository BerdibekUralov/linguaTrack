"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Trophy } from "lucide-react";
import { LEVELS } from "@/lib/gamification-config";

interface GamificationData {
  xp: number;
  level: number;
  streak: number;
  levelInfo: {
    current: { level: number; label: string; emoji: string; minXp: number };
    next: { level: number; label: string; emoji: string; minXp: number } | null;
    progress: number;
  };
}

export function UserXpWidget() {
  const [data, setData] = useState<GamificationData | null>(null);

  useEffect(() => {
    fetch("/api/gamification/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: GamificationData | null) => {
        if (d?.levelInfo?.current) setData(d);
      })
      .catch(() => null);
  }, []);

  if (!data?.levelInfo?.current) return null;

  const { levelInfo, streak } = data;
  const maxLevel = LEVELS[LEVELS.length - 1].level;
  const isMaxLevel = levelInfo.current.level >= maxLevel;

  return (
    <Link
      href="/leaderboard"
      className="block mx-3 mb-3 rounded-xl p-3 transition-all hover:opacity-90"
      style={{ background: "var(--primary-bg)", border: "1px solid var(--border)" }}
    >
      {/* Level + Streak row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{levelInfo.current.emoji}</span>
          <div>
            <p className="text-[11px] font-bold leading-none" style={{ color: "var(--primary)" }}>
              Level {levelInfo.current.level}
            </p>
            <p className="text-[10px] leading-none mt-0.5" style={{ color: "var(--text-3)" }}>
              {levelInfo.current.label}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-0.5">
              <Flame className="h-3 w-3" style={{ color: "#f97316" }} />
              <span className="text-[11px] font-bold" style={{ color: "#f97316" }}>{streak}</span>
            </div>
          )}
          <div className="flex items-center gap-0.5">
            <Trophy className="h-3 w-3" style={{ color: "var(--primary)" }} />
            <span className="text-[11px] font-bold" style={{ color: "var(--primary)" }}>
              {data.xp} XP
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {!isMaxLevel && levelInfo.next && (
        <>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--border)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${levelInfo.progress}%`,
                background: "var(--primary)",
              }}
            />
          </div>
          <p className="mt-1 text-[10px]" style={{ color: "var(--text-3)" }}>
            {levelInfo.progress}% → Level {levelInfo.next.level}
          </p>
        </>
      )}
      {isMaxLevel && (
        <p className="text-[10px] font-semibold text-center" style={{ color: "var(--primary)" }}>
          💎 Maximum level reached!
        </p>
      )}
    </Link>
  );
}
