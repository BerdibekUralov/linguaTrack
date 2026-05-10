import { redirect } from "next/navigation";

// Public registration is disabled — only admins can create accounts.
export default function RegisterPage() {
  redirect("/login");
}
