---
name: n8n-workflow-development
description: Expert n8n workflow development with JSON generation. Creates complete, valid n8n workflow JSONs following best practices. Use when building n8n workflows, creating automation flows, or generating n8n nodes.
---

# n8n Workflow Development Skill

## Core Principles

When generating n8n workflows:

1. **Always use complete node structure** - Never output partial node code. Every node must be wrapped in valid workflow structure with `nodes` array
2. **OpenAI API - Use "responses" endpoint** - Never use `/v1/completions`. Always use `/v1/responses` for OpenAI HTTP requests
3. **Unique UUIDs** - Generate valid UUID v4 for every node `id`
4. **Descriptive naming** - Use clear, action-based names for nodes (e.g., "Fetch Customer Data", not "HTTP Request 1")
5. **Documentation-first** - Include Sticky Notes for setup instructions and workflow sections

## When to Use This Skill

Activate this skill when the user asks to:
- Create or generate n8n workflows
- Build automation flows
- Generate specific n8n nodes
- Convert logic into n8n JSON
- Fix or improve existing n8n workflows

## Proactive Agent Invocation (CRITICAL)

This skill **MUST** invoke specialized agents automatically to leverage the EXAMPLES-LIBRARY and ensure high-quality workflows.

### ALWAYS Invoke n8n-example-finder When:

✅ User asks to build/create any workflow
✅ User asks "how to" questions about N8N patterns
✅ User mentions specific integrations (WhatsApp, AI, Supabase, etc)
✅ User asks for examples or patterns
✅ Starting ANY workflow generation

**How to invoke**:
```
Task tool with subagent_type: "n8n-example-finder"
Prompt: "Search EXAMPLES-LIBRARY for workflows matching: [user requirement]. Focus on [key integration/pattern]."
```

**Example**:
```
User: "Create a WhatsApp webhook with AI"

BEFORE generating, invoke:
Task → n8n-example-finder
Prompt: "Search for WhatsApp webhook workflows with AI integration. Return top 3 ranked matches."

Then use results to inform generation.
```

### Invoke n8n-workflow-adapter When:

✅ Found example is 70%+ match but needs customization
✅ User says "like X but with Y"
✅ User wants to swap integrations (Postgres→Supabase, OpenAI→Anthropic)
✅ Example found requires UUID regeneration or parameter updates

**How to invoke**:
```
Task tool with subagent_type: "n8n-workflow-adapter"
Prompt: "Adapt workflow at [path] for new use case: [requirements]. Change [specific modifications]."
```

### Invoke n8n-workflow-analyzer When:

✅ Need to understand example before adapting it
✅ User provides workflow path without explicit /n8n-analyze command
✅ Comparing multiple examples to choose best approach
✅ Need to extract patterns from example workflows

**How to invoke**:
```
Task tool with subagent_type: "n8n-workflow-analyzer"
Prompt: "Analyze workflow at [path]. Extract: [structure/patterns/key nodes]."
```

### Why Separate Context Windows?

Each specialized agent uses its own context window to:
- ✅ **Keep main conversation clean** - No token pollution from deep searches
- ✅ **Allow deep analysis** - Agents can read multiple workflows without overflow
- ✅ **Enable parallelization** - Multiple agents can work simultaneously
- ✅ **Return focused results** - Only relevant findings come back

**Trust the agents** - They're specialized and optimized for their tasks.

### Integration Workflow

**Standard flow when user requests workflow**:
```
1. User Request
   ↓
2. Invoke n8n-example-finder (ALWAYS)
   ↓
3. Evaluate Results:
   - Exact match (90%+) → Return with minor tweaks
   - Good match (70-89%) → Invoke n8n-workflow-adapter
   - Weak match (<70%) → Use as reference, generate fresh
   - No match → Generate from scratch
   ↓
4. Generate/Adapt Workflow
   ↓
5. Suggest /n8n-save if new pattern created
```

## Workflow Generation Process

### Step 1: Understand Requirements
Ask clarifying questions about:
- Trigger type (webhook, schedule, manual, etc.)
- Data sources and destinations
- Processing logic needed
- Error handling requirements
- Required integrations

### Step 2: Design Workflow Structure
Before generating code:
1. Identify logical blocks (Input → Process → Transform → Output)
2. Map data flow between nodes
3. Plan conditional logic and loops
4. Consider error handling

### Step 3: Generate Complete JSON

**Critical Rule**: Always output complete workflow JSON, never fragments.

Even for a single node request, wrap it in valid structure:

```json
{
  "name": "Workflow Name",
  "nodes": [
    {
      "id": "uuid-here",
      "name": "Node Name",
      "type": "n8n-nodes-base.nodeType",
      "position": [x, y],
      "parameters": { ... }
    }
  ],
  "connections": { ... },
  "settings": {
    "executionOrder": "v1"
  }
}
```

### Step 4: Add Documentation
Include Sticky Notes for:
- Setup instructions
- Configuration requirements
- API keys needed
- Section separators

## Standard Workflow Patterns (REQUIRED)

### 1. Workflow Start Pattern

**SEMPRE confirmar o tipo de trigger antes de gerar:**

Quando o usuário diz "vamos fazer um workflow para..." você DEVE:

1. **Confirmar o trigger inicial:**
   - Webhook (padrão para integrações WhatsApp/uazapi)
   - Execute Workflow Trigger (quando chamado por outro workflow)

2. **Confirmar integração:** Se mencionar WhatsApp, perguntar se é uazapi

**Triggers obrigatórios:**

```json
// Opção 1: Webhook (padrão para entrada de mensagens)
{
  "id": "uuid-v4",
  "name": "Webhook",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1.1,
  "position": [240, 300],
  "parameters": {
    "httpMethod": "POST",
    "path": "nome-do-webhook",
    "options": {}
  },
  "webhookId": "uuid-v4"
}

// Opção 2: Execute Workflow Trigger (sub-workflows)
{
  "id": "uuid-v4",
  "name": "Execute Workflow Trigger",
  "type": "n8n-nodes-base.executeWorkflowTrigger",
  "typeVersion": 1,
  "position": [240, 300],
  "parameters": {}
}
```

### 2. WhatsApp/Uazapi Integration Standards

**Padrão obrigatório:** Webhook → Normalização → Roteamento → PostgreSQL → Saída uazapi

#### Nó de Normalização (SEMPRE após o webhook)

**CRÍTICO:** Após o webhook, SEMPRE adicionar nó Set chamado "variaveis" para normalizar dados do uazapi:

```json
{
  "id": "uuid-v4",
  "name": "variaveis",
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.3,
  "position": [460, 300],
  "parameters": {
    "assignments": {
      "assignments": [
        {
          "id": "uuid-v4",
          "name": "variaveis.chat.chatId",
          "value": "={{ $json.body.message.chatid.split(\"@\")[0] }}",
          "type": "string"
        },
        {
          "id": "uuid-v4",
          "name": "variaveis.chat.groupName",
          "value": "={{ $json.body.message.groupName }}",
          "type": "string"
        },
        {
          "id": "uuid-v4",
          "name": "variaveis.chat.isGroup",
          "value": "={{ $json.body.message.isGroup }}",
          "type": "boolean"
        },
        {
          "id": "uuid-v4",
          "name": "variaveis.user.whatsapp",
          "value": "={{ $json.body.message.sender_pn.split(\"@\")[0] }}",
          "type": "string"
        },
        {
          "id": "uuid-v4",
          "name": "variaveis.user.name",
          "value": "={{ $json.body.message.senderName }}",
          "type": "string"
        },
        {
          "id": "uuid-v4",
          "name": "variaveis.message.text",
          "value": "={{ $json.body.message.content.text || $json.body.message.text }}",
          "type": "string"
        },
        {
          "id": "uuid-v4",
          "name": "variaveis.message.id",
          "value": "={{ $json.body.message.messageid }}",
          "type": "string"
        },
        {
          "id": "uuid-v4",
          "name": "variaveis.message.fromMe",
          "value": "={{ $json.body.message.fromMe }}",
          "type": "boolean"
        },
        {
          "id": "uuid-v4",
          "name": "variaveis.message.type",
          "value": "={{ $json.body.message.type == 'text' ? $json.body.message.type : $json.body.message.messageType.split(\"M\")[0].replace(\"Extended\",\"\") }}",
          "type": "string"
        },
        {
          "id": "uuid-v4",
          "name": "variaveis.message.timestamp",
          "value": "={{ $json.body.message.messageTimestamp }}",
          "type": "string"
        },
        {
          "id": "uuid-v4",
          "name": "variaveis.instance.number",
          "value": "={{ $json.body.owner }}",
          "type": "string"
        },
        {
          "id": "uuid-v4",
          "name": "variaveis.instance.token",
          "value": "={{ $json.body.token }}",
          "type": "string"
        },
        {
          "id": "uuid-v4",
          "name": "variaveis.instance.host",
          "value": "={{ $json.body.BaseUrl || 'https://dominio.uazapi.com' }}",
          "type": "string"
        }
      ]
    },
    "options": {
      "ignoreConversionErrors": false
    }
  },
  "notes": "Uazapi - Extrai variáveis do webhook"
}
```

**Campos adicionais opcionais:**
- `variaveis.message.media.url/type/file_name` - Para mensagens com mídia
- `variaveis.message.responded.*` - Para respostas/citações
- `variaveis.event.type/whatsapp` - Para eventos de grupo (join/leave)

### 3. Database Strategy (PostgreSQL SEMPRE)

**REGRA CRÍTICA:** SEMPRE usar PostgreSQL com queries SQL diretas. NUNCA use nós do Supabase.

**Por quê PostgreSQL:**
- Queries SQL otimizadas reduzem complexidade
- Menos nós IF e Switch desnecessários
- Múltiplas operações em uma query
- Query params seguros contra SQL injection

#### Padrão PostgreSQL:

```json
{
  "id": "uuid-v4",
  "name": "Nome Descritivo da Query",
  "type": "n8n-nodes-base.postgres",
  "typeVersion": 2.6,
  "position": [x, y],
  "parameters": {
    "operation": "executeQuery",
    "query": "-- Query SQL com CTEs para otimização\nWITH input_data AS (\n  SELECT \n    $1::VARCHAR as parametro1,\n    $2::INTEGER as parametro2\n),\nprocessamento AS (\n  SELECT * FROM tabela\n  WHERE coluna = (SELECT parametro1 FROM input_data)\n)\nSELECT \n  json_build_object(\n    'status', CASE WHEN ... THEN 'sucesso' ELSE 'erro' END,\n    'dados', row_to_json(p.*)\n  ) as resultado\nFROM processamento p;",
    "options": {
      "queryReplacement": "={{ $('variaveis').item.json.variaveis.chat.chatId }}, {{ $('variaveis').item.json.variaveis.user.whatsapp }}"
    }
  },
  "credentials": {
    "postgres": {
      "id": "credential-id",
      "name": "Nome da Credencial"
    }
  },
  "notes": "Descrição do que a query faz"
}
```

**Boas práticas:**
1. ✅ Usar CTEs (WITH) para organizar lógica complexa
2. ✅ Query params ($1, $2, $3) SEMPRE
3. ✅ `json_build_object()` para retornar dados estruturados
4. ✅ CASE para lógica condicional dentro da query
5. ✅ Múltiplas queries com LEFT JOIN e COALESCE
6. ✅ Adicionar comentários SQL explicando a lógica
7. ❌ NUNCA interpolar valores diretamente na query
8. ❌ NUNCA usar nós Supabase

### 4. Output Pattern (Respostas via uazapi)

**Para respostas WhatsApp, SEMPRE usar API uazapi:**

```json
{
  "id": "uuid-v4",
  "name": "Enviar Mensagem uazapi",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [x, y],
  "parameters": {
    "method": "POST",
    "url": "={{ $('variaveis').first().json.variaveis.instance.host }}/send/text",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Accept",
          "value": "application/json"
        },
        {
          "name": "token",
          "value": "={{ $('variaveis').first().json.variaveis.instance.token }}"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "number",
          "value": "={{ $json.chat_id }}@g.us"
        },
        {
          "name": "text",
          "value": "={{ $json.mensagem_resposta }}"
        },
        {
          "name": "delay",
          "value": "={{ 1000 }}"
        },
        {
          "name": "linkPreview",
          "value": "={{ false }}"
        }
      ]
    },
    "options": {}
  },
  "credentials": {
    "httpHeaderAuth": {
      "id": "credential-id",
      "name": "Uazapi - Credencial"
    }
  }
}
```

**Outros endpoints uazapi comuns:**
- `/send/image` - Enviar imagens
- `/send/audio` - Enviar áudios
- `/send/file` - Enviar documentos
- `/group/info` - Buscar info do grupo

## Common Node Patterns

Refer to `NODE-REFERENCE.md` for detailed node configurations.

### HTTP Request to OpenAI (Correct Pattern)

**Always use `/v1/responses` endpoint:**

```json
{
  "id": "uuid-v4",
  "name": "OpenAI Chat Request",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [x, y],
  "parameters": {
    "url": "https://api.openai.com/v1/responses",
    "method": "POST",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "Authorization",
          "value": "Bearer {{$credential.openAiApi.apiKey}}"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "model",
          "value": "gpt-4o"
        },
        {
          "name": "input",
          "value": "={{ $json.userMessage }}"
        }
      ]
    },
    "options": {}
  }
}
```

**Never use**: `/v1/completions` or `/v1/chat/completions` - these are outdated patterns.

### Required Elements Checklist

For every workflow generation:

- [ ] Valid JSON structure with all required keys
- [ ] Unique UUIDs for all nodes
- [ ] Complete `nodes` array
- [ ] Proper `connections` object
- [ ] `settings` with `executionOrder: "v1"`
- [ ] Descriptive node names
- [ ] `options: {}` in node parameters (critical!)
- [ ] Correct `typeVersion` for each node
- [ ] At least one Sticky Note with setup instructions

## Critical Configurations

### Always Include "options": {}
Every node's `parameters` must have `"options": {}` even if empty. This prevents common errors.

### Position Coordinates
Use logical spacing:
- X-axis: increment by 200-300 for sequential nodes
- Y-axis: use different values for branches
- Start at [240, 300] for first node

### TypeVersions (Use Latest)
- HTTP Request: 4.2
- Set/Edit Fields: 3.4
- IF: 2.2
- Switch: 3
- Code: 2
- Webhook: 2

## Data Mapping Expressions

Use n8n expression syntax:
- Reference previous node: `{{ $('Node Name').item.json.fieldName }}`
- Current item: `{{ $json.fieldName }}`
- First item only: `{{ $('Node Name').first().json.fieldName }}`

## Error Prevention

Common mistakes to avoid:
1. Missing `options: {}` in parameters
2. Using `/completions` endpoint for OpenAI
3. Generating node fragments without complete structure
4. Invalid UUIDs or duplicate IDs
5. Missing `typeVersion`
6. Incorrect nested parameter structure

## Progressive Disclosure

For complex workflows, refer to:
- `NODE-REFERENCE.md` - Detailed node type configurations
- `EXAMPLES.md` - Complete workflow examples
- `MCP-INTEGRATION.md` - OpenAI MCP server integration patterns

## Output Format

When generating workflows:

1. **Show workflow structure overview** (text description)
2. **Generate complete JSON** (always copyable)
3. **Add setup instructions** (what credentials needed, etc.)
4. **Explain key nodes** (only for complex logic)

## Validation

Before outputting, verify:
- All nodes have unique IDs
- Connections reference existing node IDs
- All required parameters are present
- OpenAI requests use `/responses` endpoint
- JSON is valid and parseable
- Node names are descriptive

## User Workflow

Typical interaction pattern:

**User**: "Create a workflow that receives a webhook and sends data to OpenAI"

**Claude**:
1. Ask about webhook configuration and OpenAI model preferences
2. Design workflow structure (Webhook → Set Data → OpenAI Request → Response)
3. Generate complete JSON with all nodes
4. Add Sticky Note with setup instructions
5. Provide copy-paste ready code

## Advanced Patterns

For complex scenarios, see detailed guides:
- AI Agents with MCP tools: `MCP-INTEGRATION.md`
- Loops and conditionals: `NODE-REFERENCE.md#control-flow`
- Database operations: `NODE-REFERENCE.md#databases`
- Error handling: `NODE-REFERENCE.md#error-handling`

## Customization

This skill adapts to user preferences:
- If user shows existing workflow style, match it
- If user specifies node naming convention, follow it
- If user has credential setup preference, apply it

## Examples Library

The skill now includes **EXAMPLES-LIBRARY** with 38+ production workflows for reference.

### Accessing Examples

**Browse the catalog**:
```bash
Read EXAMPLES-LIBRARY/INDEX.md
```

**Search for specific patterns**:
```bash
/n8n-find whatsapp routing        # Find WhatsApp message routing examples
/n8n-find ai agent rag           # Find AI agents with RAG
/n8n-find simple webhook         # Find beginner-friendly webhooks
```

**Analyze a workflow**:
```bash
/n8n-analyze EXAMPLES-LIBRARY/ai-agents/comagent-ai-group.json
/n8n-analyze EXAMPLES-LIBRARY/webhooks/pantero-tracker.json full
```

**Save new examples**:
```bash
/n8n-save path/to/workflow.json custom-name
```

### Using Examples in Your Workflow

When building workflows:

1. **Check for similar patterns** - Use `/n8n-find` to search for existing examples
2. **Reference specific examples** - The skill can automatically adapt examples for your use case
3. **Learn from production code** - All examples are from real production systems

**Example**:
```
User: "Create a WhatsApp webhook that routes messages to different handlers"
Assistant:
1. Searches EXAMPLES-LIBRARY for similar patterns
2. Finds: pantero-groups.json (webhook → switch → handlers)
3. Adapts the pattern for user's specific requirements
4. Generates complete, valid workflow JSON
```

### Example Categories

- **🌐 Webhooks** (13): API endpoints, message processing, real-time triggers
- **🤖 AI Agents** (14): LangChain agents, RAG systems, tool workflows
- **🔄 Data Processing** (4): Scheduled jobs, CRON, ETL pipelines
- **📝 Content Generation** (7): Briefings, summaries, AI-powered documents

### Integration with Specialized Agents

The skill works with specialized subagents:

- **n8n-example-finder**: Fast search through examples (separate context)
- **n8n-workflow-analyzer**: Deep workflow analysis and explanation
- **n8n-workflow-adapter**: Adapt examples for specific use cases

These agents run in separate context windows to preserve your main conversation context.

### Common Use Cases from Examples

**WhatsApp Automation**:
- Message tracking and routing
- Group management
- Command handlers
Examples: `pantero-tracker.json`, `briefia-message-segmentation.json`

**AI Agents with RAG**:
- Context-aware assistants
- Vector store integration
- Multi-tool agents
Examples: `comagent-ai-group.json`, `manytest-conversation-agent.json`

**Scheduled Content Generation**:
- Automated summaries
- Report generation
- Content distribution
Examples: `briefia-briefing-generator.json`, `comagent-summary-generator.json`

**Tool Workflows**:
- Sub-workflow patterns
- Reusable tools
- Agent capabilities
Examples: `manytest-tool-test-generation.json`, `pantero-tool-grupos.json`

---

## Daily Workflow Patterns

Practical patterns for common daily tasks with this skill.

### Pattern 1: User Asks to Build New Workflow

**User Request**:
> "Create a WhatsApp webhook that processes messages with AI and saves to database"

**Skill Process**:
1. ✅ **Invoke n8n-example-finder**: Search for "whatsapp webhook ai database"
2. ✅ **Evaluate results**: Finder returns `comagent-ai-group.json` (8/10 match)
3. ✅ **Invoke n8n-workflow-adapter**: Adapt for user's specific database schema
4. ✅ **Return workflow**: Complete JSON with customizations
5. ✅ **Suggest save**: If new pattern, suggest `/n8n-save` for future reuse

**User receives**: Production-ready workflow JSON

### Pattern 2: User Shows Existing Workflow to Understand

**User Request**:
> "Explain what this workflow does: Downloads/my-flow.json"

**Skill Options**:

**Option A - Inline analysis** (quick):
```
Invoke n8n-workflow-analyzer with "quick" mode
Return: Brief explanation of purpose, main nodes, flow
```

**Option B - Detailed command** (comprehensive):
```
Suggest: /n8n-analyze Downloads/my-flow.json full
User gets: Complete node-by-node breakdown, patterns, improvements
```

**When to choose**:
- User says "quickly explain" → Option A
- User says "analyze in detail" / "understand everything" → Option B

### Pattern 3: User Asks Generic "How To" Question

**User Request**:
> "How do I handle errors in N8N workflows?"

**Skill Process**:
1. ✅ **Invoke n8n-example-finder**: "error handling patterns"
2. ✅ **Finder returns**: 3 workflows with error handling
3. ✅ **Extract pattern**: Read examples and identify common approach
4. ✅ **Explain with code**: Show error trigger + notification pattern
5. ✅ **Reference examples**: Point to specific files for full implementation

**User receives**: Explanation + code snippet + 2-3 example references

### Pattern 4: User Wants to Modify Existing Workflow

**User Request**:
> "Change this workflow to use Supabase instead of PostgreSQL"

**Skill Process**:
1. ✅ **Invoke n8n-workflow-analyzer**: Understand current structure
2. ✅ **Invoke n8n-workflow-adapter**: Change Postgres→Supabase nodes
3. ✅ **Return modified workflow**: New JSON with regenerated UUIDs
4. ✅ **Explain changes**: List what was modified and why

**User receives**: Updated workflow + change summary

### Pattern 5: User Asks for Examples Only

**User Request**:
> "Show me examples of scheduled workflows"

**Skill Options**:

**Option A - Command** (user browses manually):
```
Suggest: /n8n-find scheduled
Returns: List of scheduled workflows with descriptions
```

**Option B - Auto-search** (skill curates):
```
Invoke n8n-example-finder: "scheduled cron"
Present top 3 with use case descriptions
Suggest /n8n-find for full list
```

**When to choose**:
- User wants to explore → Option A
- User wants quick curated list → Option B

### Pattern 6: User Created Workflow and Wants to Save

**User Request**:
> "I created this great workflow for X, can you save it to the library?"

**Skill Process**:
1. ❌ **Don't invoke analyzer** (save command does it automatically)
2. ✅ **Suggest command**: `/n8n-save path/to/workflow.json optional-name`
3. ✅ **Explain**: Command will auto-categorize and update index
4. ✅ **Benefit**: Workflow becomes searchable for future use

**User receives**: Simple command to run + explanation

### Pattern 7: User Wants Similar Workflow

**User Request**:
> "Find workflows similar to pantero-tracker.json"

**Skill Process**:
1. ✅ **Invoke n8n-workflow-analyzer**: Understand pantero-tracker structure
2. ✅ **Invoke n8n-example-finder**: Search for "webhook tracking similar patterns"
3. ✅ **Compare results**: Show 3-4 similar workflows
4. ✅ **Explain differences**: Highlight what makes each unique

**User receives**: Comparison of similar workflows

---

## Command vs Automatic Invocation

| User Need | Best Approach | Why |
|-----------|---------------|-----|
| Build new workflow | Natural language | Skill auto-searches + adapts |
| Save workflow | `/n8n-save path` | Manual categorization |
| Find examples | Natural language OR `/n8n-find` | Both work; command for browsing |
| Analyze workflow | `/n8n-analyze path full` | Gets comprehensive report |
| Rebuild index | `/n8n-index --full` | Manual maintenance only |

**General Rule**: Let user ask naturally first. Skill will invoke agents automatically. Use commands for specific manual operations.

---

## Testing Output

After generation, user should be able to:
1. Copy the entire JSON
2. Import directly into n8n
3. Configure only credentials
4. Test workflow successfully

---

**Remember**: Quality over speed. A complete, correct workflow is better than a quick, broken fragment. When in doubt, check EXAMPLES-LIBRARY for proven patterns.
