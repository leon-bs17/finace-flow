"use client";

import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Search, SlidersHorizontal, Upload, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { TransactionModal } from "@/components/dashboard/TransactionModal";
import { UploadModal } from "@/components/dashboard/UploadModal";



export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      api.get<any[]>("/transactions/categories", token).then(setCategories).catch(console.error);
    }
  }, [token]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        let url = "/transactions";
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (selectedCategory) params.append("category_id", selectedCategory);
        if (params.toString()) url += `?${params.toString()}`;

        const data = await api.get<any[]>(url, token || undefined);
        setTransactions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      const timer = setTimeout(() => load(), 300);
      return () => clearTimeout(timer);
    }
  }, [token, search, selectedCategory, reloadTrigger]);

  const [modalOpen, setModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);

  function handleOpenModal(txn: any = null) {
    setSelectedTxn(txn);
    setModalOpen(true);
  }

  function handleModalSuccess() {
    setReloadTrigger(prev => prev + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header de ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Input
          placeholder="Buscar por descrição, merchant ou categoria..."
          leftElement={<Search className="h-4 w-4" />}
          className="flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="md" leftIcon={<SlidersHorizontal className="h-4 w-4" />}>
            Filtrar
          </Button>
          <Button variant="outline" size="md" onClick={() => setUploadModalOpen(true)} leftIcon={<Upload className="h-4 w-4" />}>
            Importar
          </Button>
          <Button variant="primary" size="md" onClick={() => handleOpenModal()} leftIcon={<ArrowUpRight className="h-4 w-4" />}>
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Filtros de categoria */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            selectedCategory === null
              ? "bg-moss-500/20 text-moss-400 border border-moss-500/30"
              : "bg-surface border border-border text-ink-muted hover:text-ink hover:border-border/80"
          }`}
        >
          Todas
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === cat.id
                ? "bg-moss-500/20 text-moss-400 border border-moss-500/30"
                : "bg-surface border border-border text-ink-muted hover:text-ink hover:border-border/80"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Lista */}
      <Card padded={false}>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-moss-400" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex items-center justify-center p-12 text-ink-muted text-sm">
            Nenhuma transação encontrada.
          </div>
        ) : (
          <ul role="list" className="divide-y divide-border">
            {transactions.map((txn) => (
              <li
                key={txn.id}
                onClick={() => handleOpenModal(txn)}
                className="flex items-center gap-3 px-5 py-4 hover:bg-elevated transition-colors cursor-pointer"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    txn.direction === "income"
                      ? "bg-moss-500/15 text-moss-400"
                      : "bg-rose-500/15 text-rose-400"
                  }`}
                >
                  {txn.direction === "income" ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{txn.description}</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {new Date(txn.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {txn.category_name && (
                  <Badge variant={txn.direction === "income" ? "positive" : "muted"} dot>
                    {txn.category_name}
                  </Badge>
                )}
                <p
                  className={`text-sm font-semibold figure tabular-nums shrink-0 ml-2 ${
                    txn.direction === "income" ? "text-moss-400" : "text-ink"
                  }`}
                >
                  {txn.direction === "income" ? "+" : "-"}
                  {formatCurrency(Math.abs(txn.amount))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <TransactionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={handleModalSuccess} 
        transaction={selectedTxn} 
      />
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={(result) => {
          alert(`Importação concluída: ${result.transactions_imported} inseridas, ${result.duplicates_skipped} duplicadas puladas.`);
          handleModalSuccess();
        }}
      />
    </div>
  );
}
