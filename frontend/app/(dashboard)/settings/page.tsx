import type { Metadata } from "next";
import { Sun, Moon, Globe, Bell, Shield, User } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Configurações" };

const SECTION = "border-b border-border pb-5 mb-5 last:border-0 last:pb-0 last:mb-0";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl flex flex-col gap-6">
      {/* Perfil */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-ink-muted" />
            <CardTitle className="text-ink">Perfil</CardTitle>
          </div>
        </CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-moss-500/20 flex items-center justify-center text-xl font-bold text-moss-400">
              U
            </div>
            <Button variant="outline" size="sm">Alterar foto</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome completo" defaultValue="Usuário" />
            <Input label="E-mail" type="email" defaultValue="usuario@email.com" />
          </div>
          <Button variant="primary" size="md" className="self-start">Salvar alterações</Button>
        </div>
      </Card>

      {/* Aparência */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-ink-muted" />
            <CardTitle className="text-ink">Aparência</CardTitle>
          </div>
        </CardHeader>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-muted">Tema do aplicativo</p>
          <div className="grid grid-cols-2 gap-3">
            {["Escuro", "Claro"].map((theme) => (
              <button
                key={theme}
                className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition-colors ${
                  theme === "Escuro"
                    ? "border-moss-500/60 bg-moss-500/10 text-moss-400"
                    : "border-border bg-surface text-ink-muted hover:border-border/80"
                }`}
              >
                {theme === "Escuro" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {theme}
                {theme === "Escuro" && <Badge variant="positive" className="ml-auto">Ativo</Badge>}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Idioma & Moeda */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-ink-muted" />
            <CardTitle className="text-ink">Idioma e Moeda</CardTitle>
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Idioma</label>
            <select className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss-500/50">
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Moeda</label>
            <select className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss-500/50">
              <option value="BRL">BRL — Real Brasileiro</option>
              <option value="USD">USD — Dólar Americano</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-ink-muted" />
            <CardTitle className="text-ink">Notificações</CardTitle>
          </div>
        </CardHeader>
        <div className="flex flex-col gap-3">
          {[
            "Compra grande detectada",
            "Assinatura renovada",
            "Meta atingida",
            "Conta a vencer",
            "Resumo semanal",
          ].map((item) => (
            <div key={item} className="flex items-center justify-between py-1">
              <p className="text-sm text-ink">{item}</p>
              <div className="relative inline-flex h-5 w-9 cursor-pointer rounded-full bg-moss-500 transition-colors">
                <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform translate-x-4" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-ink-muted" />
            <CardTitle className="text-ink">Segurança</CardTitle>
          </div>
        </CardHeader>
        <div className="flex flex-col gap-3">
          <Input label="Senha atual" type="password" />
          <Input label="Nova senha" type="password" />
          <Input label="Confirmar nova senha" type="password" />
          <Button variant="primary" size="md" className="self-start">Atualizar senha</Button>
        </div>
      </Card>
    </div>
  );
}
