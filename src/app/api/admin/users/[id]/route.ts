import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name:     z.string().min(2).optional(),
  email:    z.string().email().optional(),
  role:     z.enum(["STUDENT", "TEACHER", "ADMIN"]).optional(),
  password: z.string().min(6).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body   = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });
  }

  const { password, ...rest } = parsed.data;

  const data: Record<string, unknown> = { ...rest };
  if (password && password.length >= 6) {
    data.password = await bcrypt.hash(password, 10);
  }

  // Prevent deactivating yourself
  if (id === (session.user.id as string) && rest.isActive === false) {
    return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 });
  }

  // Email uniqueness check
  if (rest.email) {
    const existing = await db.user.findFirst({ where: { email: rest.email, NOT: { id } } });
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const user = await db.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, _count: { select: { submissions: true } } },
  });

  return NextResponse.json(user);
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  if (id === (session.user.id as string)) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  await db.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
