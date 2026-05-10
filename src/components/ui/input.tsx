"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, type, style, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    const inputType  = isPassword ? (show ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={inputType}
            className={cn(
              "w-full rounded-xl px-3 py-2 text-sm transition-colors outline-none focus:ring-2",
              isPassword && "pr-10",
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
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
              style={{ color: "var(--text-3)" }}
              tabIndex={-1}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error && <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
