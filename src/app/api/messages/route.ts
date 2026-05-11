import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { broadcastMessage } from "@/lib/supabase-server";

const sendSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

// GET /api/messages — conversation list (last message per partner)
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Get all messages where user is sender or receiver
  const messages = await db.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    include: {
      sender: { select: { id: true, name: true, avatar: true, role: true } },
      receiver: { select: { id: true, name: true, avatar: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build conversation map — one entry per partner
  const convMap = new Map<string, (typeof messages)[0]>();
  for (const msg of messages) {
    const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!convMap.has(partnerId)) convMap.set(partnerId, msg);
  }

  // Count unread per partner
  const unreadCounts = await db.message.groupBy({
    by: ["senderId"],
    where: { receiverId: userId, isRead: false },
    _count: true,
  });
  const unreadMap = new Map(unreadCounts.map((u) => [u.senderId, u._count]));

  const conversations = Array.from(convMap.values()).map((msg) => {
    const partner = msg.senderId === userId ? msg.receiver : msg.sender;
    return {
      partnerId: partner.id,
      partnerName: partner.name,
      lastMessage: msg.content,
      lastAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : String(msg.createdAt),
      unreadCount: unreadMap.get(partner.id) ?? 0,
    };
  });

  return NextResponse.json(conversations);
}

// POST /api/messages — send a message
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }

    const { receiverId, content } = parsed.data;
    const senderId = session.user.id;

    if (senderId === receiverId) {
      return NextResponse.json({ error: "O'zingizga xabar yubora olmaysiz" }, { status: 400 });
    }

    // Check that a relationship exists (enrollment)
    const enrollment = await db.enrollment.findFirst({
      where: {
        OR: [
          { studentId: senderId, teacherId: receiverId },
          { studentId: receiverId, teacherId: senderId },
        ],
      },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "Bu foydalanuvchi bilan aloqa yo'q" }, { status: 403 });
    }

    const message = await db.message.create({
      data: { senderId, receiverId, content },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Broadcast via Supabase Realtime (fire-and-forget)
    void broadcastMessage(senderId as string, receiverId, {
      ...message,
      createdAt: message.createdAt.toISOString(),
    });

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error("[messages POST]", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
