# N8N Workflow Patterns

Padrões de produção extraídos de 38+ workflows reais. Use estes padrões para criar workflows consistentes, eficientes e fáceis de manter.

## Índice

1. [WhatsApp/Uazapi Tracker Pattern](#whatsappuazapi-tracker-pattern)
2. [PostgreSQL Query Optimization](#postgresql-query-optimization)
3. [Data Normalization](#data-normalization)
4. [Output via Uazapi](#output-via-uazapi)
5. [Workflow Structure](#workflow-structure)

---

## WhatsApp/Uazapi Tracker Pattern

### Padrão Completo

```
Webhook → Normalização → Validação → Roteamento → PostgreSQL → Saída uazapi
```

### 1. Trigger (Webhook ou Execute Workflow)

**Quando usar cada um:**
- **Webhook**: Para entrada de mensagens diretamente da uazapi
- **Execute Workflow Trigger**: Para sub-workflows chamados por outros fluxos

**Webhook padrão:**
```json
{
  "id": "uuid",
  "name": "Webhook",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1.1,
  "position": [240, 300],
  "parameters": {
    "httpMethod": "POST",
    "path": "nome-tracker",
    "options": {}
  },
  "webhookId": "uuid"
}
```

**Execute Workflow padrão:**
```json
{
  "id": "uuid",
  "name": "Execute Workflow Trigger",
  "type": "n8n-nodes-base.executeWorkflowTrigger",
  "typeVersion": 1,
  "position": [240, 300],
  "parameters": {}
}
```

### 2. Normalização (OBRIGATÓRIO)

**SEMPRE adicionar após o webhook:**

Nó Set chamado "variaveis" que extrai campos padrão do payload uazapi:

```json
{
  "id": "uuid",
  "name": "variaveis",
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.3,
  "position": [460, 300],
  "parameters": {
    "assignments": {
      "assignments": [
        // CHAT
        {
          "id": "uuid",
          "name": "variaveis.chat.chatId",
          "value": "={{ $json.body.message.chatid.split(\"@\")[0] }}",
          "type": "string"
        },
        {
          "id": "uuid",
          "name": "variaveis.chat.groupName",
          "value": "={{ $json.body.message.groupName }}",
          "type": "string"
        },
        {
          "id": "uuid",
          "name": "variaveis.chat.isGroup",
          "value": "={{ $json.body.message.isGroup }}",
          "type": "boolean"
        },

        // USER
        {
          "id": "uuid",
          "name": "variaveis.user.whatsapp",
          "value": "={{ $json.body.message.sender_pn.split(\"@\")[0] }}",
          "type": "string"
        },
        {
          "id": "uuid",
          "name": "variaveis.user.name",
          "value": "={{ $json.body.message.senderName }}",
          "type": "string"
        },

        // MESSAGE
        {
          "id": "uuid",
          "name": "variaveis.message.text",
          "value": "={{ $json.body.message.content.text || $json.body.message.text }}",
          "type": "string"
        },
        {
          "id": "uuid",
          "name": "variaveis.message.id",
          "value": "={{ $json.body.message.messageid }}",
          "type": "string"
        },
        {
          "id": "uuid",
          "name": "variaveis.message.fromMe",
          "value": "={{ $json.body.message.fromMe }}",
          "type": "boolean"
        },
        {
          "id": "uuid",
          "name": "variaveis.message.type",
          "value": "={{ $json.body.message.type == 'text' ? $json.body.message.type : $json.body.message.messageType.split(\"M\")[0].replace(\"Extended\",\"\") }}",
          "type": "string"
        },
        {
          "id": "uuid",
          "name": "variaveis.message.timestamp",
          "value": "={{ $json.body.message.messageTimestamp }}",
          "type": "string"
        },

        // INSTANCE
        {
          "id": "uuid",
          "name": "variaveis.instance.number",
          "value": "={{ $json.body.owner }}",
          "type": "string"
        },
        {
          "id": "uuid",
          "name": "variaveis.instance.token",
          "value": "={{ $json.body.token }}",
          "type": "string"
        },
        {
          "id": "uuid",
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

**Campos Opcionais (adicionar conforme necessidade):**

```json
// MEDIA
{
  "name": "variaveis.message.media.url",
  "value": "={{ $json.body.message.content.URL }}",
  "type": "string"
},
{
  "name": "variaveis.message.media.type",
  "value": "={{ $json.body.message.messageType }}",
  "type": "string"
},

// QUOTED/REPLIED MESSAGE
{
  "name": "variaveis.message.responded.whatsapp",
  "value": "={{ $json.body.message.content.contextInfo?.participant.split(\"@\")[0] }}",
  "type": "string"
},
{
  "name": "variaveis.message.responded.text",
  "value": "={{ $json.body.message.content.contextInfo.quotedMessage.conversation }}",
  "type": "string"
},

// GROUP EVENTS (Join/Leave)
{
  "name": "variaveis.event.type",
  "value": "={{ $json.body.event?.Join[0]?.split(\"@\")[0] || $json.body.event?.Leave[0].split(\"@\")[0] }}",
  "type": "string"
}
```

### 3. Validação (Opcional mas Recomendado)

Filtrar mensagens antes do processamento:

```json
{
  "id": "uuid",
  "name": "If - fromMe",
  "type": "n8n-nodes-base.if",
  "typeVersion": 2.2,
  "position": [680, 300],
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "typeValidation": "strict",
        "version": 2
      },
      "conditions": [
        {
          "leftValue": "={{ $json.variaveis.message.fromMe }}",
          "rightValue": "",
          "operator": {
            "type": "boolean",
            "operation": "false",
            "singleValue": true
          }
        }
      ],
      "combinator": "and"
    },
    "options": {}
  }
}
```

### 4. Roteamento

**Switch para múltiplas rotas:**

```json
{
  "id": "uuid",
  "name": "Switch - Tipo de Chat",
  "type": "n8n-nodes-base.switch",
  "typeVersion": 3.2,
  "position": [900, 300],
  "parameters": {
    "rules": {
      "values": [
        {
          "conditions": {
            "conditions": [
              {
                "leftValue": "={{ $json.variaveis.chat.isGroup }}",
                "operator": {
                  "type": "boolean",
                  "operation": "true",
                  "singleValue": true
                }
              }
            ]
          },
          "renameOutput": true,
          "outputKey": "Group"
        },
        {
          "conditions": {
            "conditions": [
              {
                "leftValue": "={{ $json.variaveis.message.text.split(\"\")[0] }}",
                "rightValue": "/",
                "operator": {
                  "type": "string",
                  "operation": "equals"
                }
              }
            ]
          },
          "renameOutput": true,
          "outputKey": "command"
        }
      ]
    },
    "options": {
      "fallbackOutput": "extra",
      "renameFallbackOutput": "Private"
    }
  }
}
```

---

## PostgreSQL Query Optimization

### Princípios Fundamentais

1. **SEMPRE usar PostgreSQL** - NUNCA Supabase
2. **Use CTEs (WITH)** para organizar lógica
3. **Query params ($1, $2, $3)** para segurança
4. **json_build_object()** para estruturar retorno
5. **CASE para lógica condicional** dentro da query
6. **LEFT JOIN + COALESCE** para evitar IFs externos

### Padrão 1: Validação com CTEs

**Use case**: Validar hierarquia de dados em uma query

```sql
-- Validar grupo → cliente → empresa
WITH grupo_info AS (
  SELECT
    g.id as grupo_id,
    g.nome as grupo_nome,
    g.id_cliente
  FROM grupos g
  WHERE g.chat_id_whatsapp = $1
  LIMIT 1
),
cliente_info AS (
  SELECT
    c.id as cliente_id,
    c.nome as cliente_nome,
    c.status as cliente_status,
    c.id_empresa
  FROM clientes c
  WHERE c.id = (SELECT id_cliente FROM grupo_info)
),
empresa_info AS (
  SELECT
    e.id as empresa_id,
    e.nome_empresa,
    e.status as empresa_status
  FROM empresas e
  WHERE e.id = (SELECT id_empresa FROM cliente_info)
)
SELECT json_build_object(
  'grupo_id', g.grupo_id,
  'grupo_nome', g.grupo_nome,
  'cliente_id', c.cliente_id,
  'cliente_status', c.cliente_status,
  'empresa_id', e.empresa_id,
  'empresa_status', e.empresa_status,
  'status_validacao', CASE
    WHEN g.grupo_id IS NULL THEN 'GRUPO_NAO_ENCONTRADO'
    WHEN e.empresa_status != 'ativa' THEN 'EMPRESA_INATIVA'
    WHEN c.cliente_status != 'ativo' THEN 'CLIENTE_INATIVO'
    ELSE 'VALIDO'
  END
) as resultado
FROM grupo_info g
LEFT JOIN cliente_info c ON true
LEFT JOIN empresa_info e ON true;
```

**Benefícios:**
- ✅ Uma query ao invés de 3-4 nós
- ✅ Lógica clara e organizada
- ✅ Retorno estruturado em JSON
- ✅ Performance superior

### Padrão 2: Upsert com RETURNING

**Use case**: Criar ou atualizar registro e retornar resultado

```sql
-- Gerenciar entrada de membro no grupo
WITH input_data AS (
  SELECT
    $1::VARCHAR as chat_id,
    $2::VARCHAR as whatsapp_number
),
grupo_info AS (
  SELECT id as grupo_id
  FROM grupos
  WHERE chat_id = (SELECT chat_id FROM input_data)
  LIMIT 1
),
membro_upsert AS (
  INSERT INTO membros (nome, whatsapp, ativo)
  SELECT
    'Membro ' || whatsapp_number,
    whatsapp_number,
    true
  FROM input_data
  ON CONFLICT (whatsapp)
  DO UPDATE SET
    ativo = true,
    dt_update = CURRENT_TIMESTAMP
  RETURNING id, nome, whatsapp, dt_create
),
associacao AS (
  INSERT INTO membros_grupos (id_grupo, id_membro, ativo)
  SELECT
    g.grupo_id,
    m.id,
    true
  FROM membro_upsert m
  CROSS JOIN grupo_info g
  WHERE g.grupo_id IS NOT NULL
  ON CONFLICT (id_grupo, id_membro)
  DO UPDATE SET
    ativo = true,
    dt_update = CURRENT_TIMESTAMP
  RETURNING id, id_grupo, id_membro, ativo, dt_create
)
SELECT
  json_build_object(
    'status', CASE
      WHEN g.grupo_id IS NULL THEN 'GRUPO_NAO_ENCONTRADO'
      ELSE 'SUCESSO'
    END,
    'operacao', CASE
      WHEN m.dt_create >= CURRENT_TIMESTAMP - INTERVAL '5 seconds' THEN 'MEMBRO_CRIADO'
      WHEN a.dt_create >= CURRENT_TIMESTAMP - INTERVAL '5 seconds' THEN 'ASSOCIACAO_CRIADA'
      ELSE 'MEMBRO_REATIVADO'
    END,
    'membro', json_build_object(
      'id', m.id,
      'nome', m.nome,
      'whatsapp', m.whatsapp
    ),
    'grupo', json_build_object(
      'id', g.grupo_id,
      'chat_id', (SELECT chat_id FROM input_data)
    )
  ) as resultado
FROM membro_upsert m
CROSS JOIN grupo_info g
CROSS JOIN associacao a;
```

**Benefícios:**
- ✅ Upsert (INSERT or UPDATE) em uma query
- ✅ Múltiplas tabelas atualizadas atomicamente
- ✅ Retorno completo do resultado
- ✅ Lógica de detecção de operação (criou vs atualizou)

### Padrão 3: Reduzir IFs com CASE

**❌ Evite (múltiplos nós):**
```
Query 1 → If (status = ativo) → Query 2a
                              ↓
                            Query 2b
```

**✅ Prefira (uma query):**
```sql
SELECT
  id,
  nome,
  CASE
    WHEN status = 'ativo' THEN json_build_object('permitido', true, 'mensagem', 'Acesso liberado')
    WHEN status = 'inativo' THEN json_build_object('permitido', false, 'mensagem', 'Conta inativa')
    ELSE json_build_object('permitido', false, 'mensagem', 'Status desconhecido')
  END as resultado
FROM usuarios
WHERE id = $1;
```

---

## Data Normalization

### Quando Normalizar

Normalização é **obrigatória** após webhooks que recebem dados externos:
- ✅ Webhooks de uazapi/WhatsApp
- ✅ Webhooks de integrações externas
- ✅ Dados de APIs com estruturas variadas

### Estrutura Padrão

```json
{
  "name": "Normalizar Dados",
  "type": "n8n-nodes-base.set",
  "parameters": {
    "assignments": {
      "assignments": [
        // Use nomenclatura hierárquica: categoria.subcategoria.campo
        {
          "name": "dados.usuario.id",
          "value": "={{ $json.raw.user.id }}",
          "type": "string"
        },
        {
          "name": "dados.usuario.nome",
          "value": "={{ $json.raw.user.name || 'Anônimo' }}",
          "type": "string"
        },
        // Use fallbacks com ||
        {
          "name": "dados.mensagem.texto",
          "value": "={{ $json.raw.message.text || $json.raw.message.content }}",
          "type": "string"
        }
      ]
    },
    "options": {
      "ignoreConversionErrors": false
    }
  }
}
```

### Boas Práticas de Normalização

1. **Hierarquia clara**: `categoria.subcategoria.campo`
2. **Fallbacks**: Use `||` para valores default
3. **Type casting**: Defina tipos explicitamente
4. **Split quando necessário**: `.split("@")[0]` para limpar dados
5. **Conversões condicionais**: Use ternários quando apropriado

**Exemplo avançado:**
```javascript
// Detectar tipo de mensagem
"={{ $json.body.message.type == 'text' ? $json.body.message.type : $json.body.message.messageType.split(\"M\")[0].replace(\"Extended\",\"\") }}"

// Extrair número limpo
"={{ $json.body.message.sender_pn.split(\"@\")[0] }}"

// Boolean de estrutura complexa
"={{ $json.body.message.chatid.includes('@g.us') }}"
```

---

## Output via Uazapi

### Enviar Mensagens de Texto

```json
{
  "id": "uuid",
  "name": "Enviar Mensagem WhatsApp",
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
          "value": "={{ $json.mensagem }}"
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

### Endpoints Comuns

| Endpoint | Uso |
|----------|-----|
| `/send/text` | Enviar mensagem de texto |
| `/send/image` | Enviar imagem com caption |
| `/send/audio` | Enviar áudio/voice |
| `/send/file` | Enviar documentos |
| `/send/video` | Enviar vídeo |
| `/group/info` | Buscar info do grupo |
| `/group/participants` | Listar participantes |

### Padrões de Body

**Texto simples:**
```json
{
  "number": "5511999999999@g.us",
  "text": "Mensagem aqui",
  "delay": 1000
}
```

**Texto com menção:**
```json
{
  "number": "5511999999999@g.us",
  "text": "Olá @5511888888888, como vai?",
  "delay": 1000,
  "mentions": "5511888888888"
}
```

**Imagem com legenda:**
```json
{
  "number": "5511999999999@g.us",
  "image": "https://example.com/image.jpg",
  "caption": "Legenda da imagem",
  "delay": 1000
}
```

---

## Workflow Structure

### Organização de Nós

**Fluxo Linear Simples:**
```
[Trigger] → [Normalização] → [Processamento] → [Database] → [Output]
```

**Fluxo com Roteamento:**
```
[Trigger] → [Normalização] → [Switch]
                                ├─→ [Route 1] → [DB] → [Output 1]
                                ├─→ [Route 2] → [DB] → [Output 2]
                                └─→ [Route 3] → [DB] → [Output 3]
```

**Fluxo com Validação:**
```
[Trigger] → [Normalização] → [If Válido?]
                                ├─→ [Sim] → [Processar] → [DB] → [Output]
                                └─→ [Não] → [Log] → [End]
```

### Posicionamento Visual

**Coordenadas base:**
- Start: `[240, 300]`
- Incremento horizontal: `+220` para nós sequenciais
- Incremento vertical: `+300` para branches
- Sticky Notes: `[-60, -100]` relativo ao nó que documenta

**Exemplo:**
```json
{
  "Webhook": [240, 300],
  "Normalização": [460, 300],
  "Switch": [680, 300],
  "Route 1": [900, 300],
  "Route 2": [900, 600],
  "Route 3": [900, 900]
}
```

### Documentação com Sticky Notes

**SEMPRE adicionar para:**
- Explicar seções do workflow
- Setup instructions (credenciais necessárias)
- Notas sobre lógica complexa
- Avisos importantes

```json
{
  "id": "uuid",
  "name": "Sticky Note - Setup",
  "type": "n8n-nodes-base.stickyNote",
  "typeVersion": 1,
  "position": [180, 200],
  "parameters": {
    "content": "## 📝 Setup Required\n\n**Credentials needed:**\n- PostgreSQL: Configure com credenciais do banco\n- Uazapi: Token da instância\n\n**Webhook URL:**\nhttps://n8n.domain.com/webhook/nome-tracker",
    "height": 280,
    "width": 400,
    "color": 5
  }
}
```

---

## Checklist de Qualidade

Antes de considerar um workflow completo, verifique:

### ✅ Estrutura
- [ ] Trigger apropriado (Webhook ou Execute Workflow)
- [ ] Normalização após webhook (se aplicável)
- [ ] Nomes descritivos para todos os nós
- [ ] UUIDs únicos gerados
- [ ] Posicionamento visual lógico
- [ ] Sticky Note com instruções de setup

### ✅ PostgreSQL
- [ ] Queries usam `executeQuery`
- [ ] CTEs para organizar lógica complexa
- [ ] Query params ($1, $2) em uso
- [ ] `json_build_object()` para retorno estruturado
- [ ] Comentários SQL explicativos
- [ ] NUNCA usa nós Supabase

### ✅ WhatsApp/Uazapi (se aplicável)
- [ ] Nó "variaveis" com campos padrão
- [ ] Extrai: chatId, groupName, user.whatsapp, message.text
- [ ] Extrai: instance.number, instance.token, instance.host
- [ ] Saídas usam endpoint uazapi correto
- [ ] Token e host referenciados de variaveis

### ✅ Segurança
- [ ] NUNCA interpola valores direto em SQL
- [ ] Sempre usa query params
- [ ] Validação de entrada quando necessário
- [ ] Error handling apropriado

### ✅ Performance
- [ ] Queries otimizadas (CTEs, JOINs eficientes)
- [ ] Evita múltiplos nós quando query resolve
- [ ] Usa CASE ao invés de IFs quando possível
- [ ] Retorna apenas dados necessários

---

## Exemplos Completos

Consulte workflows de produção na EXAMPLES-LIBRARY:

### WhatsApp Trackers
- `pantero-tracker.json` - Tracker completo com roteamento
- `briefia-tracker.json` - Validação hierárquica com PostgreSQL
- `comagent-tracker.json` - Padrão com events de grupo

### PostgreSQL Avançado
- `briefia-message-segmentation.json` - Query com CTEs complexas
- `pantero-groups.json` - Upsert com múltiplas tabelas

### Padrões de Roteamento
- `manytest-message-flow.json` - Switch com múltiplas saídas
- `pantero-private-v2.json` - Roteamento condicional avançado

---

**Versão**: 1.0
**Última atualização**: 2025-01-03
**Baseado em**: 38+ workflows de produção
