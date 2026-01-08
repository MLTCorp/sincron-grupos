# Guia de Execucao de Tarefas - Sincron Grupos

**Documento de Instrucao para o Claude Code**

Este documento ensina COMO executar tarefas no projeto Sincron Grupos usando MCPs, Skills e ferramentas disponiveis. Leia este documento para entender como realizar acoes como: criar gatilhos, configurar comandos, gerenciar grupos WhatsApp, enviar mensagens, e implementar automacoes.

---

## IMPORTANTE: Como Voce (Claude) Executa Tarefas

Voce tem acesso a ferramentas poderosas atraves de MCPs. Quando o usuario pedir algo, siga este processo:

```
1. ENTENDER o que o usuario quer
2. IDENTIFICAR quais ferramentas/MCPs usar
3. EXECUTAR as acoes necessarias
4. VERIFICAR se funcionou
5. REPORTAR o resultado
```

### Ferramentas Disponiveis

| Ferramenta | O que faz | Quando usar |
|------------|-----------|-------------|
| `mcp__supabase__execute_sql` | Executa SQL no banco | Consultar/modificar dados |
| `mcp__supabase__apply_migration` | Cria/altera tabelas | Mudancas de schema |
| `mcp__supabase__list_tables` | Lista tabelas | Ver estrutura do banco |
| `Bash(curl:*)` | Faz requisicoes HTTP | Chamar APIs (UAZAPI, etc) |
| `Read/Write/Edit` | Manipula arquivos | Codigo, configs |
| `mcp__playwright__*` | Controla browser | Testes, automacao |

---

## EXECUCAO DE TAREFAS ESPECIFICAS

### Tarefa: Criar um Gatilho

Quando o usuario pedir para criar um gatilho, faca:

```
1. Verificar estrutura da tabela gatilhos:
   mcp__supabase__execute_sql
   project_id: qhjlxnzxazcqrkgojnbx
   query: SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'gatilhos'

2. Inserir o gatilho:
   mcp__supabase__execute_sql
   project_id: qhjlxnzxazcqrkgojnbx
   query: INSERT INTO gatilhos (id_organizacao, nome, tipo, condicoes, acao, config_acao, ativo)
          VALUES ('uuid-da-org', 'Nome do Gatilho', 'keyword',
                  '{"palavras": ["ola", "oi"], "match_type": "contains"}',
                  'send_message',
                  '{"tipo": "text", "mensagem": "Resposta automatica"}',
                  true)
          RETURNING *

3. Confirmar criacao:
   - Mostrar o gatilho criado
   - Explicar como ele vai funcionar
```

### Tarefa: Criar um Comando de Chatbot

Quando o usuario pedir para criar um comando (/ajuda, /regras, etc):

```
1. Verificar se tabela comandos existe:
   mcp__supabase__list_tables
   project_id: qhjlxnzxazcqrkgojnbx

2. Se nao existir, criar:
   mcp__supabase__apply_migration
   project_id: qhjlxnzxazcqrkgojnbx
   name: create_comandos_table
   query: CREATE TABLE comandos (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     id_organizacao UUID REFERENCES organizacoes(id),
     comando TEXT NOT NULL,
     resposta TEXT,
     ativo BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT NOW()
   );

3. Inserir o comando:
   mcp__supabase__execute_sql
   project_id: qhjlxnzxazcqrkgojnbx
   query: INSERT INTO comandos (id_organizacao, comando, resposta, ativo)
          VALUES ('uuid-org', '/ajuda', 'Lista de comandos...', true)
          RETURNING *
```

### Tarefa: Enviar Mensagem WhatsApp

Quando o usuario pedir para enviar mensagem:

```bash
# Via Bash com cURL
curl -X POST "https://mltcorp.uazapi.com/send/text" \
  -H "Content-Type: application/json" \
  -H "token: TOKEN_DA_INSTANCIA" \
  -d '{
    "number": "5511999999999",
    "text": "Sua mensagem aqui"
  }'
```

**Para pegar o token da instancia:**
```
mcp__supabase__execute_sql
project_id: qhjlxnzxazcqrkgojnbx
query: SELECT api_key FROM instancias_whatsapp WHERE id_organizacao = 'uuid' AND status = 'connected' LIMIT 1
```

### Tarefa: Listar Grupos da Instancia

```bash
# Primeiro pegar o token
# Depois chamar a API
curl -X GET "https://mltcorp.uazapi.com/group/all" \
  -H "token: TOKEN_DA_INSTANCIA"
```

### Tarefa: Configurar Webhook

```bash
curl -X POST "https://mltcorp.uazapi.com/webhook" \
  -H "Content-Type: application/json" \
  -H "token: TOKEN_DA_INSTANCIA" \
  -d '{
    "enabled": true,
    "url": "https://workflows.sincronia.digital/webhook/sincron-grupos/messages",
    "events": ["messages", "groups", "connection"],
    "excludeMessages": ["wasSentByApi"]
  }'
```

### Tarefa: Criar Agente IA

```
1. Inserir na tabela agentes_ia:
   mcp__supabase__execute_sql
   project_id: qhjlxnzxazcqrkgojnbx
   query: INSERT INTO agentes_ia (id_organizacao, nome, prompt_sistema, modelo, temperatura, ativo)
          VALUES ('uuid-org', 'Assistente de Vendas',
                  'Voce e um assistente de vendas...',
                  'gpt-4o-mini', 0.7, true)
          RETURNING *
```

### Tarefa: Ver Status da Instancia WhatsApp

```bash
curl -X GET "https://mltcorp.uazapi.com/instance/status" \
  -H "token: TOKEN_DA_INSTANCIA"
```

### Tarefa: Criar Componente React

Use a skill `ui-components-skill` ou o MCP `@21st-dev/magic`:

```
mcp__magic__21st_magic_component_builder
message: "Criar um card de gatilho com toggle de ativo"
searchQuery: "card toggle switch"
```

### Tarefa: Implementar Pagina de CRUD

1. Ler arquivo existente para entender o padrao
2. Criar/editar o arquivo da pagina
3. Usar componentes shadcn/ui
4. Conectar com Supabase via `createClient()`

---

## CONSULTAS SQL UTEIS

### Ver todos os gatilhos de uma organizacao
```sql
SELECT * FROM gatilhos
WHERE id_organizacao = 'uuid'
ORDER BY prioridade ASC
```

### Ver comandos ativos
```sql
SELECT * FROM comandos
WHERE ativo = true
ORDER BY comando
```

### Ver instancias conectadas
```sql
SELECT id, nome, status, api_key
FROM instancias_whatsapp
WHERE status = 'connected'
```

### Ver grupos de uma organizacao
```sql
SELECT g.*, c.nome as categoria
FROM grupos g
LEFT JOIN grupos_categorias gc ON g.id = gc.id_grupo
LEFT JOIN categorias c ON gc.id_categoria = c.id
WHERE g.id_organizacao = 'uuid'
```

### Ver agentes IA
```sql
SELECT * FROM agentes_ia
WHERE id_organizacao = 'uuid'
AND ativo = true
```

---

## PADROES DE CODIGO DO PROJETO

### Hook de Dados da Organizacao
```tsx
const { instancias, grupos, gatilhos, categorias, loading } = useOrganizationData()
```

### Cliente Supabase (Client Component)
```tsx
"use client"
import { createClient } from "@/lib/supabase/client"
const supabase = createClient()
```

### Cliente Supabase (Server Component)
```tsx
import { createClient } from "@/lib/supabase/server"
const supabase = await createClient()
```

### Permissoes
```tsx
import { usePermissions } from "@/hooks/use-permissions"
const { hasPermission, isOwner } = usePermissions()
if (hasPermission('configurar_gatilhos')) { ... }
```

---

## FLUXO DE TRABALHO TIPICO

Quando o usuario pede uma feature nova:

```
1. ANALISAR o que ja existe
   - Ler arquivos relacionados
   - Ver estrutura do banco

2. PLANEJAR a implementacao
   - Quais tabelas criar/modificar?
   - Quais componentes criar?
   - Qual workflow N8N?

3. EXECUTAR em ordem
   - Primeiro: migrations (banco)
   - Segundo: types (gerar tipos)
   - Terceiro: codigo (componentes)
   - Quarto: testes

4. VERIFICAR
   - Testar a funcionalidade
   - Verificar erros no console
```

---

## ARQUITETURA DO AGENTE CONVERSACIONAL (Referencia do Copysr)

O projeto Copysr usa um agente conversacional que chama funcoes (function calling) via OpenRouter/OpenAI.
Essa mesma arquitetura pode ser aplicada ao Sincron Grupos para criar um agente que gerencia grupos WhatsApp.

### Componentes do Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ARQUITETURA DO AGENTE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. SYSTEM PROMPT (lib/chat/agent-prompt.ts)                               │
│     - Define personalidade do agente                                        │
│     - Lista capacidades                                                     │
│     - Instrui como usar ferramentas                                         │
│                                                                             │
│  2. TOOLS/FERRAMENTAS (lib/mcp/tools.ts)                                   │
│     - Define cada ferramenta com schema JSON                                │
│     - Nome, descricao, parametros                                          │
│     - Exporta em formato OpenAI                                            │
│                                                                             │
│  3. EXECUTOR (lib/mcp/executor.ts)                                         │
│     - Dispatcher que executa ferramentas                                    │
│     - Valida entrada com Zod                                               │
│     - Chama APIs internas                                                  │
│                                                                             │
│  4. CHAT ROUTE (/api/chat/agent/route.ts)                                  │
│     - Recebe mensagem do usuario                                           │
│     - Chama OpenRouter com tools                                           │
│     - Executa tool_calls                                                   │
│     - Retorna resposta                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Fluxo de Execucao

```
Usuario: "Crie um gatilho para responder 'oi'"
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  /api/chat/agent                                 │
│  - Autentica usuario                             │
│  - Carrega system prompt + tools                 │
│  - Envia para OpenRouter                         │
└──────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  OpenRouter (GPT-4.1-mini ou Claude)             │
│  - Analisa mensagem                              │
│  - Decide: preciso chamar create_trigger         │
│  - Retorna: tool_calls: [{                       │
│      name: "create_trigger",                     │
│      arguments: { palavra: "oi", resposta: "..." }│
│    }]                                            │
└──────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  executeTool("create_trigger", args)             │
│  - Valida com Zod                                │
│  - Chama Supabase ou API interna                 │
│  - Retorna: { success: true, data: {...} }       │
└──────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  OpenRouter (novamente)                          │
│  - Recebe resultado da tool                      │
│  - Gera resposta: "Gatilho criado com sucesso!"  │
└──────────────────────────────────────────────────┘
                    │
                    ▼
            Resposta ao usuario
```

### Exemplo: Definicao de Ferramenta (tools.ts)

```typescript
// lib/mcp/tools.ts
export const createTriggerTool = {
  name: "create_trigger",
  description: "Cria um gatilho para responder automaticamente a mensagens",
  inputSchema: {
    type: "object",
    properties: {
      palavras: {
        type: "array",
        items: { type: "string" },
        description: "Palavras-chave que ativam o gatilho"
      },
      resposta: {
        type: "string",
        description: "Mensagem de resposta automatica"
      },
      tipo: {
        type: "string",
        enum: ["exato", "contem"],
        default: "contem"
      }
    },
    required: ["palavras", "resposta"]
  }
};

// Converte para formato OpenAI
export function getOpenAITools() {
  return [createTriggerTool, ...].map(tool => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema
    }
  }));
}
```

### Exemplo: Executor (executor.ts)

```typescript
// lib/mcp/executor.ts
export async function executeTool(
  toolName: string,
  input: unknown,
  options: { userId: string }
) {
  switch (toolName) {
    case "create_trigger":
      return await executeCreateTrigger(input, options.userId);
    case "send_message":
      return await executeSendMessage(input, options.userId);
    case "list_groups":
      return await executeListGroups(options.userId);
    // ... outras ferramentas
    default:
      return { success: false, error: "Ferramenta desconhecida" };
  }
}

async function executeCreateTrigger(input: any, userId: string) {
  const supabase = createClient();

  // Buscar organizacao do usuario
  const { data: usuario } = await supabase
    .from("usuarios_sistema")
    .select("id_organizacao")
    .eq("user_id", userId)
    .single();

  // Criar gatilho
  const { data, error } = await supabase
    .from("gatilhos")
    .insert({
      id_organizacao: usuario.id_organizacao,
      nome: `Resposta para: ${input.palavras.join(", ")}`,
      tipo: "keyword",
      condicoes: { palavras: input.palavras, match_type: input.tipo },
      acao: "send_message",
      config_acao: { mensagem: input.resposta },
      ativo: true
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
```

### Exemplo: Chat Route (route.ts)

```typescript
// app/api/chat/agent/route.ts
import { openrouter } from "@/lib/openrouter/client";
import { getOpenAITools, executeTool } from "@/lib/mcp";
import { AGENT_SYSTEM_PROMPT } from "@/lib/chat/agent-prompt";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { message, sessionId } = await request.json();

  // Chamar LLM com tools
  const tools = getOpenAITools();

  let completion = await openrouter.chat.completions.create({
    model: "openai/gpt-4.1-mini",
    messages: [
      { role: "system", content: AGENT_SYSTEM_PROMPT },
      { role: "user", content: message }
    ],
    tools,
    tool_choice: "auto"
  });

  let assistantMessage = completion.choices[0]?.message;

  // Executar tool_calls se houver
  while (assistantMessage?.tool_calls?.length > 0) {
    for (const toolCall of assistantMessage.tool_calls) {
      const result = await executeTool(
        toolCall.function.name,
        JSON.parse(toolCall.function.arguments),
        { userId: user.id }
      );

      // Adicionar resultado e continuar conversa
      // ...
    }
  }

  return NextResponse.json({
    success: true,
    message: assistantMessage.content
  });
}
```

### Ferramentas Sugeridas para Sincron Grupos

| Ferramenta | Descricao |
|------------|-----------|
| `create_trigger` | Criar gatilho de resposta automatica |
| `create_command` | Criar comando de chatbot (/ajuda, etc) |
| `send_message` | Enviar mensagem WhatsApp |
| `list_groups` | Listar grupos da instancia |
| `sync_groups` | Sincronizar grupos do WhatsApp |
| `create_agent` | Criar agente IA |
| `configure_webhook` | Configurar webhook da instancia |
| `get_instance_status` | Ver status da instancia WhatsApp |

### Como Implementar no Sincron Grupos

1. **Criar lib/mcp/tools.ts** - Definir ferramentas com schemas
2. **Criar lib/mcp/executor.ts** - Implementar execucao de cada ferramenta
3. **Criar lib/chat/agent-prompt.ts** - System prompt do agente
4. **Criar app/api/chat/agent/route.ts** - Rota do chat
5. **Instalar openai ou usar OpenRouter** - Cliente para LLM
6. **Criar tabela agent_chats** - Armazenar historico

### Configuracao OpenRouter

```typescript
// lib/openrouter/client.ts
import OpenAI from "openai";

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

export const MODELS = {
  GPT_4_1_MINI: "openai/gpt-4.1-mini",
  CLAUDE_SONNET: "anthropic/claude-3.5-sonnet"
};
```

---

## Indice Completo

1. [Visao Geral da Arquitetura](#1-visao-geral-da-arquitetura)
2. [MCPs - Model Context Protocol](#2-mcps---model-context-protocol)
3. [Skills - Ensinando o Claude](#3-skills---ensinando-o-claude)
4. [Commands - Slash Commands](#4-commands---slash-commands)
5. [Fazendo Requisicoes HTTP](#5-fazendo-requisicoes-http)
6. [Integracoes Disponiveis](#6-integracoes-disponiveis)
7. [Padrao de Implementacao: Gatilhos](#7-padrao-de-implementacao-gatilhos)
8. [Padrao de Implementacao: Comandos](#8-padrao-de-implementacao-comandos)
9. [Workflows N8N](#9-workflows-n8n)
10. [Exemplos Praticos](#10-exemplos-praticos)

---

## 1. Visao Geral da Arquitetura

### Estrutura de Pastas

```
projeto/
├── .mcp.json                    # Configuracao dos servidores MCP
├── .claude/
│   ├── settings.local.json      # Permissoes e MCPs habilitados
│   ├── skills/                  # Skills que ensinam o Claude
│   │   ├── n8n-development-skill/
│   │   ├── uazapi-whatsapp-skill/
│   │   ├── ui-components-skill/
│   │   └── security-audit-skill/
│   └── commands/                # Slash commands personalizados
│       ├── iniciar.md
│       ├── terminar.md
│       └── security-audit.md
└── docs/
    └── ARQUITETURA-CLAUDE-MCP.md  # Este documento
```

### Como Tudo se Conecta

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLAUDE CODE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐        │
│  │   SKILLS     │   │   COMMANDS   │   │    MCPs      │        │
│  │              │   │              │   │              │        │
│  │ Ensinam      │   │ Executam     │   │ Conectam     │        │
│  │ como fazer   │   │ fluxos       │   │ servicos     │        │
│  │ tarefas      │   │ completos    │   │ externos     │        │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘        │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    EXECUCAO                              │   │
│  │  • Supabase (banco de dados)                            │   │
│  │  • UAZAPI (WhatsApp)                                    │   │
│  │  • N8N (workflows)                                      │   │
│  │  • Playwright (automacao browser)                       │   │
│  │  • Filesystem (arquivos)                                │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. MCPs - Model Context Protocol

### O que sao MCPs?

MCPs sao servidores que estendem as capacidades do Claude, permitindo:
- Executar SQL no Supabase
- Enviar mensagens WhatsApp
- Controlar navegador (Playwright)
- Acessar sistema de arquivos
- Buscar componentes UI

### Arquivo de Configuracao: `.mcp.json`

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "sbp_seu_token_aqui"
      ]
    },
    "@21st-dev/magic": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@21st-dev/magic@latest",
        "API_KEY=sua_api_key"
      ]
    },
    "playwright": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@playwright/mcp@latest"
      ]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:\\"]
    }
  }
}
```

### Habilitando MCPs: `settings.local.json`

```json
{
  "permissions": {
    "allow": [
      "mcp__supabase__list_tables",
      "mcp__supabase__apply_migration",
      "mcp__supabase__execute_sql",
      "mcp__supabase__generate_typescript_types",
      "mcp__playwright__browser_navigate",
      "mcp__playwright__browser_click",
      "mcp__playwright__browser_snapshot"
    ]
  },
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": [
    "supabase",
    "@21st-dev/magic",
    "playwright"
  ]
}
```

### MCPs Disponiveis Neste Projeto

| MCP | Funcao | Ferramentas Principais |
|-----|--------|------------------------|
| `supabase` | Banco de dados | `execute_sql`, `apply_migration`, `list_tables` |
| `playwright` | Automacao browser | `browser_navigate`, `browser_click`, `browser_snapshot` |
| `@21st-dev/magic` | Componentes UI | `21st_magic_component_builder` |

### Usando MCPs - Exemplos

**Executar SQL no Supabase:**
```
mcp__supabase__execute_sql
project_id: qhjlxnzxazcqrkgojnbx
query: SELECT * FROM gatilhos WHERE ativo = true
```

**Aplicar Migration:**
```
mcp__supabase__apply_migration
project_id: qhjlxnzxazcqrkgojnbx
name: add_comando_tipo_resposta
query: ALTER TABLE comandos ADD COLUMN tipo_resposta TEXT DEFAULT 'texto';
```

**Gerar Types TypeScript:**
```
mcp__supabase__generate_typescript_types
project_id: qhjlxnzxazcqrkgojnbx
```

---

## 3. Skills - Ensinando o Claude

### O que sao Skills?

Skills sao documentos Markdown que ensinam o Claude a executar tarefas especificas. Cada skill contem:
- Principios fundamentais
- Quando usar
- Passo a passo
- Exemplos de codigo
- Padroes de integracao

### Estrutura de uma Skill

```
skill-name/
├── SKILL.md           # Arquivo principal (obrigatorio)
├── API-REFERENCE.md   # Documentacao detalhada de APIs
├── PATTERNS.md        # Padroes de uso comum
├── EXAMPLES.md        # Exemplos de codigo
└── EXAMPLES-LIBRARY/  # Biblioteca de exemplos reais
    └── INDEX.md
```

### Formato do SKILL.md

```markdown
---
name: nome-da-skill
description: Descricao curta de quando usar esta skill
---

# Nome da Skill

## Core Principles

Regras fundamentais que SEMPRE devem ser seguidas.

## When to Use This Skill

Lista de situacoes que ativam esta skill.

## Passo a Passo

Instrucoes detalhadas de como executar tarefas.

## Exemplos

Codigo pronto para copiar e usar.
```

### Skills Disponiveis

#### 1. n8n-development-skill
**Quando usar:** Criar workflows N8N, automacoes, integracao com PostgreSQL

**Capacidades:**
- Gerar JSON de workflow N8N completo
- Padrao WhatsApp/UAZAPI com normalizacao
- Integracao PostgreSQL com CTEs
- 38+ exemplos de producao

#### 2. uazapi-whatsapp-skill
**Quando usar:** Integrar WhatsApp, enviar mensagens, configurar webhooks

**Capacidades:**
- Autenticacao admin vs instance token
- Envio de mensagens (texto, midia, menus)
- Configuracao de webhooks
- Chatbots com IA
- Campanhas em massa
- Gestao de grupos

#### 3. ui-components-skill
**Quando usar:** Criar componentes React, usar shadcn/ui, animacoes

**Capacidades:**
- Instalacao de componentes shadcn
- Templates prontos (timelines, heroes, cards)
- Animacoes com Framer Motion

#### 4. security-audit-skill
**Quando usar:** Auditar seguranca, verificar vulnerabilidades

**Capacidades:**
- Deteccao de secrets expostos
- SQL injection
- XSS
- Validacao RLS

---

## 4. Commands - Slash Commands

### O que sao Commands?

Commands sao arquivos `.md` que definem fluxos de trabalho completos, ativados com `/nome-do-comando`.

### Estrutura

```
.claude/commands/
├── iniciar.md        # /iniciar - Inicia sessao
├── terminar.md       # /terminar - Finaliza com relatorio
└── security-audit.md # /security-audit - Auditoria
```

### Formato de um Command

```markdown
# Titulo do Comando

## Objetivo
Descricao do que este comando faz.

## Etapas

### Etapa 1: Nome
Instrucoes detalhadas...

### Etapa 2: Nome
Mais instrucoes...

## Output
O que deve ser gerado no final.
```

### Commands Disponiveis

| Comando | Descricao |
|---------|-----------|
| `/iniciar` | Carrega contexto da sessao anterior |
| `/terminar` | Gera relatorio e salva progresso |
| `/security-audit` | Executa auditoria de seguranca |

---

## 5. Fazendo Requisicoes HTTP

### Via Bash com cURL

```bash
# GET simples
curl -X GET "https://mltcorp.uazapi.com/instance/status" \
  -H "token: seu-token-aqui"

# POST com JSON
curl -X POST "https://mltcorp.uazapi.com/send/text" \
  -H "Content-Type: application/json" \
  -H "token: seu-token-aqui" \
  -d '{
    "number": "5511999999999",
    "text": "Mensagem de teste"
  }'
```

### Via API Routes do Next.js

O projeto tem rotas proxy em `app/api/uazapi/`:

```typescript
// Exemplo: app/api/uazapi/instances/[token]/send/text/route.ts
export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  const body = await request.json()

  const response = await fetch(`${UAZAPI_BASE_URL}/send/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'token': params.token
    },
    body: JSON.stringify(body)
  })

  return Response.json(await response.json())
}
```

### Via Supabase Edge Function

```typescript
// supabase/functions/send-whatsapp/index.ts
Deno.serve(async (req) => {
  const { number, text, token } = await req.json()

  const response = await fetch('https://mltcorp.uazapi.com/send/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'token': token
    },
    body: JSON.stringify({ number, text })
  })

  return new Response(JSON.stringify(await response.json()))
})
```

---

## 6. Integracoes Disponiveis

### UAZAPI (WhatsApp)

**Base URL:** `https://mltcorp.uazapi.com`

**Autenticacao:**
- Admin Token: `admintoken: xxx` (gestao de instancias)
- Instance Token: `token: xxx` (operacoes diarias)

**Endpoints Principais:**

| Acao | Metodo | Endpoint |
|------|--------|----------|
| Criar instancia | POST | /instance/init |
| Conectar | POST | /instance/connect |
| Status | GET | /instance/status |
| Enviar texto | POST | /send/text |
| Enviar midia | POST | /send/media |
| Enviar menu | POST | /send/menu |
| Webhook | POST | /webhook |
| Buscar chats | POST | /chat/find |

**Exemplo - Enviar Mensagem:**
```json
POST /send/text
Headers: token: seu-token
Body: {
  "number": "5511999999999",
  "text": "Ola! Como posso ajudar?"
}
```

**Exemplo - Configurar Webhook:**
```json
POST /webhook
Headers: token: seu-token
Body: {
  "enabled": true,
  "url": "https://seu-servidor.com/webhook",
  "events": ["messages", "connection"],
  "excludeMessages": ["wasSentByApi"]
}
```

### Supabase

**Project ID:** `qhjlxnzxazcqrkgojnbx`

**Tabelas Principais:**
- `organizacoes` - Tenants
- `instancias_whatsapp` - Instancias WhatsApp
- `grupos` - Grupos gerenciados
- `gatilhos` - Event triggers
- `comandos` - Comandos de chatbot (a criar)
- `agentes_ia` - Configuracao de agentes IA

**Via MCP:**
```
mcp__supabase__execute_sql
project_id: qhjlxnzxazcqrkgojnbx
query: SELECT * FROM gatilhos WHERE id_organizacao = 'uuid'
```

**Via Cliente TypeScript:**
```typescript
const supabase = createClient()
const { data } = await supabase
  .from('gatilhos')
  .select('*')
  .eq('ativo', true)
```

### N8N (Workflows)

**URL:** `https://workflows.sincronia.digital`

**Webhook Base:** `https://workflows.sincronia.digital/webhook/`

**Padrao de Workflow:**
```
Webhook → Normalizacao → Logica → Acao → Resposta
```

---

## 7. Padrao de Implementacao: Gatilhos

### Estrutura da Tabela `gatilhos`

```sql
CREATE TABLE gatilhos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_organizacao UUID REFERENCES organizacoes(id),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'keyword', 'event', 'schedule'
  condicoes JSONB,
  acao TEXT NOT NULL, -- 'send_message', 'call_webhook', 'run_agent'
  config_acao JSONB,
  ativo BOOLEAN DEFAULT true,
  prioridade INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Fluxo de Processamento

```
1. Mensagem chega via Webhook UAZAPI
   ↓
2. N8N recebe e normaliza dados
   ↓
3. Consulta gatilhos ativos no Supabase
   ↓
4. Verifica condicoes (keyword match, evento, etc.)
   ↓
5. Executa acao configurada
   ↓
6. Registra log da execucao
```

### Exemplo: Gatilho por Palavra-Chave

```json
{
  "nome": "Resposta Automatica - Preco",
  "tipo": "keyword",
  "condicoes": {
    "palavras": ["preco", "valor", "quanto custa"],
    "match_type": "contains",
    "ignore_groups": true
  },
  "acao": "send_message",
  "config_acao": {
    "tipo": "text",
    "mensagem": "Nossos precos comecam em R$ 99/mes. Quer saber mais?"
  }
}
```

### Implementacao no N8N

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "sincron-grupos/gatilhos",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Normalizar",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "string": [
            {"name": "chatid", "value": "={{ $json.message.chatid }}"},
            {"name": "texto", "value": "={{ $json.message.text.toLowerCase() }}"},
            {"name": "token", "value": "={{ $json.token }}"}
          ]
        }
      }
    },
    {
      "name": "Buscar Gatilhos",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "query": "SELECT * FROM gatilhos WHERE ativo = true ORDER BY prioridade"
      }
    },
    {
      "name": "Verificar Match",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [{
            "value1": "={{ $('Normalizar').item.json.texto }}",
            "operation": "contains",
            "value2": "={{ $json.condicoes.palavras[0] }}"
          }]
        }
      }
    },
    {
      "name": "Enviar Resposta",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://mltcorp.uazapi.com/send/text",
        "method": "POST",
        "headers": {
          "token": "={{ $('Normalizar').item.json.token }}"
        },
        "body": {
          "number": "={{ $('Normalizar').item.json.chatid }}",
          "text": "={{ $json.config_acao.mensagem }}"
        }
      }
    }
  ]
}
```

---

## 8. Padrao de Implementacao: Comandos

### Estrutura da Tabela `comandos`

```sql
CREATE TABLE comandos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_organizacao UUID REFERENCES organizacoes(id),
  comando TEXT NOT NULL, -- ex: '/ajuda', '/regras'
  descricao TEXT,
  tipo_match TEXT DEFAULT 'exato', -- 'exato', 'comeca_com'
  resposta TEXT,
  tipo_resposta TEXT DEFAULT 'texto', -- 'texto', 'menu', 'agente'
  config_resposta JSONB,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(id_organizacao, comando)
);
```

### Fluxo de Processamento

```
1. Mensagem chega com "/" no inicio
   ↓
2. Extrai comando (ex: /ajuda -> ajuda)
   ↓
3. Busca comando na tabela
   ↓
4. Verifica se match (exato ou comeca_com)
   ↓
5. Executa resposta configurada
```

### Exemplo: Comando /ajuda

```json
{
  "comando": "/ajuda",
  "descricao": "Lista comandos disponiveis",
  "tipo_match": "exato",
  "tipo_resposta": "texto",
  "resposta": "Comandos disponiveis:\n/ajuda - Esta mensagem\n/regras - Regras do grupo\n/admin - Chamar administrador"
}
```

### Exemplo: Comando com Menu

```json
{
  "comando": "/menu",
  "descricao": "Menu principal",
  "tipo_match": "exato",
  "tipo_resposta": "menu",
  "config_resposta": {
    "type": "button",
    "text": "Como posso ajudar?",
    "choices": [
      "Suporte|suporte",
      "Vendas|vendas",
      "Financeiro|financeiro"
    ]
  }
}
```

### Implementacao Frontend (React)

```tsx
// app/(dashboard)/commands/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Comando {
  id: string
  comando: string
  descricao: string
  resposta: string
  tipo_resposta: string
  ativo: boolean
}

export default function CommandsPage() {
  const [comandos, setComandos] = useState<Comando[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadComandos()
  }, [])

  async function loadComandos() {
    const { data } = await supabase
      .from('comandos')
      .select('*')
      .order('comando')

    if (data) setComandos(data)
  }

  async function createComando(comando: Partial<Comando>) {
    const { data, error } = await supabase
      .from('comandos')
      .insert(comando)
      .select()
      .single()

    if (data) {
      setComandos([...comandos, data])
    }
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await supabase
      .from('comandos')
      .update({ ativo })
      .eq('id', id)

    setComandos(comandos.map(c =>
      c.id === id ? { ...c, ativo } : c
    ))
  }

  return (
    <div className="p-6">
      <h1>Comandos</h1>
      {/* UI de CRUD */}
    </div>
  )
}
```

---

## 9. Workflows N8N

### Padrao de Workflow UAZAPI

Todo workflow que recebe mensagens WhatsApp deve seguir este padrao:

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Webhook   │ -> │ Normalizacao │ -> │   Logica    │
│   (entry)   │    │  (variaveis) │    │ (condicoes) │
└─────────────┘    └──────────────┘    └─────────────┘
                                              │
                         ┌────────────────────┴────────────────────┐
                         ▼                                         ▼
                   ┌──────────┐                              ┌──────────┐
                   │ Supabase │                              │  UAZAPI  │
                   │ (dados)  │                              │ (enviar) │
                   └──────────┘                              └──────────┘
```

### No de Normalizacao (OBRIGATORIO)

```json
{
  "name": "variaveis",
  "type": "n8n-nodes-base.set",
  "parameters": {
    "mode": "manual",
    "duplicateItem": false,
    "assignments": {
      "assignments": [
        {"name": "messageid", "value": "={{ $json.message?.messageid }}", "type": "string"},
        {"name": "chatid", "value": "={{ $json.message?.chatid }}", "type": "string"},
        {"name": "sender", "value": "={{ $json.message?.sender }}", "type": "string"},
        {"name": "senderName", "value": "={{ $json.message?.senderName }}", "type": "string"},
        {"name": "fromMe", "value": "={{ $json.message?.fromMe }}", "type": "boolean"},
        {"name": "isGroup", "value": "={{ $json.message?.isGroup }}", "type": "boolean"},
        {"name": "groupName", "value": "={{ $json.message?.groupName }}", "type": "string"},
        {"name": "messageType", "value": "={{ $json.message?.messageType }}", "type": "string"},
        {"name": "text", "value": "={{ $json.message?.text || $json.message?.content?.text }}", "type": "string"},
        {"name": "messageTimestamp", "value": "={{ $json.message?.messageTimestamp }}", "type": "number"},
        {"name": "event", "value": "={{ $json.event }}", "type": "string"},
        {"name": "instance", "value": "={{ $json.instance }}", "type": "string"},
        {"name": "token", "value": "={{ $json.token }}", "type": "string"},
        {"name": "BaseUrl", "value": "={{ $json.BaseUrl }}", "type": "string"}
      ]
    }
  }
}
```

### Exemplo Completo: Workflow de Gatilhos

```json
{
  "name": "Sincron Grupos - Processar Gatilhos",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "sincron-grupos/gatilhos",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [220, 300]
    },
    {
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {"name": "chatid", "value": "={{ $json.message.chatid }}", "type": "string"},
            {"name": "texto", "value": "={{ ($json.message.text || '').toLowerCase() }}", "type": "string"},
            {"name": "token", "value": "={{ $json.token }}", "type": "string"},
            {"name": "isGroup", "value": "={{ $json.message.isGroup }}", "type": "boolean"},
            {"name": "fromMe", "value": "={{ $json.message.fromMe }}", "type": "boolean"}
          ]
        }
      },
      "name": "Normalizar",
      "type": "n8n-nodes-base.set",
      "position": [440, 300]
    },
    {
      "parameters": {
        "conditions": {
          "options": {"caseSensitive": true},
          "conditions": [
            {"leftValue": "={{ $json.fromMe }}", "rightValue": false, "operator": {"type": "boolean", "operation": "equals"}}
          ]
        }
      },
      "name": "Nao eh minha msg?",
      "type": "n8n-nodes-base.if",
      "position": [660, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT g.*, i.api_key as token FROM gatilhos g JOIN instancias_whatsapp i ON g.id_organizacao = i.id_organizacao WHERE g.ativo = true ORDER BY g.prioridade",
        "options": {}
      },
      "name": "Buscar Gatilhos",
      "type": "n8n-nodes-base.postgres",
      "position": [880, 200]
    },
    {
      "parameters": {
        "jsCode": "// Verificar se texto contem alguma palavra-chave\nconst texto = $('Normalizar').item.json.texto;\nconst gatilhos = $input.all();\n\nfor (const gatilho of gatilhos) {\n  const palavras = gatilho.json.condicoes?.palavras || [];\n  for (const palavra of palavras) {\n    if (texto.includes(palavra.toLowerCase())) {\n      return [{ json: { ...gatilho.json, matched: true, matched_word: palavra } }];\n    }\n  }\n}\n\nreturn [{ json: { matched: false } }];"
      },
      "name": "Verificar Match",
      "type": "n8n-nodes-base.code",
      "position": [1100, 200]
    },
    {
      "parameters": {
        "conditions": {
          "conditions": [
            {"leftValue": "={{ $json.matched }}", "rightValue": true, "operator": {"type": "boolean", "operation": "equals"}}
          ]
        }
      },
      "name": "Tem match?",
      "type": "n8n-nodes-base.if",
      "position": [1320, 200]
    },
    {
      "parameters": {
        "url": "=https://mltcorp.uazapi.com/send/text",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [{"name": "token", "value": "={{ $('Normalizar').item.json.token }}"}]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {"name": "number", "value": "={{ $('Normalizar').item.json.chatid }}"},
            {"name": "text", "value": "={{ $json.config_acao.mensagem }}"}
          ]
        }
      },
      "name": "Enviar Resposta",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1540, 100]
    }
  ],
  "connections": {
    "Webhook": {"main": [[{"node": "Normalizar"}]]},
    "Normalizar": {"main": [[{"node": "Nao eh minha msg?"}]]},
    "Nao eh minha msg?": {"main": [[{"node": "Buscar Gatilhos"}], []]},
    "Buscar Gatilhos": {"main": [[{"node": "Verificar Match"}]]},
    "Verificar Match": {"main": [[{"node": "Tem match?"}]]},
    "Tem match?": {"main": [[{"node": "Enviar Resposta"}], []]}
  }
}
```

---

## 10. Exemplos Praticos

### Exemplo 1: Criar Tabela de Comandos

```sql
-- Via MCP ou Migration
CREATE TABLE IF NOT EXISTS comandos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_organizacao UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  comando TEXT NOT NULL,
  descricao TEXT,
  tipo_match TEXT DEFAULT 'exato' CHECK (tipo_match IN ('exato', 'comeca_com')),
  resposta TEXT,
  tipo_resposta TEXT DEFAULT 'texto' CHECK (tipo_resposta IN ('texto', 'menu', 'agente')),
  config_resposta JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_organizacao, comando)
);

-- RLS
ALTER TABLE comandos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org commands"
  ON comandos FOR SELECT
  USING (id_organizacao IN (
    SELECT id_organizacao FROM usuarios_sistema
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own org commands"
  ON comandos FOR ALL
  USING (id_organizacao IN (
    SELECT id_organizacao FROM usuarios_sistema
    WHERE user_id = auth.uid()
  ));
```

### Exemplo 2: Enviar Mensagem WhatsApp via cURL

```bash
curl -X POST "https://mltcorp.uazapi.com/send/text" \
  -H "Content-Type: application/json" \
  -H "token: 7c517000-571d-4a6a-9701-35016f13a110" \
  -d '{
    "number": "5511999999999",
    "text": "Ola! Esta e uma mensagem de teste do Sincron Grupos."
  }'
```

### Exemplo 3: Configurar Webhook para Grupos

```bash
curl -X POST "https://mltcorp.uazapi.com/webhook" \
  -H "Content-Type: application/json" \
  -H "token: seu-token-aqui" \
  -d '{
    "enabled": true,
    "url": "https://workflows.sincronia.digital/webhook/sincron-grupos/messages",
    "events": ["messages", "groups"],
    "excludeMessages": ["wasSentByApi"],
    "addUrlEvents": true
  }'
```

### Exemplo 4: Query de Gatilhos Ativos

```sql
SELECT
  g.id,
  g.nome,
  g.tipo,
  g.condicoes,
  g.acao,
  g.config_acao,
  i.api_key as token,
  o.nome as organizacao
FROM gatilhos g
JOIN organizacoes o ON g.id_organizacao = o.id
JOIN instancias_whatsapp i ON g.id_organizacao = i.id_organizacao
WHERE g.ativo = true
  AND i.status = 'connected'
ORDER BY g.prioridade ASC;
```

### Exemplo 5: Componente React de Toggle

```tsx
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"

interface ToggleAtivoProps {
  id: string
  ativo: boolean
  tabela: 'gatilhos' | 'comandos'
  onToggle: (ativo: boolean) => void
}

export function ToggleAtivo({ id, ativo, tabela, onToggle }: ToggleAtivoProps) {
  const supabase = createClient()

  async function handleToggle(checked: boolean) {
    const { error } = await supabase
      .from(tabela)
      .update({ ativo: checked })
      .eq('id', id)

    if (!error) {
      onToggle(checked)
    }
  }

  return (
    <Switch
      checked={ativo}
      onCheckedChange={handleToggle}
    />
  )
}
```

---

## Resumo de Comandos Uteis

### Supabase via MCP

```
# Listar tabelas
mcp__supabase__list_tables
project_id: qhjlxnzxazcqrkgojnbx

# Executar SQL
mcp__supabase__execute_sql
project_id: qhjlxnzxazcqrkgojnbx
query: SELECT * FROM tabela

# Aplicar migration
mcp__supabase__apply_migration
project_id: qhjlxnzxazcqrkgojnbx
name: nome_da_migration
query: CREATE TABLE...

# Gerar types
mcp__supabase__generate_typescript_types
project_id: qhjlxnzxazcqrkgojnbx
```

### UAZAPI via cURL

```bash
# Status da instancia
curl -H "token: TOKEN" https://mltcorp.uazapi.com/instance/status

# Enviar mensagem
curl -X POST -H "token: TOKEN" -H "Content-Type: application/json" \
  -d '{"number":"5511...","text":"msg"}' \
  https://mltcorp.uazapi.com/send/text

# Listar grupos
curl -H "token: TOKEN" https://mltcorp.uazapi.com/group/all
```

### Git

```bash
git add .
git commit -m "feat: descricao"
git push origin main
```

---

## Checklist de Implementacao

### Para implementar Gatilhos:
- [ ] Verificar se tabela `gatilhos` existe
- [ ] Criar/ajustar campos conforme necessario
- [ ] Implementar UI de CRUD em `/triggers`
- [ ] Criar/atualizar workflow N8N
- [ ] Configurar webhook UAZAPI
- [ ] Testar fluxo completo

### Para implementar Comandos:
- [ ] Criar tabela `comandos` com migration
- [ ] Implementar UI de CRUD em `/commands`
- [ ] Adicionar logica no workflow N8N
- [ ] Testar comandos basicos (/ajuda, /regras)
- [ ] Adicionar menus interativos

### Para nova integracao:
- [ ] Documentar endpoints na skill apropriada
- [ ] Adicionar exemplos de requisicao
- [ ] Criar workflow N8N se necessario
- [ ] Testar em ambiente de desenvolvimento
- [ ] Atualizar este documento

---

**Ultima Atualizacao:** Janeiro 2025
**Mantido por:** Claude Code
**Projeto:** Sincron Grupos
