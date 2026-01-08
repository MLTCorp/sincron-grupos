"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bot,
  MessageSquare,
  Clock,
  Zap,
  Send,
  Calendar,
  Users,
  Bell,
  Settings,
  ArrowRight,
} from "lucide-react";
import { AgentChat, AgentSessionList } from "@/components/agent/agent-chat";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  {
    icon: Send,
    label: "Enviar mensagem",
    prompt: "Quero enviar uma mensagem para um grupo",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Calendar,
    label: "Agendar mensagem",
    prompt: "Quero agendar uma mensagem para amanhã às 14h",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: Zap,
    label: "Criar gatilho",
    prompt: "Quando alguém perguntar sobre preço, responder com nossa tabela",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: Users,
    label: "Boas-vindas",
    prompt: "Quero enviar uma mensagem de boas-vindas quando alguém entrar no grupo",
    color: "bg-green-500/10 text-green-500",
  },
];

const CAPABILITIES = [
  "Gerenciar grupos WhatsApp",
  "Agendar mensagens",
  "Criar gatilhos automáticos",
  "Configurar comandos de chatbot",
  "Ver estatísticas dos grupos",
];

export default function AgentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat");
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [chatTitle, setChatTitle] = useState<string>("Nova conversa");

  const handleSessionCreated = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    // Update URL without navigation
    window.history.replaceState({}, "", `/agent/${sessionId}`);
  }, []);

  const handleSelectSession = useCallback((sessionId: string) => {
    router.push(`/agent/${sessionId}`);
  }, [router]);

  const handleNewChat = useCallback(() => {
    setCurrentSessionId(undefined);
    setChatTitle("Nova conversa");
    window.history.replaceState({}, "", "/agent");
  }, []);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Assistente Sincron</h1>
            <p className="text-xs text-muted-foreground">
              Gerencie grupos via linguagem natural
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="flex md:hidden border-b shrink-0">
        <button
          onClick={() => setActiveTab("chat")}
          className={cn(
            "flex-1 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "chat"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          )}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex-1 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "history"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          )}
        >
          Histórico
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar - Desktop */}
        <div className="hidden md:flex flex-col w-64 border-r p-4 overflow-y-auto">
          <AgentSessionList
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            selectedSessionId={currentSessionId}
          />

          {/* Capabilities */}
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">
              Capacidades
            </h3>
            <ul className="space-y-1.5">
              {CAPABILITIES.map((cap, i) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-primary" />
                  {cap}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* History Panel - Mobile */}
        {activeTab === "history" && (
          <div className="flex-1 md:hidden p-4 overflow-y-auto">
            <AgentSessionList
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
              selectedSessionId={currentSessionId}
            />
          </div>
        )}

        {/* Chat Panel */}
        <div
          className={cn(
            "flex-1 flex flex-col min-h-0 overflow-hidden",
            activeTab !== "chat" && "hidden md:flex"
          )}
        >
          {!currentSessionId ? (
            // Welcome Screen
            <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
              <div className="max-w-md w-full text-center mb-8">
                <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                  <Bot className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">
                  Olá! Sou o assistente do Sincron Grupos
                </h2>
                <p className="text-muted-foreground text-sm">
                  Posso ajudar você a gerenciar seus grupos WhatsApp usando
                  linguagem natural. Experimente uma das ações rápidas abaixo ou
                  digite sua solicitação.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-6">
                {QUICK_ACTIONS.map((action, i) => (
                  <Card
                    key={i}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => {
                      // This will trigger the chat with the prompt
                      const input = document.querySelector(
                        "textarea"
                      ) as HTMLTextAreaElement;
                      if (input) {
                        input.value = action.prompt;
                        input.dispatchEvent(
                          new Event("input", { bubbles: true })
                        );
                        input.focus();
                      }
                    }}
                  >
                    <CardContent className="p-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center mb-2",
                          action.color
                        )}
                      >
                        <action.icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium">{action.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Chat Input */}
              <div className="w-full max-w-md sticky bottom-0 bg-background pb-4">
                <AgentChat
                  onSessionCreated={handleSessionCreated}
                  onTitleUpdate={setChatTitle}
                />
              </div>
            </div>
          ) : (
            // Active Chat
            <AgentChat
              sessionId={currentSessionId}
              onSessionCreated={handleSessionCreated}
              onTitleUpdate={setChatTitle}
              className="h-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}
