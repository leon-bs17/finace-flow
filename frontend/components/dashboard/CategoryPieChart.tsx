"use client";

/**
 * components/dashboard/CategoryPieChart.tsx — Pizza de distribuição de gastos.
 */
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

interface CategoryPieChartProps {
  data: CategoryBreakdown[];
  className?: string;
}

// Paleta harmonizada com o design system
const COLORS = [
  "#2FA36B", // moss-500
  "#5FBE7E", // moss-400
  "#E8A33D", // amber-400
  "#E2716B", // rose-400
  "#60A5FA", // blue-400
  "#A78BFA", // violet-400
];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-xl border border-border bg-elevated p-3 shadow-soft text-xs">
      <p className="font-semibold text-ink">{entry.name}</p>
      <p className="text-ink-muted mt-1">
        {formatCurrency(entry.value)}{" "}
        <span className="text-moss-400">({entry.payload.percentage}%)</span>
      </p>
    </div>
  );
}

export function CategoryPieChart({ data, className }: CategoryPieChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Categorias</CardTitle>
        <p className="text-xs text-ink-muted">Este mês</p>
      </CardHeader>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={80}
              strokeWidth={2}
              stroke="transparent"
              paddingAngle={2}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Legenda lateral */}
        <ul className="flex-1 flex flex-col gap-2 w-full">
          {data.slice(0, 6).map((item, index) => (
            <li key={item.category} className="flex items-center gap-2.5">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: COLORS[index % COLORS.length] }}
                aria-hidden="true"
              />
              <span className="flex-1 text-xs text-ink truncate">{item.category}</span>
              <span className="text-xs font-medium text-ink-muted figure tabular-nums">
                {formatPercent(item.percentage)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
