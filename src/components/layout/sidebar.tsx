"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, FileText,
  TrendingUp, Users, GraduationCap, X, ShieldCheck, Trophy, Video, HelpCircle,
} from "lucide-react";
import { UserXpWidget } from "@/components/gamification/user-xp-widget";

interface SidebarProps {
  role: string;
  name: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { href: "/dashboard",   label: "Dashboard",    icon: LayoutDashboard, roles: ["STUDENT", "TEACHER", "ADMIN"] },
  { href: "/assignments", label: "Assignments",  icon: BookOpen,         roles: ["STUDENT", "TEACHER", "ADMIN"] },
  { href: "/submissions", label: "Submissions",  icon: FileText,         roles: ["STUDENT"] },
  { href: "/progress",    label: "Progress",     icon: TrendingUp,       roles: ["STUDENT", "TEACHER", "ADMIN"] },
  { href: "/lessons",     label: "Lessons",      icon: Video,            roles: ["STUDENT", "TEACHER"] },
  { href: "/leaderboard", label: "Leaderboard",  icon: Trophy,           roles: ["STUDENT", "TEACHER", "ADMIN"] },
  { href: "/students",    label: "Students",     icon: Users,            roles: ["TEACHER", "ADMIN"] },
  { href: "/students",    label: "Teachers",     icon: Users,            roles: ["STUDENT"] },
  { href: "/admin/users", label: "Users",        icon: ShieldCheck,      roles: ["ADMIN"] },
];

function NavContent({ role, name, onClose }: { role: string; name: string; onClose?: () => void; }) {
  const pathname = usePathname();

  return (
    <div
      className="flex h-full w-[240px] flex-col"
      style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-between px-5 h-[60px] shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "var(--primary)" }}>
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight" style={{ color: "var(--text)" }}>LinguaTrack</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden rounded-xl p-1.5 transition-colors" style={{ color: "var(--text-3)" }}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
          Menu
        </p>
        <div className="space-y-0.5">
          {navItems
            .filter((item) => item.roles.includes(role))
            .map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                  style={{
                    background: active ? "var(--primary-bg)" : "transparent",
                    color: active ? "var(--primary)" : "var(--text-2)",
                  }}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" style={{ color: active ? "var(--primary)" : "var(--text-3)" }} />
                  {item.label}
                  {active && <div className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: "var(--primary)" }} />}
                </Link>
              );
            })}
        </div>
      </nav>

      {/* XP Widget — students only */}
      {role === "STUDENT" && <UserXpWidget />}

      {/* Help link */}
      <div className="px-3 pb-1 shrink-0">
        <Link
          href="/help"
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--text-3)" }}
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          Yoriqnoma
        </Link>
      </div>

      {/* User footer */}
      <div className="px-3 py-3 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "var(--surface-2)" }}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "var(--primary)" }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold" style={{ color: "var(--text)" }}>{name}</p>
            <p className="truncate text-[10px]" style={{ color: "var(--text-3)" }}>
              {role === "TEACHER" ? "Teacher" : role === "STUDENT" ? "Student" : role === "ADMIN" ? "Admin" : role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ role, name, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden lg:flex h-full shrink-0">
        <NavContent role={role} name={name} />
      </aside>
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40" style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)" }} onClick={onMobileClose} />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 flex animate-slide-in-left">
            <NavContent role={role} name={name} onClose={onMobileClose} />
          </aside>
        </>
      )}
    </>
  );
}
