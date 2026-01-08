# Implementação MCP Server - Sincron Grupos

## Visão Geral

Este documento guia a implementação completa de um MCP Server para Sincron Grupos, permitindo que Claude Desktop/Code execute ferramentas de gerenciamento de grupos WhatsApp via API autenticada.

## Arquitetura

```
Claude Desktop/Code
       ↓ (stdio)
MCP Server (local, Node.js)
       ↓ (HTTP + x-api-key)
Sincron Grupos API (/api/mcp/tools/*)
       ↓
Supabase + UAZAPI
```

## Status da Migration

✅ **Migration `api_keys` já aplicada** no Supabase (projeto qhjlxnzxazcqrkgojnbx)

A tabela `api_keys` já existe com a seguinte estrutura:
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_organizacao INTEGER NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  key_suffix TEXT NOT NULL,
  name TEXT DEFAULT 'API Key',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Fase 1: Sistema de API Keys

### 1.1 Criar `lib/supabase/admin.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Cliente Supabase com service_role_key para operações administrativas.
 * Bypass de RLS para validação de API keys.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

**⚠️ Adicionar ao `.env.local`:**
```
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Pegar no Supabase Dashboard > Settings > API
```

### 1.2 Criar `lib/auth/api-key.ts`

```typescript
import { createAdminClient } from "@/lib/supabase/admin";
import { createHash, randomBytes } from "crypto";

/**
 * Gera uma nova API Key
 * Formato: sg_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 */
export function generateApiKey(): string {
  const prefix = "sg_live_";
  const randomPart = randomBytes(32).toString("hex"); // 64 caracteres hex
  return `${prefix}${randomPart}`;
}

/**
 * Cria hash SHA-256 da API key para armazenamento seguro
 */
export function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Extrai prefixo e sufixo da API key para exibição
 * Ex: "sg_live_abc123...xyz789"
 */
export function getKeyDisplay(apiKey: string): { prefix: string; suffix: string } {
  return {
    prefix: apiKey.substring(0, 12), // "sg_live_xxxx"
    suffix: apiKey.substring(apiKey.length - 4), // últimos 4 caracteres
  };
}

/**
 * Valida uma API Key e retorna o userId e organizacaoId associados
 */
export async function validateApiKey(
  apiKey: string
): Promise<{
  valid: boolean;
  userId?: string;
  organizacaoId?: number;
  keyId?: string;
  error?: string
}> {
  try {
    const supabase = createAdminClient();
    const keyHash = hashApiKey(apiKey);

    // Busca a key pelo hash
    const { data, error } = await supabase
      .from("api_keys")
      .select("id, user_id, id_organizacao, is_active, usage_count")
      .eq("key_hash", keyHash)
      .single();

    if (error || !data) {
      return {
        valid: false,
        error: "API key inválida",
      };
    }

    if (!data.is_active) {
      return {
        valid: false,
        error: "API key revogada",
      };
    }

    // Atualiza last_used_at e usage_count
    await supabase
      .from("api_keys")
      .update({
        last_used_at: new Date().toISOString(),
        usage_count: (data.usage_count || 0) + 1,
      })
      .eq("id", data.id);

    return {
      valid: true,
      userId: data.user_id,
      organizacaoId: data.id_organizacao,
      keyId: data.id,
    };
  } catch (err) {
    console.error("Error validating API key:", err);
    return {
      valid: false,
      error: "Erro ao validar API key",
    };
  }
}

/**
 * Cria uma nova API Key para um usuário
 */
export async function createApiKey(
  userId: string,
  organizacaoId: number,
  name?: string
): Promise<{ success: boolean; apiKey?: string; keyId?: string; error?: string }> {
  try {
    const supabase = createAdminClient();

    // Gera a key
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);
    const { prefix, suffix } = getKeyDisplay(apiKey);

    // Revoga keys anteriores do usuário nesta organização
    await supabase
      .from("api_keys")
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("id_organizacao", organizacaoId)
      .eq("is_active", true);

    // Insere a nova key
    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        user_id: userId,
        id_organizacao: organizacaoId,
        key_hash: keyHash,
        key_prefix: prefix,
        key_suffix: suffix,
        name: name || "API Key",
        is_active: true,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Error creating API key:", error);
      return {
        success: false,
        error: "Erro ao criar API key",
      };
    }

    return {
      success: true,
      apiKey, // Retorna a key completa APENAS neste momento
      keyId: data.id,
    };
  } catch (err) {
    console.error("Error creating API key:", err);
    return {
      success: false,
      error: "Erro ao criar API key",
    };
  }
}

/**
 * Revoga uma API Key
 */
export async function revokeApiKey(
  userId: string,
  keyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("api_keys")
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq("id", keyId)
      .eq("user_id", userId);

    if (error) {
      return {
        success: false,
        error: "Erro ao revogar API key",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Error revoking API key:", err);
    return {
      success: false,
      error: "Erro ao revogar API key",
    };
  }
}

/**
 * Lista API Keys do usuário (sem expor o hash)
 */
export async function listApiKeys(userId: string, organizacaoId?: number) {
  try {
    const supabase = createAdminClient();

    let query = supabase
      .from("api_keys")
      .select("id, key_prefix, key_suffix, name, is_active, created_at, last_used_at, usage_count, id_organizacao")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (organizacaoId) {
      query = query.eq("id_organizacao", organizacaoId);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: "Erro ao listar API keys" };
    }

    return { success: true, keys: data || [] };
  } catch (err) {
    console.error("Error listing API keys:", err);
    return { success: false, error: "Erro ao listar API keys" };
  }
}
```

### 1.3 Criar `lib/auth/mcp-auth.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateApiKey } from "./api-key";

export interface McpAuthResult {
  authenticated: boolean;
  userId?: string;
  organizacaoId?: number;
  error?: string;
  errorResponse?: NextResponse;
}

/**
 * Autentica uma requisição MCP.
 * Aceita autenticação via:
 * - Header x-api-key (API key gerada no painel)
 * - Sessão Supabase (para chamadas do frontend)
 */
export async function authenticateMcpRequest(
  request: NextRequest
): Promise<McpAuthResult> {
  const apiKey = request.headers.get("x-api-key");

  // 1. Tentar autenticação por API Key
  if (apiKey) {
    const validation = await validateApiKey(apiKey);
    if (!validation.valid || !validation.userId) {
      return {
        authenticated: false,
        error: validation.error || "API key inválida",
        errorResponse: NextResponse.json(
          { error: validation.error || "API key inválida" },
          { status: 401 }
        ),
      };
    }
    return {
      authenticated: true,
      userId: validation.userId,
      organizacaoId: validation.organizacaoId,
    };
  }

  // 2. Fallback: Sessão Supabase
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Buscar organização do usuário
      const { data: usuario } = await supabase
        .from("usuarios_sistema")
        .select("id_organizacao")
        .eq("auth_user_id", user.id)
        .single();

      return {
        authenticated: true,
        userId: user.id,
        organizacaoId: usuario?.id_organizacao,
      };
    }
  } catch (err) {
    console.error("Supabase auth error:", err);
  }

  return {
    authenticated: false,
    error: "Unauthorized. Forneça uma API key via header x-api-key ou faça login.",
    errorResponse: NextResponse.json(
      {
        error: "Unauthorized. Forneça uma API key via header x-api-key ou faça login.",
        hint: "Gere uma API key em /settings",
      },
      { status: 401 }
    ),
  };
}
```

### 1.4 Criar `app/api/settings/api-keys/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createApiKey, listApiKeys, revokeApiKey } from "@/lib/auth/api-key";

// GET - Listar API keys do usuário
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar organização do usuário
    const { data: usuario } = await supabase
      .from("usuarios_sistema")
      .select("id_organizacao")
      .eq("auth_user_id", user.id)
      .single();

    const result = await listApiKeys(user.id, usuario?.id_organizacao);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ keys: result.keys });
  } catch (error) {
    console.error("Error listing API keys:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - Criar nova API key
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar organização do usuário
    const { data: usuario } = await supabase
      .from("usuarios_sistema")
      .select("id_organizacao")
      .eq("auth_user_id", user.id)
      .single();

    if (!usuario?.id_organizacao) {
      return NextResponse.json({ error: "Usuário sem organização" }, { status: 400 });
    }

    const body = await request.json();
    const { name } = body;

    const result = await createApiKey(user.id, usuario.id_organizacao, name);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      apiKey: result.apiKey, // Só retorna a key completa aqui
      keyId: result.keyId,
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE - Revogar API key
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("keyId");

    if (!keyId) {
      return NextResponse.json({ error: "keyId é obrigatório" }, { status: 400 });
    }

    const result = await revokeApiKey(user.id, keyId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking API key:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
```

---

## Fase 2: MCP Core

### 2.1 Criar `lib/mcp/types.ts`

```typescript
export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface McpToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface McpDiscoveryResponse {
  name: string;
  version: string;
  description: string;
  tools: McpTool[];
  authentication: {
    type: string;
    header: string;
    description: string;
  };
}
```

### 2.2 Criar `lib/mcp/tools.ts`

```typescript
import { McpTool } from "./types";

export const MCP_TOOLS: McpTool[] = [
  {
    name: "get_instance_status",
    description: "Obtém o status da instância WhatsApp da organização",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "list_groups",
    description: "Lista todos os grupos WhatsApp da organização",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Número máximo de grupos a retornar (padrão: 50)",
        },
        offset: {
          type: "number",
          description: "Offset para paginação (padrão: 0)",
        },
      },
      required: [],
    },
  },
  {
    name: "sync_groups",
    description: "Sincroniza grupos do WhatsApp com o banco de dados",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "send_message",
    description: "Envia uma mensagem de texto para um grupo ou contato",
    inputSchema: {
      type: "object",
      properties: {
        number: {
          type: "string",
          description: "Número do destinatário ou ID do grupo (ex: 5511999999999 ou 120363xxx@g.us)",
        },
        text: {
          type: "string",
          description: "Texto da mensagem a ser enviada",
        },
      },
      required: ["number", "text"],
    },
  },
  {
    name: "configure_webhook",
    description: "Configura o webhook da instância WhatsApp",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL do webhook",
        },
        events: {
          type: "array",
          items: { type: "string" },
          description: "Lista de eventos a receber (messages, connection, etc)",
        },
        enabled: {
          type: "boolean",
          description: "Se o webhook deve estar ativo",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "create_trigger",
    description: "Cria um gatilho de resposta automática",
    inputSchema: {
      type: "object",
      properties: {
        nome: {
          type: "string",
          description: "Nome do gatilho",
        },
        palavras_chave: {
          type: "array",
          items: { type: "string" },
          description: "Palavras-chave que ativam o gatilho",
        },
        resposta: {
          type: "string",
          description: "Resposta automática do gatilho",
        },
        tipo_resposta: {
          type: "string",
          enum: ["texto", "imagem", "audio", "video", "documento"],
          description: "Tipo da resposta (padrão: texto)",
        },
        ativo: {
          type: "boolean",
          description: "Se o gatilho está ativo (padrão: true)",
        },
      },
      required: ["nome", "palavras_chave", "resposta"],
    },
  },
  {
    name: "create_command",
    description: "Cria um comando de chatbot (ex: /ajuda)",
    inputSchema: {
      type: "object",
      properties: {
        comando: {
          type: "string",
          description: "O comando (ex: /ajuda, /menu)",
        },
        descricao: {
          type: "string",
          description: "Descrição do que o comando faz",
        },
        resposta: {
          type: "string",
          description: "Resposta quando o comando é acionado",
        },
        ativo: {
          type: "boolean",
          description: "Se o comando está ativo (padrão: true)",
        },
      },
      required: ["comando", "resposta"],
    },
  },
  {
    name: "create_agent",
    description: "Cria um agente de IA para atendimento automático",
    inputSchema: {
      type: "object",
      properties: {
        nome: {
          type: "string",
          description: "Nome do agente",
        },
        prompt_sistema: {
          type: "string",
          description: "Prompt de sistema que define o comportamento do agente",
        },
        modelo: {
          type: "string",
          enum: ["gpt-4o-mini", "gpt-4o", "claude-3-haiku", "claude-3-sonnet"],
          description: "Modelo de IA a ser usado (padrão: gpt-4o-mini)",
        },
        temperatura: {
          type: "number",
          description: "Temperatura do modelo (0-1, padrão: 0.7)",
        },
        ativo: {
          type: "boolean",
          description: "Se o agente está ativo (padrão: true)",
        },
      },
      required: ["nome", "prompt_sistema"],
    },
  },
];

export function getToolByName(name: string): McpTool | undefined {
  return MCP_TOOLS.find((tool) => tool.name === name);
}
```

### 2.3 Criar `lib/mcp/schemas.ts`

```typescript
import { z } from "zod";

export const listGroupsSchema = z.object({
  limit: z.number().optional().default(50),
  offset: z.number().optional().default(0),
});

export const sendMessageSchema = z.object({
  number: z.string().min(1, "Número é obrigatório"),
  text: z.string().min(1, "Texto é obrigatório"),
});

export const configureWebhookSchema = z.object({
  url: z.string().url("URL inválida"),
  events: z.array(z.string()).optional().default(["messages", "connection"]),
  enabled: z.boolean().optional().default(true),
});

export const createTriggerSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  palavras_chave: z.array(z.string()).min(1, "Pelo menos uma palavra-chave é obrigatória"),
  resposta: z.string().min(1, "Resposta é obrigatória"),
  tipo_resposta: z.enum(["texto", "imagem", "audio", "video", "documento"]).optional().default("texto"),
  ativo: z.boolean().optional().default(true),
});

export const createCommandSchema = z.object({
  comando: z.string().min(1, "Comando é obrigatório").startsWith("/", "Comando deve começar com /"),
  descricao: z.string().optional(),
  resposta: z.string().min(1, "Resposta é obrigatória"),
  ativo: z.boolean().optional().default(true),
});

export const createAgentSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  prompt_sistema: z.string().min(10, "Prompt deve ter pelo menos 10 caracteres"),
  modelo: z.enum(["gpt-4o-mini", "gpt-4o", "claude-3-haiku", "claude-3-sonnet"]).optional().default("gpt-4o-mini"),
  temperatura: z.number().min(0).max(1).optional().default(0.7),
  ativo: z.boolean().optional().default(true),
});
```

### 2.4 Criar `app/api/mcp/route.ts` (Discovery)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { MCP_TOOLS } from "@/lib/mcp/tools";
import type { McpDiscoveryResponse } from "@/lib/mcp/types";

// GET /api/mcp - Discovery endpoint
export async function GET(request: NextRequest) {
  const response: McpDiscoveryResponse = {
    name: "sincron-grupos",
    version: "1.0.0",
    description: "MCP Server para gerenciamento de grupos WhatsApp do Sincron Grupos",
    tools: MCP_TOOLS,
    authentication: {
      type: "api-key",
      header: "x-api-key",
      description: "Gere uma API key em /settings para autenticar requisições",
    },
  };

  return NextResponse.json(response);
}

// OPTIONS - CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  });
}
```

---

## Fase 3: Tool Endpoints

### Estrutura de Pastas

```
app/api/mcp/tools/
├── get-instance-status/route.ts
├── list-groups/route.ts
├── sync-groups/route.ts
├── send-message/route.ts
├── configure-webhook/route.ts
├── create-trigger/route.ts
├── create-command/route.ts
└── create-agent/route.ts
```

### 3.1 Criar `app/api/mcp/tools/get-instance-status/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/auth/mcp-auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // 1. Autenticar
  const auth = await authenticateMcpRequest(request);
  if (!auth.authenticated) return auth.errorResponse;

  try {
    const supabase = await createClient();

    // Buscar instância da organização
    const { data: instancia, error } = await supabase
      .from("instancias_whatsapp")
      .select("*")
      .eq("id_organizacao", auth.organizacaoId)
      .single();

    if (error || !instancia) {
      return NextResponse.json({
        success: false,
        error: "Instância não encontrada",
      });
    }

    // Chamar UAZAPI para status atual
    const statusResponse = await fetch(`/api/proxy/uazapi/instance/status`, {
      method: "GET",
      headers: {
        "token": instancia.token,
      },
    });

    const status = await statusResponse.json();

    return NextResponse.json({
      success: true,
      data: {
        nome: instancia.nome,
        numero: instancia.numero,
        status: status.state || instancia.status,
        conectado: status.state === "connected",
        ultima_conexao: instancia.data_conexao,
      },
    });
  } catch (error) {
    console.error("Error getting instance status:", error);
    return NextResponse.json({
      success: false,
      error: "Erro ao obter status da instância",
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  });
}
```

### 3.2 Criar `app/api/mcp/tools/list-groups/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/auth/mcp-auth";
import { createClient } from "@/lib/supabase/server";
import { listGroupsSchema } from "@/lib/mcp/schemas";

export async function POST(request: NextRequest) {
  const auth = await authenticateMcpRequest(request);
  if (!auth.authenticated) return auth.errorResponse;

  try {
    const body = await request.json();
    const validated = listGroupsSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({
        success: false,
        error: validated.error.errors[0].message,
      }, { status: 400 });
    }

    const { limit, offset } = validated.data;
    const supabase = await createClient();

    const { data: grupos, error, count } = await supabase
      .from("grupos")
      .select("*", { count: "exact" })
      .eq("id_organizacao", auth.organizacaoId)
      .range(offset, offset + limit - 1)
      .order("nome", { ascending: true });

    if (error) {
      return NextResponse.json({
        success: false,
        error: "Erro ao listar grupos",
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        grupos: grupos || [],
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Error listing groups:", error);
    return NextResponse.json({
      success: false,
      error: "Erro interno",
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  });
}
```

### 3.3 Criar `app/api/mcp/tools/send-message/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/auth/mcp-auth";
import { createClient } from "@/lib/supabase/server";
import { sendMessageSchema } from "@/lib/mcp/schemas";

export async function POST(request: NextRequest) {
  const auth = await authenticateMcpRequest(request);
  if (!auth.authenticated) return auth.errorResponse;

  try {
    const body = await request.json();
    const validated = sendMessageSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({
        success: false,
        error: validated.error.errors[0].message,
      }, { status: 400 });
    }

    const { number, text } = validated.data;
    const supabase = await createClient();

    // Buscar instância e token
    const { data: instancia } = await supabase
      .from("instancias_whatsapp")
      .select("token, base_url")
      .eq("id_organizacao", auth.organizacaoId)
      .single();

    if (!instancia) {
      return NextResponse.json({
        success: false,
        error: "Instância não encontrada",
      }, { status: 404 });
    }

    // Enviar mensagem via UAZAPI
    const response = await fetch(`${instancia.base_url}/send/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": instancia.token,
      },
      body: JSON.stringify({ number, text }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: result.error || "Erro ao enviar mensagem",
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      data: {
        messageId: result.messageid,
        status: "sent",
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({
      success: false,
      error: "Erro interno",
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  });
}
```

### 3.4 Criar `app/api/mcp/tools/create-trigger/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/auth/mcp-auth";
import { createClient } from "@/lib/supabase/server";
import { createTriggerSchema } from "@/lib/mcp/schemas";

export async function POST(request: NextRequest) {
  const auth = await authenticateMcpRequest(request);
  if (!auth.authenticated) return auth.errorResponse;

  try {
    const body = await request.json();
    const validated = createTriggerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({
        success: false,
        error: validated.error.errors[0].message,
      }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: gatilho, error } = await supabase
      .from("gatilhos")
      .insert({
        id_organizacao: auth.organizacaoId,
        nome: validated.data.nome,
        palavras_chave: validated.data.palavras_chave,
        resposta: validated.data.resposta,
        tipo_resposta: validated.data.tipo_resposta,
        ativo: validated.data.ativo,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating trigger:", error);
      return NextResponse.json({
        success: false,
        error: "Erro ao criar gatilho",
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: gatilho,
    });
  } catch (error) {
    console.error("Error creating trigger:", error);
    return NextResponse.json({
      success: false,
      error: "Erro interno",
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  });
}
```

### 3.5 Criar `app/api/mcp/tools/create-agent/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/auth/mcp-auth";
import { createClient } from "@/lib/supabase/server";
import { createAgentSchema } from "@/lib/mcp/schemas";

export async function POST(request: NextRequest) {
  const auth = await authenticateMcpRequest(request);
  if (!auth.authenticated) return auth.errorResponse;

  try {
    const body = await request.json();
    const validated = createAgentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({
        success: false,
        error: validated.error.errors[0].message,
      }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: agente, error } = await supabase
      .from("agentes_ia")
      .insert({
        id_organizacao: auth.organizacaoId,
        nome: validated.data.nome,
        prompt_sistema: validated.data.prompt_sistema,
        modelo: validated.data.modelo,
        temperatura: validated.data.temperatura,
        ativo: validated.data.ativo,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating agent:", error);
      return NextResponse.json({
        success: false,
        error: "Erro ao criar agente",
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: agente,
    });
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json({
      success: false,
      error: "Erro interno",
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  });
}
```

*Nota: Os endpoints `sync-groups`, `configure-webhook` e `create-command` seguem o mesmo padrão.*

---

## Fase 4: Frontend - ApiKeyManager

### 4.1 Criar `components/settings/api-key-manager.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    if (!confirm("Tem certeza que deseja revogar esta API key? Esta ação não pode ser desfeita.")) {
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
          Gerencie suas API keys para integração com o MCP Server.
          As keys permitem que Claude Desktop/Code execute ações nesta organização.
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
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
                    Criada: {formatDate(key.created_at)} •
                    Último uso: {formatDate(key.last_used_at)} •
                    Usos: {key.usage_count}
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
            Consulte a documentação em /docs/MCP-SETUP.md para configuração detalhada.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4.2 Atualizar Settings Page

No arquivo `app/(dashboard)/settings/page.tsx`, na seção de API Keys (linhas ~560-567), substituir o placeholder por:

```typescript
import { ApiKeyManager } from "@/components/settings/api-key-manager";

// ... dentro do componente, onde estava o placeholder:
<TabsContent value="api-keys">
  <ApiKeyManager />
</TabsContent>
```

---

## Fase 5: MCP Server Package

### 5.1 Estrutura

```
mcp-server/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts
```

### 5.2 `mcp-server/package.json`

```json
{
  "name": "sincron-grupos-mcp",
  "version": "1.0.0",
  "description": "MCP Server para Sincron Grupos - Gerenciamento de grupos WhatsApp",
  "main": "dist/index.js",
  "bin": {
    "sincron-grupos-mcp": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2"
  }
}
```

### 5.3 `mcp-server/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 5.4 `mcp-server/src/index.ts`

```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Configuração via env vars
const API_KEY = process.env.SINCRON_API_KEY;
const API_URL = process.env.SINCRON_API_URL || "https://sincron-grupos.vercel.app";

if (!API_KEY) {
  console.error("SINCRON_API_KEY environment variable is required");
  process.exit(1);
}

// Definição das tools
const TOOLS = [
  {
    name: "get_instance_status",
    description: "Obtém o status da instância WhatsApp da organização",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "list_groups",
    description: "Lista todos os grupos WhatsApp da organização",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", description: "Número máximo de grupos (padrão: 50)" },
        offset: { type: "number", description: "Offset para paginação (padrão: 0)" },
      },
    },
  },
  {
    name: "sync_groups",
    description: "Sincroniza grupos do WhatsApp com o banco de dados",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "send_message",
    description: "Envia uma mensagem de texto para um grupo ou contato",
    inputSchema: {
      type: "object" as const,
      properties: {
        number: { type: "string", description: "Número ou ID do grupo" },
        text: { type: "string", description: "Texto da mensagem" },
      },
      required: ["number", "text"],
    },
  },
  {
    name: "configure_webhook",
    description: "Configura o webhook da instância WhatsApp",
    inputSchema: {
      type: "object" as const,
      properties: {
        url: { type: "string", description: "URL do webhook" },
        events: { type: "array", items: { type: "string" }, description: "Eventos a receber" },
        enabled: { type: "boolean", description: "Se o webhook está ativo" },
      },
      required: ["url"],
    },
  },
  {
    name: "create_trigger",
    description: "Cria um gatilho de resposta automática",
    inputSchema: {
      type: "object" as const,
      properties: {
        nome: { type: "string", description: "Nome do gatilho" },
        palavras_chave: { type: "array", items: { type: "string" }, description: "Palavras-chave" },
        resposta: { type: "string", description: "Resposta automática" },
        tipo_resposta: { type: "string", enum: ["texto", "imagem", "audio", "video", "documento"] },
        ativo: { type: "boolean" },
      },
      required: ["nome", "palavras_chave", "resposta"],
    },
  },
  {
    name: "create_command",
    description: "Cria um comando de chatbot (ex: /ajuda)",
    inputSchema: {
      type: "object" as const,
      properties: {
        comando: { type: "string", description: "O comando (ex: /ajuda)" },
        descricao: { type: "string", description: "Descrição do comando" },
        resposta: { type: "string", description: "Resposta do comando" },
        ativo: { type: "boolean" },
      },
      required: ["comando", "resposta"],
    },
  },
  {
    name: "create_agent",
    description: "Cria um agente de IA para atendimento automático",
    inputSchema: {
      type: "object" as const,
      properties: {
        nome: { type: "string", description: "Nome do agente" },
        prompt_sistema: { type: "string", description: "Prompt de sistema" },
        modelo: { type: "string", enum: ["gpt-4o-mini", "gpt-4o", "claude-3-haiku", "claude-3-sonnet"] },
        temperatura: { type: "number", description: "Temperatura (0-1)" },
        ativo: { type: "boolean" },
      },
      required: ["nome", "prompt_sistema"],
    },
  },
];

// Função para chamar a API
async function callApi(toolName: string, args: Record<string, unknown>) {
  const endpoint = toolName.replace(/_/g, "-");
  const url = `${API_URL}/api/mcp/tools/${endpoint}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY!,
    },
    body: JSON.stringify(args),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Criar servidor MCP
const server = new Server(
  {
    name: "sincron-grupos",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handler: Listar tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handler: Executar tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await callApi(name, args || {});

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: false, error: message }),
        },
      ],
      isError: true,
    };
  }
});

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Sincron Grupos MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

---

## Configuração Claude Desktop

Após implementar e fazer deploy, configure em `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sincron-grupos": {
      "command": "node",
      "args": ["C:/caminho/para/mcp-server/dist/index.js"],
      "env": {
        "SINCRON_API_KEY": "sg_live_sua_api_key_aqui",
        "SINCRON_API_URL": "https://sincron-grupos.vercel.app"
      }
    }
  }
}
```

---

## Checklist de Implementação

### Fase 1: API Keys
- [ ] Criar `lib/supabase/admin.ts`
- [ ] Criar `lib/auth/api-key.ts`
- [ ] Criar `lib/auth/mcp-auth.ts`
- [ ] Criar `app/api/settings/api-keys/route.ts`
- [ ] Adicionar `SUPABASE_SERVICE_ROLE_KEY` ao `.env.local`

### Fase 2: MCP Core
- [ ] Criar `lib/mcp/types.ts`
- [ ] Criar `lib/mcp/tools.ts`
- [ ] Criar `lib/mcp/schemas.ts`
- [ ] Criar `app/api/mcp/route.ts`

### Fase 3: Tool Endpoints
- [ ] `app/api/mcp/tools/get-instance-status/route.ts`
- [ ] `app/api/mcp/tools/list-groups/route.ts`
- [ ] `app/api/mcp/tools/sync-groups/route.ts`
- [ ] `app/api/mcp/tools/send-message/route.ts`
- [ ] `app/api/mcp/tools/configure-webhook/route.ts`
- [ ] `app/api/mcp/tools/create-trigger/route.ts`
- [ ] `app/api/mcp/tools/create-command/route.ts`
- [ ] `app/api/mcp/tools/create-agent/route.ts`

### Fase 4: Frontend
- [ ] Criar `components/settings/api-key-manager.tsx`
- [ ] Atualizar settings page com ApiKeyManager

### Fase 5: MCP Server Package
- [ ] Criar `mcp-server/package.json`
- [ ] Criar `mcp-server/tsconfig.json`
- [ ] Criar `mcp-server/src/index.ts`
- [ ] Build e testar localmente

---

## Comandos Úteis

```bash
# Regenerar types do Supabase
npx supabase gen types typescript --project-id qhjlxnzxazcqrkgojnbx > types/supabase.ts

# Build do MCP Server
cd mcp-server && npm run build

# Testar MCP Server localmente
SINCRON_API_KEY=sg_live_xxx SINCRON_API_URL=http://localhost:3000 npm run dev
```

---

## Troubleshooting e Boas Práticas

Esta seção documenta erros comuns encontrados durante a implementação do MCP Server e suas soluções.

### Erros Comuns

#### 1. ERR_SSL_PACKET_LENGTH_TOO_LONG

**Causa:** Tentativa de conexão HTTPS em servidor HTTP. Isso ocorre porque `request.nextUrl.protocol` retorna `https:` mesmo em localhost no Next.js.

**Sintoma:**
```
Error: fetch failed
cause: Error: read ECONNRESET
  code: 'ERR_SSL_PACKET_LENGTH_TOO_LONG'
```

**Solução:** Detectar localhost e forçar protocolo HTTP:

```typescript
// app/api/chat/agent/route.ts ou similar
const forwardedHost = request.headers.get("x-forwarded-host");
const forwardedProto = request.headers.get("x-forwarded-proto");

let baseUrl: string;
if (forwardedHost) {
  // Produção (Vercel, etc)
  const proto = forwardedProto || "https";
  baseUrl = `${proto}://${forwardedHost}`;
} else {
  // Localhost - IMPORTANTE: forçar HTTP
  const host = request.nextUrl.host;
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
  const proto = isLocalhost ? "http" : request.nextUrl.protocol.replace(":", "");
  baseUrl = `${proto}://${host}`;
}
```

#### 2. "Unexpected token '<', '<!DOCTYPE '... is not valid JSON"

**Causa:** Middleware de autenticação redirecionando requisição interna para `/login`, retornando HTML ao invés de JSON.

**Por que acontece:** Requisições server-to-server (fetch interno) não carregam cookies de sessão do usuário, então o middleware não reconhece como autenticado.

**Solução:** Adicionar exceção para rotas MCP no middleware:

```typescript
// lib/supabase/middleware.ts
const isMcpApiRoute = request.nextUrl.pathname.startsWith('/api/mcp/');

if (!user && !isPublicRoute && !isInviteRoute && !isMcpApiRoute) {
  // redirect to login
}
```

#### 3. Tool retorna "Unauthorized" mesmo com usuário logado

**Causa:** O executor MCP faz fetch interno para os endpoints, mas sem cookies de sessão.

**Solução:** Implementar autenticação via headers internos (server-to-server):

**No executor (`lib/mcp/executor.ts`):**
```typescript
const response = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    // Headers internos para autenticação server-to-server
    "x-internal-user-id": context.userId,
    "x-internal-org-id": context.organizacaoId.toString(),
  },
  body: JSON.stringify(args),
});
```

**No autenticador (`lib/auth/mcp-auth.ts`):**
```typescript
export async function authenticateMcpRequest(request: NextRequest): Promise<McpAuthResult> {
  // Prioridade 1: Headers internos (server-to-server)
  const internalUserId = request.headers.get("x-internal-user-id");
  const internalOrgId = request.headers.get("x-internal-org-id");

  if (internalUserId && internalOrgId) {
    return {
      authenticated: true,
      userId: internalUserId,
      organizacaoId: parseInt(internalOrgId, 10),
    };
  }

  // Prioridade 2: API Key
  // Prioridade 3: Sessão Supabase
  // ...
}
```

#### 4. Erros difíceis de diagnosticar

**Causa:** Falta de logging estruturado para tools MCP.

**Solução:** Implementar logger dedicado (`lib/mcp/logger.ts`):

```typescript
export interface McpLogEntry {
  timestamp: string;
  tool: string;
  url: string;
  args: Record<string, unknown>;
  result: { success: boolean; error?: string; data?: unknown };
  durationMs: number;
  context: { userId: string; organizacaoId: number };
}

export function logMcpExecution(entry: McpLogEntry): void {
  const emoji = entry.result.success ? "✅" : "❌";
  console.log(`[MCP ${emoji}] ${entry.tool} - ${entry.durationMs}ms - ${entry.url}`);

  if (!entry.result.success) {
    console.error(`[MCP ERROR] Tool: ${entry.tool}`);
    console.error(`[MCP ERROR] URL: ${entry.url}`);
    console.error(`[MCP ERROR] Error: ${entry.result.error}`);
    console.error(`[MCP ERROR] Args:`, JSON.stringify(entry.args, null, 2));
    console.error(`[MCP ERROR] Context: userId=${entry.context.userId}, orgId=${entry.context.organizacaoId}`);
  }
}
```

---

### Checklist de Implementação MCP

Antes de considerar o MCP Server pronto para produção, verifique:

#### Middleware e Rotas
- [ ] Middleware tem exceção para `/api/mcp/` (não redireciona para login)
- [ ] Endpoints MCP retornam JSON (nunca HTML)
- [ ] Rotas públicas do MCP estão na lista de exceções

#### Autenticação
- [ ] `lib/auth/mcp-auth.ts` aceita headers internos (`x-internal-user-id`, `x-internal-org-id`)
- [ ] API Key é validada corretamente
- [ ] Fallback para sessão Supabase funciona

#### Conectividade
- [ ] BaseUrl detecta localhost e usa HTTP (não HTTPS)
- [ ] Headers `x-forwarded-host` e `x-forwarded-proto` são respeitados em produção
- [ ] Timeout adequado configurado no fetch

#### Observabilidade
- [ ] Sistema de logging implementado (`lib/mcp/logger.ts`)
- [ ] Logs incluem timestamp, tool, URL, args, resultado e duração
- [ ] Erros são logados com contexto completo

---

### Padrão de Teste

Para testar uma tool MCP, siga estes passos:

#### 1. Testar endpoint diretamente com curl

```bash
# Teste com headers internos (simula server-to-server)
curl -X POST http://localhost:3000/api/mcp/tools/list-groups \
  -H "Content-Type: application/json" \
  -H "x-internal-user-id: seu-user-id" \
  -H "x-internal-org-id: 1" \
  -d '{}'
```

#### 2. Testar via chat do agente

1. Acesse `/agent` no browser
2. Digite um comando natural (ex: "liste meus grupos")
3. Verifique se a tool é chamada e retorna dados

#### 3. Verificar logs no console do servidor

Procure por logs no formato:
```
[MCP ✅] list_groups - 234ms - http://localhost:3000/api/mcp/tools/list-groups
```

Se houver erro:
```
[MCP ❌] list_groups - 45ms - http://localhost:3000/api/mcp/tools/list-groups
[MCP ERROR] Tool: list_groups
[MCP ERROR] Error: Mensagem do erro
```

---

### Arquitetura de Autenticação MCP

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FLUXO DE AUTENTICAÇÃO                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Frontend (Browser)                                                 │
│      │                                                              │
│      ▼                                                              │
│  /api/chat/agent (Route Handler)                                    │
│      │ ◄── Sessão Supabase (cookies)                               │
│      │                                                              │
│      ▼                                                              │
│  executeTool() ──► fetch interno ──► /api/mcp/tools/xxx            │
│      │                   │                 │                        │
│      │                   │                 ▼                        │
│      │                   │         authenticateMcpRequest()         │
│      │                   │                 │                        │
│      │                   ▼                 ▼                        │
│      │            Headers:           1. x-internal-user-id? ✓       │
│      │            - x-internal-      2. x-api-key?                  │
│      │              user-id          3. Sessão Supabase?            │
│      │            - x-internal-                                     │
│      │              org-id                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Resumo das Soluções

| Erro | Causa | Arquivo | Solução |
|------|-------|---------|---------|
| SSL em localhost | `nextUrl.protocol` retorna https | `app/api/chat/agent/route.ts` | Detectar localhost, forçar HTTP |
| HTML ao invés de JSON | Middleware redireciona para /login | `lib/supabase/middleware.ts` | Exceção para `/api/mcp/` |
| Unauthorized interno | Fetch sem cookies | `lib/auth/mcp-auth.ts` | Headers internos |
| Debug difícil | Sem logs estruturados | `lib/mcp/logger.ts` | Logger dedicado |
