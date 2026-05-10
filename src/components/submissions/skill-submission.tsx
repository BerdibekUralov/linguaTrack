"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  SkillContent,
  ReadingContent,
  ListeningContent,
  GrammarContent,
  VocabularyContent,
  SpeakingContent,
  StructuredAnswers,
} from "@/types/skill-content";

import { ReadingSubmission } from "./reading-submission";
import { ListeningSubmission } from "./listening-submission";
import { GrammarSubmission } from "./grammar-submission";
import { SpeakingSubmission } from "./speaking-submission";
import { VocabularyGame } from "./vocabulary-game";
import { SubmitForm } from "./submit-form";

interface Props {
  assignmentId: string;
  skillType: string;
  skillContent: SkillContent | null;
  maxScore: number;
  dueDate: Date | null;
  allowLate: boolean;
  submission: {
    id: string;
    status: string;
    content: string | null;
    answers?: unknown;
    autoScore?: number | null;
  } | null;
}

async function submitWithAnswers(
  assignmentId: string,
  answers: unknown,
  content?: string
): Promise<void> {
  // Create or update draft with answers, then submit
  const createRes = await fetch("/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assignmentId, content: content ?? "", answers }),
  });

  if (!createRes.ok) {
    const data = await createRes.json().catch(() => ({}));
    if (createRes.status === 401) {
      // Session expired / user deleted — force re-login
      window.location.href = "/api/auth/signout?callbackUrl=/login";
      return;
    }
    throw new Error(data.error ?? "Topshirishda xato");
  }
  const sub = await createRes.json();

  // Submit the draft
  const submitRes = await fetch(`/api/submissions/${sub.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "submit", answers }),
  });

  if (!submitRes.ok) {
    const data = await submitRes.json().catch(() => ({}));
    throw new Error(data.error ?? "Topshirishda xato");
  }
}

export function SkillSubmission({
  assignmentId,
  skillType,
  skillContent,
  maxScore,
  dueDate,
  allowLate,
  submission,
}: Props) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(
    submission?.status === "SUBMITTED" || submission?.status === "GRADED"
  );

  const handleDone = () => {
    setSubmitted(true);
    router.refresh();
  };

  // WRITING — use the existing plain-text submit form
  if (skillType === "WRITING" || !skillContent) {
    return (
      <SubmitForm
        assignmentId={assignmentId}
        maxScore={maxScore}
        submission={submission}
        dueDate={dueDate}
        allowLate={allowLate}
      />
    );
  }

  // READING
  if (skillType === "READING") {
    const content = skillContent as ReadingContent;
    return (
      <ReadingSubmission
        content={content}
        assignmentId={assignmentId}
        submitted={submitted}
        onSubmit={async (answers: StructuredAnswers) => {
          await submitWithAnswers(assignmentId, answers);
          handleDone();
        }}
      />
    );
  }

  // LISTENING
  if (skillType === "LISTENING") {
    const content = skillContent as ListeningContent;
    return (
      <ListeningSubmission
        content={content}
        submitted={submitted}
        onSubmit={async (answers: StructuredAnswers) => {
          await submitWithAnswers(assignmentId, answers);
          handleDone();
        }}
      />
    );
  }

  // GRAMMAR
  if (skillType === "GRAMMAR") {
    const content = skillContent as GrammarContent;
    return (
      <GrammarSubmission
        content={content}
        submitted={submitted}
        onSubmit={async (answers: StructuredAnswers) => {
          await submitWithAnswers(assignmentId, answers);
          handleDone();
        }}
      />
    );
  }

  // SPEAKING
  if (skillType === "SPEAKING") {
    const content = skillContent as SpeakingContent;
    return (
      <SpeakingSubmission
        content={content}
        submitted={submitted}
        onSubmit={async (answers: Record<string, string>) => {
          await submitWithAnswers(assignmentId, answers);
          handleDone();
        }}
      />
    );
  }

  // VOCABULARY
  if (skillType === "VOCABULARY") {
    const content = skillContent as VocabularyContent;
    if (submitted) {
      return (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-5 py-4">
          <span className="text-green-600 text-xl">✅</span>
          <div>
            <p className="text-sm text-green-700 font-medium">Natija saqlandi!</p>
            {submission?.autoScore != null && (
              <p className="text-xs text-green-600">
                Ball: {submission.autoScore}/{maxScore}
              </p>
            )}
          </div>
        </div>
      );
    }
    return (
      <VocabularyGame
        words={content.words}
        assignmentId={assignmentId}
        existingSubmission={submission ?? undefined}
        onComplete={async (answers, score) => {
          await submitWithAnswers(assignmentId, answers, `Vocabulary quiz: ${score}%`);
          handleDone();
        }}
      />
    );
  }

  // Fallback
  return (
    <SubmitForm
      assignmentId={assignmentId}
      maxScore={maxScore}
      submission={submission}
      dueDate={dueDate}
      allowLate={allowLate}
    />
  );
}
