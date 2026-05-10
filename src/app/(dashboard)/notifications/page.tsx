import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkAllRead } from "@/components/notifications/mark-all-read";
import { formatDate } from "@/lib/utils";
import { Bell, BookOpen, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import Link from "next/link";

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  NEW_ASSIGNMENT:      { icon: BookOpen, color: "text-blue-600 bg-blue-50", label: "New assignment" },
  ASSIGNMENT_GRADED:   { icon: CheckCircle, color: "text-green-600 bg-green-50", label: "Graded" },
  DEADLINE_REMINDER:   { icon: AlertCircle, color: "text-orange-600 bg-orange-50", label: "Deadline" },
  SUBMISSION_RECEIVED: { icon: MessageSquare, color: "text-purple-600 bg-purple-50", label: "Submitted" },
  SYSTEM:              { icon: Bell, color: "text-gray-600 bg-gray-100", label: "System" },
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

  // Mark all as read when page loads (server action triggers from client)
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
        <div className="divide-y divide-gray-50">
          {notifications.length === 0 ? (
            <CardBody className="py-16 text-center">
              <Bell className="mx-auto mb-3 h-12 w-12 text-gray-200" />
              <p className="text-gray-400">No notifications yet</p>
            </CardBody>
          ) : (
            notifications.map((n) => {
              const cfg = typeConfig[n.type] ?? typeConfig["SYSTEM"];
              const Icon = cfg.icon;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 px-6 py-4 transition-colors ${
                    !n.isRead ? "bg-indigo-50/40" : "hover:bg-gray-50"
                  }`}
                >
                  <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${cfg.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-medium ${!n.isRead ? "text-gray-900" : "text-gray-700"}`}>
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-sm text-gray-500">{n.message}</p>
                      </div>
                      <div className="flex flex-shrink-0 flex-col items-end gap-1">
                        <p className="text-xs text-gray-300 whitespace-nowrap">{formatDate(n.createdAt)}</p>
                        {!n.isRead && <Badge variant="default" className="text-xs">Yangi</Badge>}
                      </div>
                    </div>
                    {n.link && (
                      <Link
                        href={n.link}
                        className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Ko&apos;rish →
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
