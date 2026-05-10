"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function PublishButton({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const publish = async () => {
    setLoading(true);
    await fetch(`/api/assignments/${assignmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ACTIVE" }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <Button size="sm" loading={loading} onClick={publish}>
      <Send className="h-4 w-4" />
      Publish
    </Button>
  );
}
