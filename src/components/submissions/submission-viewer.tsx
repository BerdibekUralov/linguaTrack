"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

interface Props {
  content: string;
  skillType?: string;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function SubmissionViewer({ content, skillType }: Props) {
  const [expanded, setExpanded] = useState(false);

  const isWriting = !skillType || skillType === "WRITING";
  const wordCount = isWriting ? countWords(content) : null;

  // Show expand/collapse only if content is long (> ~300 chars / ~4 lines)
  const isLong = content.length > 300;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      {/* Header bar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}
      >
        <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-3)" }} />
        <span className="text-xs font-medium" style={{ color: "var(--text-3)" }}>Student answer</span>
        {wordCount !== null && (
          <span
            className="ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{
              background: wordCount >= 150 ? "var(--success-bg)" : "var(--warning-bg)",
              color:      wordCount >= 150 ? "var(--success)"    : "var(--warning)",
            }}
          >
            {wordCount} words
          </span>
        )}
      </div>

      {/* Content */}
      <div className="relative">
        <div
          className="px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed"
          style={{
            color: "var(--text-2)",
            maxHeight: expanded || !isLong ? "none" : "200px",
            overflow: "hidden",
          }}
        >
          {content}
        </div>

        {/* Gradient fade when collapsed */}
        {isLong && !expanded && (
          <div
            className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, transparent, var(--surface))",
            }}
          />
        )}
      </div>

      {/* Expand / Collapse toggle */}
      {isLong && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition hover:opacity-80"
          style={{
            borderTop: "1px solid var(--border)",
            color: "var(--primary)",
            background: "var(--surface-2)",
          }}
        >
          {expanded ? (
            <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" /> Show full answer</>
          )}
        </button>
      )}
    </div>
  );
}
