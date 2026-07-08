"use client";

/**
 * components/dashboard/CashFlowChart.tsx — Gráfico de barras empilhadas
 * mostrando Receita vs Despesas nos últimos 6 meses.
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { abbreviateNumber } from "@/lib/utils";

export interface CashFlowPoint {
  label: string;
  income: number;
  expenses: number;
}

interface CashFlowChartProps {
  data: CashFlowPoint[];
  className?: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-elevated p-3 shadow-soft text-xs">
      <p className="font-semibold text-ink mb-2">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: entry.color }} />
          {entry.name === "income" ? "Receita" : "Despesas"}:{" "}
          <span className="font-medium figure tabular-nums">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(entry.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

export function CashFlowChart({ data, className }: CashFlowChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
        <p className="text-xs text-ink-muted">Últimos 6 meses</p>
      </CardHeader>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={24} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#8FA398", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `R$${abbreviateNumber(v)}`}
            tick={{ fill: "#8FA398", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="income" name="income" fill="#2FA36B" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="expenses" fill="#CC584F" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      {/* Legenda manual para controle do estilo */}
      <div className="flex items-center gap-4 mt-3 px-1">
        <span className="flex items-center gap-1.5 text-xs text-ink-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-moss-500" />
          Receita
        </span>
        <span className="flex items-center gap-1.5 text-xs text-ink-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          Despesas
        </span>
      </div>
    </Card>
  );
}
