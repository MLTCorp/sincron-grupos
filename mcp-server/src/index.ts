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
