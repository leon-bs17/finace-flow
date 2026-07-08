"use client";

/**
 * components/layout/Header.tsx — Cabeçalho superior do dashboard.
 * Contém: título da página, toggle dark/light, sino de notificações, avatar.
 */
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sun, Moon, Bell, Menu, X, Search, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";
import { useLocale } from "@/contexts/LocaleContext";


interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const { t } = useLocale();
  const [isDark, setIsDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const PAGE_TITLE_KEYS: Record<string, string> = {
    "/dashboard": "nav.dashboard",
    "/transactions": "nav.transactions",
    "/subscriptions": "nav.subscriptions",
    "/goals": "nav.goals",
    "/chat": "nav.chat",
    "/settings": "nav.settings",
  };

  const titleKey =
    PAGE_TITLE_KEYS[pathname] ??
    Object.entries(PAGE_TITLE_KEYS).find(([key]) => pathname.startsWith(key))?.[1];

  const title = titleKey ? t(titleKey) : "FinanceFlow";

  // Sincroniza o tema com localStorage e html.light
  useEffect(() => {
    const stored = localStorage.getItem("ff-theme");
    setIsDark(stored !== "light");
  }, []);

  function toggleTheme() {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("ff-theme", next);
    document.documentElement.classList.toggle("light", next === "light");
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </div>

      {/* Header bar */}
      <header
        className={cn(
          "flex h-14 items-center gap-3 border-b border-border bg-surface/80 backdrop-blur-sm px-4 lg:px-6",
          className
        )}
      >
        {/* Mobile menu button */}
        <button
          className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg text-ink-muted hover:text-ink hover:bg-elevated transition-colors"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {/* Título da página */}
        <h1 className="font-display font-semibold text-ink text-[15px] tracking-tight">
          {title}
        </h1>

        <div className="flex-1" />

        {/* Ações */}
        <div className="flex items-center gap-1">
          {/* Busca rápida */}
          <Button variant="ghost" size="icon" aria-label="Buscar" title="Buscar transações">
            <Search className="h-4 w-4" />
          </Button>

          {/* Importar extrato */}
          <Button variant="ghost" size="icon" aria-label="Importar extrato" title="Importar extrato bancário">
            <Upload className="h-4 w-4" />
          </Button>

          {/* Notificações */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notificações"
            className="relative"
            title="Notificações"
          >
            <Bell className="h-4 w-4" />
            {/* Badge de notificação não lida */}
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-moss-400" aria-hidden="true" />
          </Button>

          {/* Toggle tema */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
            title={isDark ? "Modo claro" : "Modo escuro"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Avatar */}
          <div className="ml-1 h-7 w-7 rounded-full bg-moss-500/20 flex items-center justify-center text-xs font-semibold text-moss-400 cursor-pointer hover:ring-2 hover:ring-moss-500/40 transition-all">
            U
          </div>
        </div>
      </header>
    </>
  );
}
