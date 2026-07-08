"use client";

/**
 * components/dashboard/InsightCard.tsx — Card de insight gerado pela IA.
 * Tipos: warning (laranja), positive (verde), tip (azul).
 */
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  PiggyBank,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type InsightKind = "warning" | "positive" | "tip";
export type InsightIcon =
  | "trending-up"
  | "trending-down"
  | "credit-card"
  | "piggy-bank"
  | "alert-triangle"
  | "sparkles";

export interface Insight {
  id: string;
  message: string;
  kind: InsightKind;
  icon: InsightIcon;
}

interface InsightCardProps {
  insight: Insight;
}

const ICON_MAP: Record<InsightIcon, React.ElementType> = {
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "credit-card": CreditCard,
  "piggy-bank": PiggyBank,
  "alert-triangle": AlertTriangle,
  sparkles: Sparkles,
};

const KIND_STYLES: Record<InsightKind, { bg: string; border: string; icon: string }> = {
  warning: {
    bg: "bg-amber-400/8",
    border: "border-amber-400/25",
    icon: "text-amber-400 bg-amber-400/15",
  },
  positive: {
    bg: "bg-moss-500/8",
    border: "border-moss-500/25",
    icon: "text-moss-400 bg-moss-500/15",
  },
  tip: {
    bg: "bg-blue-500/8",
    border: "border-blue-500/25",
    icon: "text-blue-400 bg-blue-500/15",
  },
};

export function InsightCard({ insight }: InsightCardProps) {
  const Icon = ICON_MAP[insight.icon] ?? Sparkles;
  const styles = KIND_STYLES[insight.kind];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3.5 transition-colors",
        styles.bg,
        styles.border
      )}
      role="listitem"
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          styles.icon
        )}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-sm text-ink leading-relaxed pt-0.5">{insight.message}</p>
    </div>
  );
}

/** Lista de insights com header e badge de count. */
interface InsightListProps {
  insights: Insight[];
  className?: string;
}

export function InsightList({ insights, className }: InsightListProps) {
  if (!insights.length) return null;
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-5 shadow-soft", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-moss-400" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-ink">Insights da IA</h3>
        <span className="ml-auto rounded-full bg-moss-500/20 px-2 py-0.5 text-[10px] font-semibold text-moss-400 leading-none">
          {insights.length}
        </span>
      </div>
      <div role="list" className="flex flex-col gap-2">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}
