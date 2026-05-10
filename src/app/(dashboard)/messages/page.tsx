import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { getInitials, formatDate } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

export default async function MessagesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id as string;

  // Get all messages
  const allMessages = await db.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    include: {
      sender: { select: { id: true, name: true, avatar: true, role: true } },
      receiver: { select: { id: true, name: true, avatar: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build conversations (last message per partner)
  const convMap = new Map<
    string,
    { partner: { id: string; name: string; avatar: string | null; role: string }; lastMsg: (typeof allMessages)[0]; unread: number }
  >();

  for (const msg of allMessages) {
    const partner = msg.senderId === userId ? msg.receiver : msg.sender;
    if (!convMap.has(partner.id)) {
      convMap.set(partner.id, { partner, lastMsg: msg, unread: 0 });
    }
  }

  // Count unread
  const unreadCounts = await db.message.groupBy({
    by: ["senderId"],
    where: { receiverId: userId, isRead: false },
    _count: true,
  });
  for (const u of unreadCounts) {
    const conv = convMap.get(u.senderId);
    if (conv) conv.unread = u._count;
  }

  const conversations = Array.from(convMap.values());

  // Get people we can message (enrolled relationships)
  let contactList: { id: string; name: string; avatar: string | null; role: string }[] = [];
  if (session.user.role === "TEACHER") {
    const enrollments = await db.enrollment.findMany({
      where: { teacherId: userId, status: "ACTIVE" },
      include: { student: { select: { id: true, name: true, avatar: true, role: true } } },
    });
    contactList = enrollments.map((e) => e.student);
  } else {
    const enrollments = await db.enrollment.findMany({
      where: { studentId: userId, status: "ACTIVE" },
      include: { teacher: { select: { id: true, name: true, avatar: true, role: true } } },
    });
    contactList = enrollments.map((e) => e.teacher);
  }

  // People not yet in conversation
  const existingIds = new Set(conversations.map((c) => c.partner.id));
  const newContacts = contactList.filter((c) => !existingIds.has(c.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Messages</h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>Chat with teachers and students</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Conversation list */}
        <div className="lg:col-span-1">
          <Card>
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>Conversations</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {conversations.length === 0 && newContacts.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-400">No messages yet</p>
                </div>
              )}
              {conversations.map(({ partner, lastMsg, unread }) => (
                <Link
                  key={partner.id}
                  href={`/messages/${partner.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm">
                    {partner.avatar ? (
                      <img src={partner.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      getInitials(partner.name)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-gray-900">{partner.name}</p>
                      {unread > 0 && (
                        <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-medium text-white">
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-gray-400">{lastMsg.content}</p>
                    <p className="text-xs text-gray-300">{formatDate(lastMsg.createdAt)}</p>
                  </div>
                </Link>
              ))}

              {/* New contacts (no messages yet) */}
              {newContacts.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Start a new conversation</p>
                  </div>
                  {newContacts.map((c) => (
                    <Link
                      key={c.id}
                      href={`/messages/${c.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 font-semibold text-sm">
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.role === "TEACHER" ? "Teacher" : "Student"}</p>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Empty state for desktop */}
        <div className="hidden lg:flex lg:col-span-2 items-center justify-center">
          <div className="text-center text-gray-400">
            <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-200" />
            <p className="text-sm">Select a conversation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
