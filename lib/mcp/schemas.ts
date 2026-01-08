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

// Schema para regra de condição individual
const condicaoRegraSchema = z.object({
  campo: z.string().min(1, "Campo é obrigatório"),
  operador: z.enum(["contem", "igual", "comeca_com", "termina_com", "regex"]),
  valor: z.string(),
});

// Schema para condições (filtros)
const condicoesSchema = z.object({
  operador: z.enum(["AND", "OR"]).default("AND"),
  regras: z.array(condicaoRegraSchema).min(1, "Pelo menos uma regra é obrigatória"),
});

// Schema para configuração da ação
const configAcaoSchema = z.object({
  tipo_envio: z.enum(["nova", "responder", "encaminhar"]).optional().default("nova"),
  destino: z.enum(["mesmo_grupo", "outros_grupos", "numero"]).optional().default("mesmo_grupo"),
  mensagem: z.string().optional(),
  grupos_destino: z.array(z.number()).optional(),
  numero_destino: z.string().optional(),
  mencionar_autor: z.boolean().optional().default(false),
  // Para tipo_acao = enviar_webhook
  webhook_url: z.string().url().optional(),
  // Para tipo_acao = acionar_bot
  bot_id: z.number().optional(),
});

export const createTriggerSchema = z.object({
  // Básico
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),

  // ESCOPO - Onde aplicar
  escopo: z.enum(["todos", "categoria", "grupo"]).optional().default("todos"),
  id_categoria: z.number().optional(),
  id_grupo: z.number().optional(),

  // EVENTO - Quando disparar
  tipo_evento: z
    .enum(["mensagem_texto", "mensagem_recebida", "mensagem_midia", "membro_entrou", "membro_saiu"])
    .optional()
    .default("mensagem_texto"),

  // CONDIÇÕES - Filtros (modo avançado)
  condicoes: condicoesSchema.optional(),

  // AÇÃO - O que fazer
  tipo_acao: z
    .enum(["enviar_mensagem", "notificar_admin", "acionar_bot", "excluir_mensagem", "enviar_webhook"])
    .optional()
    .default("enviar_mensagem"),

  // CONFIG AÇÃO - Detalhes da ação (modo avançado)
  config_acao: configAcaoSchema.optional(),

  // MODO SIMPLES (compatibilidade) - gera condicoes e config_acao automaticamente
  palavras_chave: z.array(z.string()).optional(),
  resposta: z.string().optional(),
  tipo_resposta: z
    .enum(["texto", "imagem", "audio", "video", "documento"])
    .optional()
    .default("texto"),

  // Outros
  ativo: z.boolean().optional().default(true),
  prioridade: z.number().optional().default(100),
}).refine(
  (data) => {
    // Validar que escopo='categoria' requer id_categoria
    if (data.escopo === "categoria" && !data.id_categoria) {
      return false;
    }
    return true;
  },
  { message: "id_categoria é obrigatório quando escopo='categoria'", path: ["id_categoria"] }
).refine(
  (data) => {
    // Validar que escopo='grupo' requer id_grupo
    if (data.escopo === "grupo" && !data.id_grupo) {
      return false;
    }
    return true;
  },
  { message: "id_grupo é obrigatório quando escopo='grupo'", path: ["id_grupo"] }
).refine(
  (data) => {
    // Validar que pelo menos um modo foi fornecido (simples ou avançado)
    const temModoSimples = data.palavras_chave && data.palavras_chave.length > 0;
    const temModoAvancado = data.condicoes !== undefined;
    return temModoSimples || temModoAvancado;
  },
  { message: "Forneça palavras_chave (modo simples) ou condicoes (modo avançado)", path: ["condicoes"] }
);

export const createCommandSchema = z.object({
  comando: z
    .string()
    .min(1, "Comando é obrigatório")
    .startsWith("/", "Comando deve começar com /"),
  descricao: z.string().optional(),
  resposta: z.string().min(1, "Resposta é obrigatória"),
  ativo: z.boolean().optional().default(true),
});

export const createAgentSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  prompt_sistema: z.string().min(10, "Prompt deve ter pelo menos 10 caracteres"),
  modelo: z
    .enum(["gpt-4o-mini", "gpt-4o", "claude-3-haiku", "claude-3-sonnet"])
    .optional()
    .default("gpt-4o-mini"),
  temperatura: z.number().min(0).max(1).optional().default(0.7),
  ativo: z.boolean().optional().default(true),
});

export const scheduleMessageSchema = z.object({
  grupo_nome: z.string().optional(),
  grupos_ids: z.array(z.number()).optional(),
  categoria_id: z.number().optional(),
  tipo_mensagem: z
    .enum(["texto", "imagem", "video", "audio"])
    .optional()
    .default("texto"),
  conteudo_texto: z.string().min(1, "Conteúdo da mensagem é obrigatório"),
  url_midia: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || /^https?:\/\/.+/.test(val),
      "URL inválida. Deve começar com http:// ou https://"
    )
    .transform((val) => (val === "" ? undefined : val)),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "Hora deve estar no formato HH:MM"),
});

// Chat Agent Schemas
export const chatAgentRequestSchema = z.object({
  message: z.string().min(1, "Mensagem é obrigatória"),
  sessionId: z.string().uuid().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })
    )
    .optional(),
});
