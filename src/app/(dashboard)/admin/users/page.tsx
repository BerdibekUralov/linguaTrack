import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminUsersClient } from "@/components/admin/admin-users-client";

export const metadata = { title: "User Management" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return <AdminUsersClient />;
}
