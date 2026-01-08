"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Plus, Trash2, Key, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  key_prefix: string;
  key_suffix: string;
  name: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  usage_count: number;
}

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/settings/api-keys");
      const data = await res.json();
      if (data.keys) {
        setKeys(data.keys);
      }
    } catch (error) {
      console.error("Error fetching keys:", error);
      toast.error("Erro ao carregar API keys");
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName || "API Key" }),
      });
      const data = await res.json();

      if (data.apiKey) {
        setShowNewKey(data.apiKey);
        setNewKeyName("");
        fetchKeys();
        toast.success("API Key criada com sucesso!");
      } else {
        toast.error(data.error || "Erro ao criar API key");
      }
    } catch (error) {
      console.error("Error creating key:", error);
      toast.error("Erro ao criar API key");
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (keyId: string) => {
    if (
      !confirm(
        "Tem certeza que deseja revogar esta API key? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/settings/api-keys?keyId=${keyId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchKeys();
        toast.success("API Key revogada");
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao revogar API key");
      }
    } catch (error) {
      console.error("Error revoking key:", error);
      toast.error("Erro ao revogar API key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado para a área de transferência");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Nunca";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys
        </CardTitle>
        <CardDescription>
          Gerencie suas API keys para integração com o MCP Server. As keys
          permitem que Claude Desktop/Code execute ações nesta organização.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nova Key (se acabou de criar) */}
        {showNewKey && (
          <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-800 dark:text-green-200">
                  API Key criada! Copie agora - ela não será exibida novamente.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded border font-mono text-sm break-all">
                    {showNewKey}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(showNewKey)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2"
                  onClick={() => setShowNewKey(null)}
                >
                  Entendi, fechar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Criar nova key */}
        <div className="flex gap-2">
          <Input
            placeholder="Nome da key (opcional)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={createKey} disabled={creating}>
            <Plus className="h-4 w-4 mr-2" />
            {creating ? "Criando..." : "Criar API Key"}
          </Button>
        </div>

        {/* Lista de keys */}
        <div className="space-y-2">
          {keys.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Nenhuma API key criada ainda.
            </p>
          ) : (
            keys.map((key) => (
              <div
                key={key.id}
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  !key.is_active ? "opacity-50 bg-muted" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{key.name}</span>
                    {!key.is_active && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                        Revogada
                      </span>
                    )}
                  </div>
                  <code className="text-sm text-muted-foreground font-mono">
                    {key.key_prefix}...{key.key_suffix}
                  </code>
                  <div className="text-xs text-muted-foreground mt-1">
                    Criada: {formatDate(key.created_at)} • Último uso:{" "}
                    {formatDate(key.last_used_at)} • Usos: {key.usage_count}
                  </div>
                </div>
                {key.is_active && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => revokeKey(key.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Instruções de uso */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Como usar</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Crie uma API key acima</li>
            <li>Copie a key (ela só é exibida uma vez)</li>
            <li>Configure no Claude Desktop ou Claude Code</li>
            <li>Use as ferramentas MCP para gerenciar seus grupos</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-3">
            Consulte a documentação em /docs/MCP-SETUP.md para configuração
            detalhada.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
