"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, BookOpen, CheckCircle, AlertCircle, MessageSquare, X, CheckCheck } from "lucide-react";
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface Group { label: string; items: Notification[] }

const TYPE_CONFIG: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  NEW_ASSIGNMENT:      { icon: BookOpen,      bg: "var(--primary-bg)",  color: "var(--primary)" },
  ASSIGNMENT_GRADED:   { icon: CheckCircle,   bg: "var(--success-bg)",  color: "var(--success)" },
  DEADLINE_REMINDER:   { icon: AlertCircle,   bg: "var(--warning-bg)",  color: "var(--warning)" },
  SUBMISSION_RECEIVED: { icon: MessageSquare, bg: "var(--primary-bg-2)", color: "var(--accent)" },
  SYSTEM:              { icon: Bell,          bg: "var(--surface-2)",   color: "var(--text-3)" },
};

function groupNotifications(notifs: Notification[]): Group[] {
  const today: Notification[] = [], yesterday: Notification[] = [],
        thisWeek: Notification[] = [], older: Notification[] = [];
  for (const n of notifs) {
    const d = new Date(n.createdAt);
    if      (isToday(d))                          today.push(n);
    else if (isYesterday(d))                      yesterday.push(n);
    else if (isThisWeek(d, { weekStartsOn: 1 })) thisWeek.push(n);
    else                                          older.push(n);
  }
  return [
    { label: "Today",     items: today },
    { label: "Yesterday", items: yesterday },
    { label: "This week", items: thisWeek },
    { label: "Earlier",   items: older },
  ].filter((g) => g.items.length > 0);
}

interface Props {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export function NotificationPanel({ open, onClose, anchorRef }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [notifs, setNotifs]   = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/notifications?limit=30")
      .then((r) => r.json())
      .then((data: Notification[]) => setNotifs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

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

  const markAllRead = async () => {
    setMarking(true);
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAll: true }) }).catch(() => {});
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarking(false);
  };

  const unread = notifs.filter((n) => !n.isRead).length;
  const groups = groupNotifications(notifs);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="animate-slide-down absolute right-0 top-full mt-2 flex flex-col overflow-hidden rounded-2xl"
      style={{ width: 400, maxHeight: 560, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)", zIndex: 50 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <span className="font-semibold" style={{ color: "var(--text)" }}>Notifications</span>
          {unread > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white" style={{ background: "var(--primary)" }}>
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button onClick={markAllRead} disabled={marking} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors" style={{ color: "var(--primary)", background: "var(--primary-bg)" }}>
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="rounded-xl p-1.5 transition-colors" style={{ color: "var(--text-3)" }}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--primary) transparent var(--primary) var(--primary)" }} />
          </div>
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "var(--surface-2)" }}>
              <Bell className="h-7 w-7 opacity-30" style={{ color: "var(--text-3)" }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>No notifications</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>New notifications will appear here</p>
            </div>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <div className="sticky top-0 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider" style={{ background: "var(--surface-2)", color: "var(--text-3)", zIndex: 1 }}>
                {group.label}
              </div>
              {group.items.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.SYSTEM;
                const Icon = cfg.icon;
                const Wrapper = n.link ? Link : "div";
                return (
                  <Wrapper
                    key={n.id}
                    href={n.link ?? ""}
                    onClick={n.link ? onClose : undefined}
                    className="flex items-start gap-3.5 px-5 py-3.5 transition-colors cursor-pointer"
                    style={{ background: !n.isRead ? "var(--primary-bg)" : undefined, borderBottom: "1px solid var(--border)" }}
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: cfg.bg }}>
                      <Icon className="h-4 w-4" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug" style={{ color: "var(--text)" }}>{n.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-2)" }}>{n.message}</p>
                      <p className="mt-1 text-[11px]" style={{ color: "var(--text-3)" }}>
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.isRead && <div className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--primary)" }} />}
                  </Wrapper>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
