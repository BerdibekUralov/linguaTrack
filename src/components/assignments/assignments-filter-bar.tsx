"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

const SKILLS = [
  { value: "",              label: "All skills" },
  { value: "WRITING",       label: "✍️ Writing" },
  { value: "SPEAKING",      label: "🎤 Speaking" },
  { value: "LISTENING",     label: "🎧 Listening" },
  { value: "READING",       label: "📖 Reading" },
  { value: "GRAMMAR",       label: "📝 Grammar" },
  { value: "VOCABULARY",    label: "📚 Vocabulary" },
  { value: "USE_OF_ENGLISH",label: "🔤 Use of English" },
  { value: "MIXED",         label: "🔀 Mixed" },
];

const TEACHER_STATUSES = [
  { value: "",        label: "All statuses" },
  { value: "ACTIVE",  label: "Active" },
  { value: "DRAFT",   label: "Draft" },
  { value: "CLOSED",  label: "Closed" },
];

const STUDENT_STATUSES = [
  { value: "",          label: "All" },
  { value: "pending",   label: "Pending" },
  { value: "submitted", label: "Submitted" },
  { value: "overdue",   label: "Overdue" },
];

const SORT_OPTIONS = [
  { value: "newest",  label: "Newest first" },
  { value: "oldest",  label: "Oldest first" },
  { value: "dueDate", label: "Due date" },
  { value: "title",   label: "Title A–Z" },
];

interface Props {
  role: string;
  total: number;
}

export function AssignmentsFilterBar({ role, total }: Props) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const skill  = searchParams.get("skill")  ?? "";
  const status = searchParams.get("status") ?? "";
  const sort   = searchParams.get("sort")   ?? "newest";
  const q      = searchParams.get("q")      ?? "";

  const push = useCallback(
    (updates: Record<string, string>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) p.set(k, v);
        else p.delete(k);
      });
      startTransition(() => router.push(`${pathname}?${p.toString()}`));
    },
    [router, pathname, searchParams],
  );

  const hasFilters = skill || status || q || sort !== "newest";
  const statuses   = role === "TEACHER" ? TEACHER_STATUSES : STUDENT_STATUSES;

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {/* Row 1: search + sort + clear */}
      <div className="flex gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
            style={{ color: "var(--text-3)" }}
          />
          <input
            type="text"
            placeholder="Search assignments…"
            defaultValue={q}
            onChange={(e) => push({ q: e.target.value })}
            className="w-full rounded-xl py-2 pl-8 pr-3 text-sm outline-none transition-all"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <SlidersHorizontal
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
            style={{ color: "var(--text-3)" }}
          />
          <select
            value={sort}
            onChange={(e) => push({ sort: e.target.value })}
            className="rounded-xl py-2 pl-8 pr-8 text-sm outline-none appearance-none cursor-pointer"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={() => router.push(pathname)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors"
            style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Row 2: Skill pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {SKILLS.map((s) => {
          const active = skill === s.value;
          return (
            <button
              key={s.value}
              onClick={() => push({ skill: s.value })}
              className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all whitespace-nowrap"
              style={{
                background: active ? "var(--primary)" : "var(--surface-2)",
                color:      active ? "#fff"             : "var(--text-2)",
                border:     active ? "1px solid var(--primary)" : "1px solid transparent",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Row 3: Status pills + result count */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {statuses.map((s) => {
            const active = status === s.value;
            return (
              <button
                key={s.value}
                onClick={() => push({ status: s.value })}
                className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  background: active ? "var(--accent)"    : "var(--surface-2)",
                  color:      active ? "#fff"              : "var(--text-2)",
                  border:     active ? "1px solid var(--accent)" : "1px solid transparent",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <span className="shrink-0 text-xs" style={{ color: "var(--text-3)" }}>
          {total} result{total !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
