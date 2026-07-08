"use client";

/**
 * components/dashboard/RecentTransactions.tsx
 * Lista das transações mais recentes com categoria, merchant e valor.
 */
import { ArrowDownLeft, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Transaction {
  id: string;
  description: string;
  merchant?: string;
  category?: string;
  category_name?: string; // from API
  amount: number;
  direction: "income" | "expense";
  date: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  className?: string;
}

function CategoryDot({ category }: { category?: string }) {
  const colors: Record<string, string> = {
    Alimentação: "bg-amber-400",
    Transporte: "bg-blue-400",
    Moradia: "bg-violet-400",
    Compras: "bg-rose-400",
    Assinaturas: "bg-moss-400",
    Entretenimento: "bg-pink-400",
    Saúde: "bg-teal-400",
    Educação: "bg-indigo-400",
    Salário: "bg-moss-500",
    Freelance: "bg-moss-400",
    Contas: "bg-orange-400",
    Investimentos: "bg-cyan-400",
  };
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full shrink-0",
        colors[category ?? ""] ?? "bg-ink-muted"
      )}
      aria-hidden="true"
    />
  );
}

export function RecentTransactions({ transactions, className }: RecentTransactionsProps) {
  return (
    <Card className={cn("", className)} padded={false}>
      <CardHeader className="px-5 pt-5 mb-0">
        <CardTitle>Transações recentes</CardTitle>
        <Button variant="ghost" size="sm" className="text-moss-400 -mr-1">
          Ver todas
        </Button>
      </CardHeader>

      <ul role="list" className="divide-y divide-border">
        {transactions.map((txn) => (
          <li
            key={txn.id}
            className="flex items-center gap-3 px-5 py-3 hover:bg-elevated transition-colors"
          >
            {/* Ícone de direção */}
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                txn.direction === "income"
                  ? "bg-moss-500/15 text-moss-400"
                  : "bg-rose-500/15 text-rose-400"
              )}
              aria-label={txn.direction === "income" ? "Receita" : "Despesa"}
            >
              {txn.direction === "income" ? (
                <ArrowDownLeft className="h-4 w-4" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
            </span>

            {/* Descrição e categoria */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">
                {txn.merchant ?? txn.description}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CategoryDot category={txn.category_name ?? txn.category} />
                <span className="text-xs text-ink-muted truncate">{txn.category_name ?? txn.category ?? "Sem categoria"}</span>
                <span className="text-xs text-ink-muted">·</span>
                <span className="text-xs text-ink-muted">
                  {new Date(txn.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </span>
              </div>
            </div>

            {/* Valor */}
            <p
              className={cn(
                "text-sm font-semibold figure tabular-nums shrink-0",
                txn.direction === "income" ? "text-moss-400" : "text-ink"
              )}
            >
              {txn.direction === "income" ? "+" : "-"}
              {formatCurrency(Math.abs(txn.amount))}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
