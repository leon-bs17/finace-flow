"use client";

import { useEffect, useState } from "react";
import { CreditCard, AlertCircle, TrendingUp, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionModal } from "@/components/dashboard/SubscriptionModal";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const data = await api.get<any[]>("/subscriptions", token);
        setSubscriptions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);

  function handleOpenModal(subscription: any = null) {
    setSelectedSubscription(subscription);
    setModalOpen(true);
  }

  function handleModalSuccess() {
    if (!token) return;
    setLoading(true);
    api.get<any[]>("/subscriptions", token).then((data) => {
      setSubscriptions(data);
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

  const totalMonthly = subscriptions.reduce((s, sub) => s + sub.monthly_cost, 0);
  const unusedCount = subscriptions.filter((s) => !s.is_active).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">Assinaturas</h1>
        <Button variant="primary" size="md" onClick={() => handleOpenModal()}>
          Nova assinatura
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-moss-500/15 text-moss-400 shrink-0">
            <CreditCard className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-ink-muted">Total mensal</p>
            <p className="text-xl font-semibold text-ink figure tabular-nums">{formatCurrency(totalMonthly)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 shrink-0">
            <AlertCircle className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-ink-muted">Não utilizadas</p>
            <p className="text-xl font-semibold text-ink">{unusedCount} assinaturas</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-ink-muted">Gasto anual</p>
            <p className="text-xl font-semibold text-ink figure tabular-nums">
              {formatCurrency(totalMonthly * 12)}
            </p>
          </div>
        </Card>
      </div>

      {/* Lista de assinaturas */}
      {subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-muted">
          <CreditCard className="h-12 w-12 opacity-30" />
          <p className="text-sm">Nenhuma assinatura detectada ainda.</p>
          <p className="text-xs">Importe seus extratos para detectar assinaturas automaticamente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="flex flex-col gap-3 cursor-pointer hover:bg-elevated transition-colors" onClick={() => handleOpenModal(sub)}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink">{sub.merchant}</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {sub.next_renewal ? (
                      <>Renova em{" "}{new Date(sub.next_renewal).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</>
                    ) : "Sem data de renovação"}
                  </p>
                </div>
                <Badge variant={sub.is_active ? "positive" : "warning"} dot>
                  {sub.is_active ? "Ativa" : "Não usada"}
                </Badge>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-ink figure tabular-nums">
                    {formatCurrency(sub.monthly_cost)}
                    <span className="text-sm font-normal text-ink-muted">/mês</span>
                  </p>
                  <p className="text-xs text-ink-muted">
                    {formatCurrency(sub.yearly_cost)}/ano
                  </p>
                </div>
                {sub.price_increased && (
                  <Badge variant="negative" dot>
                    Aumento detectado
                  </Badge>
                )}
              </div>

              {!sub.is_active && (
                <Button variant="outline" size="sm" className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50" onClick={(e) => { e.stopPropagation(); handleOpenModal(sub); }}>
                  Editar Assinatura
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
      
      <SubscriptionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={handleModalSuccess} 
        subscription={selectedSubscription} 
      />
    </div>
  );
}
