import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { EditAssignmentForm } from "@/components/assignments/edit-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditAssignmentPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/assignments");

  const { id } = await params;
  const assignment = await db.assignment.findUnique({
    where: { id },
    select: {
      id: true, title: true, description: true, instructions: true,
      dueDate: true, maxScore: true, type: true, status: true, teacherId: true,
      skillType: true, skillContent: true,
    },
  });

  if (!assignment || assignment.teacherId !== session.user.id) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Edit assignment</h1>
        <p className="text-gray-500">{assignment.title}</p>
      </div>
      <EditAssignmentForm assignment={assignment} />
    </div>
  );
}
