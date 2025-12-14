# Daily Usage Guide: N8N Skill + Agents + Commands

**Quick reference for using the N8N workflow system effectively**

Last updated: 2025-11-03

---

## 🚀 Quick Start

### I Want to Build a Workflow

Just ask naturally - the skill handles everything automatically:

```
You: "Create a WhatsApp webhook that uses AI to respond to messages"

Skill does automatically:
1. Searches EXAMPLES-LIBRARY for similar patterns
2. Finds best match (e.g., comagent-ai-group.json)
3. Adapts it for your needs
4. Returns complete, valid workflow JSON
```

**You receive**: Production-ready workflow you can import into N8N

### I Want to Understand a Workflow

**Quick explanation** (inline):
```
You: "What does this workflow do: Downloads/my-flow.json"
Skill: [Invokes analyzer, returns brief explanation]
```

**Detailed analysis** (comprehensive report):
```
You: /n8n-analyze Downloads/my-flow.json full
Result: Complete breakdown with nodes, patterns, improvements
```

### I Want to Find Examples

**Let skill search** (curated results):
```
You: "Show me WhatsApp workflows with AI"
Skill: [Searches, shows top 3 with descriptions]
```

**Manual browse** (full list):
```
You: /n8n-find whatsapp ai
Result: All matching workflows ranked by relevance
```

### I Want to Save My Work

**After creating valuable workflow**:
```
You: /n8n-save path/to/my-workflow.json custom-name

Result:
- Auto-categorized (webhooks/ai-agents/etc)
- Added to EXAMPLES-LIBRARY
- Indexed for future searches
```

---

## 🎯 When to Use What

| What You Need | Use This | Result |
|---------------|----------|--------|
| Build workflow | Natural language | Skill auto-searches + generates |
| Understand workflow (quick) | "Explain [path]" | Inline explanation |
| Understand workflow (deep) | `/n8n-analyze [path] full` | Comprehensive report |
| Find examples | "Show me X workflows" OR `/n8n-find X` | Ranked list |
| Save workflow | `/n8n-save [path]` | Added to library |
| Fix broken index | `/n8n-index --verify` then `--full` | Rebuilt index |

---

## 💡 Best Practices

### ✅ DO

**Let the skill work for you**:
```
✅ "I need a workflow for X" (skill searches automatically)
✅ "Explain this workflow" (skill analyzes inline)
✅ "Show me examples of Y" (skill curates results)
```

**Save valuable patterns**:
```
✅ After skill creates novel workflow: /n8n-save output.json
✅ After importing external workflow: /n8n-save downloaded.json
✅ When you solve unique problem: /n8n-save solution.json
```

**Use commands for specific operations**:
```
✅ /n8n-analyze when you need full report
✅ /n8n-find when browsing/exploring
✅ /n8n-index after bulk imports
```

### ❌ DON'T

**Don't manually search**:
```
❌ Reading INDEX.md yourself to find examples
   ✅ Ask: "Find WhatsApp examples" (skill searches)

❌ Manually grepping through files
   ✅ Use: /n8n-find or let skill invoke finder
```

**Don't skip saving good work**:
```
❌ Creating great workflow → not saving it
   ✅ Create → Test → /n8n-save for future reuse
```

**Don't reindex unnecessarily**:
```
❌ Running /n8n-index after every /n8n-save
   ✅ /n8n-save auto-updates index incrementally
```

---

## 📚 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  YOU (User)                             │
└────────┬────────────────────────────────────────────────┘
         │
         ├─ Natural Language Request
         │  "Create WhatsApp AI workflow"
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│        n8n-workflow-development SKILL                   │
│                                                         │
│  1. Understands request                                 │
│  2. Invokes subagents automatically                     │
│  3. Generates/adapts workflow                           │
│  4. Returns result                                      │
└────┬────────────────────────────────────────────────────┘
     │
     ├─ Invokes (automatic, separate context)
     │
     ▼
┌──────────────────────────────────────────┬──────────────┬────────────────┐
│  n8n-example-finder                      │  n8n-workflow│  n8n-workflow- │
│  (Search agent)                          │  -analyzer   │  adapter       │
│                                          │  (Analysis)  │  (Modify)      │
│  • Searches EXAMPLES-LIBRARY             │  • Explains  │  • Adapts      │
│  • Ranks results                         │  • Categor   │  • Changes     │
│  • Returns top matches                   │    izes      │    integrations│
└──────────────────────────────────────────┴──────────────┴────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │     EXAMPLES-LIBRARY (38+)     │
        │                                │
        │  • webhooks/                   │
        │  • ai-agents/                  │
        │  • data-processing/            │
        │  • content-generation/         │
        │  • INDEX.md                    │
        └────────────────────────────────┘

═══════════════════════════════════════════════════════════

MANUAL COMMANDS (explicit user invocation):

/n8n-find       → Invokes n8n-example-finder → Formatted results
/n8n-analyze    → Invokes n8n-workflow-analyzer → Report
/n8n-save       → Invokes n8n-workflow-analyzer → Saves + updates INDEX
/n8n-index      → Scans all → Rebuilds INDEX.md
```

---

## 🔄 Common Workflows

### Workflow 1: Create New Feature

```
1. You: "Create a workflow that does X"

2. Skill automatically:
   - Searches for similar patterns
   - Finds pantero-tracker.json (7/10 match)
   - Adapts it for your specific use case

3. You receive: Complete workflow JSON

4. (Optional) You: /n8n-save output/new-feature.json
```

### Workflow 2: Understand Existing Code

```
1. Colleague shares: workflow.json

2. You: "Explain what Downloads/workflow.json does"

3. Skill: Invokes analyzer → Brief explanation

4. (Optional) You: /n8n-analyze Downloads/workflow.json full
   → Get comprehensive analysis
```

### Workflow 3: Find Similar Solutions

```
1. You: "Show me workflows that handle errors"

2. Skill:
   - Searches EXAMPLES-LIBRARY
   - Shows top 3 with error handling
   - Explains common pattern

3. You: "Use the second one as reference"

4. Skill: Adapts that pattern for your case
```

### Workflow 4: Import External Workflow

```
1. Download workflow from N8N community

2. You: /n8n-save Downloads/community-flow.json reddit-integration

3. Command:
   - Analyzes workflow
   - Categorizes as "webhooks"
   - Saves to EXAMPLES-LIBRARY/webhooks/
   - Updates INDEX.md

4. Now searchable: /n8n-find reddit
```

### Workflow 5: Bulk Library Update

```
1. You copied 20 workflows to EXAMPLES-LIBRARY/ manually

2. You: /n8n-index --verify
   → Finds 20 missing from index

3. You: /n8n-index --full
   → Analyzes all 20
   → Categorizes each
   → Updates INDEX.md

4. Library now has 58 workflows (38 + 20)
```

---

## 🎓 Understanding the System

### Three Layers

**Layer 1: Skill (Main Intelligence)**
- Natural language interface
- Orchestrates everything
- Automatically invokes agents when needed
- Returns final results to you

**Layer 2: Subagents (Specialized Workers)**
- Work in separate context windows
- Invoked automatically by skill OR manually via commands
- Each has specific expertise:
  - **Finder**: Searches library
  - **Analyzer**: Explains workflows
  - **Adapter**: Modifies workflows

**Layer 3: Commands (Manual Tools)**
- Explicit user operations
- Invoke subagents for specific tasks
- Used for browsing, saving, maintenance

### Context Windows

**Why separate contexts matter**:

**Main conversation** (your chat with skill):
```
✅ Clean and focused
✅ No token pollution from searches
✅ Faster responses
✅ Better for long conversations
```

**Agent context** (subagent work):
```
✅ Can read multiple workflows
✅ Deep analysis without overflow
✅ Results returned concisely
✅ Disposable after task
```

### Automatic vs Manual

| Operation | Automatic (Skill) | Manual (Command) |
|-----------|-------------------|------------------|
| Search examples | ✅ Always | ✅ For browsing |
| Analyze workflow | ✅ When needed | ✅ For full report |
| Adapt workflow | ✅ When match found | ❌ N/A |
| Save workflow | ❌ Never | ✅ Always |
| Rebuild index | ❌ Never | ✅ Always |

---

## 📖 Example Scenarios

### Scenario: "I'm New to N8N"

```
You: "How do I build a simple webhook?"

Skill:
1. Searches: "simple webhook examples"
2. Finds: briefia-join-group.json (Simple, 4 nodes)
3. Shows: Code snippet + explanation
4. Offers: "Want me to generate one for your use case?"

You: "Yes, for receiving GitHub webhooks"

Skill:
1. Adapts simple webhook pattern
2. Adds GitHub-specific parameters
3. Returns: Complete workflow JSON

You: /n8n-save output/github-webhook.json
```

### Scenario: "I Need to Modify Production Code"

```
You: "This workflow uses OpenAI, change it to Anthropic"
You: [Uploads production-flow.json]

Skill:
1. Analyzes current structure
2. Identifies OpenAI nodes
3. Swaps to Anthropic nodes
4. Regenerates all UUIDs
5. Returns: Modified workflow

You: Test locally → Works! → Deploy
```

### Scenario: "Learning from Examples"

```
You: "What are common patterns for AI agents?"

Skill:
1. Searches: "ai agent patterns"
2. Finds 5 examples
3. Analyzes each
4. Explains patterns:
   - Agent + Chat Model + Memory
   - Tool workflows
   - RAG with vector store

You: "Show me the RAG pattern"

Skill: [Shows comagent-ai-group.json structure]

You: "Generate one for my knowledge base"

Skill: Adapts RAG pattern → Your workflow
```

### Scenario: "Team Collaboration"

```
Team member: "I created a great workflow for Slack notifications"

You: /n8n-save team-slack-notifier.json

[Later, another team member]

Teammate: "How do we send Slack notifications?"

Skill:
1. Searches library
2. Finds team-slack-notifier.json
3. Shows pattern
4. Adapts for their use case

Result: Team knowledge preserved and reused
```

---

## 🔍 Troubleshooting

### "Skill isn't finding examples"

**Possible causes**:
- INDEX.md out of date
- Workflows not in EXAMPLES-LIBRARY
- Search terms too specific

**Solutions**:
```
1. Check: Read EXAMPLES-LIBRARY/INDEX.md
2. Verify: /n8n-index --verify
3. Rebuild: /n8n-index --full
4. Try broader: "ai workflows" instead of "openai gpt-4 with redis memory"
```

### "Analysis seems incomplete"

**For quick questions**:
- Skill uses quick analysis (by design)
- Get full: `/n8n-analyze [path] full`

**For detailed needs**:
```
/n8n-analyze path/to/workflow.json full
```

### "Skill generated workflow but it's different from example"

**This is correct behavior**:
- Skill adapts examples, not copies them
- Customizes for your specific requirements
- Regenerates UUIDs (required for N8N)

**If you want exact copy**:
```
Read EXAMPLES-LIBRARY/path/to/example.json
Copy → Import to N8N
```

### "Command isn't working"

**Check syntax**:
```
✅ /n8n-find whatsapp
❌ n8n-find whatsapp (missing /)

✅ /n8n-analyze path/to/file.json
❌ /n8n-analyze file.json (needs full path)

✅ /n8n-save Downloads/flow.json custom-name
❌ /n8n-save flow.json (needs path)
```

---

## 📊 Library Statistics

Current library contents:

- **Total**: 38 production workflows
- **Categories**:
  - Webhooks: 13 (WhatsApp, APIs, message processing)
  - AI Agents: 14 (Conversational, RAG, tools)
  - Data Processing: 4 (Scheduled, CRON, RSS)
  - Content Generation: 7 (Briefings, summaries)

- **Projects**:
  - Briefia (12): Marketing automation
  - Pantero (13): Credit/community platform
  - ComAgent (8): Group assistant
  - Manytest (5): Educational quizzes

- **Top Integrations**:
  - OpenAI (14 workflows)
  - PostgreSQL/Supabase (25+ workflows)
  - WhatsApp/Uazapi (18 workflows)
  - LangChain (14 workflows)

---

## 🎯 Tips for Success

1. **Trust the skill** - It knows when to search examples automatically
2. **Ask naturally** - Don't overthink command syntax in conversation
3. **Save good work** - `/n8n-save` makes patterns reusable
4. **Use commands for specifics** - When you need full control
5. **Keep INDEX current** - `/n8n-index` after bulk operations
6. **Explore examples** - Browse INDEX.md for inspiration
7. **Test before production** - Always test adapted workflows
8. **Document custom patterns** - Add notes in workflow JSON

---

## 📞 Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                  N8N SYSTEM QUICK REFERENCE                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BUILD WORKFLOW                                             │
│    → Just ask: "Create workflow for X"                      │
│                                                             │
│  FIND EXAMPLES                                              │
│    → Ask: "Show me X examples"                              │
│    → OR: /n8n-find X                                        │
│                                                             │
│  UNDERSTAND WORKFLOW                                        │
│    → Quick: "Explain path/to/file.json"                     │
│    → Full: /n8n-analyze path/to/file.json full             │
│                                                             │
│  SAVE WORKFLOW                                              │
│    → /n8n-save path/to/file.json [name]                    │
│                                                             │
│  REBUILD INDEX                                              │
│    → /n8n-index --verify (check)                            │
│    → /n8n-index --full (rebuild)                            │
│                                                             │
│  BROWSE LIBRARY                                             │
│    → Read EXAMPLES-LIBRARY/INDEX.md                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Next Steps

1. **Try it now**: "Show me a simple webhook example"
2. **Build something**: "Create a workflow for [your use case]"
3. **Explore library**: Browse EXAMPLES-LIBRARY/INDEX.md
4. **Save your work**: Use `/n8n-save` after creating valuable workflows
5. **Share with team**: Commit EXAMPLES-LIBRARY to git

---

**Need more help?**
- Skill documentation: `n8n-development-skill/SKILL.md`
- Node reference: `n8n-development-skill/NODE-REFERENCE.md`
- Examples: `n8n-development-skill/EXAMPLES.md`
- Library index: `EXAMPLES-LIBRARY/INDEX.md`

**Happy workflow building! 🎉**
