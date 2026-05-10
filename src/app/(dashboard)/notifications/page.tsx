import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { MarkAllRead } from "@/components/notifications/mark-all-read";
import { formatDate } from "@/lib/utils";
import { Bell, BookOpen, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import Link from "next/link";

const typeConfig: Record<string, {
  icon: React.ElementType;
  bg: string;
  color: string;
  label: string;
}> = {
  NEW_ASSIGNMENT:      { icon: BookOpen,      bg: "var(--primary-bg)",  color: "var(--primary)", label: "New assignment" },
  ASSIGNMENT_GRADED:   { icon: CheckCircle,   bg: "var(--success-bg)",  color: "var(--success)", label: "Graded" },
  DEADLINE_REMINDER:   { icon: AlertCircle,   bg: "var(--warning-bg)",  color: "var(--warning)", label: "Deadline" },
  SUBMISSION_RECEIVED: { icon: MessageSquare, bg: "var(--primary-bg-2)", color: "var(--accent)",  label: "Submitted" },
  SYSTEM:              { icon: Bell,          bg: "var(--surface-2)",   color: "var(--text-3)",  label: "System" },
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Notifications</h1>
          {unreadCount > 0 && (
            <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && <MarkAllRead />}
      </div>

      <Card>
        <div>
          {notifications.length === 0 ? (
            <div className="py-16 text-center px-6">
              <Bell className="mx-auto mb-3 h-12 w-12 opacity-20" style={{ color: "var(--text-3)" }} />
              <p style={{ color: "var(--text-3)" }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => {
              const cfg = typeConfig[n.type] ?? typeConfig["SYSTEM"]!;
              const Icon = cfg.icon;
              return (
                <div
                  key={n.id}
                  className="flex items-start gap-4 px-6 py-4 transition-colors"
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: !n.isRead ? "var(--primary-bg)" : undefined,
                  }}
                >
                  <div
                    className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: cfg.bg }}
                  >
                    <Icon className="h-4 w-4" style={{ color: cfg.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-sm" style={{ color: "var(--text-2)" }}>{n.message}</p>
                      </div>
                      <div className="flex flex-shrink-0 flex-col items-end gap-1">
                        <p className="text-xs whitespace-nowrap" style={{ color: "var(--text-3)" }}>
                          {formatDate(n.createdAt)}
                        </p>
                        {!n.isRead && (
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                            style={{ background: "var(--primary)" }}
                          >
                            New
                          </span>
                        )}
                      </div>
                    </div>
                    {n.link && (
                      <Link
                        href={n.link}
                        className="mt-2 inline-block text-xs font-medium transition-opacity hover:opacity-70"
                        style={{ color: "var(--primary)" }}
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
