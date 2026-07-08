"use client";

import { useEffect, useState } from "react";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Loader2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { InsightList } from "@/components/dashboard/InsightCard";
import { FinancialScoreGauge } from "@/components/dashboard/FinancialScoreGauge";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        const [sumData, insData, txData] = await Promise.all([
          api.get<any>("/dashboard/summary", token),
          api.get<any[]>("/dashboard/insights", token),
          api.get<any[]>("/transactions?limit=6", token),
        ]);
        setSummary(sumData);
        setInsights(insData);
        setTransactions(txData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-moss-400" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Linha 1: Cards de métricas ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Saldo atual"
          value={summary.current_balance}
          change={0}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Receita do mês"
          value={summary.monthly_income}
          change={0}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Despesas do mês"
          value={summary.monthly_expenses}
          change={0}
          icon={<TrendingDown className="h-5 w-5" />}
          invertColor
        />
        <StatCard
          label="Economia do mês"
          value={summary.monthly_savings}
          change={0}
          icon={<PiggyBank className="h-5 w-5" />}
        />
      </div>

      {/* ── Linha 2: Gráficos ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CashFlowChart data={summary.cash_flow} className="lg:col-span-2" />
        <CategoryPieChart data={summary.top_categories} />
      </div>

      {/* ── Linha 3: Score + Insights ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FinancialScoreGauge score={summary.financial_health_score} />
        <InsightList insights={insights} className="lg:col-span-2" />
      </div>

      {/* ── Linha 4: Transações recentes ─────────────────────────────────── */}
      <RecentTransactions transactions={transactions} />
    </div>
  );
}
