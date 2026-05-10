import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 100);

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(notifications);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const body = await req.json();
  const { ids, markAll } = body;

  await db.notification.updateMany({
    where: {
      userId: session.user.id as string,
      ...(markAll ? {} : ids ? { id: { in: ids } } : {}),
    },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
