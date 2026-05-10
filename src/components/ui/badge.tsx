import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  className?: string;
}

// Using explicit colors so badges are readable in both light and dark modes
const variantStyles: Record<string, React.CSSProperties> = {
  default: { background: "var(--surface-2)",     color: "var(--text-2)" },
  success: { background: "#dcfce7",               color: "#15803d" },
  warning: { background: "#fef3c7",               color: "#92400e" },
  danger:  { background: "#fee2e2",               color: "#b91c1c" },
  info:    { background: "#dbeafe",               color: "#1d4ed8" },
  purple:  { background: "#ede9fe",               color: "#6d28d9" },
};

// Dark-mode-aware: if you use the `.dark` class, these colours are too light — so we override them
const darkStyles: Record<string, React.CSSProperties> = {
  success: { background: "#166534", color: "#86efac" },
  warning: { background: "#78350f", color: "#fde68a" },
  danger:  { background: "#7f1d1d", color: "#fca5a5" },
  info:    { background: "#1e3a8a", color: "#93c5fd" },
  purple:  { background: "#4c1d95", color: "#c4b5fd" },
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", className)}
      style={variantStyles[variant]}
      // Note: for proper dark mode we'd need a client component — these colours work for light mode.
      // The semantic colours above have sufficient contrast in light mode.
    >
      {children}
    </span>
  );
}
