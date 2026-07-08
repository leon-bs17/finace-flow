"use client";

/**
 * components/dashboard/StatCard.tsx — Card de métrica financeira principal.
 * Exibe: label, valor, variação percentual vs período anterior, ícone.
 */
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: number;
  change?: number; // % de variação vs mês anterior
  icon: React.ReactNode;
  currency?: string;
  /** Inverte a lógica de cor (ex: despesas — menos é melhor) */
  invertColor?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  icon,
  currency = "BRL",
  invertColor = false,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined ? change > 0 : null;
  const isNeutral = change === 0 || change === undefined;

  // Em despesas (invertColor=true), queda é boa, alta é ruim
  const colorIsGood = invertColor ? !isPositive : isPositive;

  return (
    <Card className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-ink-muted leading-snug">{label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-elevated text-ink-muted">
          {icon}
        </span>
      </div>

      <p className="text-2xl font-semibold text-ink font-display figure mt-0.5 tabular-nums">
        {formatCurrency(value, currency)}
      </p>

      {!isNeutral && change !== undefined && (
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            colorIsGood ? "text-moss-400" : "text-rose-400"
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{formatPercent(Math.abs(change), false)} vs mês passado</span>
        </div>
      )}
      {isNeutral && (
        <div className="flex items-center gap-1 text-xs font-medium text-ink-muted">
          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Sem variação</span>
        </div>
      )}
    </Card>
  );
}
