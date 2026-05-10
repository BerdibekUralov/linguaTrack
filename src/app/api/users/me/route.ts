import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id as string },
    select: {
      id: true, name: true, email: true, role: true,
      avatar: true, bio: true, phone: true, createdAt: true,
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const body = await req.json();
  const { name, bio, phone, currentPassword, newPassword } = body;

  const updateData: Record<string, unknown> = {};
  if (name) updateData.name = name;
  if (bio !== undefined) updateData.bio = bio;
  if (phone !== undefined) updateData.phone = phone;

  if (newPassword) {
    const user = await db.user.findUnique({ where: { id: session.user.id as string } });
    if (!user?.password) return NextResponse.json({ error: "Cannot change password for this account" }, { status: 400 });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  const updated = await db.user.update({
    where: { id: session.user.id as string },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, avatar: true, bio: true, phone: true },
  });

  return NextResponse.json(updated);
}
