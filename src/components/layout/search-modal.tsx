"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, BookOpen, FileText, ArrowRight, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  type: "assignment" | "submission";
  title: string;
  subtitle: string;
  href: string;
}

interface Props { open: boolean; onClose: () => void }

export function SearchModal({ open, onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive]   = useState(0);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery(""); setResults([]); setActive(0);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) { const data = await res.json() as SearchResult[]; setResults(data); setActive(0); }
      } catch { /* ignore */ } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const navigate = useCallback((href: string) => { router.push(href); onClose(); }, [router, onClose]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      if (e.key === "Enter" && results[active]) { navigate(results[active].href); }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, results, active, onClose, navigate]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="animate-slide-down w-full max-w-[600px] mx-4 rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <Search className="h-5 w-5 shrink-0" style={{ color: "var(--text-3)" }} />
          <input
            ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assignments and submissions..."
            className="flex-1 bg-transparent text-base outline-none"
            style={{ color: "var(--text)" }}
          />
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0" style={{ color: "var(--text-3)" }} />
          ) : query ? (
            <button onClick={() => setQuery("")} style={{ color: "var(--text-3)" }}><X className="h-4 w-4" /></button>
          ) : null}
        </div>

        {/* Keyboard hints */}
        <div className="flex items-center gap-4 px-5 py-2.5" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
          {[{ key: "↑↓", label: "navigate" }, { key: "↵", label: "open" }, { key: "Esc", label: "close" }].map(({ key, label }) => (
            <span key={key} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-3)" }}>
              <kbd>{key}</kbd> {label}
            </span>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto">
          {!query.trim() ? (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: "var(--text-3)" }}>
              <Search className="mb-3 h-10 w-10 opacity-20" />
              <p className="text-sm">Search assignments and submissions</p>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="py-12 text-center text-sm" style={{ color: "var(--text-3)" }}>
              No results for &quot;{query}&quot;
            </div>
          ) : (
            <div className="py-2">
              {results.map((r, i) => (
                <button
                  key={r.id} onClick={() => navigate(r.href)} onMouseEnter={() => setActive(i)}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors"
                  style={{ background: active === i ? "var(--primary-bg)" : undefined }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: r.type === "assignment" ? "#eef2ff" : "#f0fdf4", color: r.type === "assignment" ? "#6366f1" : "#16a34a" }}>
                    {r.type === "assignment" ? <BookOpen className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{r.title}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{r.subtitle}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0" style={{ color: "var(--text-3)" }} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
