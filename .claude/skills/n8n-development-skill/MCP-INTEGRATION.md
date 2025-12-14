# OpenAI MCP Integration Patterns

Complete guide for integrating OpenAI's Model Context Protocol (MCP) servers in n8n workflows.

## What is MCP?

Model Context Protocol (MCP) allows AI models to access external tools and data sources through standardized servers. OpenAI's `/v1/responses` endpoint supports remote MCP servers.

## Key Concepts

### MCP Server Structure
```json
{
  "type": "mcp",
  "server_label": "unique-label",
  "server_url": "https://mcp.example.com/mcp",
  "require_approval": "never | always | object",
  "allowed_tools": ["tool_name_1", "tool_name_2"],
  "headers": {
    "Authorization": "Bearer token"
  }
}
```

### Important Rules

1. **Full URL Required**: Always send complete server URL including path (e.g., `/mcp`)
2. **Headers Not Stored**: Authentication headers must be sent in every request
3. **Approval Control**: Use `require_approval: "never"` only for trusted servers
4. **Tool Filtering**: Use `allowed_tools` to limit scope and reduce latency

## Common MCP Servers

### DeepWiki Documentation
```json
{
  "type": "mcp",
  "server_label": "deepwiki_docs",
  "server_url": "https://mcp.deepwiki.com/mcp",
  "require_approval": "never",
  "allowed_tools": ["ask_question"]
}
```

### Stripe Payments (with auth)
```json
{
  "type": "mcp",
  "server_label": "stripe_prod",
  "server_url": "https://mcp.stripe.com",
  "headers": {
    "Authorization": "Bearer {{ $credential.stripeApi.apiKey }}"
  }
  // require_approval defaults to "always"
}
```

## Complete n8n HTTP Request Node

```json
{
  "id": "uuid-here",
  "name": "OpenAI with MCP Tools",
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
          "value": "={{ $json.userQuery }}"
        },
        {
          "name": "tools",
          "value": "={{ [{\"type\": \"mcp\", \"server_label\": \"deepwiki\", \"server_url\": \"https://mcp.deepwiki.com/mcp\", \"require_approval\": \"never\", \"allowed_tools\": [\"ask_question\"]}] }}"
        }
      ]
    },
    "options": {}
  },
  "credentials": {
    "openAiApi": {
      "id": "1",
      "name": "OpenAI account"
    }
  }
}
```

## Multiple MCP Servers

You can use multiple MCP servers in one request:

```json
{
  "name": "tools",
  "value": "={{ [\n  {\n    \"type\": \"mcp\",\n    \"server_label\": \"deepwiki\",\n    \"server_url\": \"https://mcp.deepwiki.com/mcp\",\n    \"require_approval\": \"never\",\n    \"allowed_tools\": [\"ask_question\"]\n  },\n  {\n    \"type\": \"mcp\",\n    \"server_label\": \"stripe\",\n    \"server_url\": \"https://mcp.stripe.com\",\n    \"headers\": {\n      \"Authorization\": \"Bearer \" + $credential.stripeApi.apiKey\n    }\n  }\n] }}"
}
```

## Approval Workflow Pattern

For operations requiring approval, handle `mcp_approval_request`:

```json
{
  "name": "Multi-Turn MCP Workflow",
  "nodes": [
    {
      "id": "uuid-1",
      "name": "Initial Request",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.openai.com/v1/responses",
        "method": "POST",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "model",
              "value": "gpt-4o"
            },
            {
              "name": "input",
              "value": "Create a payment link for $50"
            },
            {
              "name": "tools",
              "value": "={{ [{\"type\": \"mcp\", \"server_label\": \"stripe\", \"server_url\": \"https://mcp.stripe.com\", \"headers\": {\"Authorization\": \"Bearer \" + $credential.stripeApi.apiKey}}] }}"
            }
          ]
        }
      }
    },
    {
      "id": "uuid-2",
      "name": "Check for Approval Request",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "conditions": [
            {
              "leftValue": "={{ $json.type }}",
              "rightValue": "mcp_approval_request",
              "operator": {
                "type": "string",
                "operation": "equals"
              }
            }
          ]
        }
      }
    },
    {
      "id": "uuid-3",
      "name": "Send Approval",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.openai.com/v1/responses",
        "method": "POST",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "model",
              "value": "gpt-4o"
            },
            {
              "name": "input",
              "value": "={{ [{\"type\": \"mcp_approval_response\", \"approved\": true}] }}"
            },
            {
              "name": "previous_response_id",
              "value": "={{ $('Initial Request').item.json.id }}"
            },
            {
              "name": "tools",
              "value": "={{ [{\"type\": \"mcp\", \"server_label\": \"stripe\", \"server_url\": \"https://mcp.stripe.com\", \"headers\": {\"Authorization\": \"Bearer \" + $credential.stripeApi.apiKey}}] }}"
            }
          ]
        }
      }
    }
  ],
  "connections": {
    "Initial Request": {
      "main": [[{"node": "Check for Approval Request", "type": "main", "index": 0}]]
    },
    "Check for Approval Request": {
      "main": [
        [{"node": "Send Approval", "type": "main", "index": 0}],
        []
      ]
    }
  }
}
```

## Security Best Practices

### 1. Trust Verification
Only use MCP servers from trusted sources. Malicious servers can extract sensitive context data.

### 2. Approval for Sensitive Operations
Use `require_approval: "always"` (default) for:
- Payment operations
- Data deletion
- External API calls with side effects

### 3. Limit Tool Access
Use `allowed_tools` to restrict which tools can be invoked:
```json
{
  "allowed_tools": ["read_only_query", "get_info"]
  // Excludes: create, update, delete operations
}
```

### 4. Audit Logging
Log MCP interactions for compliance:
```json
{
  "id": "uuid",
  "name": "Log MCP Call",
  "type": "n8n-nodes-base.code",
  "parameters": {
    "jsCode": "console.log('MCP Call:', JSON.stringify({\n  server: items[0].json.server_label,\n  tool: items[0].json.tool_name,\n  args: items[0].json.arguments,\n  timestamp: new Date().toISOString()\n}));\nreturn items;"
  }
}
```

## Response Handling

### Success Response
```json
{
  "id": "response-id",
  "object": "response",
  "output": "The answer from the AI",
  "usage": { ... },
  "items": [
    {
      "type": "message",
      "content": "AI response text"
    },
    {
      "type": "mcp_call",
      "server_label": "deepwiki",
      "tool_name": "ask_question",
      "arguments": { ... },
      "result": { ... }
    }
  ]
}
```

### Error Response
```json
{
  "items": [
    {
      "type": "mcp_call",
      "server_label": "stripe",
      "tool_name": "create_payment",
      "error": {
        "code": "server_error",
        "message": "Connection timeout"
      }
    }
  ]
}
```

### Extract Output
```json
{
  "id": "uuid",
  "name": "Extract Answer",
  "type": "n8n-nodes-base.set",
  "parameters": {
    "assignments": {
      "assignments": [
        {
          "name": "answer",
          "value": "={{ $json.output }}",
          "type": "string"
        }
      ]
    }
  }
}
```

## Common Patterns

### Pattern 1: Single-Turn Query
User asks question → MCP tool fetches data → AI responds

```
Webhook → Prepare Input → OpenAI with MCP → Extract Output → Respond
```

### Pattern 2: Approval Flow
AI proposes action → User approves → Action executes → Result returned

```
Initial Request → Check Type → (if approval) → Manual Approval → Send Approval → Execute
```

### Pattern 3: Multi-Tool Research
AI uses multiple MCP servers to gather comprehensive information

```
User Query → OpenAI with [DeepWiki, Stripe, Custom] → Synthesize → Respond
```

## Error Handling

```json
{
  "id": "uuid",
  "name": "Handle MCP Errors",
  "type": "n8n-nodes-base.code",
  "parameters": {
    "jsCode": "const items = [];\nfor (const item of $input.all()) {\n  if (item.json.items) {\n    for (const responseItem of item.json.items) {\n      if (responseItem.type === 'mcp_call' && responseItem.error) {\n        items.push({\n          json: {\n            error: true,\n            server: responseItem.server_label,\n            tool: responseItem.tool_name,\n            message: responseItem.error.message\n          }\n        });\n      }\n    }\n  }\n}\nreturn items;"
  }
}
```

## Testing Checklist

- [ ] MCP server URL includes full path
- [ ] Authentication headers present (if required)
- [ ] `require_approval` set appropriately
- [ ] `allowed_tools` limits scope
- [ ] Error handling implemented
- [ ] Response parsing tested
- [ ] Approval flow works (if applicable)
- [ ] Logging configured for audit

## Complete Example Workflow

See `EXAMPLES.md` → "AI Agent with MCP Tools" for a complete, copy-paste ready workflow.

---

**Remember**: Always use full server URLs, include auth headers in every request, and prefer explicit approval for sensitive operations.
