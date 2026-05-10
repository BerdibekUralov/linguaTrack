"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, UserPlus, CheckCircle, Loader2 } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface Teacher {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  enrolled: boolean;
}

interface Props {
  myEnrollmentIds: string[];
}

export function TeacherSearch({ myEnrollmentIds }: Props) {
  const [query, setQuery] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set(myEnrollmentIds));

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/teachers?q=${encodeURIComponent(q)}`);
      if (res.ok) setTeachers(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const enroll = async (teacherId: string) => {
    setEnrollingId(teacherId);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId }),
      });
      if (res.ok) {
        setEnrolled((prev) => new Set([...prev, teacherId]));
      }
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
      </div>

      {teachers.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
          {teachers.map((t) => {
            const isEnrolled = enrolled.has(t.id);
            const isEnrolling = enrollingId === t.id;
            return (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: "var(--primary)" }}>
                  {getInitials(t.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm" style={{ color: "var(--text)" }}>{t.name}</p>
                  <p className="truncate text-xs" style={{ color: "var(--text-3)" }}>{t.bio ?? t.email}</p>
                </div>
                <button
                  onClick={() => !isEnrolled && void enroll(t.id)}
                  disabled={isEnrolled || isEnrolling}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                  style={isEnrolled
                    ? { background: "var(--success-bg)", color: "var(--success)" }
                    : { background: "var(--primary)", color: "#fff" }
                  }
                >
                  {isEnrolling ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isEnrolled ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    <UserPlus className="h-3.5 w-3.5" />
                  )}
                  {isEnrolled ? "Enrolled" : "Enroll"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
