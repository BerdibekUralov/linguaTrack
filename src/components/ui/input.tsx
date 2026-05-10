"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, style, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn(
          "w-full rounded-xl px-3 py-2 text-sm transition-colors outline-none focus:ring-2",
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

Input.displayName = "Input";
