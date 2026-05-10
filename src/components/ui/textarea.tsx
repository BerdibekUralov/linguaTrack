"use client";

import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, style, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        className={cn(
          "w-full rounded-xl px-3 py-2 text-sm transition-colors outline-none focus:ring-2 resize-none",
          error && "ring-1 ring-red-400",
          className
        )}
        style={{
          background: "var(--surface-2)",
          border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
          color: "var(--text)",
          ...style,
        }}
        {...props}
      />
      {error && <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>}
    </div>
  )
);

Textarea.displayName = "Textarea";
