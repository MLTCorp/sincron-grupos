# n8n Workflow Examples

Complete, ready-to-use workflow examples demonstrating common patterns.

## Table of Contents

### Basic Examples
1. [Simple Webhook to OpenAI](#simple-webhook-to-openai)
2. [Scheduled Data Fetch with Conditional Logic](#scheduled-data-fetch-with-conditional-logic)
3. [AI Agent with MCP Tools](#ai-agent-with-mcp-tools)
4. [Database CRUD Operations](#database-crud-operations)

### Real-World Project Examples
5. [Circle.so Community Management](#circleso-community-management)
6. [Pantero WhatsApp Automation](#pantero-whatsapp-automation)
7. [RAG System Pipeline](#rag-system-pipeline)

---

## Simple Webhook to OpenAI

Complete workflow that receives data via webhook and sends it to OpenAI.

```json
{
  "name": "Webhook to OpenAI Chat",
  "nodes": [
    {
      "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "name": "Sticky Note - Setup",
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [240, 200],
      "parameters": {
        "content": "## Setup Instructions\n1. Configure OpenAI credentials\n2. Note the webhook URL after saving\n3. Send POST request with JSON: {\"message\": \"your text\"}",
        "height": 180,
        "width": 400,
        "color": 5
      }
    },
    {
      "id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [240, 400],
      "parameters": {
        "httpMethod": "POST",
        "path": "openai-chat",
        "responseMode": "lastNode",
        "options": {}
      },
      "webhookId": "c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f"
    },
    {
      "id": "d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a",
      "name": "Prepare OpenAI Request",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [460, 400],
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {
              "id": "e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b",
              "name": "userMessage",
              "value": "={{ $json.body.message }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      }
    },
    {
      "id": "f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c",
      "name": "OpenAI Chat",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [680, 400],
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
              "value": "={{ $json.userMessage }}"
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
    },
    {
      "id": "a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d",
      "name": "Format Response",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [900, 400],
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {
              "id": "b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e",
              "name": "response",
              "value": "={{ $json.choices[0].message.content }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      }
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [
        [
          {
            "node": "Prepare OpenAI Request",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Prepare OpenAI Request": {
      "main": [
        [
          {
            "node": "OpenAI Chat",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI Chat": {
      "main": [
        [
          {
            "node": "Format Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1"
  },
  "active": false,
  "versionId": "12345678-1234-1234-1234-123456789012",
  "tags": []
}
```

---

## Scheduled Data Fetch with Conditional Logic

Workflow that fetches data hourly and processes it based on conditions.

```json
{
  "name": "Scheduled API Check with Conditions",
  "nodes": [
    {
      "id": "1a2b3c4d-5e6f-4a5b-8c9d-0e1f2a3b4c5d",
      "name": "Every Hour",
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
    },
    {
      "id": "2b3c4d5e-6f7a-4b5c-9d0e-1f2a3b4c5d6e",
      "name": "Fetch API Data",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [460, 300],
      "parameters": {
        "url": "https://api.example.com/status",
        "method": "GET",
        "options": {}
      }
    },
    {
      "id": "3c4d5e6f-7a8b-4c5d-0e1f-2a3b4c5d6e7f",
      "name": "Check Status",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [680, 300],
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
              "id": "4d5e6f7a-8b9c-4d5e-1f2a-3b4c5d6e7f8a",
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
        "options": {}
      }
    },
    {
      "id": "5e6f7a8b-9c0d-4e5f-2a3b-4c5d6e7f8a9b",
      "name": "Active Path",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [900, 200],
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {
              "id": "6f7a8b9c-0d1e-4f5a-3b4c-5d6e7f8a9b0c",
              "name": "message",
              "value": "Status is active - proceeding",
              "type": "string"
            }
          ]
        },
        "options": {}
      }
    },
    {
      "id": "7a8b9c0d-1e2f-4a5b-4c5d-6e7f8a9b0c1d",
      "name": "Inactive Path",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [900, 400],
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {
              "id": "8b9c0d1e-2f3a-4b5c-5d6e-7f8a9b0c1d2e",
              "name": "message",
              "value": "Status is inactive - skipping",
              "type": "string"
            }
          ]
        },
        "options": {}
      }
    }
  ],
  "connections": {
    "Every Hour": {
      "main": [
        [
          {
            "node": "Fetch API Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Fetch API Data": {
      "main": [
        [
          {
            "node": "Check Status",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Status": {
      "main": [
        [
          {
            "node": "Active Path",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Inactive Path",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1"
  },
  "active": false,
  "versionId": "22345678-2234-2234-2234-223456789012",
  "tags": []
}
```

---

## AI Agent with MCP Tools

Complete AI agent workflow using OpenAI MCP server integration.

```json
{
  "name": "AI Agent with MCP DeepWiki",
  "nodes": [
    {
      "id": "aa1b2c3d-4e5f-4a5b-8c9d-0e1f2a3b4c5d",
      "name": "Setup Note",
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [240, 100],
      "parameters": {
        "content": "## AI Agent with MCP Tools\nThis workflow uses OpenAI's MCP server to access DeepWiki documentation.\n\n**Required**: OpenAI API key",
        "height": 150,
        "width": 600,
        "color": 4
      }
    },
    {
      "id": "bb2c3d4e-5f6a-4b5c-9d0e-1f2a3b4c5d6e",
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [240, 300],
      "parameters": {}
    },
    {
      "id": "cc3d4e5f-6a7b-4c5d-0e1f-2a3b4c5d6e7f",
      "name": "Prepare Question",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [460, 300],
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {
              "id": "dd4e5f6a-7b8c-4d5e-1f2a-3b4c5d6e7f8a",
              "name": "question",
              "value": "What transport protocols does the 2025-03-26 version of the MCP spec support?",
              "type": "string"
            }
          ]
        },
        "options": {}
      }
    },
    {
      "id": "ee5f6a7b-8c9d-4e5f-2a3b-4c5d6e7f8a9b",
      "name": "OpenAI with MCP",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [680, 300],
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
              "value": "={{ $json.question }}"
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
    },
    {
      "id": "ff6a7b8c-9d0e-4f5a-3b4c-5d6e7f8a9b0c",
      "name": "Extract Answer",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [900, 300],
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {
              "id": "aa7b8c9d-0e1f-4a5b-4c5d-6e7f8a9b0c1d",
              "name": "answer",
              "value": "={{ $json.output }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      }
    }
  ],
  "connections": {
    "Manual Trigger": {
      "main": [
        [
          {
            "node": "Prepare Question",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Prepare Question": {
      "main": [
        [
          {
            "node": "OpenAI with MCP",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI with MCP": {
      "main": [
        [
          {
            "node": "Extract Answer",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1"
  },
  "active": false,
  "versionId": "32345678-3234-3234-3234-323456789012",
  "tags": []
}
```

---

## Database CRUD Operations

Example workflow for PostgreSQL operations with error handling.

```json
{
  "name": "Database CRUD with Error Handling",
  "nodes": [
    {
      "id": "11a2b3c4-d5e6-4a5b-8c9d-0e1f2a3b4c5d",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [240, 300],
      "parameters": {
        "httpMethod": "POST",
        "path": "db-operation",
        "responseMode": "lastNode",
        "options": {}
      },
      "webhookId": "22b3c4d5-e6f7-4b5c-9d0e-1f2a3b4c5d6e"
    },
    {
      "id": "33c4d5e6-f7a8-4c5d-0e1f-2a3b4c5d6e7f",
      "name": "Validate Input",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [460, 300],
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
              "id": "44d5e6f7-a8b9-4d5e-1f2a-3b4c5d6e7f8a",
              "leftValue": "={{ $json.body.name }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "notEmpty"
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      }
    },
    {
      "id": "55e6f7a8-b9c0-4e5f-2a3b-4c5d6e7f8a9b",
      "name": "Insert to Database",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.5,
      "position": [680, 200],
      "parameters": {
        "operation": "insert",
        "schema": {
          "__rl": true,
          "mode": "list",
          "value": "public"
        },
        "table": {
          "__rl": true,
          "mode": "list",
          "value": "users"
        },
        "columns": {
          "value": {
            "name": "={{ $json.body.name }}",
            "email": "={{ $json.body.email }}"
          },
          "schema": [],
          "mappingMode": "defineBelow",
          "matchingColumns": [],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "credentials": {
        "postgres": {
          "id": "1",
          "name": "Postgres account"
        }
      }
    },
    {
      "id": "66f7a8b9-c0d1-4f5a-3b4c-5d6e7f8a9b0c",
      "name": "Success Response",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [900, 200],
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {
              "id": "77a8b9c0-d1e2-4a5b-4c5d-6e7f8a9b0c1d",
              "name": "status",
              "value": "success",
              "type": "string"
            },
            {
              "id": "88b9c0d1-e2f3-4b5c-5d6e-7f8a9b0c1d2e",
              "name": "message",
              "value": "User created successfully",
              "type": "string"
            }
          ]
        },
        "options": {}
      }
    },
    {
      "id": "99c0d1e2-f3a4-4c5d-6e7f-8a9b0c1d2e3f",
      "name": "Error Response",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [680, 400],
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {
              "id": "aad1e2f3-a4b5-4d5e-7f8a-9b0c1d2e3f4a",
              "name": "status",
              "value": "error",
              "type": "string"
            },
            {
              "id": "bbe2f3a4-b5c6-4e5f-8a9b-0c1d2e3f4a5b",
              "name": "message",
              "value": "Invalid input - name is required",
              "type": "string"
            }
          ]
        },
        "options": {}
      }
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [
        [
          {
            "node": "Validate Input",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Validate Input": {
      "main": [
        [
          {
            "node": "Insert to Database",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Error Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Insert to Database": {
      "main": [
        [
          {
            "node": "Success Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1"
  },
  "active": false,
  "versionId": "42345678-4234-4234-4234-423456789012",
  "tags": []
}
```

---

# Real-World Project Examples

These examples are based on actual production workflows from real projects.

---

## Circle.so Community Management

Complete workflow for managing Circle.so communities, fetching spaces, posts, and members via API.

**Use Case:** Automate community analytics, member engagement tracking, and content management for online learning communities.

```json
{
  "name": "Circle.so Community Data Fetcher",
  "nodes": [
    {
      "id": "11a1b2c3-d4e5-4a5b-8c9d-0e1f2a3b4c5d",
      "name": "Setup Instructions",
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [240, 100],
      "parameters": {
        "content": "## Circle.so API Integration\\n\\n**Required:**\\n1. Circle.so API Token (from Settings → API)\\n2. Store token in credentials (never hardcode)\\n\\n**What this does:**\\n- Fetches communities, spaces, posts, and members\\n- Paginates results (per_page=100)\\n- Returns structured data for analytics\\n\\n**API Docs:** https://api.circle.so/",
        "height": 240,
        "width": 500,
        "color": 4
      }
    },
    {
      "id": "22b2c3d4-e5f6-4b5c-9d0e-1f2a3b4c5d6e",
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [240, 400],
      "parameters": {}
    },
    {
      "id": "33c3d4e5-f6a7-4c5d-0e1f-2a3b4c5d6e7f",
      "name": "Fetch Communities",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [460, 400],
      "parameters": {
        "url": "https://app.circle.so/api/admin/v2/communities",
        "method": "GET",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "per_page",
              "value": "50"
            }
          ]
        },
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "={{ 'Token ' + $credential.circleApi.token }}"
            }
          ]
        },
        "options": {}
      },
      "credentials": {
        "circleApi": {
          "id": "1",
          "name": "Circle.so API"
        }
      }
    },
    {
      "id": "44d4e5f6-a789-4d5e-1f2a-3b4c5d6e7f8a",
      "name": "Fetch Spaces",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [680, 400],
      "parameters": {
        "url": "https://app.circle.so/api/admin/v2/spaces",
        "method": "GET",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "per_page",
              "value": "100"
            }
          ]
        },
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "={{ 'Token ' + $credential.circleApi.token }}"
            }
          ]
        },
        "options": {}
      },
      "credentials": {
        "circleApi": {
          "id": "1",
          "name": "Circle.so API"
        }
      }
    },
    {
      "id": "55e5f6a7-8901-4e5f-2a3b-4c5d6e7f8a9b",
      "name": "Fetch Posts",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [900, 400],
      "parameters": {
        "url": "https://app.circle.so/api/admin/v2/posts",
        "method": "GET",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "per_page",
              "value": "100"
            }
          ]
        },
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "={{ 'Token ' + $credential.circleApi.token }}"
            }
          ]
        },
        "options": {}
      },
      "credentials": {
        "circleApi": {
          "id": "1",
          "name": "Circle.so API"
        }
      }
    },
    {
      "id": "66f6a7b8-9012-4f5a-3b4c-5d6e7f8a9b0c",
      "name": "Fetch Members",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1120, 400],
      "parameters": {
        "url": "https://app.circle.so/api/admin/v2/community_members",
        "method": "GET",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "per_page",
              "value": "100"
            }
          ]
        },
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "={{ 'Token ' + $credential.circleApi.token }}"
            }
          ]
        },
        "options": {}
      },
      "credentials": {
        "circleApi": {
          "id": "1",
          "name": "Circle.so API"
        }
      }
    },
    {
      "id": "77a7b8c9-0123-4a5b-4c5d-6e7f8a9b0c1d",
      "name": "Combine Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1340, 400],
      "parameters": {
        "mode": "runOnceForAllItems",
        "jsCode": "const communities = $input.first().json.records || [];\\nconst spaces = $input.first().json.records || [];\\nconst posts = $input.first().json.records || [];\\nconst members = $input.first().json.records || [];\\n\\nreturn [{\\n  json: {\\n    summary: {\\n      communities_count: communities.length,\\n      spaces_count: spaces.length,\\n      posts_count: posts.length,\\n      members_count: members.length,\\n      fetched_at: new Date().toISOString()\\n    },\\n    communities: communities,\\n    spaces: spaces,\\n    posts: posts,\\n    members: members\\n  }\\n}];",
        "options": {}
      }
    }
  ],
  "connections": {
    "Manual Trigger": {
      "main": [
        [
          {
            "node": "Fetch Communities",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Fetch Communities": {
      "main": [
        [
          {
            "node": "Fetch Spaces",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Fetch Spaces": {
      "main": [
        [
          {
            "node": "Fetch Posts",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Fetch Posts": {
      "main": [
        [
          {
            "node": "Fetch Members",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Fetch Members": {
      "main": [
        [
          {
            "node": "Combine Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1"
  },
  "active": false,
  "versionId": "50000001-5000-5000-5000-500000000001",
  "tags": ["circle", "community", "api"]
}
```

---

## Pantero WhatsApp Automation

Production workflow for processing WhatsApp messages via webhook with validation, conditional routing, and database storage.

**Use Case:** Handle 10,000+ WhatsApp messages per day for agricultural credit automation, route to correct handlers, store in database.

```json
{
  "name": "Pantero WhatsApp Message Handler",
  "nodes": [
    {
      "id": "11p1a2n3-t4e5-4r5o-w6h7-atsapp123456",
      "name": "Setup Note",
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [240, 100],
      "parameters": {
        "content": "## Pantero WhatsApp Automation\\n\\n**Production System:**\\n- Processes 10,000+ messages/day\\n- Routes based on message type\\n- Stores in PostgreSQL\\n- Sends confirmations\\n\\n**Message Types:**\\n1. New Lead → Lead Processing\\n2. Document Upload → File Handler\\n3. Status Query → Info Response\\n4. Other → General Queue",
        "height": 240,
        "width": 500,
        "color": 5
      }
    },
    {
      "id": "22p2a3n4-t5e6-4r5o-w6h7-atsapp234567",
      "name": "WhatsApp Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [240, 400],
      "parameters": {
        "httpMethod": "POST",
        "path": "pantero/whatsapp",
        "responseMode": "onReceived",
        "options": {}
      },
      "webhookId": "33p3a4n5-t6e7-4r5o-w6h7-atsapp345678"
    },
    {
      "id": "44p4a5n6-t7e8-4r5o-w6h7-atsapp456789",
      "name": "Parse Message",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [460, 400],
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {
              "id": "55p5a6n7-t8e9-4r5o-w6h7-atsapp567890",
              "name": "phone",
              "value": "={{ $json.body.from }}",
              "type": "string"
            },
            {
              "id": "66p6a7n8-t9e0-4r5o-w6h7-atsapp678901",
              "name": "message",
              "value": "={{ $json.body.text }}",
              "type": "string"
            },
            {
              "id": "77p7a8n9-t0e1-4r5o-w6h7-atsapp789012",
              "name": "timestamp",
              "value": "={{ $json.body.timestamp }}",
              "type": "string"
            },
            {
              "id": "88p8a9n0-t1e2-4r5o-w6h7-atsapp890123",
              "name": "hasMedia",
              "value": "={{ $json.body.hasMedia || false }}",
              "type": "boolean"
            }
          ]
        },
        "options": {}
      }
    },
    {
      "id": "99p9a0n1-t2e3-4r5o-w6h7-atsapp901234",
      "name": "Classify Message Type",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 3,
      "position": [680, 400],
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
                    "leftValue": "={{ $json.message.toLowerCase() }}",
                    "rightValue": "quero financiamento",
                    "operator": {
                      "type": "string",
                      "operation": "contains"
                    }
                  }
                ],
                "combinator": "or"
              },
              "renameOutput": true,
              "outputKey": "New Lead"
            },
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
                    "leftValue": "={{ $json.hasMedia }}",
                    "rightValue": "true",
                    "operator": {
                      "type": "boolean",
                      "operation": "equals"
                    }
                  }
                ],
                "combinator": "and"
              },
              "renameOutput": true,
              "outputKey": "Document"
            },
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
                    "leftValue": "={{ $json.message.toLowerCase() }}",
                    "rightValue": "status",
                    "operator": {
                      "type": "string",
                      "operation": "contains"
                    }
                  }
                ],
                "combinator": "or"
              },
              "renameOutput": true,
              "outputKey": "Status Query"
            }
          ]
        },
        "options": {}
      }
    },
    {
      "id": "aapaa1n2-t3e4-4r5o-w6h7-atsapp012345",
      "name": "Process New Lead",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [900, 200],
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {
              "id": "bbpbb2n3-t4e5-4r5o-w6h7-atsapp123456",
              "name": "leadType",
              "value": "financing_inquiry",
              "type": "string"
            },
            {
              "id": "ccpcc3n4-t5e6-4r5o-w6h7-atsapp234567",
              "name": "priority",
              "value": "high",
              "type": "string"
            }
          ]
        },
        "options": {}
      }
    },
    {
      "id": "ddpdd4n5-t6e7-4r5o-w6h7-atsapp345678",
      "name": "Process Document",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [900, 400],
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {
              "id": "eepee5n6-t7e8-4r5o-w6h7-atsapp456789",
              "name": "docType",
              "value": "uploaded_file",
              "type": "string"
            },
            {
              "id": "ffpff6n7-t8e9-4r5o-w6h7-atsapp567890",
              "name": "needsProcessing",
              "value": "true",
              "type": "string"
            }
          ]
        },
        "options": {}
      }
    },
    {
      "id": "ggpgg7n8-t9e0-4r5o-w6h7-atsapp678901",
      "name": "Handle Status Query",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [900, 600],
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {
              "id": "hhphh8n9-t0e1-4r5o-w6h7-atsapp789012",
              "name": "queryType",
              "value": "status_check",
              "type": "string"
            },
            {
              "id": "iipii9n0-t1e2-4r5o-w6h7-atsapp890123",
              "name": "autoRespond",
              "value": "true",
              "type": "string"
            }
          ]
        },
        "options": {}
      }
    },
    {
      "id": "jjpjj0n1-t2e3-4r5o-w6h7-atsapp901234",
      "name": "Store in Database",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.5,
      "position": [1120, 400],
      "parameters": {
        "operation": "insert",
        "schema": {
          "__rl": true,
          "mode": "list",
          "value": "public"
        },
        "table": {
          "__rl": true,
          "mode": "list",
          "value": "whatsapp_messages"
        },
        "columns": {
          "value": {
            "phone": "={{ $json.phone }}",
            "message": "={{ $json.message }}",
            "message_type": "={{ $json.leadType || $json.docType || $json.queryType || 'general' }}",
            "timestamp": "={{ $json.timestamp }}",
            "processed_at": "={{ new Date().toISOString() }}"
          },
          "schema": [],
          "mappingMode": "defineBelow",
          "matchingColumns": [],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "credentials": {
        "postgres": {
          "id": "1",
          "name": "Pantero Database"
        }
      }
    }
  ],
  "connections": {
    "WhatsApp Webhook": {
      "main": [
        [
          {
            "node": "Parse Message",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Parse Message": {
      "main": [
        [
          {
            "node": "Classify Message Type",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Classify Message Type": {
      "main": [
        [
          {
            "node": "Process New Lead",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Process Document",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Handle Status Query",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process New Lead": {
      "main": [
        [
          {
            "node": "Store in Database",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Document": {
      "main": [
        [
          {
            "node": "Store in Database",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Handle Status Query": {
      "main": [
        [
          {
            "node": "Store in Database",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1",
    "timezone": "America/Sao_Paulo"
  },
  "active": true,
  "versionId": "60000002-6000-6000-6000-600000000002",
  "tags": ["pantero", "whatsapp", "production"]
}
```

---

## RAG System Pipeline

Complete RAG (Retrieval-Augmented Generation) pipeline for processing documents, generating embeddings, and storing in vector database.

**Use Case:** Automated document ingestion for credit documentation system (Meu Parceiro Agro), with scheduled processing and Pinecone vector storage.

```json
{
  "name": "RAG Document Processing Pipeline",
  "nodes": [
    {
      "id": "11r1a2g3-s4y5-4s5t-e6m7-pipeline12345",
      "name": "Pipeline Overview",
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [240, 100],
      "parameters": {
        "content": "## RAG Pipeline - Document Ingestion\\n\\n**Pipeline Steps:**\\n1. Schedule trigger (every 6 hours)\\n2. Fetch new documents from source\\n3. Chunk text (1000 chars, 200 overlap)\\n4. Generate embeddings (OpenAI text-embedding-3-large)\\n5. Store in Pinecone vector database\\n6. Log results to database\\n\\n**Production:** Meu Parceiro Agro credit docs",
        "height": 260,
        "width": 550,
        "color": 3
      }
    },
    {
      "id": "22r2a3g4-s5y6-4s5t-e6m7-pipeline23456",
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [240, 420],
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "hoursInterval": 6
            }
          ]
        }
      }
    },
    {
      "id": "33r3a4g5-s6y7-4s5t-e6m7-pipeline34567",
      "name": "Fetch Documents",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [460, 420],
      "parameters": {
        "url": "https://api.meuparceiro.com.br/documents/pending",
        "method": "GET",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "={{ 'Bearer ' + $credential.mpaApi.token }}"
            }
          ]
        },
        "options": {}
      },
      "credentials": {
        "mpaApi": {
          "id": "1",
          "name": "MPA API"
        }
      }
    },
    {
      "id": "44r4a5g6-s7y8-4s5t-e6m7-pipeline45678",
      "name": "Split Documents",
      "type": "n8n-nodes-base.splitOut",
      "typeVersion": 1,
      "position": [680, 420],
      "parameters": {
        "fieldToSplitOut": "documents",
        "options": {}
      }
    },
    {
      "id": "55r5a6g7-s8y9-4s5t-e6m7-pipeline56789",
      "name": "Chunk Text",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [900, 420],
      "parameters": {
        "mode": "runOnceForEachItem",
        "jsCode": "const chunkSize = 1000;\\nconst overlap = 200;\\nconst text = $json.content;\\nconst chunks = [];\\n\\nfor (let i = 0; i < text.length; i += chunkSize - overlap) {\\n  const chunk = text.slice(i, i + chunkSize);\\n  chunks.push({\\n    text: chunk,\\n    metadata: {\\n      doc_id: $json.id,\\n      doc_title: $json.title,\\n      chunk_index: Math.floor(i / (chunkSize - overlap)),\\n      source: $json.source\\n    }\\n  });\\n}\\n\\nreturn chunks.map(chunk => ({ json: chunk }));",
        "options": {}
      }
    },
    {
      "id": "66r6a7g8-s9y0-4s5t-e6m7-pipeline67890",
      "name": "Generate Embeddings",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1120, 420],
      "parameters": {
        "url": "https://api.openai.com/v1/embeddings",
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
              "value": "text-embedding-3-large"
            },
            {
              "name": "input",
              "value": "={{ $json.text }}"
            }
          ]
        },
        "options": {}
      },
      "credentials": {
        "openAiApi": {
          "id": "2",
          "name": "OpenAI API"
        }
      }
    },
    {
      "id": "77r7a8g9-s0y1-4s5t-e6m7-pipeline78901",
      "name": "Prepare for Pinecone",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [1340, 420],
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {
              "id": "88r8a9g0-s1y2-4s5t-e6m7-pipeline89012",
              "name": "id",
              "value": "={{ $json.metadata.doc_id + '_chunk_' + $json.metadata.chunk_index }}",
              "type": "string"
            },
            {
              "id": "99r9a0g1-s2y3-4s5t-e6m7-pipeline90123",
              "name": "values",
              "value": "={{ $('Generate Embeddings').item.json.data[0].embedding }}",
              "type": "string"
            },
            {
              "id": "aar0a1g2-s3y4-4s5t-e6m7-pipeline01234",
              "name": "metadata",
              "value": "={{ $json.metadata }}",
              "type": "object"
            }
          ]
        },
        "options": {}
      }
    },
    {
      "id": "bbr1a2g3-s4y5-4s5t-e6m7-pipeline12345",
      "name": "Store in Pinecone",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1560, 420],
      "parameters": {
        "url": "={{ 'https://' + $credential.pineconeApi.environment + '/vectors/upsert' }}",
        "method": "POST",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            },
            {
              "name": "Api-Key",
              "value": "={{ $credential.pineconeApi.apiKey }}"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "vectors",
              "value": "={{ [{id: $json.id, values: $json.values, metadata: $json.metadata}] }}"
            },
            {
              "name": "namespace",
              "value": "mpa-credit-docs"
            }
          ]
        },
        "options": {}
      },
      "credentials": {
        "pineconeApi": {
          "id": "3",
          "name": "Pinecone API"
        }
      }
    },
    {
      "id": "ccr2a3g4-s5y6-4s5t-e6m7-pipeline23456",
      "name": "Log Results",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.5,
      "position": [1780, 420],
      "parameters": {
        "operation": "insert",
        "schema": {
          "__rl": true,
          "mode": "list",
          "value": "public"
        },
        "table": {
          "__rl": true,
          "mode": "list",
          "value": "rag_processing_log"
        },
        "columns": {
          "value": {
            "doc_id": "={{ $json.metadata.doc_id }}",
            "chunk_count": "={{ $json.metadata.chunk_index + 1 }}",
            "processed_at": "={{ new Date().toISOString() }}",
            "status": "success"
          },
          "schema": [],
          "mappingMode": "defineBelow",
          "matchingColumns": [],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "credentials": {
        "postgres": {
          "id": "1",
          "name": "MPA Database"
        }
      }
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "Fetch Documents",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Fetch Documents": {
      "main": [
        [
          {
            "node": "Split Documents",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Split Documents": {
      "main": [
        [
          {
            "node": "Chunk Text",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Chunk Text": {
      "main": [
        [
          {
            "node": "Generate Embeddings",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Generate Embeddings": {
      "main": [
        [
          {
            "node": "Prepare for Pinecone",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Prepare for Pinecone": {
      "main": [
        [
          {
            "node": "Store in Pinecone",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Store in Pinecone": {
      "main": [
        [
          {
            "node": "Log Results",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1",
    "timezone": "America/Sao_Paulo",
    "saveExecutionProgress": "disabled"
  },
  "active": true,
  "versionId": "70000003-7000-7000-7000-700000000003",
  "tags": ["rag", "embeddings", "pinecone", "production"]
}
```

**Pipeline Performance:**
- **Documents/run:** ~50-100
- **Chunks generated:** ~500-1000
- **Processing time:** ~5-10 minutes
- **Vector dimensions:** 3072 (text-embedding-3-large)
- **Run frequency:** Every 6 hours

---

## Key Patterns Demonstrated

### 1. Complete Structure
Every example shows the full workflow JSON with:
- All required top-level keys
- Complete nodes array
- Proper connections object
- Settings configuration

### 2. OpenAI Integration
All OpenAI examples use `/v1/responses` endpoint (never `/completions`)

### 3. Documentation
Sticky Notes provide setup instructions in every workflow

### 4. Error Handling
Conditional logic and validation before operations

### 5. Descriptive Naming
All nodes have clear, action-based names

---

Use these examples as templates for your own workflows. Copy the entire JSON and customize as needed.
