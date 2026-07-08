"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "Onde gastei mais este mês?",
  "Quanto gastei em restaurantes?",
  "Consigo pagar um notebook de R$ 4.500?",
  "Quais assinaturas posso cancelar?",
  "Quanto economizei desde janeiro?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content:
        "Olá! 👋 Sou o assistente financeiro do FinanceFlow. Posso responder perguntas sobre seus gastos, receitas, assinaturas e metas. Como posso ajudar?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text?: string) {
    const content = text ?? input.trim();
    if (!content || loading || !token) return;
    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    
    // Copy history to send to API
    const historyForApi = messages.filter(m => m.id !== "0").map(m => ({
      role: m.role,
      content: m.content
    }));

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.post<{ reply: string }>("/chat", {
        message: content,
        history: historyForApi
      }, token);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao conectar com o meu cérebro (backend).",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto">
      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-4 pb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            {msg.role === "assistant" && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-moss-500/20 text-moss-400 mt-0.5">
                <Sparkles className="h-4 w-4" />
              </span>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-moss-500 text-white rounded-br-sm"
                  : "bg-surface border border-border text-ink rounded-bl-sm"
              )}
            >
              {msg.content}
              <p
                className={cn(
                  "text-[10px] mt-1.5",
                  msg.role === "user" ? "text-white/60" : "text-ink-muted"
                )}
              >
                {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {msg.role === "user" && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-elevated text-ink-muted mt-0.5">
                <User className="h-4 w-4" />
              </span>
            )}
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-moss-500/20 text-moss-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-moss-400 animate-pulse-line"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Sugestões */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-ink-muted hover:text-ink hover:border-moss-500/50 hover:bg-elevated transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte algo sobre suas finanças..."
          className="flex-1"
          disabled={loading}
          aria-label="Mensagem para o assistente"
        />
        <Button
          type="submit"
          variant="primary"
          size="icon"
          loading={loading}
          disabled={!input.trim()}
          aria-label="Enviar mensagem"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
