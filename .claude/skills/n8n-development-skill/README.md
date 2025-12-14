# n8n Workflow Development Skill

Expert n8n workflow development skill for Claude, following Anthropic's best practices.

## What This Skill Does

This skill teaches Claude to:
- Generate complete, valid n8n workflow JSONs following production standards
- **Follow WhatsApp/uazapi patterns** with mandatory normalization
- **Always use PostgreSQL** with optimized queries (never Supabase)
- Use correct OpenAI API endpoints (`/v1/responses`, not `/completions`)
- Always output complete node structures (never fragments)
- **Search 38+ production workflows** in EXAMPLES-LIBRARY for reference
- **Invoke specialized subagents** for deep analysis and adaptation
- Create well-documented, production-ready workflows

## Installation

### For Claude Desktop / Claude Code

1. Download or clone this skill folder
2. Navigate to Settings → Capabilities → Skills
3. Click "Upload skill" and select the entire `n8n-development-skill` folder (or ZIP it first)
4. The skill will be automatically available in your conversations

### For Claude API

Follow the [API skills documentation](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills) to integrate this skill.

## Usage

The skill activates automatically when you:
- Ask to create an n8n workflow
- Request specific n8n nodes
- Want to build automation flows
- Need to convert logic into n8n JSON

### Example Prompts

**Basic:**
> "Create an n8n workflow that receives a webhook and sends the data to OpenAI"

**Advanced:**
> "Build a workflow that fetches data from an API every hour, checks conditions, and stores results in PostgreSQL"

**MCP Integration:**
> "Create an AI agent workflow using OpenAI MCP servers for DeepWiki documentation"

## File Structure

```
n8n-development-skill/
├── SKILL.md                  # Main skill instructions (loaded first)
├── NODE-REFERENCE.md         # Detailed node configurations (PostgreSQL focus)
├── PATTERNS.md               # Production patterns (WhatsApp/uazapi, PostgreSQL)
├── EXAMPLES.md               # Complete workflow examples
├── MCP-INTEGRATION.md        # OpenAI MCP integration patterns
├── TESTING-GUIDE.md          # Testing strategies
├── GUIA-INSTALACAO.md        # Installation guide (Portuguese)
├── README.md                 # This file
└── EXAMPLES-LIBRARY/         # 38+ production workflows
    ├── INDEX.md              # Searchable catalog
    ├── USAGE-GUIDE.md        # Daily usage patterns
    ├── webhooks/             # 13 webhook workflows
    ├── ai-agents/            # 14 AI agent workflows
    ├── data-processing/      # 4 data processing workflows
    └── content-generation/   # 7 content generation workflows
```

## Specialized Subagents

The skill works with 3 specialized agents (separate context windows):

### n8n-example-finder
**Purpose**: Fast search through EXAMPLES-LIBRARY
- Searches 38+ workflows by nodes, patterns, integrations
- Ranks results by relevance (1-10)
- **Analyzes multiple workflows in parallel** for speed
- Returns top 5-7 matches with recommendations

**Usage**: Automatically invoked before generating workflows

### n8n-workflow-analyzer
**Purpose**: Deep workflow analysis
- Parses JSON structure and maps architecture
- Identifies patterns and complexity
- **Validates WhatsApp/uazapi compliance** (tracker pattern)
- **Verifies PostgreSQL usage** (not Supabase)
- Provides improvement suggestions

**Usage**: Via `/n8n-analyze` command or automatically when needed

### n8n-workflow-adapter
**Purpose**: Modify existing workflows
- Adapts workflows for new requirements
- **Maintains PostgreSQL** (never converts to Supabase)
- Swaps integrations while preserving structure
- Regenerates all UUIDs for uniqueness

**Usage**: Automatically invoked when adapting examples

## Slash Commands

Quick access to specialized functionality:

```bash
/n8n-find <criteria>          # Search EXAMPLES-LIBRARY
/n8n-analyze <path> [mode]    # Analyze workflow (quick|full|compare)
/n8n-save <path> [name]       # Save workflow to library
/n8n-index [--full|--quick]   # Rebuild library index
```

## Key Features

### 1. Production Standards Enforcement

**WhatsApp/Uazapi Pattern (Mandatory):**
```
Webhook → Normalização ("variaveis") → PostgreSQL → Output (uazapi)
```
- ✅ Always confirms trigger type before generating
- ✅ Always confirms if uazapi integration
- ✅ Always adds normalization node after webhook
- ✅ Extracts standard fields: chatId, groupName, user.whatsapp, message.text, etc.

**PostgreSQL Only (Critical):**
- ✅ Always uses PostgreSQL with `executeQuery`
- ✅ Uses CTEs (WITH statements) for complex logic
- ✅ Uses query params ($1, $2, $3) for security
- ✅ Uses `json_build_object()` for structured returns
- ❌ NEVER uses Supabase nodes

**Complete Structure:**
```json
{
  "name": "Workflow Name",
  "nodes": [...],
  "connections": {...},
  "settings": {...}
}
```
Never generates fragments.

**Correct OpenAI endpoint:**
- ✅ Uses `/v1/responses`
- ❌ Never uses `/v1/completions` or `/v1/chat/completions`

### 2. Follows Best Practices

- Generates unique UUIDs for all nodes
- Includes `"options": {}` in parameters (critical!)
- Uses correct `typeVersion` for each node type
- Creates descriptive, action-based node names
- Adds Sticky Notes with setup instructions

### 3. Progressive Disclosure

The skill uses Anthropic's progressive disclosure pattern:
- **SKILL.md**: Overview and core instructions
- **NODE-REFERENCE.md**: Detailed configurations (loaded when needed)
- **EXAMPLES.md**: Complete templates (loaded when requested)
- **MCP-INTEGRATION.md**: Advanced patterns (loaded for AI workflows)

This keeps context usage low while providing comprehensive information.

## Real-World Examples

This skill includes **38+ production-tested workflows** from actual projects:

### EXAMPLES-LIBRARY Categories

**🌐 Webhooks (13 workflows)**
- WhatsApp message tracking and routing
- Group event handling (join/leave)
- Message segmentation and validation
- Examples: `pantero-tracker.json`, `briefia-message-segmentation.json`

**🤖 AI Agents (14 workflows)**
- LangChain agents with tools
- RAG systems with vector stores
- Conversation memory management
- MCP integration patterns
- Examples: `comagent-ai-group.json`, `manytest-conversation-agent.json`

**🔄 Data Processing (4 workflows)**
- Scheduled message processing
- CRON jobs for status checks
- RSS feed processing
- Examples: `briefia-scheduled-messages.json`, `pantero-rss.json`

**📝 Content Generation (7 workflows)**
- Automated briefing generation
- Group summary creation
- Manager reports
- Summary distribution
- Examples: `briefia-briefing-generator.json`, `comagent-summary-generator.json`

### Key Production Patterns

All workflows demonstrate:
- ✅ Webhook → Normalization pattern
- ✅ PostgreSQL with optimized CTEs
- ✅ uazapi integration for WhatsApp
- ✅ Proper error handling
- ✅ Query param usage (no SQL injection)

Browse the full catalog: `EXAMPLES-LIBRARY/INDEX.md`

## What Gets Fixed

### Before (Common Issues)

**Issue 1: Fragment Output**
```json
{
  "id": "uuid",
  "name": "HTTP Request",
  "type": "n8n-nodes-base.httpRequest",
  ...
}
```
❌ Not importable to n8n!

**Issue 2: Wrong Endpoint**
```json
{
  "url": "https://api.openai.com/v1/completions"
}
```
❌ Outdated endpoint!

### After (With Skill)

**Issue 1: Complete Structure**
```json
{
  "name": "My Workflow",
  "nodes": [
    {
      "id": "uuid",
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      ...
    }
  ],
  "connections": {...},
  "settings": {...}
}
```
✅ Copy-paste ready!

**Issue 2: Correct Endpoint**
```json
{
  "url": "https://api.openai.com/v1/responses"
}
```
✅ Current API!

## Testing the Skill

After installation, test with:

1. **Simple Test:**
   > "Create a basic n8n workflow with a manual trigger and a Set node"

   Verify the output is complete JSON with all required keys.

2. **OpenAI Test:**
   > "Create a workflow that calls OpenAI"

   Verify it uses `/v1/responses` endpoint.

3. **MCP Test:**
   > "Create an AI agent using OpenAI MCP servers"

   Verify MCP configuration is correct.

## Customization

The skill adapts to your preferences:
- If you show existing workflow style → matches it
- If you specify naming conventions → follows them
- If you have credential preferences → applies them

## Requirements

- Claude Desktop/Code or Claude API access
- Pro, Max, Team, or Enterprise plan (for skills feature)
- Code execution enabled

## Troubleshooting

**Skill not activating?**
- Check the skill description matches your request
- Try more specific prompts (mention "n8n" or "workflow")
- Verify skills are enabled in Settings

**Output still has fragments?**
- Explicitly ask for "complete n8n workflow JSON"
- Reference the skill: "Using n8n development skill, create..."

**Wrong OpenAI endpoint?**
- Mention: "Use the /responses endpoint"
- The skill should auto-correct this, report if it doesn't

## Contributing

Found an issue or want to improve the skill?

1. Test the problematic scenario
2. Note the expected vs actual behavior
3. Create an issue or pull request with details

## Version History

**v2.0.0** (2025-01-03)
- **Production Standards**: WhatsApp/uazapi mandatory patterns
- **PostgreSQL Only**: Always use PostgreSQL, never Supabase
- **EXAMPLES-LIBRARY**: 38+ production workflows categorized
- **Specialized Subagents**: finder, analyzer, adapter (separate contexts)
- **Parallel Analysis**: Analyze multiple workflows simultaneously
- **Slash Commands**: /n8n-find, /n8n-analyze, /n8n-save, /n8n-index
- **PATTERNS.md**: Complete documentation of production patterns
- **Normalization Standard**: Mandatory "variaveis" node after webhooks
- **Query Optimization**: CTEs, query params, json_build_object
- **Compliance Validation**: Analyzer checks pattern adherence

**v1.0.0** (2025-01-XX)
- Initial release
- Complete node structure enforcement
- OpenAI /responses endpoint
- MCP integration patterns
- Progressive disclosure structure

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [OpenAI MCP Servers](https://platform.openai.com/docs/guides/mcp)
- [Anthropic Skills Best Practices](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/best-practices)

## License

This skill is provided as-is for educational and development purposes.

---

**Built following [Anthropic's Agent Skills Best Practices](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/best-practices)**
