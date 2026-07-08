"use client";

import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscription?: any | null;
}

export function SubscriptionModal({ isOpen, onClose, onSuccess, subscription }: SubscriptionModalProps) {
  const [merchant, setMerchant] = useState("");
  const [monthlyCost, setMonthlyCost] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [nextRenewal, setNextRenewal] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (subscription) {
      setMerchant(subscription.merchant || "");
      setMonthlyCost(subscription.monthly_cost?.toString() || "");
      setBillingCycle(subscription.billing_cycle || "monthly");
      setNextRenewal(subscription.next_renewal || "");
      setIsActive(subscription.is_active ?? true);
    } else {
      setMerchant("");
      setMonthlyCost("");
      setBillingCycle("monthly");
      setNextRenewal("");
      setIsActive(true);
    }
  }, [subscription, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setLoading(true);

    try {
      const numCost = parseFloat(monthlyCost.replace(",", "."));
      const payload = {
        merchant,
        monthly_cost: numCost,
        yearly_cost: numCost * (billingCycle === "monthly" ? 12 : 1),
        billing_cycle: billingCycle,
        next_renewal: nextRenewal || null,
        is_active: isActive,
      };

      if (subscription) {
        await api.put(`/subscriptions/${subscription.id}`, payload, token);
      } else {
        await api.post("/subscriptions", payload, token);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar assinatura");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!token || !subscription) return;
    if (!confirm("Tem certeza que deseja excluir esta assinatura? (Você também pode apenas desativá-la)")) return;
    setLoading(true);
    try {
      await api.delete(`/subscriptions/${subscription.id}`, token);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir assinatura");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{subscription ? "Editar Assinatura" : "Nova Assinatura"}</ModalTitle>
          <ModalDescription>
            {subscription ? "Altere os dados da sua assinatura." : "Adicione manualmente uma assinatura para acompanhar seus gastos."}
          </ModalDescription>
        </ModalHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Input 
            label="Serviço (Merchant)" 
            placeholder="Ex: Netflix, Spotify" 
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Custo Mensal (R$)" 
              type="number"
              step="0.01"
              placeholder="0.00" 
              value={monthlyCost}
              onChange={(e) => setMonthlyCost(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink block">Status</label>
              <select 
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-moss-500"
                value={isActive ? "active" : "inactive"}
                onChange={(e) => setIsActive(e.target.value === "active")}
              >
                <option value="active">Ativa</option>
                <option value="inactive">Cancelada/Inativa</option>
              </select>
            </div>
          </div>

          <Input 
            label="Data de Renovação (Opcional)" 
            type="date"
            value={nextRenewal}
            onChange={(e) => setNextRenewal(e.target.value)}
          />
          
          <ModalFooter className="pt-4 flex justify-between items-center sm:justify-between">
            {subscription ? (
              <Button variant="outline" type="button" onClick={handleDelete} disabled={loading} className="text-rose-500 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400">
                Excluir
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
