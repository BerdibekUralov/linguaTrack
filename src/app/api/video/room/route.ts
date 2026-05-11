import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createRoom, getRoom, isDailyConfigured } from "@/lib/daily";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!isDailyConfigured()) {
    return NextResponse.json(
      { error: "Daily.co not configured. Add DAILY_API_KEY and NEXT_PUBLIC_DAILY_DOMAIN to .env" },
      { status: 503 }
    );
  }

  const { name, expirySeconds } = await req.json() as {
    name: string;
    expirySeconds?: number;
  };

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  try {
    // Check if room already exists
    const existing = await getRoom(name);
    if (existing) {
      return NextResponse.json(existing);
    }

    const room = await createRoom(name, expirySeconds ?? 86_400);
    return NextResponse.json(room, { status: 201 });
  } catch (err) {
    console.error("[video/room POST]", err);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
