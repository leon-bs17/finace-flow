"use client";

import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal?: Record<string, any> | null; // se passado, é edição
}

export function GoalModal({ isOpen, onClose, onSuccess, goal }: GoalModalProps) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (goal) {
      setName(goal.name || "");
      setTargetAmount(goal.target_amount?.toString() || "");
      setCurrentAmount(goal.current_amount?.toString() || "0");
      setTargetDate(goal.target_date || "");
      setIcon(goal.icon || "🎯");
    } else {
      setName("");
      setTargetAmount("");
      setCurrentAmount("0");
      setTargetDate("");
      setIcon("🎯");
    }
  }, [goal, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setLoading(true);

    try {
      const payload = {
        name,
        target_amount: parseFloat(targetAmount.replace(",", ".")),
        current_amount: parseFloat(currentAmount.replace(",", ".")),
        target_date: targetDate || null,
        icon,
      };

      if (goal) {
        await api.put(`/goals/${goal.id}`, payload, token);
      } else {
        await api.post("/goals", payload, token);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar meta");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!token || !goal) return;
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;
    setLoading(true);
    try {
      await api.delete(`/goals/${goal.id}`, token);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir meta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{goal ? "Editar Meta" : "Nova Meta"}</ModalTitle>
          <ModalDescription>
            {goal ? "Altere os dados da sua meta." : "Defina um objetivo financeiro e acompanhe o seu progresso."}
          </ModalDescription>
        </ModalHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-[3rem_1fr] gap-4">
            <Input 
              label="Ícone" 
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="text-center"
            />
            <Input 
              label="Nome da Meta" 
              placeholder="Ex: Viagem para Europa" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Valor Alvo (R$)" 
              type="number"
              step="0.01"
              placeholder="0.00" 
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
            <Input 
              label="Valor Guardado (R$)" 
              type="number"
              step="0.01"
              placeholder="0.00" 
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
            />
          </div>

          <Input 
            label="Data Alvo (Opcional)" 
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
          
          <ModalFooter className={`pt-4 flex items-center ${goal ? "justify-between" : "justify-end"} sm:${goal ? "justify-between" : "justify-end"}`}>
            {goal && (
              <Button variant="outline" type="button" onClick={handleDelete} disabled={loading} className="text-rose-500 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400">
                Excluir
              </Button>
            )}
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
