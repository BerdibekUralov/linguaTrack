"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { LogOut, Settings, Sun, Moon, Monitor } from "lucide-react";
import { signOut } from "next-auth/react";

interface Props {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  name: string;
  email: string;
  role: string;
}

const ROLE_LABEL: Record<string, string> = {
  TEACHER: "Teacher",
  STUDENT: "Student",
  ADMIN: "Admin",
};

export function ProfileDropdown({ open, onClose, anchorRef, name, email, role }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && !anchorRef.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onClose, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const themes = [
    { id: "light",  label: "Light",  icon: Sun },
    { id: "dark",   label: "Dark",   icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <div
      ref={panelRef}
      className="animate-slide-down absolute right-0 top-full mt-2 w-[280px] rounded-2xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)", zIndex: 50 }}
    >
      {/* User info */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "var(--primary)" }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold" style={{ color: "var(--text)" }}>{name}</p>
            <p className="truncate text-xs" style={{ color: "var(--text-3)" }}>{email}</p>
            <span className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: "var(--primary-bg)", color: "var(--primary)" }}>
              {ROLE_LABEL[role] ?? role}
            </span>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Theme</p>
        <div className="flex gap-1.5">
          {themes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-all text-xs font-medium"
              style={{
                background: theme === id ? "var(--primary-bg)" : "var(--surface-2)",
                color: theme === id ? "var(--primary)" : "var(--text-2)",
                border: theme === id ? "1px solid var(--primary)" : "1px solid transparent",
              }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="py-1">
        <Link href="/settings" onClick={onClose} className="flex items-center gap-3 px-5 py-2.5 text-sm transition-colors" style={{ color: "var(--text-2)" }}>
          <Settings className="h-4 w-4" style={{ color: "var(--text-3)" }} />
          Settings
        </Link>
      </div>

      {/* Logout */}
      <div style={{ borderTop: "1px solid var(--border)" }} className="py-1">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 px-5 py-2.5 text-sm transition-colors"
          style={{ color: "#ef4444" }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
