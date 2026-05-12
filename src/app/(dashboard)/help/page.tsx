import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HelpPageClient } from "./help-client";

export default async function HelpPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const role = session.user.role as string;
  return <HelpPageClient defaultRole={role === "TEACHER" ? "teacher" : "student"} />;
}
