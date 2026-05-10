import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/messages/[userId] — full conversation with a partner
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId: partnerId } = await params;
  const myId = session.user.id;

  // Mark all incoming messages from this partner as read
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
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Also return partner info
  const partner = await db.user.findUnique({
    where: { id: partnerId },
    select: { id: true, name: true, avatar: true, role: true, email: true },
  });

  return NextResponse.json({ messages, partner });
}
