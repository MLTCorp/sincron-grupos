"use client";

import { useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Bell,
  Settings,
  ChevronLeft,
  Trash2,
  Edit2,
} from "lucide-react";
import { AgentChat, AgentSessionList } from "@/components/agent/agent-chat";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CAPABILITIES = [
  "Gerenciar grupos WhatsApp",
  "Agendar mensagens",
  "Criar gatilhos automáticos",
  "Configurar comandos de chatbot",
  "Ver estatísticas dos grupos",
];

export default function AgentSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat");
  const [chatTitle, setChatTitle] = useState<string>("Carregando...");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleSelectSession = useCallback(
    (newSessionId: string) => {
      router.push(`/agent/${newSessionId}`);
    },
    [router]
  );

  const handleNewChat = useCallback(() => {
    router.push("/agent");
  }, [router]);

  const handleBack = useCallback(() => {
    router.push("/agent");
  }, [router]);

  const handleRename = async () => {
    if (!newTitle.trim()) return;

    try {
      const response = await fetch("/api/chat/agent", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, title: newTitle.trim() }),
      });

      if (response.ok) {
        setChatTitle(newTitle.trim());
        setRenameDialogOpen(false);
        toast.success("Conversa renomeada");
      } else {
        toast.error("Falha ao renomear conversa");
      }
    } catch {
      toast.error("Falha ao renomear conversa");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/chat/agent?sessionId=${sessionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Conversa removida");
        router.push("/agent");
      } else {
        toast.error("Falha ao remover conversa");
      }
    } catch {
      toast.error("Falha ao remover conversa");
    }
  };

  const openRenameDialog = () => {
    setNewTitle(chatTitle);
    setRenameDialogOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={handleBack}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="p-2 rounded-lg bg-primary/10 hidden md:flex">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{chatTitle}</h1>
            <p className="text-xs text-muted-foreground hidden md:block">
              Conversa com o assistente
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={openRenameDialog}
          >
            <Edit2 className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex">
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
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop */}
        <div className="hidden md:flex flex-col w-64 border-r p-4 overflow-y-auto">
          <AgentSessionList
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            selectedSessionId={sessionId}
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
              selectedSessionId={sessionId}
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
          <AgentChat
            sessionId={sessionId}
            onTitleUpdate={setChatTitle}
            className="h-full"
          />
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Conversa</DialogTitle>
            <DialogDescription>
              Digite um novo nome para esta conversa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nome da Conversa</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Configuração de gatilhos"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRename} disabled={!newTitle.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conversa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A conversa e todo o histórico
              serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
