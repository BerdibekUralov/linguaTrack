"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Loader2 } from "lucide-react";

export function MarkAllRead() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const markAll = async () => {
    setLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={markAll}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50"
      style={{ border: "1px solid var(--border)", color: "var(--text-2)", background: "var(--surface)" }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
      Mark all as read
    </button>
  );
}
