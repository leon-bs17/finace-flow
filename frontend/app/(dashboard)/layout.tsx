"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Layout do grupo (dashboard) — envolve todas as páginas internas.
 * Sidebar fixa em desktop, drawer em mobile via Header.
 * Protege as rotas — redireciona para /login se não autenticado.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
    }
  }, [loading, token, router]);

  if (loading || !token) {
    return null; // evita flash de conteúdo protegido
  }

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {/* Sidebar — visível apenas em lg+ */}
      <Sidebar className="hidden lg:flex shrink-0" />

      {/* Coluna principal */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-6"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

