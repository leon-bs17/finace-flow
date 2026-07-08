"use client";

import { useEffect, useState } from "react";
import { Target, Plus, Calendar, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { GoalModal } from "@/components/dashboard/GoalModal";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const data = await api.get<any[]>("/goals", token);
        setGoals(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  function handleOpenModal(goal: any = null) {
    setSelectedGoal(goal);
    setModalOpen(true);
  }

  function handleModalSuccess() {
    if (!token) return;
    setLoading(true);
    api.get<any[]>("/goals", token).then((data) => {
      setGoals(data);
      setLoading(false);
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-moss-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {goals.length} metas ativas · Você já economizou{" "}
          <span className="text-moss-400 font-semibold">
            {formatCurrency(goals.reduce((s, g) => s + g.current_amount, 0))}
          </span>
        </p>
        <Button variant="primary" size="md" onClick={() => handleOpenModal()} leftIcon={<Plus className="h-4 w-4" />}>
          Nova meta
        </Button>
      </div>

      {/* Grid de metas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const pct = goal.progress_percentage || 0;
          const remaining = Math.max(0, goal.target_amount - goal.current_amount);
          const done = pct >= 100;
          const color = goal.color || "#60A5FA"; // Fallback color

          return (
            <Card key={goal.id} interactive className="flex flex-col gap-4 cursor-pointer" onClick={() => handleOpenModal(goal)}>
              {/* Cabeçalho */}
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none" role="img" aria-label={goal.name}>
                  {goal.icon || "🎯"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink truncate">{goal.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-ink-muted">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {goal.target_date ? new Date(goal.target_date).toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    }) : "Sem data alvo"}
                  </div>
                </div>
                <Badge variant={done ? "positive" : "muted"}>
                  {done ? "✓ Concluída" : formatPercent(pct)}
                </Badge>
              </div>

              {/* Barra de progresso */}
              <div>
                <div className="h-2 w-full rounded-full bg-elevated overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: done ? "#2FA36B" : color,
                      boxShadow: `0 0 8px ${color}60`,
                    }}
                    role="progressbar"
                    aria-valuenow={Math.round(pct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>

              {/* Valores */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xl font-bold text-ink figure tabular-nums">
                    {formatCurrency(goal.current_amount)}
                  </p>
                  <p className="text-xs text-ink-muted">
                    de {formatCurrency(goal.target_amount)}
                  </p>
                </div>
                {!done && (
                  <p className="text-xs text-ink-muted">
                    Faltam{" "}
                    <span className="text-ink font-medium figure">{formatCurrency(remaining)}</span>
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      
      <GoalModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={handleModalSuccess} 
        goal={selectedGoal} 
      />
    </div>
  );
}
