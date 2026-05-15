import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PracticeSession } from "@/components/practice/practice-session";

export default async function PracticeLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { lessonId } = await params;
  const userId = session.user.id as string;

  const lesson = await db.gameLesson.findUnique({
    where: { id: lessonId },
    include: {
      questions: { orderBy: { order: "asc" } },
      unit: {
        include: {
          module: { select: { id: true, name: true, slug: true } },
        },
      },
      progress: { where: { userId } },
    },
  });

  if (!lesson) redirect("/practice");

  const existingProgress = lesson.progress[0] ?? null;

  return (
    <PracticeSession
      lesson={{
        id: lesson.id,
        title: lesson.title,
        xpReward: lesson.xpReward,
        unitTitle: lesson.unit.title,
        unitColor: lesson.unit.color,
        moduleSlug: lesson.unit.module.slug,
        questions: lesson.questions.map((q) => ({
          id: q.id,
          type: q.type,
          question: q.question,
          options: (q.options as string[]) ?? [],
          answer: q.answer,
          hint: q.hint ?? undefined,
        })),
      }}
      userId={userId}
      previousStars={existingProgress?.stars ?? null}
    />
  );
}
