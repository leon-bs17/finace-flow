/**
 * components/ui/card.tsx — Card base do FinanceFlow.
 * Glassmorphism sutil com borda fina e sombra soft.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adiciona padding interno padrão. Default: true */
  padded?: boolean;
  /** Destaca o card com borda em verde-musgo */
  highlighted?: boolean;
  /** Torna o card interativo (hover + cursor pointer) */
  interactive?: boolean;
}

export function Card({
  className,
  padded = true,
  highlighted = false,
  interactive = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-surface shadow-soft transition-all duration-200",
        "border-border",
        padded && "p-5",
        highlighted && "border-moss-500/60 ring-1 ring-moss-500/20",
        interactive &&
          "cursor-pointer hover:border-border/80 hover:shadow-lg hover:-translate-y-px active:translate-y-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-start justify-between gap-3 mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-sm font-medium text-ink-muted leading-none", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardValue({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-2xl font-semibold text-ink font-display figure mt-1", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-4 pt-4 border-t border-border flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}
