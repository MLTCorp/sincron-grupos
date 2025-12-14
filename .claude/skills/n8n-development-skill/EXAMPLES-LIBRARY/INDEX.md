# N8N Workflow Examples Library

**Last Updated**: 2025-11-03

**Total Workflows**: 38

---

## 📚 Quick Navigation

- [Webhooks](#webhooks) (13 workflows)
- [AI Agents](#ai-agents) (14 workflows)
- [Data Processing](#data-processing) (4 workflows)
- [Content Generation](#content-generation) (7 workflows)

---

## 🔍 Search Tips

- Use `/n8n-find <criteria>` to search workflows
- Use `/n8n-analyze <path>` to understand a workflow
- Use `/n8n-save <path>` to add new workflows

---

## 🌐 Webhooks

*API endpoints, HTTP triggers, real-time message processing*

### Briefia Project

#### Briefia - Message Tracker
- **File**: `webhooks/briefia-tracker.json`
- **Summary**: Tracks incoming WhatsApp messages and routes to processing
- **Key Nodes**: `Webhook`, `Set`, `HTTP Request`, `PostgreSQL`
- **Tags**: `whatsapp` `tracking` `webhook` `database`
- **Use Cases**:
  - Message intake system
  - WhatsApp integration
  - Real-time message tracking

#### Briefia - Message Segmentation
- **File**: `webhooks/briefia-message-segmentation.json`
- **Summary**: Segments incoming messages by type and routes accordingly
- **Key Nodes**: `Webhook`, `Switch`, `Set`, `Respond`
- **Tags**: `routing` `segmentation` `conditional`
- **Use Cases**:
  - Message classification
  - Conditional routing
  - Multi-path processing

#### Briefia - Join Group
- **File**: `webhooks/briefia-join-group.json`
- **Summary**: Handles WhatsApp group join events
- **Key Nodes**: `Webhook`, `PostgreSQL`, `HTTP Request`
- **Tags**: `whatsapp` `group-management` `webhook`
- **Use Cases**:
  - Group membership tracking
  - Automated onboarding

#### Briefia - Leave Group
- **File**: `webhooks/briefia-leave-group.json`
- **Summary**: Processes WhatsApp group leave events
- **Key Nodes**: `Webhook`, `PostgreSQL`, `HTTP Request`
- **Tags**: `whatsapp` `group-management` `webhook`
- **Use Cases**:
  - Member departure handling
  - Group cleanup automation

#### Briefia - Update Scheduled Status
- **File**: `webhooks/briefia-update-scheduled-status.json`
- **Summary**: Webhook to update status of scheduled messages
- **Key Nodes**: `Webhook`, `PostgreSQL`, `Respond`
- **Tags**: `status-update` `webhook` `database`
- **Use Cases**:
  - Message status tracking
  - Scheduled message management

### ComAgent Project

#### ComAgent - Message Tracker
- **File**: `webhooks/comagent-tracker.json`
- **Summary**: Tracks group messages for analysis
- **Key Nodes**: `Webhook`, `Set`, `PostgreSQL`, `Supabase`
- **Tags**: `whatsapp` `tracking` `analytics`
- **Use Cases**:
  - Group message monitoring
  - Data collection for AI analysis

#### ComAgent - Message Segmentation
- **File**: `webhooks/comagent-message-segmentation.json`
- **Summary**: Routes messages to appropriate handlers
- **Key Nodes**: `Webhook`, `Switch`, `PostgreSQL`
- **Tags**: `routing` `segmentation` `whatsapp`
- **Use Cases**:
  - Message classification
  - Intelligent routing

### Pantero Project

#### Pantero - Message Tracker
- **File**: `webhooks/pantero-tracker.json`
- **Summary**: Main message intake for Pantero platform
- **Key Nodes**: `Webhook`, `PostgreSQL`, `Set`
- **Tags**: `whatsapp` `tracking` `pantero`
- **Use Cases**:
  - Central message processing
  - WhatsApp message logging

#### Pantero - Groups Handler
- **File**: `webhooks/pantero-groups.json`
- **Summary**: Handles group-specific message processing
- **Key Nodes**: `Webhook`, `Switch`, `PostgreSQL`, `HTTP Request`
- **Tags**: `whatsapp` `groups` `routing`
- **Use Cases**:
  - Group message handling
  - Multi-group management

#### Pantero - Private Messages
- **File**: `webhooks/pantero-private.json`
- **Summary**: Processes private/direct messages
- **Key Nodes**: `Webhook`, `PostgreSQL`, `Switch`
- **Tags**: `whatsapp` `private` `dm`
- **Use Cases**:
  - 1-on-1 conversations
  - Private message routing

#### Pantero - Private Messages v2
- **File**: `webhooks/pantero-private-v2.json`
- **Summary**: Enhanced version of private message handler
- **Key Nodes**: `Webhook`, `PostgreSQL`, `Switch`, `HTTP Request`
- **Tags**: `whatsapp` `private` `enhanced`
- **Use Cases**:
  - Improved private messaging
  - Additional features for DMs

#### Pantero - Accept Group Member
- **File**: `webhooks/pantero-accept-member.json`
- **Summary**: Automates group member acceptance
- **Key Nodes**: `Webhook`, `PostgreSQL`, `HTTP Request`
- **Tags**: `whatsapp` `automation` `group-management`
- **Use Cases**:
  - Auto-accept group requests
  - Member validation

### Manytest Project

#### Manytest - Message Flow
- **File**: `webhooks/manytest-message-flow.json`
- **Summary**: Main message processing flow for quiz generation
- **Key Nodes**: `Webhook`, `PostgreSQL`, `Set`
- **Tags**: `whatsapp` `education` `quiz`
- **Use Cases**:
  - Educational bot message intake
  - Quiz request processing

---

## 🤖 AI Agents

*LangChain agents, OpenAI/Anthropic integrations, RAG systems, tool workflows*

### Manytest Project

#### Manytest - Conversation Agent
- **File**: `ai-agents/manytest-conversation-agent.json`
- **Summary**: Main AI agent for quiz generation conversations
- **Key Nodes**: `Agent`, `ChatOpenAI`, `ToolWorkflow`, `Memory`
- **Tags**: `ai` `agent` `education` `quiz` `openai`
- **Use Cases**:
  - Educational AI assistant
  - Quiz generation via conversation
  - Multi-tool AI agent

#### Manytest - Tool: Test Generation
- **File**: `ai-agents/manytest-tool-test-generation.json`
- **Summary**: Tool workflow for generating educational tests
- **Key Nodes**: `ToolWorkflow`, `ChatOpenAI`, `Code`, `PostgreSQL`
- **Tags**: `tool` `ai` `quiz-generation` `education`
- **Use Cases**:
  - Automated quiz creation
  - Educational content generation
  - Sub-workflow tool pattern

#### Manytest - Tool: Remake Question
- **File**: `ai-agents/manytest-tool-remake-question.json`
- **Summary**: Regenerates quiz questions with different variations
- **Key Nodes**: `ToolWorkflow`, `ChatOpenAI`, `PostgreSQL`
- **Tags**: `tool` `ai` `question-rewriting`
- **Use Cases**:
  - Question variation
  - Content diversification

#### Manytest - Tool: YouTube Analysis
- **File**: `ai-agents/manytest-tool-youtube-analysis.json`
- **Summary**: Analyzes YouTube videos to extract quiz content
- **Key Nodes**: `ToolWorkflow`, `ChatOpenAI`, `HTTP Request`
- **Tags**: `tool` `ai` `youtube` `content-extraction`
- **Use Cases**:
  - Video-based quiz generation
  - Content extraction from videos

### ComAgent Project

#### ComAgent - AI Group Assistant
- **File**: `ai-agents/comagent-ai-group.json`
- **Summary**: AI assistant for WhatsApp groups with RAG
- **Key Nodes**: `Agent`, `ChatOpenAI`, `VectorStoreSupabase`, `Memory`
- **Tags**: `ai` `agent` `rag` `whatsapp` `groups`
- **Use Cases**:
  - Group conversation AI
  - Context-aware responses
  - RAG-powered assistant

#### ComAgent - AI Private Assistant
- **File**: `ai-agents/comagent-ai-private.json`
- **Summary**: AI for private conversations with configuration
- **Key Nodes**: `Agent`, `ChatOpenAI`, `Memory`, `PostgreSQL`
- **Tags**: `ai` `agent` `private` `whatsapp`
- **Use Cases**:
  - 1-on-1 AI conversations
  - Personalized responses

#### ComAgent - MCP Configuration
- **File**: `ai-agents/comagent-mcp-config.json`
- **Summary**: MCP server for AI configuration management
- **Key Nodes**: `ManualTrigger`, `PostgreSQL`, `Code`
- **Tags**: `mcp` `configuration` `ai-settings`
- **Use Cases**:
  - AI configuration via MCP
  - Dynamic settings management

### Pantero Project

#### Pantero - WhatsApp Commands
- **File**: `ai-agents/pantero-whatsapp-commands.json`
- **Summary**: Command handler for WhatsApp bot interactions
- **Key Nodes**: `ToolWorkflow`, `Switch`, `HTTP Request`
- **Tags**: `tool` `commands` `whatsapp`
- **Use Cases**:
  - Bot command processing
  - Command routing

#### Pantero - Tool: Groups Management
- **File**: `ai-agents/pantero-tool-grupos.json`
- **Summary**: Tool for managing group operations
- **Key Nodes**: `ToolWorkflow`, `PostgreSQL`, `HTTP Request`
- **Tags**: `tool` `groups` `management`
- **Use Cases**:
  - Group CRUD operations
  - Group information retrieval

#### Pantero - Tool: Mass Commands
- **File**: `ai-agents/pantero-tool-mass-commands.json`
- **Summary**: Execute commands across multiple chats
- **Key Nodes**: `ToolWorkflow`, `PostgreSQL`, `HTTP Request`, `Code`
- **Tags**: `tool` `bulk-operations` `automation`
- **Use Cases**:
  - Bulk message sending
  - Mass operations

#### Pantero - Tool: Access Control
- **File**: `ai-agents/pantero-tool-acesso.json`
- **Summary**: Manages user access and permissions
- **Key Nodes**: `ToolWorkflow`, `PostgreSQL`, `Code`
- **Tags**: `tool` `access-control` `permissions`
- **Use Cases**:
  - User permission management
  - Access validation

#### Pantero - Call: Tokens & Raffle
- **File**: `ai-agents/pantero-call-tokens-sorteio.json`
- **Summary**: Handles token economy and raffle systems
- **Key Nodes**: `ToolWorkflow`, `PostgreSQL`, `Code`, `HTTP Request`
- **Tags**: `tool` `gamification` `tokens` `raffle`
- **Use Cases**:
  - Token management
  - Raffle automation

#### Pantero - Tool: Tokens & Raffle
- **File**: `ai-agents/pantero-tool-tokens-sorteio.json`
- **Summary**: Tool version of tokens and raffle handler
- **Key Nodes**: `ToolWorkflow`, `PostgreSQL`, `Code`
- **Tags**: `tool` `gamification` `tokens`
- **Use Cases**:
  - Token operations
  - Prize distribution

#### Pantero - Uazapi WhatsApp Tools
- **File**: `ai-agents/pantero-uazapi-tools.json`
- **Summary**: Integration tools for Uazapi WhatsApp API
- **Key Nodes**: `ToolWorkflow`, `HTTP Request`, `Code`
- **Tags**: `tool` `uazapi` `whatsapp-api`
- **Use Cases**:
  - WhatsApp API operations
  - Message sending utilities

---

## 🔄 Data Processing

*Scheduled jobs, CRON tasks, RSS feeds, ETL pipelines*

### Briefia Project

#### Briefia - Scheduled Messages
- **File**: `data-processing/briefia-scheduled-messages.json`
- **Summary**: Manages message scheduling system
- **Key Nodes**: `PostgreSQL`, `Code`, `HTTP Request`
- **Tags**: `scheduled` `messaging` `automation`
- **Use Cases**:
  - Message queuing
  - Delayed message delivery

#### Briefia - Check Scheduled Status
- **File**: `data-processing/briefia-check-scheduled-status.json`
- **Summary**: CRON job to verify scheduled message status
- **Key Nodes**: `ScheduleTrigger`, `PostgreSQL`, `Code`, `HTTP Request`
- **Tags**: `cron` `scheduled` `monitoring`
- **Use Cases**:
  - Periodic status checks
  - Message delivery verification

#### Briefia - CRON Job
- **File**: `data-processing/briefia-cron.json`
- **Summary**: General purpose CRON workflow
- **Key Nodes**: `ScheduleTrigger`, `PostgreSQL`, `Set`
- **Tags**: `cron` `scheduled` `maintenance`
- **Use Cases**:
  - Periodic data processing
  - Maintenance tasks

### Pantero Project

#### Pantero - RSS Feed
- **File**: `data-processing/pantero-rss.json`
- **Summary**: Fetches and processes RSS feeds
- **Key Nodes**: `ScheduleTrigger`, `RSS`, `PostgreSQL`, `HTTP Request`
- **Tags**: `rss` `scheduled` `feed` `news`
- **Use Cases**:
  - News aggregation
  - Content distribution
  - Automated posting

---

## 📝 Content Generation

*Document creation, briefings, summaries, reports, AI-powered content*

### Briefia Project

#### Briefia - Briefing Generator
- **File**: `content-generation/briefia-briefing-generator.json`
- **Summary**: Generates marketing briefings with AI and security validation
- **Key Nodes**: `Webhook`, `Agent`, `ChatOpenAI`, `Code`, `PostgreSQL`
- **Tags**: `ai` `content-generation` `briefing` `marketing` `security`
- **Use Cases**:
  - Marketing brief automation
  - AI-powered document creation
  - Prompt injection protection

#### Briefia - Group Summary Generation
- **File**: `content-generation/briefia-group-summary-generation.json`
- **Summary**: Creates summaries of group conversations
- **Key Nodes**: `ScheduleTrigger`, `PostgreSQL`, `ChatOpenAI`, `Code`
- **Tags**: `ai` `summary` `groups` `scheduled`
- **Use Cases**:
  - Conversation summarization
  - Group activity reports

#### Briefia - Manager Summary Generation
- **File**: `content-generation/briefia-manager-summary-generation.json`
- **Summary**: Generates executive summaries for managers
- **Key Nodes**: `ScheduleTrigger`, `PostgreSQL`, `ChatOpenAI`, `Code`
- **Tags**: `ai` `summary` `reports` `management`
- **Use Cases**:
  - Executive reporting
  - High-level summaries

#### Briefia - Send Summaries
- **File**: `content-generation/briefia-send-summaries.json`
- **Summary**: Distributes generated summaries to recipients
- **Key Nodes**: `ScheduleTrigger`, `PostgreSQL`, `HTTP Request`
- **Tags**: `distribution` `scheduled` `messaging`
- **Use Cases**:
  - Report distribution
  - Automated delivery

### ComAgent Project

#### ComAgent - Create Group Summaries
- **File**: `content-generation/comagent-create-group-summaries.json`
- **Summary**: Orchestrates group summary creation process
- **Key Nodes**: `ScheduleTrigger`, `PostgreSQL`, `HTTP Request`
- **Tags**: `summary` `groups` `orchestration`
- **Use Cases**:
  - Batch summary generation
  - Group analytics

#### ComAgent - Summary Generator
- **File**: `content-generation/comagent-summary-generator.json`
- **Summary**: Core AI engine for generating summaries
- **Key Nodes**: `ChatOpenAI`, `PostgreSQL`, `Code`, `VectorStore`
- **Tags**: `ai` `summary` `rag` `content`
- **Use Cases**:
  - AI-powered summarization
  - Context-aware summaries

#### ComAgent - Send Summaries
- **File**: `content-generation/comagent-send-summaries.json`
- **Summary**: Delivers summaries via WhatsApp
- **Key Nodes**: `PostgreSQL`, `HTTP Request`, `Code`
- **Tags**: `distribution` `whatsapp` `automation`
- **Use Cases**:
  - Summary distribution
  - WhatsApp messaging

---

## 📊 Statistics

**By Category**:
- 🌐 Webhooks: 13 workflows
- 🤖 AI Agents: 14 workflows
- 🔄 Data Processing: 4 workflows
- 📝 Content Generation: 7 workflows

**By Project**:
- **Briefia**: 12 workflows (marketing automation)
- **Pantero**: 13 workflows (credit/community platform)
- **ComAgent**: 8 workflows (group assistant)
- **Manytest**: 5 workflows (educational quizzes)

**Top Node Types**:
1. `@n8n/n8n-nodes-langchain.agent` - AI agents
2. `@n8n/n8n-nodes-langchain.lmChatOpenAi` - OpenAI integration
3. `n8n-nodes-base.webhook` - HTTP webhooks
4. `n8n-nodes-base.postgres` - PostgreSQL database
5. `n8n-nodes-base.httpRequest` - HTTP requests
6. `n8n-nodes-base.switch` - Conditional routing
7. `@n8n/n8n-nodes-langchain.toolWorkflow` - Sub-workflow tools
8. `@n8n/n8n-nodes-langchain.vectorStoreSupabase` - RAG/Vector store

**Top Use Cases**:
- WhatsApp automation & messaging
- AI-powered conversation & assistance
- Content generation (briefings, summaries, quizzes)
- Scheduled message processing
- Group management & analytics

**Key Integrations**:
- **OpenAI**: AI/LLM capabilities
- **PostgreSQL/Supabase**: Data persistence & vector storage
- **Uazapi**: WhatsApp API integration
- **LangChain**: AI agent framework

---

## 🏷️ Tag Index

Quick reference by popular tags:

- **ai** (20 workflows): AI-powered automation
- **whatsapp** (18 workflows): WhatsApp integration
- **webhook** (13 workflows): HTTP triggers
- **tool** (10 workflows): Sub-workflow tools
- **agent** (6 workflows): LangChain agents
- **rag** (4 workflows): Retrieval-augmented generation
- **scheduled** (7 workflows): CRON/scheduled tasks
- **summary** (6 workflows): Content summarization
- **groups** (8 workflows): Group management
- **database** (25+ workflows): Database operations

---

## 🔗 Related Resources

- **N8N Development Skill**: See `SKILL.md` for skill documentation
- **Node Reference**: See `NODE-REFERENCE.md` for detailed node configurations
- **Examples Guide**: See `EXAMPLES.md` for annotated workflow examples
- **Testing Guide**: See `TESTING-GUIDE.md` for testing strategies
- **MCP Integration**: See `MCP-INTEGRATION.md` for MCP server details

---

## 💡 Using This Library

### Search Workflows
```bash
/n8n-find whatsapp ai agent     # Find AI-powered WhatsApp workflows
/n8n-find rag supabase          # Find RAG workflows with Supabase
/n8n-find simple webhook        # Find beginner-friendly webhook examples
```

### Analyze Workflows
```bash
/n8n-analyze EXAMPLES-LIBRARY/ai-agents/comagent-ai-group.json
/n8n-analyze EXAMPLES-LIBRARY/webhooks/pantero-tracker.json full
```

### Add New Workflows
```bash
/n8n-save path/to/new-workflow.json custom-name
```

### Rebuild Index
```bash
/n8n-index --full    # Complete reindex with analysis
/n8n-index --verify  # Check index integrity
```

---

## 🚀 Common Patterns Found

### Pattern: Webhook → Router → Handlers
Many workflows follow this pattern:
- Webhook receives data
- Switch/conditional routes to handlers
- Specific processing per route
- Unified response

Examples: `pantero-groups.json`, `briefia-message-segmentation.json`

### Pattern: AI Agent with Tools
Advanced AI workflows use:
- Main agent node
- Multiple tool workflows
- Vector store for RAG
- Memory for context

Examples: `manytest-conversation-agent.json`, `comagent-ai-group.json`

### Pattern: Scheduled → Process → Store
Data processing follows:
- Schedule trigger (CRON)
- Fetch/process data
- Store results
- Optional notifications

Examples: `briefia-check-scheduled-status.json`, `pantero-rss.json`

### Pattern: Generate → Validate → Deliver
Content generation uses:
- AI generation
- Validation/security checks
- Storage
- Distribution

Examples: `briefia-briefing-generator.json`, `comagent-summary-generator.json`

---

*Generated on 2025-11-03 | Total workflows: 38*
*Use `/n8n-index` to regenerate this file*
