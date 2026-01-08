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
    name: "list_categories",
    description:
      "Lista todas as categorias de grupos da organização com quantidade de grupos em cada. Use para descobrir quais categorias existem e seus IDs antes de agendar mensagens por categoria.",
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
          description:
            "Número do destinatário ou ID do grupo (ex: 5511999999999 ou 120363xxx@g.us)",
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
    description:
      "Cria um gatilho de resposta automática ou ação baseada em eventos. Suporta modo simples (palavras_chave + resposta) ou modo avançado (condições + config_acao).",
    inputSchema: {
      type: "object",
      properties: {
        // Básico
        nome: {
          type: "string",
          description: "Nome do gatilho",
        },
        descricao: {
          type: "string",
          description: "Descrição do gatilho (opcional)",
        },

        // ESCOPO - Onde aplicar
        escopo: {
          type: "string",
          enum: ["todos", "categoria", "grupo"],
          description:
            "Onde aplicar: 'todos' (todos os grupos), 'categoria' (categoria específica), 'grupo' (grupo específico). Padrão: todos",
        },
        id_categoria: {
          type: "number",
          description:
            "ID da categoria (obrigatório quando escopo='categoria'). Use list_categories para obter IDs.",
        },
        id_grupo: {
          type: "number",
          description:
            "ID do grupo (obrigatório quando escopo='grupo'). Use list_groups para obter IDs.",
        },

        // EVENTO - Quando disparar
        tipo_evento: {
          type: "string",
          enum: [
            "mensagem_texto",
            "mensagem_recebida",
            "mensagem_midia",
            "membro_entrou",
            "membro_saiu",
          ],
          description:
            "Tipo de evento que dispara o gatilho. Padrão: mensagem_texto",
        },

        // CONDIÇÕES - Filtros (modo avançado)
        condicoes: {
          type: "object",
          description:
            "Condições para filtrar. Estrutura: { operador: 'AND'|'OR', regras: [{ campo, operador, valor }] }. Campos: texto, autor, tipo_mensagem. Operadores: contem, igual, comeca_com, termina_com, regex",
        },

        // AÇÃO - O que fazer
        tipo_acao: {
          type: "string",
          enum: [
            "enviar_mensagem",
            "notificar_admin",
            "acionar_bot",
            "excluir_mensagem",
            "enviar_webhook",
          ],
          description: "Tipo de ação a executar. Padrão: enviar_mensagem",
        },

        // CONFIG AÇÃO - Detalhes da ação (modo avançado)
        config_acao: {
          type: "object",
          description:
            "Configuração da ação. Para enviar_mensagem: { tipo_envio: 'nova'|'responder'|'encaminhar', destino: 'mesmo_grupo'|'outros_grupos'|'numero', mensagem: string, grupos_destino: number[], numero_destino: string, mencionar_autor: boolean }",
        },

        // MODO SIMPLES (compatibilidade)
        palavras_chave: {
          type: "array",
          items: { type: "string" },
          description:
            "MODO SIMPLES: Palavras-chave que ativam o gatilho. Gera condições automaticamente.",
        },
        resposta: {
          type: "string",
          description:
            "MODO SIMPLES: Resposta automática. Define config_acao.mensagem automaticamente.",
        },
        tipo_resposta: {
          type: "string",
          enum: ["texto", "imagem", "audio", "video", "documento"],
          description: "MODO SIMPLES: Tipo da resposta (padrão: texto)",
        },

        // Outros
        ativo: {
          type: "boolean",
          description: "Se o gatilho está ativo (padrão: true)",
        },
        prioridade: {
          type: "number",
          description: "Prioridade de execução (menor = maior prioridade). Padrão: 100",
        },
      },
      required: ["nome"],
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
  {
    name: "schedule_message",
    description:
      "Agenda uma mensagem para envio futuro a um ou mais grupos WhatsApp. Use quando o usuário pedir para agendar, programar ou enviar mensagem em um horário específico.",
    inputSchema: {
      type: "object",
      properties: {
        grupo_nome: {
          type: "string",
          description:
            "Nome do grupo (busca parcial, case-insensitive). Ex: 'Vendas' encontra 'Grupo Vendas 2024'",
        },
        grupos_ids: {
          type: "array",
          items: { type: "number" },
          description: "IDs dos grupos no banco de dados (use list_groups para obter)",
        },
        categoria_id: {
          type: "number",
          description: "ID da categoria - envia para TODOS os grupos dessa categoria",
        },
        tipo_mensagem: {
          type: "string",
          enum: ["texto", "imagem", "video", "audio"],
          description: "Tipo da mensagem (padrão: texto)",
        },
        conteudo_texto: {
          type: "string",
          description: "Texto da mensagem ou legenda da mídia",
        },
        url_midia: {
          type: "string",
          description: "URL da mídia (obrigatório para imagem/video/audio)",
        },
        data: {
          type: "string",
          description: "Data de envio no formato YYYY-MM-DD (ex: 2026-01-06)",
        },
        hora: {
          type: "string",
          description: "Hora de envio no formato HH:MM (ex: 14:30)",
        },
      },
      required: ["conteudo_texto", "data", "hora"],
    },
  },
];

export function getToolByName(name: string): McpTool | undefined {
  return MCP_TOOLS.find((tool) => tool.name === name);
}
