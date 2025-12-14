# n8n Node Reference Guide

Complete reference for common n8n node types with correct parameter structures.

## Table of Contents

1. [Trigger Nodes](#trigger-nodes)
2. [HTTP & API Nodes](#http--api-nodes)
3. [Data Transformation](#data-transformation)
4. [Control Flow](#control-flow)
5. [AI & LangChain](#ai--langchain)
6. [Databases](#databases)
7. [Messaging](#messaging)

---

## Trigger Nodes

### Manual Trigger
```json
{
  "id": "uuid",
  "name": "When clicking 'Test workflow'",
  "type": "n8n-nodes-base.manualTrigger",
  "typeVersion": 1,
  "position": [240, 300],
  "parameters": {}
}
```

### Webhook Trigger
```json
{
  "id": "uuid",
  "name": "Webhook",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "position": [240, 300],
  "parameters": {
    "httpMethod": "POST",
    "path": "my-webhook-path",
    "responseMode": "onReceived",
    "options": {}
  },
  "webhookId": "uuid-webhook"
}
```

### Schedule Trigger
```json
{
  "id": "uuid",
  "name": "Schedule Trigger",
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2,
  "position": [240, 300],
  "parameters": {
    "rule": {
      "interval": [
        {
          "field": "hours",
          "hoursInterval": 1
        }
      ]
    }
  }
}
```

---

## HTTP & API Nodes

### HTTP Request (Generic)
```json
{
  "id": "uuid",
  "name": "HTTP Request",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [x, y],
  "parameters": {
    "url": "https://api.example.com/endpoint",
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
          "value": "Bearer token-here"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "key",
          "value": "value"
        }
      ]
    },
    "options": {}
  }
}
```

### OpenAI HTTP Request (CORRECT - Use /responses)
```json
{
  "id": "uuid",
  "name": "OpenAI Chat",
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
          "value": "={{ 'Bearer ' + $credential.openAiApi.apiKey }}"
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
          "value": "={{ $json.prompt }}"
        },
        {
          "name": "tools",
          "value": "={{ $json.tools }}"
        }
      ]
    },
    "options": {}
  }
}
```

**NEVER use `/v1/completions` or `/v1/chat/completions` - always use `/v1/responses`**

---

## Data Transformation

### Set/Edit Fields
```json
{
  "id": "uuid",
  "name": "Edit Fields",
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "position": [x, y],
  "parameters": {
    "mode": "manual",
    "assignments": {
      "assignments": [
        {
          "id": "uuid-assignment",
          "name": "fieldName",
          "value": "fieldValue",
          "type": "string"
        }
      ]
    },
    "options": {}
  }
}
```

### Code Node
```json
{
  "id": "uuid",
  "name": "Process Data",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [x, y],
  "parameters": {
    "mode": "runOnceForEachItem",
    "jsCode": "// Your JavaScript code here\nreturn items;",
    "options": {}
  }
}
```

### Split Out
```json
{
  "id": "uuid",
  "name": "Split Array",
  "type": "n8n-nodes-base.splitOut",
  "typeVersion": 1,
  "position": [x, y],
  "parameters": {
    "fieldToSplitOut": "items",
    "options": {}
  }
}
```

### Aggregate
```json
{
  "id": "uuid",
  "name": "Aggregate",
  "type": "n8n-nodes-base.aggregate",
  "typeVersion": 1,
  "position": [x, y],
  "parameters": {
    "aggregate": "aggregateAllItemData",
    "options": {}
  }
}
```

---

## Control Flow

### IF Node
```json
{
  "id": "uuid",
  "name": "IF",
  "type": "n8n-nodes-base.if",
  "typeVersion": 2.2,
  "position": [x, y],
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "leftValue": "",
        "typeValidation": "strict",
        "version": 2
      },
      "conditions": [
        {
          "id": "uuid-condition",
          "leftValue": "={{ $json.field }}",
          "rightValue": "expectedValue",
          "operator": {
            "type": "string",
            "operation": "equals"
          }
        }
      ],
      "combinator": "and"
    },
    "options": {}
  }
}
```

### Switch Node
```json
{
  "id": "uuid",
  "name": "Switch",
  "type": "n8n-nodes-base.switch",
  "typeVersion": 3,
  "position": [x, y],
  "parameters": {
    "rules": {
      "values": [
        {
          "conditions": {
            "options": {
              "caseSensitive": false,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 1
            },
            "conditions": [
              {
                "leftValue": "={{ $json.status }}",
                "rightValue": "active",
                "operator": {
                  "type": "string",
                  "operation": "equals"
                }
              }
            ],
            "combinator": "and"
          },
          "renameOutput": true,
          "outputKey": "Active"
        }
      ]
    },
    "options": {}
  }
}
```

### Loop Over Items
```json
{
  "id": "uuid",
  "name": "Loop Over Items",
  "type": "n8n-nodes-base.splitInBatches",
  "typeVersion": 3,
  "position": [x, y],
  "parameters": {
    "batchSize": 1,
    "options": {}
  }
}
```

### Merge
```json
{
  "id": "uuid",
  "name": "Merge",
  "type": "n8n-nodes-base.merge",
  "typeVersion": 3,
  "position": [x, y],
  "parameters": {
    "mode": "append",
    "options": {}
  }
}
```

---

## AI & LangChain

### OpenAI Chat Model (LangChain)
```json
{
  "id": "uuid",
  "name": "OpenAI Chat Model",
  "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
  "typeVersion": 1,
  "position": [x, y],
  "parameters": {
    "model": "gpt-4o",
    "options": {}
  },
  "credentials": {
    "openAiApi": {
      "id": "credential-id",
      "name": "OpenAI account"
    }
  }
}
```

### AI Agent
```json
{
  "id": "uuid",
  "name": "AI Agent",
  "type": "@n8n/n8n-nodes-langchain.agent",
  "typeVersion": 1.7,
  "position": [x, y],
  "parameters": {
    "promptType": "define",
    "text": "={{ $json.prompt }}",
    "options": {}
  }
}
```

### Window Buffer Memory
```json
{
  "id": "uuid",
  "name": "Window Buffer Memory",
  "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
  "typeVersion": 1.2,
  "position": [x, y],
  "parameters": {
    "contextWindowLength": 10
  }
}
```

### Tool HTTP Request (LangChain)
```json
{
  "id": "uuid",
  "name": "HTTP Request Tool",
  "type": "@n8n/n8n-nodes-langchain.toolHttpRequest",
  "typeVersion": 1.1,
  "position": [x, y],
  "parameters": {
    "toolDescription": "Tool description for AI",
    "method": "POST",
    "url": "https://api.example.com/endpoint",
    "authentication": "none",
    "sendBody": true,
    "parametersBody": {
      "values": [
        {
          "name": "param",
          "valueProvider": "modelOptional"
        }
      ]
    },
    "placeholderDefinitions": {
      "values": [
        {
          "name": "param",
          "description": "Parameter description",
          "type": "string"
        }
      ]
    },
    "options": {}
  }
}
```

---

## Databases

**CRITICAL**: ALWAYS use PostgreSQL with executeQuery. NEVER use Supabase nodes.

### PostgreSQL (RECOMMENDED - Standard Pattern)

#### Execute Query (Preferred Method)

**Simple Query with Params:**
```json
{
  "id": "uuid",
  "name": "Query Descritivo",
  "type": "n8n-nodes-base.postgres",
  "typeVersion": 2.6,
  "position": [x, y],
  "parameters": {
    "operation": "executeQuery",
    "query": "SELECT * FROM users WHERE id = $1 AND status = $2",
    "options": {
      "queryReplacement": "={{ $json.user_id }}, 'active'"
    }
  },
  "credentials": {
    "postgres": {
      "id": "credential-id",
      "name": "Postgres account"
    }
  }
}
```

**Complex Query with CTEs (Best Practice):**
```json
{
  "id": "uuid",
  "name": "Validar Grupo e Hierarquia",
  "type": "n8n-nodes-base.postgres",
  "typeVersion": 2.6,
  "position": [x, y],
  "parameters": {
    "operation": "executeQuery",
    "query": "-- Validar grupo → cliente → empresa\nWITH grupo_info AS (\n  SELECT \n    g.id as grupo_id,\n    g.nome as grupo_nome,\n    g.id_cliente\n  FROM grupos g\n  WHERE g.chat_id_whatsapp = $1\n  LIMIT 1\n),\ncliente_info AS (\n  SELECT \n    c.id as cliente_id,\n    c.nome as cliente_nome,\n    c.status as cliente_status,\n    c.id_empresa\n  FROM clientes c\n  WHERE c.id = (SELECT id_cliente FROM grupo_info)\n),\nempresa_info AS (\n  SELECT \n    e.id as empresa_id,\n    e.nome_empresa,\n    e.status as empresa_status\n  FROM empresas e\n  WHERE e.id = (SELECT id_empresa FROM cliente_info)\n)\nSELECT json_build_object(\n  'grupo_id', g.grupo_id,\n  'grupo_nome', g.grupo_nome,\n  'cliente_id', c.cliente_id,\n  'cliente_status', c.cliente_status,\n  'empresa_id', e.empresa_id,\n  'empresa_status', e.empresa_status,\n  'status_validacao', CASE \n    WHEN e.empresa_status != 'ativa' THEN 'EMPRESA_INATIVA'\n    WHEN c.cliente_status != 'ativo' THEN 'CLIENTE_INATIVO'\n    ELSE 'VALIDO'\n  END\n) as resultado\nFROM grupo_info g\nLEFT JOIN cliente_info c ON true\nLEFT JOIN empresa_info e ON true;",
    "options": {
      "queryReplacement": "={{ $('variaveis').item.json.variaveis.chat.chatId }}"
    }
  },
  "credentials": {
    "postgres": {
      "id": "credential-id",
      "name": "Postgres - Nome Projeto"
    }
  },
  "notes": "Valida grupo → cliente → empresa em uma query"
}
```

**Insert/Update with RETURNING:**
```json
{
  "id": "uuid",
  "name": "Adicionar Membro",
  "type": "n8n-nodes-base.postgres",
  "typeVersion": 2.6,
  "position": [x, y],
  "parameters": {
    "operation": "executeQuery",
    "query": "-- Gerenciar entrada de membro no grupo\nWITH input_data AS (\n  SELECT \n    $1::VARCHAR as chat_id,\n    $2::VARCHAR as whatsapp_number\n),\nmembro_upsert AS (\n  INSERT INTO membros (nome, whatsapp, ativo)\n  SELECT \n    'Membro ' || whatsapp_number,\n    whatsapp_number,\n    true\n  FROM input_data\n  ON CONFLICT (whatsapp) \n  DO UPDATE SET \n    ativo = true,\n    dt_update = CURRENT_TIMESTAMP\n  RETURNING id, nome, whatsapp\n),\nassociacao AS (\n  INSERT INTO membros_grupos (id_grupo, id_membro, ativo)\n  SELECT \n    (SELECT id FROM grupos WHERE chat_id = (SELECT chat_id FROM input_data)),\n    m.id,\n    true\n  FROM membro_upsert m\n  ON CONFLICT (id_grupo, id_membro) \n  DO UPDATE SET \n    ativo = true,\n    dt_update = CURRENT_TIMESTAMP\n  RETURNING *\n)\nSELECT json_build_object(\n  'status', 'SUCESSO',\n  'operacao', 'MEMBRO_CRIADO',\n  'membro', row_to_json(m.*)\n) as resultado\nFROM membro_upsert m;",
    "options": {
      "queryReplacement": "={{ $json.group.chat_id }}, {{ $json.user.whatsapp }}"
    }
  },
  "credentials": {
    "postgres": {
      "id": "credential-id",
      "name": "Postgres account"
    }
  },
  "notes": "Cria/atualiza membro e associa ao grupo"
}
```

### PostgreSQL Query Best Practices

✅ **SEMPRE fazer:**
1. Usar `operation: "executeQuery"` para flexibilidade
2. Usar CTEs (WITH) para organizar lógica complexa
3. Usar query params ($1, $2, $3) via `queryReplacement`
4. Usar `json_build_object()` para retornar dados estruturados
5. Usar CASE para lógica condicional dentro da query
6. Adicionar comentários SQL (-- explicação)
7. Usar RETURNING * em INSERT/UPDATE para retornar dados inseridos
8. Usar LEFT JOIN e COALESCE para evitar IFs desnecessários

❌ **NUNCA fazer:**
1. Interpolar valores diretamente na query string (SQL injection)
2. Usar operações "insert", "update" separadas quando executeQuery resolve
3. Criar múltiplos nós para queries que podem ser unificadas
4. Usar nós Supabase

### Query Params (queryReplacement)

```
"queryReplacement": "value1, value2, value3"
```

Maps to:
- $1 = value1
- $2 = value2
- $3 = value3

**Examples:**
```
"queryReplacement": "={{ $json.chat_id }}, {{ $json.user_whatsapp }}, 'active'"
```

---

## Messaging

### Telegram
```json
{
  "id": "uuid",
  "name": "Send Telegram Message",
  "type": "n8n-nodes-base.telegram",
  "typeVersion": 1.2,
  "position": [x, y],
  "parameters": {
    "resource": "message",
    "operation": "sendMessage",
    "chatId": "={{ $json.chatId }}",
    "text": "={{ $json.message }}",
    "additionalFields": {},
    "options": {}
  },
  "credentials": {
    "telegramApi": {
      "id": "credential-id",
      "name": "Telegram account"
    }
  }
}
```

### Slack
```json
{
  "id": "uuid",
  "name": "Send Slack Message",
  "type": "n8n-nodes-base.slack",
  "typeVersion": 2.2,
  "position": [x, y],
  "parameters": {
    "resource": "message",
    "operation": "post",
    "channel": "#general",
    "text": "={{ $json.message }}",
    "otherOptions": {}
  },
  "credentials": {
    "slackApi": {
      "id": "credential-id",
      "name": "Slack account"
    }
  }
}
```

---

## Documentation Nodes

### Sticky Note
```json
{
  "id": "uuid",
  "name": "Sticky Note",
  "type": "n8n-nodes-base.stickyNote",
  "typeVersion": 1,
  "position": [x, y],
  "parameters": {
    "content": "## Setup Instructions\n1. Configure credentials\n2. Set webhook path\n3. Test workflow",
    "height": 200,
    "width": 400,
    "color": 5
  }
}
```

---

## Common Parameter Patterns

### Resource Locator (__rl)
Used for dynamic resource selection:
```json
{
  "fieldName": {
    "__rl": true,
    "mode": "list",
    "value": "resource-id"
  }
}
```

### Header Parameters
```json
{
  "headerParameters": {
    "parameters": [
      {
        "name": "Header-Name",
        "value": "header-value"
      }
    ]
  }
}
```

### Body Parameters
```json
{
  "bodyParameters": {
    "parameters": [
      {
        "name": "field",
        "value": "value"
      }
    ]
  }
}
```

---

## Critical Rules

1. **Always include `"options": {}`** in parameters
2. **Use correct typeVersion** for each node
3. **Generate valid UUID v4** for all IDs
4. **OpenAI: Use /v1/responses** endpoint only
5. **Nested parameters** follow consistent structure
6. **Credentials** use `{id, name}` format

---

Remember: This is a reference. For complete workflows, always wrap nodes in full JSON structure with connections and settings.
