# 🎯 Guia de Instalação e Uso da Skill n8n

## 📦 O Que Foi Criado

Uma skill profissional para desenvolvimento n8n seguindo **todas** as melhores práticas da Anthropic, com **padrões de produção** para WhatsApp/uazapi e PostgreSQL.

### 📁 Estrutura Completa

```
n8n-development-skill/
├── 📄 SKILL.md                       # Instruções principais + padrões obrigatórios
├── 📚 NODE-REFERENCE.md              # Referência de nós (foco PostgreSQL)
├── 🎯 PATTERNS.md                    # Padrões de produção (NOVO!)
├── 💡 EXAMPLES.md                    # Workflows completos de exemplo
├── 🔗 MCP-INTEGRATION.md             # Integração OpenAI MCP
├── 🧪 TESTING-GUIDE.md               # Estratégias de teste
├── 📖 README.md                      # Documentação completa (English)
├── 📋 GUIA-INSTALACAO.md             # Este arquivo (Português)
└── 📚 EXAMPLES-LIBRARY/              # 38+ workflows de produção
    ├── INDEX.md                      # Catálogo pesquisável
    ├── USAGE-GUIDE.md                # Guia de uso diário
    ├── webhooks/                     # 13 workflows webhook
    ├── ai-agents/                    # 14 workflows AI
    ├── data-processing/              # 4 workflows processamento
    └── content-generation/           # 7 workflows geração de conteúdo
```

### 🤖 Subagents Especializados

**Localizados em**: `.claude/agents/`

```
.claude/agents/
├── n8n-example-finder.md         # Busca na biblioteca (38+ workflows)
├── n8n-workflow-analyzer.md      # Análise profunda + validação de padrões
└── n8n-workflow-adapter.md       # Adaptação de workflows existentes
```

### ⚡ Comandos Slash

**Localizados em**: `.claude/commands/`

```
.claude/commands/
├── n8n-find.md                   # /n8n-find - Buscar workflows
├── n8n-analyze.md                # /n8n-analyze - Analisar workflow
├── n8n-save.md                   # /n8n-save - Salvar na biblioteca
└── n8n-index.md                  # /n8n-index - Reindexar biblioteca
```

## 🚀 Como Instalar

### Passo 1: Instalar a Skill

**Opção A: Claude Desktop / Claude Code**

1. Abra o Claude Desktop ou Claude Code
2. Vá em **Settings** → **Capabilities** → **Skills**
3. Clique em **"Upload skill"**
4. Selecione a pasta **`n8n-development-skill`** completa
5. ✅ Skill instalada!

**Opção B: Copiar para .claude/skills/**

```bash
# Windows
xcopy /E /I n8n-development-skill C:\Users\SEU_USUARIO\.claude\skills\n8n-development-skill

# Linux/Mac
cp -r n8n-development-skill ~/.claude/skills/n8n-development-skill
```

### Passo 2: Instalar os Subagents

Os subagents devem estar em `.claude/agents/`:

```bash
# Windows
copy n8n-example-finder.md C:\Users\SEU_USUARIO\.claude\agents\
copy n8n-workflow-analyzer.md C:\Users\SEU_USUARIO\.claude\agents\
copy n8n-workflow-adapter.md C:\Users\SEU_USUARIO\.claude\agents\

# Linux/Mac
cp n8n-example-finder.md ~/.claude/agents/
cp n8n-workflow-analyzer.md ~/.claude/agents/
cp n8n-workflow-adapter.md ~/.claude/agents/
```

### Passo 3: Instalar os Comandos Slash

Os comandos devem estar em `.claude/commands/`:

```bash
# Windows
copy n8n-find.md C:\Users\SEU_USUARIO\.claude\commands\
copy n8n-analyze.md C:\Users\SEU_USUARIO\.claude\commands\
copy n8n-save.md C:\Users\SEU_USUARIO\.claude\commands\
copy n8n-index.md C:\Users\SEU_USUARIO\.claude\commands\

# Linux/Mac
cp n8n-find.md ~/.claude/commands/
cp n8n-analyze.md ~/.claude/commands/
cp n8n-save.md ~/.claude/commands/
cp n8n-index.md ~/.claude/commands/
```

### ✅ Verificação da Instalação

Após instalar, verifique:

1. **Skill ativa**: Em Settings → Skills, veja se "n8n-workflow-development" aparece
2. **Subagents disponíveis**: Digite `/agents` e veja se os 3 agents n8n aparecem
3. **Comandos disponíveis**: Digite `/` e veja se os comandos n8n aparecem na lista

## 🎯 Como Usar

### Ativação Automática

A skill é ativada automaticamente quando você:

- Menciona "n8n" ou "workflow"
- Pede para criar automações
- Precisa gerar código JSON para n8n
- Quer integrar OpenAI com MCP

### Exemplos de Prompts

**Básico:**
```
"Crie um workflow n8n que recebe um webhook e envia para OpenAI"
```

**Intermediário:**
```
"Preciso de um fluxo que busca dados de uma API a cada hora,
valida os dados e armazena no PostgreSQL"
```

**Avançado:**
```
"Crie um AI Agent usando OpenAI MCP servers para acessar
documentação do DeepWiki e Stripe"
```

## 🎯 Novos Padrões de Produção

### 📱 WhatsApp/Uazapi Pattern (Obrigatório)

Quando você disser "vamos fazer um workflow para WhatsApp", a skill irá:

1. ✅ **Confirmar o trigger**: Webhook ou Execute Workflow?
2. ✅ **Confirmar integração**: É uazapi?
3. ✅ **Adicionar normalização**: Nó "variaveis" após o webhook
4. ✅ **Usar PostgreSQL**: Queries otimizadas com CTEs
5. ✅ **Saída via uazapi**: Endpoints corretos

**Estrutura padrão gerada:**
```
Webhook → Normalização ("variaveis") → PostgreSQL → Saída (uazapi)
```

### 🗄️ PostgreSQL SEMPRE (Crítico)

**REGRA**: SEMPRE usar PostgreSQL com `executeQuery`. NUNCA usar Supabase.

**Padrões aplicados:**
- ✅ CTEs (WITH statements) para organizar lógica
- ✅ Query params ($1, $2, $3) para segurança
- ✅ `json_build_object()` para retornos estruturados
- ✅ CASE para lógica condicional dentro da query
- ✅ LEFT JOIN + COALESCE para evitar IFs desnecessários

**Benefício**: Menos nós, queries mais eficientes, código mais limpo.

### 📚 EXAMPLES-LIBRARY (38+ Workflows)

A skill tem acesso a 38+ workflows de produção categorizados:

- **🌐 Webhooks** (13): Tracking, roteamento, validação
- **🤖 AI Agents** (14): LangChain, RAG, MCP
- **🔄 Data Processing** (4): Scheduled, CRON, ETL
- **📝 Content Generation** (7): Briefings, summaries

Todos os workflows demonstram os padrões corretos.

### 🚀 Análise Paralela

Quando buscar múltiplos workflows, os subagents analisam **em paralelo**:

**Antes**: 3 workflows = ~30-60 segundos
**Agora**: 3 workflows = ~10-15 segundos (3x mais rápido!)

## ✨ Problemas Que a Skill Resolve

### ❌ ANTES (Sem a Skill)

**Problema 1: Código Fragmentado**
```json
{
  "id": "abc-123",
  "name": "HTTP Request",
  "type": "n8n-nodes-base.httpRequest"
}
```
→ **NÃO funciona!** Não pode ser importado no n8n.

**Problema 2: Endpoint Errado**
```json
{
  "url": "https://api.openai.com/v1/completions"
}
```
→ **ENDPOINT ANTIGO!** Não usa mais completions.

**Problema 3: Falta "options"**
```json
{
  "parameters": {
    "url": "...",
    "method": "POST"
    // Falta "options": {}
  }
}
```
→ **ERRO!** n8n vai falhar.

### ✅ DEPOIS (Com a Skill)

**Solução 1: Estrutura Completa**
```json
{
  "name": "Meu Workflow",
  "nodes": [
    {
      "id": "uuid-valido",
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [240, 300],
      "parameters": {
        "url": "...",
        "options": {}
      }
    }
  ],
  "connections": {},
  "settings": {
    "executionOrder": "v1"
  }
}
```
→ **✅ FUNCIONA!** Copy-paste direto no n8n.

**Solução 2: Endpoint Correto**
```json
{
  "url": "https://api.openai.com/v1/responses"
}
```
→ **✅ CORRETO!** Usa o endpoint atual.

**Solução 3: Sempre Inclui "options"**
```json
{
  "parameters": {
    "url": "...",
    "method": "POST",
    "options": {}  // ✅ Sempre presente!
  }
}
```
→ **✅ SEM ERROS!**

## 🎓 Recursos da Skill

### 1. Referência Completa de Nós

A skill conhece todos os tipos de nós n8n:
- Triggers (Webhook, Schedule, Manual, Execute Workflow)
- HTTP & APIs (Request, OpenAI, MCP, uazapi)
- Transformação (Set, Code, Split, Aggregate)
- Controle (IF, Switch, Loop, Merge)
- AI/LangChain (OpenAI, Agent, Tools, Memory, RAG)
- **Databases (PostgreSQL APENAS)** - Supabase não é usado
- Mensagens (Telegram, Slack, WhatsApp via uazapi)

### 2. Exemplos Prontos (38+ Workflows)

**EXAMPLES-LIBRARY** com workflows reais de produção:

**Trackers WhatsApp:**
- `pantero-tracker.json` - Tracker completo com roteamento
- `briefia-tracker.json` - Validação hierárquica PostgreSQL
- `comagent-tracker.json` - Events de grupo

**AI Agents:**
- `comagent-ai-group.json` - Agent com RAG
- `manytest-conversation-agent.json` - Memory management
- `pantero-whatsapp-commands.json` - Command handler

**PostgreSQL Avançado:**
- `briefia-message-segmentation.json` - CTEs complexas
- `pantero-groups.json` - Upsert multi-tabela

**Busque workflows:**
```
/n8n-find whatsapp routing        # Buscar padrões WhatsApp
/n8n-find ai agent rag           # Buscar AI com RAG
/n8n-find postgresql complex     # Buscar queries complexas
```

### 3. Integração MCP

Guia completo para usar OpenAI MCP servers:
- DeepWiki (documentação)
- Stripe (pagamentos)
- Servers customizados
- Fluxos de aprovação

### 4. Subagents Especializados

**n8n-example-finder** (Busca na biblioteca):
```bash
/n8n-find whatsapp webhook    # Buscar workflows
```
- Busca em 38+ workflows
- Ranqueia por relevância (1-10)
- Analisa múltiplos workflows em paralelo
- Retorna top 5-7 com recomendações

**n8n-workflow-analyzer** (Análise profunda):
```bash
/n8n-analyze pantero-tracker.json full
```
- Mapeia arquitetura completa
- Valida compliance com padrões (WhatsApp/PostgreSQL)
- Identifica padrões e complexidade
- Sugere melhorias

**n8n-workflow-adapter** (Adaptação):
```
"Adapte pantero-tracker.json para outro projeto"
```
- Modifica workflows para novos requisitos
- Mantém PostgreSQL (nunca converte para Supabase)
- Regenera UUIDs
- Preserva estrutura

### 5. Comandos Slash

**Buscar workflows:**
```bash
/n8n-find <critério>             # Ex: /n8n-find whatsapp ai
```

**Analisar workflow:**
```bash
/n8n-analyze <path> [modo]       # quick | full | compare
```

**Salvar na biblioteca:**
```bash
/n8n-save <path> [nome]          # Categoriza automaticamente
```

**Reindexar biblioteca:**
```bash
/n8n-index [--full|--quick]      # Reconstruir INDEX.md
```

## 🔧 Testando a Skill

### Teste 1: Workflow Simples

**Prompt:**
```
Crie um workflow n8n com trigger manual e um nó Set
```

**Verificar:**
- [ ] Retorna JSON completo com `nodes`, `connections`, `settings`
- [ ] IDs são UUIDs válidos
- [ ] Tem `"options": {}` nos parâmetros

### Teste 2: OpenAI

**Prompt:**
```
Crie um workflow que chama a API da OpenAI
```

**Verificar:**
- [ ] Usa endpoint `/v1/responses`
- [ ] **NÃO** usa `/v1/completions`
- [ ] Headers de autenticação corretos

### Teste 3: WhatsApp/Uazapi (NOVO)

**Prompt:**
```
Vamos fazer um workflow para processar mensagens do WhatsApp
```

**Verificar:**
- [ ] Pergunta se é integração uazapi
- [ ] Pergunta se é Webhook ou Execute Workflow Trigger
- [ ] Adiciona nó "variaveis" após o webhook
- [ ] Extrai campos padrão: chatId, groupName, user.whatsapp, message.text
- [ ] Extrai instance.number, instance.token, instance.host
- [ ] Usa PostgreSQL (NÃO Supabase)
- [ ] Saída usa endpoint uazapi (`/send/text`)

### Teste 4: PostgreSQL (NOVO)

**Prompt:**
```
Crie um workflow que valida se o grupo está ativo antes de processar
```

**Verificar:**
- [ ] Usa `operation: "executeQuery"`
- [ ] Usa CTEs (WITH statements)
- [ ] Tem query params ($1, $2, $3)
- [ ] Usa `json_build_object()` no SELECT
- [ ] Tem `queryReplacement` com referências aos nós anteriores
- [ ] NÃO usa nós Supabase

### Teste 5: Busca na EXAMPLES-LIBRARY (NOVO)

**Prompt:**
```
/n8n-find whatsapp tracker
```

**Verificar:**
- [ ] Retorna workflows relevantes (pantero-tracker, briefia-tracker, etc)
- [ ] Cada resultado tem score de relevância (1-10)
- [ ] Mostra caminho do arquivo
- [ ] Explica por que é relevante
- [ ] Limita a 5-7 resultados principais

### Teste 6: MCP

**Prompt:**
```
Crie um AI agent que usa MCP server do DeepWiki
```

**Verificar:**
- [ ] Estrutura MCP correta no body
- [ ] `server_url` completa com path `/mcp`
- [ ] `allowed_tools` especificado

## 📚 Documentação Técnica

### Progressive Disclosure

A skill usa o padrão de "revelação progressiva" da Anthropic:

1. **SKILL.md** (sempre carregado)
   - Princípios básicos
   - Regras críticas
   - Quando usar

2. **NODE-REFERENCE.md** (carregado quando necessário)
   - Configurações detalhadas de cada tipo de nó
   - Parâmetros específicos

3. **EXAMPLES.md** (carregado sob demanda)
   - Workflows completos
   - Templates prontos

4. **MCP-INTEGRATION.md** (para casos avançados)
   - Padrões de integração MCP
   - Fluxos de aprovação
   - Segurança

**Benefício:** Usa menos tokens, mantém contexto limpo, mas tem toda informação quando precisa.

## 🎯 Melhores Práticas Seguidas

### ✅ Concisão
- SKILL.md principal tem < 500 linhas
- Informações distribuídas em arquivos especializados
- Nada de redundância

### ✅ Nomenclatura Clara
- Nome em gerúndio: `n8n-workflow-development`
- Descrição específica: "Expert n8n workflow development..."
- Quando usar bem definido

### ✅ Exemplos Concretos
- Workflows completos e funcionais
- Não só teoria, mas código copiável
- Casos de uso reais

### ✅ Consistência
- Sempre usa mesma terminologia
- Formato padrão para todos os nós
- Regras aplicadas uniformemente

### ✅ Testado
- Validação automática com script
- Casos de erro documentados
- Checklist de verificação

## 🐛 Troubleshooting

### Skill não ativa?

**Solução:**
- Mencione "n8n" ou "workflow" no prompt
- Seja mais específico: "usando n8n, crie..."
- Verifique que skills estão habilitadas em Settings

### Ainda gera fragmentos?

**Solução:**
- Peça explicitamente: "gere o JSON completo do workflow n8n"
- Mencione: "preciso de estrutura completa com nodes, connections e settings"

### Endpoint errado da OpenAI?

**Solução:**
- A skill deve corrigir automaticamente
- Se persistir, mencione: "use o endpoint /responses da OpenAI"
- Reporte o caso

## 📊 Estrutura da Skill (Técnico)

### Metadata (YAML Frontmatter)

```yaml
name: n8n-workflow-development
description: Expert n8n workflow development with JSON generation.
             Creates complete, valid n8n workflow JSONs following
             best practices. Use when building n8n workflows,
             creating automation flows, or generating n8n nodes.
```

### Arquitetura

```
SKILL.md (Base - 489 linhas)
    ├── Core Principles
    ├── When to Use
    ├── Generation Process
    ├── Common Patterns → NODE-REFERENCE.md
    ├── Examples → EXAMPLES.md
    └── Advanced → MCP-INTEGRATION.md

NODE-REFERENCE.md (Referência - 687 linhas)
    ├── Trigger Nodes
    ├── HTTP & API Nodes
    ├── Data Transformation
    ├── Control Flow
    ├── AI & LangChain
    └── Databases

EXAMPLES.md (Templates - 540 linhas)
    ├── Webhook to OpenAI
    ├── Scheduled with Conditions
    ├── AI Agent with MCP
    └── Database CRUD

MCP-INTEGRATION.md (Avançado - 436 linhas)
    ├── MCP Concepts
    ├── Server Configuration
    ├── Approval Workflows
    ├── Security
    └── Complete Examples
```

## 🔄 Fluxo de Trabalho Completo

### Cenário: Criar Workflow WhatsApp do Zero

**1. Você diz:**
```
"Vamos fazer um workflow para processar mensagens de entrada do WhatsApp"
```

**2. Claude confirma:**
- "É integração uazapi?" → Você: Sim
- "Webhook ou Execute Workflow Trigger?" → Você: Webhook

**3. Claude busca exemplos automaticamente:**
- Invoca `n8n-example-finder` para buscar trackers similares
- Analisa `pantero-tracker.json`, `briefia-tracker.json` em paralelo
- Identifica padrões comuns

**4. Claude gera o workflow:**
```json
{
  "name": "WhatsApp Message Processor",
  "nodes": [
    { "Webhook" },
    { "variaveis" /* normalização completa */ },
    { "Switch - Tipo Mensagem" },
    { "PostgreSQL Query" /* com CTEs */ },
    { "Enviar Resposta uazapi" }
  ]
}
```

**5. Workflow gerado inclui:**
- ✅ Webhook configurado
- ✅ Normalização com 13+ campos padrão
- ✅ PostgreSQL com CTEs e query params
- ✅ Saída via endpoint uazapi correto
- ✅ Sticky notes com instruções

**Resultado**: Workflow production-ready na primeira tentativa! 🎯

### Cenário: Adaptar Workflow Existente

**1. Você diz:**
```
"Analise o pantero-tracker e adapte para meu projeto de atendimento"
```

**2. Claude invoca subagents:**
- `n8n-workflow-analyzer`: Analisa estrutura completa
- `n8n-workflow-adapter`: Adapta para novo contexto

**3. Claude retorna:**
- Workflow adaptado com UUIDs novos
- Mantém PostgreSQL (não converte para Supabase)
- Preserva padrão de normalização
- Explica mudanças feitas

### Cenário: Buscar e Comparar Workflows

**1. Você diz:**
```
/n8n-find ai agent tools
```

**2. Claude retorna:**
```
Encontrados 5 workflows:

1. comagent-ai-group.json ⭐⭐⭐⭐⭐ (9/10)
   - Agent LangChain com 3 tools
   - RAG com vector store
   - Memory management

2. pantero-whatsapp-commands.json ⭐⭐⭐⭐ (8/10)
   - Tool workflows para commands
   - Execute Workflow Trigger pattern
   ...
```

**3. Você escolhe:**
```
"Use o comagent-ai-group como base"
```

**4. Claude adapta** o workflow para suas necessidades.

## 🎉 Pronto Para Usar!

A skill está completa e seguindo todas as melhores práticas da Anthropic:

- ✅ Progressive disclosure
- ✅ Nomenclatura gerúndio
- ✅ Descrição clara e específica
- ✅ Exemplos concretos (38+ workflows)
- ✅ Terminologia consistente
- ✅ **Padrões de produção (WhatsApp/PostgreSQL)**
- ✅ **Subagents especializados com análise paralela**
- ✅ **Biblioteca pesquisável de workflows**
- ✅ Validação automatizada
- ✅ Documentação completa
- ✅ Testada e funcional

## 📞 Suporte

Se encontrar problemas:

1. Verifique a seção **Troubleshooting** acima
2. Teste com os **Exemplos de Prompts**
3. Use o **validation-script.js** para verificar outputs
4. Reporte bugs com exemplos específicos

---

**Criado seguindo as [Melhores Práticas de Agent Skills da Anthropic](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/best-practices)**

🚀 **Bom desenvolvimento com n8n!**
