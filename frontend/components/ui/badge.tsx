/**
 * components/ui/badge.tsx — Badge/pill de categorias e status.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "positive"
  | "negative"
  | "warning"
  | "info"
  | "muted";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface border-border text-ink",
  positive: "bg-moss-500/15 border-moss-500/30 text-moss-400",
  negative: "bg-rose-500/15 border-rose-500/30 text-rose-400",
  warning: "bg-amber-400/15 border-amber-400/30 text-amber-400",
  info: "bg-blue-500/15 border-blue-500/30 text-blue-400",
  muted: "bg-surface border-border text-ink-muted",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-ink-muted",
  positive: "bg-moss-400",
  negative: "bg-rose-400",
  warning: "bg-amber-400",
  info: "bg-blue-400",
  muted: "bg-ink-muted",
};

export function Badge({
  className,
  variant = "default",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "text-xs font-medium leading-none whitespace-nowrap",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
