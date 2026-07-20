"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UploadCloud, Loader2 } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Using fetch instead of api.ts because api.ts assumes JSON payload usually, 
      // and here we are sending FormData (multipart/form-data)
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/v1/upload/statement", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erro ao enviar arquivo");
      }

      const data = await res.json();
      onSuccess(data);
      onClose();
      setFile(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro ao processar o extrato");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setFile(null);
        onClose();
      }
    }}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Importar Extrato</ModalTitle>
          <ModalDescription>
            Faça upload do seu extrato bancário (CSV, OFX, XLSX, ou PDF). A IA irá categorizar automaticamente as transações para você.
          </ModalDescription>
        </ModalHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 bg-surface hover:bg-elevated transition-colors cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".csv,.xlsx,.xls,.ofx,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <UploadCloud className="h-10 w-10 text-moss-400 mb-2" />
            <p className="text-sm font-medium text-ink">
              {file ? file.name : "Clique ou arraste o arquivo aqui"}
            </p>
            <p className="text-xs text-ink-muted mt-1">CSV, OFX, XLSX, PDF</p>
          </div>
          
          <ModalFooter className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => { setFile(null); onClose(); }} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={!file || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  Enviando...
                </>
              ) : (
                "Importar"
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
