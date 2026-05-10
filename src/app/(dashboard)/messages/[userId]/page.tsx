import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ConversationView } from "@/components/messages/conversation-view";
import { ChevronLeft } from "lucide-react";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function ConversationPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { userId: partnerId } = await params;
  const myId = session.user.id as string;

  const partner = await db.user.findUnique({
    where: { id: partnerId },
    select: { id: true, name: true, avatar: true, role: true, email: true },
  });
  if (!partner) notFound();

  // Check enrollment exists
  const enrollment = await db.enrollment.findFirst({
    where: {
      OR: [
        { studentId: myId, teacherId: partnerId },
        { studentId: partnerId, teacherId: myId },
      ],
    },
  });
  if (!enrollment) {
    redirect("/messages");
  }

  // Mark incoming as read
  await db.message.updateMany({
    where: { senderId: partnerId, receiverId: myId, isRead: false },
    data: { isRead: true },
  });

  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: myId, receiverId: partnerId },
        { senderId: partnerId, receiverId: myId },
      ],
    },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
        <Link href="/messages" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
          {partner.name[0].toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{partner.name}</p>
          <p className="text-xs text-gray-400">{partner.role === "TEACHER" ? "O'qituvchi" : "Talaba"}</p>
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-hidden">
        <ConversationView
          initialMessages={messages.map((m) => ({
            ...m,
            createdAt: m.createdAt.toISOString(),
          }))}
          partner={{ ...partner, avatar: partner.avatar }}
          currentUserId={myId}
        />
      </div>
    </div>
  );
}
