"use client";

import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction?: any | null; // se passado, é modo de edição
}

export function TransactionModal({ isOpen, onClose, onSuccess, transaction }: TransactionModalProps) {
  const [description, setDescription] = useState("");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description || "");
      setMerchant(transaction.merchant || "");
      setAmount(Math.abs(transaction.amount).toString());
      setDate(transaction.date || "");
    } else {
      setDescription("");
      setMerchant("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [transaction, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !user) return;
    setLoading(true);

    try {
      const numAmount = parseFloat(amount.replace(",", "."));
      const isExpense = numAmount > 0 && !description.toLowerCase().includes("salário"); // heurística simples
      const finalAmount = isExpense ? -Math.abs(numAmount) : Math.abs(numAmount);
      
      const payload = {
        description,
        merchant: merchant || description,
        amount: finalAmount,
        date,
      };

      if (transaction) {
        await api.put(`/transactions/${transaction.id}`, payload, token);
      } else {
        await api.post("/transactions", payload, token);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar transação");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!token || !transaction) return;
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;
    setLoading(true);
    try {
      await api.delete(`/transactions/${transaction.id}`, token);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir transação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{transaction ? "Editar Transação" : "Nova Transação"}</ModalTitle>
          <ModalDescription>
            {transaction ? "Altere os dados da transação abaixo." : "Adicione uma nova entrada ou saída manual."}
          </ModalDescription>
        </ModalHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Input 
            label="Descrição" 
            placeholder="Ex: Compra no supermercado" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Input 
            label="Estabelecimento (Merchant)" 
            placeholder="Ex: Pão de Açúcar" 
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Valor (R$)" 
              type="number"
              step="0.01"
              placeholder="0.00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <Input 
              label="Data" 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          
          <ModalFooter className="pt-4 flex justify-between items-center sm:justify-between">
            {transaction ? (
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
