# Changelog

## [2.0.0] - 2025-01-03

### 🎯 Major Changes

#### Production Standards Enforcement
- **WhatsApp/Uazapi Pattern (Mandatory)**: Workflows now follow strict pattern: Webhook → Normalization → PostgreSQL → Output (uazapi)
- **PostgreSQL Only**: ALWAYS use PostgreSQL with `executeQuery`. NEVER use Supabase nodes
- **Normalization Standard**: Mandatory "variaveis" node after webhooks with 13+ standard fields

### 📚 New Features

#### EXAMPLES-LIBRARY
- Added 38+ production-tested workflows
- Organized in 4 categories:
  - 🌐 Webhooks (13 workflows)
  - 🤖 AI Agents (14 workflows)
  - 🔄 Data Processing (4 workflows)
  - 📝 Content Generation (7 workflows)
- Complete INDEX.md catalog with searchable metadata
- USAGE-GUIDE.md with daily workflow patterns

#### Specialized Subagents (Separate Context Windows)
- **n8n-example-finder**: Fast search through 38+ workflows with relevance ranking (1-10)
- **n8n-workflow-analyzer**: Deep analysis with WhatsApp/PostgreSQL compliance validation
- **n8n-workflow-adapter**: Adapt workflows while maintaining PostgreSQL standard

#### Parallel Analysis
- Subagents can now analyze multiple workflows simultaneously
- Speed improvement: 3 workflows analyzed in ~10-15s vs ~30-60s (3x faster)

#### Slash Commands
- `/n8n-find <criteria>` - Search EXAMPLES-LIBRARY
- `/n8n-analyze <path> [mode]` - Analyze workflow (quick|full|compare)
- `/n8n-save <path> [name]` - Save workflow to library with auto-categorization
- `/n8n-index [--full|--quick]` - Rebuild library index

### 📖 Documentation

#### New Files
- **PATTERNS.md**: Complete production patterns documentation
  - WhatsApp/Uazapi Tracker Pattern
  - PostgreSQL Query Optimization (3 patterns)
  - Data Normalization standards
  - Output via Uazapi endpoints
  - Workflow Structure best practices
  - Quality checklist

#### Updated Files
- **SKILL.md**: Added "Standard Workflow Patterns (REQUIRED)" section
  - Workflow Start Pattern (triggers)
  - WhatsApp/Uazapi Integration Standards
  - Database Strategy (PostgreSQL only)
  - Output Pattern (uazapi)

- **NODE-REFERENCE.md**: Complete PostgreSQL section rewrite
  - Execute Query preferred method
  - 3 production examples (simple, CTEs, upsert)
  - PostgreSQL Query Best Practices
  - Query params (queryReplacement) guide
  - Removed Supabase emphasis

- **README.md**: Updated with new features
  - Production standards section
  - Subagents overview
  - Slash commands list
  - EXAMPLES-LIBRARY categories
  - Updated version history

- **GUIA-INSTALACAO.md**: Complete rewrite (Portuguese)
  - Installation steps for skill, subagents, commands
  - New production patterns explained
  - Test cases for WhatsApp/uazapi and PostgreSQL
  - Complete workflow scenarios
  - Parallel analysis explanation

#### Agent Files Updated
- **n8n-workflow-analyzer.md**:
  - Added WhatsApp/Uazapi Tracker Pattern recognition
  - Added pattern validation section
  - Compliance scoring system
  - PostgreSQL vs Supabase verification

- **n8n-workflow-adapter.md**:
  - Critical rule: ALWAYS maintain PostgreSQL
  - Scenario for Supabase → PostgreSQL conversion
  - Never convert PostgreSQL → Supabase

- **n8n-example-finder.md**:
  - Pattern-specific ranking boosts (+2 for tracker pattern, +2 for PostgreSQL with CTEs)
  - Parallel analysis section
  - Speed optimization instructions

### 🔧 Behavioral Changes

#### Skill Workflow Generation
**Before v2.0.0**:
- Generated workflows without specific patterns
- No database preference
- Generic normalization

**After v2.0.0**:
1. ✅ Confirms trigger type (Webhook or Execute Workflow)
2. ✅ Confirms uazapi integration for WhatsApp workflows
3. ✅ Adds mandatory normalization node ("variaveis")
4. ✅ Always uses PostgreSQL with optimized queries
5. ✅ Configures uazapi output endpoints
6. ✅ Searches EXAMPLES-LIBRARY for similar patterns
7. ✅ Invokes subagents for deep analysis when needed

#### PostgreSQL Query Standards
- Uses CTEs (WITH statements) for complex logic
- Always uses query params ($1, $2, $3) via `queryReplacement`
- Returns structured data with `json_build_object()`
- Includes CASE statements for conditional logic
- Uses LEFT JOIN + COALESCE to reduce external IFs
- Adds SQL comments explaining logic

#### Normalization Standards
**Standard fields extracted in "variaveis" node**:
- `variaveis.chat.chatId`
- `variaveis.chat.groupName`
- `variaveis.chat.isGroup`
- `variaveis.user.whatsapp`
- `variaveis.user.name`
- `variaveis.message.text`
- `variaveis.message.id`
- `variaveis.message.fromMe`
- `variaveis.message.type`
- `variaveis.message.timestamp`
- `variaveis.instance.number`
- `variaveis.instance.token`
- `variaveis.instance.host`

### 🐛 Bug Fixes
- N/A (no bugs fixed, only enhancements)

### 🔒 Breaking Changes

⚠️ **CRITICAL BREAKING CHANGES**:

1. **Supabase Nodes No Longer Generated**
   - Skill will NEVER generate Supabase nodes
   - All database operations use PostgreSQL
   - Migration path: Adapter can convert Supabase → PostgreSQL

2. **WhatsApp Workflows Require Confirmation**
   - Skill will ask about uazapi integration
   - Skill will ask about trigger type
   - Cannot skip normalization node

3. **Database Operations Changed**
   - Default operation is now `executeQuery` (not insert/update)
   - Queries must use CTEs when complex
   - Query params are mandatory

### 📊 Statistics

- **Documentation**: +1500 lines added (PATTERNS.md alone is ~700 lines)
- **Examples**: 38+ production workflows cataloged
- **Subagents**: 3 specialized agents with separate contexts
- **Commands**: 4 slash commands for quick access
- **Performance**: 3x faster workflow analysis with parallelism

### 🎓 Migration Guide

#### For Existing Users

**If you have existing workflows with Supabase**:
1. Use `/n8n-analyze <path>` to understand structure
2. Ask Claude to adapt to PostgreSQL: "Convert this workflow to use PostgreSQL"
3. Adapter will handle Supabase → PostgreSQL conversion

**If you have WhatsApp workflows without normalization**:
1. Analyze with: `/n8n-analyze <path> full`
2. Check compliance score
3. Ask: "Add standard normalization to this workflow"

**To leverage EXAMPLES-LIBRARY**:
1. Browse: `Read EXAMPLES-LIBRARY/INDEX.md`
2. Search: `/n8n-find <your criteria>`
3. Generate similar: "Create a workflow like pantero-tracker.json but for X"

### 🙏 Acknowledgments

All patterns are based on 38+ real production workflows processing:
- 10,000+ WhatsApp messages per day (Pantero)
- Automated briefing generation (Briefia)
- Multi-project AI agents (ComAgent, Manytest)

---

## [1.0.0] - 2025-01-XX

### Initial Release
- Complete node structure enforcement
- OpenAI /responses endpoint
- MCP integration patterns
- Progressive disclosure structure
- NODE-REFERENCE.md with common node types
- EXAMPLES.md with basic workflow templates
- MCP-INTEGRATION.md for AI agents
