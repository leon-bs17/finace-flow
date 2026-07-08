"use client";

/**
 * components/dashboard/FinancialScoreGauge.tsx
 * Gauge semicircular mostrando o Score de Saúde Financeira (0–100).
 * Colorido: vermelho (0-40) → laranja (40-70) → verde (70-100).
 */
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface FinancialScoreGaugeProps {
  score: number; // 0–100
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#2FA36B"; // moss-500
  if (score >= 45) return "#E8A33D"; // amber-400
  return "#CC584F"; // rose-500
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excelente";
  if (score >= 65) return "Bom";
  if (score >= 45) return "Regular";
  if (score >= 25) return "Atenção";
  return "Crítico";
}

/** Converte o score (0-100) em ângulo para o arco SVG (0-180 graus). */
function scoreToAngle(score: number): number {
  return (Math.min(Math.max(score, 0), 100) / 100) * 180;
}

/** Calcula o ponto final do arco em coordenadas SVG (cx=100, cy=100, r=72). */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 180) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

export function FinancialScoreGauge({ score, className }: FinancialScoreGaugeProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const angle = scoreToAngle(score);

  const cx = 100;
  const cy = 100;
  const r = 72;

  const start = polarToCartesian(cx, cy, r, 0);
  const end = polarToCartesian(cx, cy, r, angle);
  const largeArc = angle > 180 ? 1 : 0;

  const arcPath = `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;

  return (
    <Card className={cn("flex flex-col items-center text-center", className)}>
      <p className="text-sm font-medium text-ink-muted mb-3">Score Financeiro</p>
      <div className="relative w-48 select-none" aria-label={`Score financeiro: ${score} de 100, ${label}`}>
        <svg viewBox="0 30 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Trilha de fundo */}
          <path
            d={`M ${polarToCartesian(cx, cy, r, 0).x} ${polarToCartesian(cx, cy, r, 0).y} A ${r} ${r} 0 1 1 ${polarToCartesian(cx, cy, r, 180).x} ${polarToCartesian(cx, cy, r, 180).y}`}
            stroke="#233029"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
          {/* Arco preenchido */}
          {angle > 2 && (
            <path
              d={arcPath}
              stroke={color}
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
              style={{
                filter: `drop-shadow(0 0 8px ${color}60)`,
                transition: "stroke-dashoffset 0.8s ease",
              }}
            />
          )}
          {/* Valor central */}
          <text
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            fontSize="28"
            fontWeight="700"
            fontFamily="var(--font-display)"
            fill="#EAF2ED"
          >
            {score}
          </text>
          <text
            x={cx}
            y={cy + 20}
            textAnchor="middle"
            fontSize="11"
            fill="#8FA398"
            fontFamily="var(--font-sans)"
          >
            de 100
          </text>
        </svg>
      </div>
      <span
        className={cn(
          "mt-1 rounded-full px-3 py-1 text-xs font-semibold",
          score >= 75 && "bg-moss-500/15 text-moss-400",
          score >= 45 && score < 75 && "bg-amber-400/15 text-amber-400",
          score < 45 && "bg-rose-500/15 text-rose-400"
        )}
      >
        {label}
      </span>
    </Card>
  );
}
