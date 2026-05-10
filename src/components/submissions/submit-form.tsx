"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isOverdue } from "@/lib/utils";

interface SubmissionLike {
  id: string;
  status: string;
  content: string | null;
}

interface SubmitFormProps {
  assignmentId: string;
  maxScore: number;
  submission: SubmissionLike | null;
  dueDate: Date | null;
  allowLate: boolean;
}

export function SubmitForm({ assignmentId, submission, dueDate, allowLate }: SubmitFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(submission?.content ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const overdue = isOverdue(dueDate);
  const alreadySubmitted = submission?.status === "SUBMITTED" || submission?.status === "GRADED";

  if (alreadySubmitted) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <Badge variant="success" className="text-sm px-4 py-1.5">Assignment submitted</Badge>
          <p className="mt-2 text-sm" style={{ color: "var(--text-3)" }}>You have already submitted this assignment</p>
        </CardBody>
      </Card>
    );
  }

  if (overdue && !allowLate) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <Badge variant="danger" className="text-sm px-4 py-1.5">Deadline passed</Badge>
          <p className="mt-2 text-sm" style={{ color: "var(--text-3)" }}>The submission deadline for this assignment has passed</p>
        </CardBody>
      </Card>
    );
  }

  const saveDraft = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, content }),
    });
    setLoading(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) { window.location.href = "/api/auth/signout?callbackUrl=/login"; return; }
      setError(json.error ?? "Something went wrong");
      return;
    }
    router.refresh();
  };

  const submit = async () => {
    setLoading(true);
    setError("");

    let subId = submission?.id;

    if (!subId) {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, content }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (res.status === 401) { window.location.href = "/api/auth/signout?callbackUrl=/login"; return; }
        setError(json.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
      const sub = await res.json();
      subId = sub.id;
    }

    const res2 = await fetch(`/api/submissions/${subId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit" }),
    });

    setLoading(false);
    if (!res2.ok) {
      const json = await res2.json();
      setError(json.error ?? "Something went wrong");
      return;
    }
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold" style={{ color: "var(--text)" }}>
          {submission?.status === "DRAFT" ? "Edit your draft" : "Write your answer"}
        </h2>
        {overdue && allowLate && <Badge variant="warning">Late submission</Badge>}
      </CardHeader>
      <CardBody className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your answer here..."
          rows={8}
        />

        {error && <div className="rounded-lg p-3 text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>{error}</div>}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={saveDraft} loading={loading} disabled={!content.trim()}>
            Save draft
          </Button>
          <Button onClick={submit} loading={loading} disabled={!content.trim()}>
            Submit
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
