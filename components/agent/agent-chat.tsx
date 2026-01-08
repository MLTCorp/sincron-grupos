"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Send,
  Loader2,
  Bot,
  User,
  CheckCircle,
  XCircle,
  Wrench,
  RefreshCw,
  Pencil,
  Trash2,
  Check,
  X,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  toolResult?: ToolResultInfo;
}

interface ToolResultInfo {
  toolCallId: string;
  name: string;
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

interface ToolCallInfo {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

interface ChatSession {
  id: string;
  title?: string;
  messages: AgentMessage[];
  tool_calls: ToolCallInfo[];
  created_at: string;
  updated_at: string;
}

interface AgentChatProps {
  sessionId?: string;
  onSessionCreated?: (sessionId: string) => void;
  onTitleUpdate?: (title: string) => void;
  className?: string;
}

export function AgentChat({
  sessionId,
  onSessionCreated,
  onTitleUpdate,
  className,
}: AgentChatProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(
    sessionId
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load session on mount or when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId]);

  const loadSession = async (sid: string) => {
    try {
      const response = await fetch(`/api/chat/agent?sessionId=${sid}`);
      const data = await response.json();

      if (data.success && data.session) {
        setMessages(data.session.messages || []);
        setCurrentSessionId(sid);
        if (data.session.title) {
          onTitleUpdate?.(data.session.title);
        }
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      toast.error("Falha ao carregar conversa");
    }
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message optimistically
    const optimisticMessage: AgentMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const response = await fetch("/api/chat/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          sessionId: currentSessionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update session ID if new
        if (!currentSessionId && data.sessionId) {
          setCurrentSessionId(data.sessionId);
          onSessionCreated?.(data.sessionId);
        }

        // Add assistant message
        const assistantMessage: AgentMessage = {
          role: "assistant",
          content: data.message,
          timestamp: new Date().toISOString(),
          toolResult:
            data.toolResults?.length > 0
              ? data.toolResults[data.toolResults.length - 1]
              : undefined,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Generate title from first user message if no title yet
        if (messages.length === 0 || messages.length === 1) {
          const title =
            userMessage.length > 50
              ? userMessage.substring(0, 47) + "..."
              : userMessage;
          onTitleUpdate?.(title);
        }
      } else {
        toast.error(data.error || "Falha ao enviar mensagem");
        // Remove optimistic message on error
        setMessages((prev) => prev.slice(0, -1));
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Falha ao enviar mensagem");
      // Remove optimistic message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }, [input, isLoading, currentSessionId, messages.length, onSessionCreated, onTitleUpdate]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatToolName = (name: string) => {
    return name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className={cn("flex flex-col flex-1 h-full min-h-0", className)}>
      {/* Messages Area */}
      <ScrollArea className="flex-1 min-h-0 px-4" ref={scrollRef}>
        <div className="space-y-4 py-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bot className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-center">
                Olá! Sou o assistente do Sincron Grupos.
                <br />
                Como posso ajudar você hoje?
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble
              key={`${message.timestamp}-${index}`}
              message={message}
              formatToolName={formatToolName}
            />
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Pensando...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4 shrink-0 bg-background">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="min-h-[44px] max-h-[200px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  formatToolName,
}: {
  message: AgentMessage;
  formatToolName: (name: string) => string;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/10"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-col gap-2 max-w-[80%]",
          isUser && "items-end"
        )}
      >
        <Card
          className={cn(
            "px-4 py-3",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50"
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MessageContent content={message.content} />
          </div>
        </Card>

        {/* Tool Result */}
        {message.toolResult && (
          <ToolResultCard
            result={message.toolResult}
            formatToolName={formatToolName}
          />
        )}

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Simple markdown-like rendering
  const lines = content.split("\n");

  return (
    <>
      {lines.map((line, i) => {
        // Handle bullet points
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <p key={i} className="flex items-start gap-2 my-1">
              <span>•</span>
              <span>{line.slice(2)}</span>
            </p>
          );
        }

        // Handle code blocks (inline)
        if (line.includes("`")) {
          const parts = line.split(/`([^`]+)`/);
          return (
            <p key={i} className="my-1">
              {parts.map((part, j) =>
                j % 2 === 1 ? (
                  <code
                    key={j}
                    className="bg-muted px-1 py-0.5 rounded text-sm font-mono"
                  >
                    {part}
                  </code>
                ) : (
                  <span key={j}>{part}</span>
                )
              )}
            </p>
          );
        }

        // Handle bold text
        if (line.includes("**")) {
          const parts = line.split(/\*\*([^*]+)\*\*/);
          return (
            <p key={i} className="my-1">
              {parts.map((part, j) =>
                j % 2 === 1 ? (
                  <strong key={j}>{part}</strong>
                ) : (
                  <span key={j}>{part}</span>
                )
              )}
            </p>
          );
        }

        // Empty lines
        if (line.trim() === "") {
          return <br key={i} />;
        }

        // Regular text
        return (
          <p key={i} className="my-1">
            {line}
          </p>
        );
      })}
    </>
  );
}

function ToolResultCard({
  result,
  formatToolName,
}: {
  result: ToolResultInfo;
  formatToolName: (name: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="px-3 py-2 bg-muted/30 border-dashed">
      <div className="flex items-center gap-2 text-sm">
        <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">{formatToolName(result.name)}</span>
        <Badge
          variant={result.success ? "default" : "destructive"}
          className="h-5 text-xs"
        >
          {result.success ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Sucesso
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              Erro
            </>
          )}
        </Badge>
        {result.data && Object.keys(result.data).length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-2 text-xs ml-auto"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Ocultar" : "Detalhes"}
          </Button>
        )}
      </div>

      {result.error && (
        <p className="text-xs text-destructive mt-2">{result.error}</p>
      )}

      {expanded && result.data && (
        <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto max-h-[200px]">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      )}
    </Card>
  );
}

// Export session list component for sidebar
interface ChatSession {
  id: string;
  title?: string;
  messages: AgentMessage[];
  created_at: string;
  updated_at: string;
}

interface AgentSessionListProps {
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  selectedSessionId?: string;
}

export function AgentSessionList({
  onSelectSession,
  onNewChat,
  selectedSessionId,
}: AgentSessionListProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const loadSessions = async () => {
    try {
      const response = await fetch("/api/chat/agent");
      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await fetch(`/api/chat/agent?sessionId=${sessionId}`, {
        method: "DELETE",
      });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Conversa removida");
    } catch {
      toast.error("Falha ao remover conversa");
    }
  };

  const startRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    const firstMessage = session.messages?.[0];
    const currentTitle =
      session.title ||
      (firstMessage?.role === "assistant"
        ? session.messages?.[1]?.content
        : firstMessage?.content) ||
      "Nova conversa";
    setEditingTitle(currentTitle.substring(0, 50));
    setEditingId(session.id);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveRename = async (sessionId: string) => {
    if (!editingTitle.trim()) {
      cancelRename();
      return;
    }

    try {
      const response = await fetch("/api/chat/agent", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          title: editingTitle.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId ? { ...s, title: editingTitle.trim() } : s
          )
        );
        toast.success("Conversa renomeada");
      } else {
        toast.error("Falha ao renomear conversa");
      }
    } catch {
      toast.error("Falha ao renomear conversa");
    } finally {
      cancelRename();
    }
  };

  const handleRenameKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    sessionId: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveRename(sessionId);
    } else if (e.key === "Escape") {
      cancelRename();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onNewChat} className="w-full" variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Nova Conversa
      </Button>

      <div className="space-y-1 mt-2">
        {sessions.map((session) => {
          const firstMessage = session.messages?.[0];
          const preview =
            session.title ||
            (firstMessage?.role === "assistant"
              ? session.messages?.[1]?.content
              : firstMessage?.content) ||
            "Nova conversa";

          const isEditing = editingId === session.id;

          return (
            <div
              key={session.id}
              onClick={() => !isEditing && onSelectSession(session.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                !isEditing && "cursor-pointer hover:bg-accent",
                "group relative",
                selectedSessionId === session.id && "bg-accent"
              )}
            >
              {isEditing ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Input
                    ref={inputRef}
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => handleRenameKeyDown(e, session.id)}
                    className="h-7 text-sm"
                    maxLength={50}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    onClick={() => saveRename(session.id)}
                  >
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    onClick={cancelRename}
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ) : (
                <>
                  <p className="truncate pr-8">
                    {preview.length > 40
                      ? preview.substring(0, 37) + "..."
                      : preview}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(session.updated_at).toLocaleDateString("pt-BR")}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded"
                      >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={(e) => startRename(session, e)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Renomear
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteSession(session.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          );
        })}

        {sessions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma conversa ainda
          </p>
        )}
      </div>
    </div>
  );
}
