# Testing Guide - n8n Workflow Development Skill

## Overview

This guide helps you test the n8n workflow development skill **before** installing it permanently. Testing ensures the skill works as expected and generates valid, importable workflows.

## Testing Methods

You can test the skill in two ways:

1. **Method A**: Temporary context injection (no installation)
2. **Method B**: Import test workflows to n8n

---

## Method A: Temporary Context Injection

Test the skill by providing its contents as context in a Claude conversation.

### Steps

1. **Open Claude Desktop/Code**

2. **Start a new conversation**

3. **Inject skill context:**
   ```
   I'm going to give you the contents of an n8n development skill. After I paste it, please help me create n8n workflows following these instructions exactly.

   [Paste entire SKILL.md content here]
   ```

4. **Test with prompts:**
   - "Create a simple webhook to OpenAI workflow"
   - "Build a Pantero WhatsApp automation workflow"
   - "Generate an AI agent using MCP servers"

5. **Verify outputs:**
   - ✅ Complete JSON structure (not fragments)
   - ✅ Uses `/v1/responses` for OpenAI
   - ✅ Has `"options": {}` in parameters
   - ✅ Includes Sticky Notes with instructions
   - ✅ All nodes have unique UUIDs

### Expected Behavior

**Good Output:**
```json
{
  "name": "My Workflow",
  "nodes": [...],
  "connections": {...},
  "settings": {"executionOrder": "v1"}
}
```

**Bad Output (fragments):**
```json
{
  "id": "uuid",
  "name": "HTTP Request",
  "type": "n8n-nodes-base.httpRequest"
}
```

---

## Method B: Import Test Workflows

Use the provided test workflows to verify compatibility with your n8n instance.

### Test Files Provided

1. **`test-workflow-simple.json`**
   - Webhook → Set → OpenAI → Response
   - Tests: Basic structure, /responses endpoint, data mapping

2. **`test-workflow-mcp.json`**
   - Manual Trigger → Set → OpenAI MCP → Extract → Validation
   - Tests: MCP integration, DeepWiki server, response handling

### Steps

#### 1. Validate JSON Structure

```bash
cd n8n-development-skill
node validation-script.js test-workflow-simple.json
node validation-script.js test-workflow-mcp.json
```

**Expected Result:**
```
✅ Valid JSON structure
✅ Found X nodes
✅ Connections validated
✅ Settings present
⚠️  Validation passed with warnings
```

Warnings about test UUIDs are normal and can be ignored.

#### 2. Import to n8n

**Option A: Via n8n UI**
1. Open n8n instance
2. Click "+ workflow" → "Import from File"
3. Select `test-workflow-simple.json`
4. Workflow should import without errors

**Option B: Via n8n API**
```bash
curl -X POST \
  http://localhost:5678/api/v1/workflows \
  -H "Content-Type: application/json" \
  -d @test-workflow-simple.json
```

#### 3. Configure Credentials

Both test workflows require OpenAI credentials:
1. Go to Settings → Credentials
2. Add "OpenAI account" credential
3. Enter your API key
4. Save

#### 4. Test Execution

**Simple Workflow:**
1. Save workflow (to get webhook URL)
2. Send POST request:
   ```bash
   curl -X POST \
     https://your-n8n.com/webhook/test-simple \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello from test"}'
   ```
3. Check response contains OpenAI output

**MCP Workflow:**
1. Click "Test workflow" button
2. Wait for execution (~5-10 seconds)
3. Check "Validation Check" node output:
   ```json
   {
     "test_result": "PASSED",
     "validations": {
       "has_answer": true,
       "mcp_was_called": true,
       "answer_not_empty": true,
       "timestamp_valid": true
     }
   }
   ```

---

## Validation Checklist

Use this checklist to verify skill-generated workflows:

### JSON Structure
- [ ] Valid JSON (no syntax errors)
- [ ] Has `name` field
- [ ] Has `nodes` array (not empty)
- [ ] Has `connections` object
- [ ] Has `settings` object with `executionOrder`

### Node Quality
- [ ] All nodes have unique `id` (UUID v4 format)
- [ ] All nodes have `name` (descriptive)
- [ ] All nodes have `type` (correct format)
- [ ] All nodes have `typeVersion`
- [ ] All nodes have `position` [x, y]
- [ ] All node parameters have `"options": {}`

### OpenAI Integration
- [ ] Uses `https://api.openai.com/v1/responses`
- [ ] NOT using `/v1/completions` or `/v1/chat/completions`
- [ ] Credentials reference format: `{{ $credential.openAiApi.apiKey }}`

### MCP Integration (if applicable)
- [ ] MCP tools in body parameters
- [ ] `server_url` includes full path (e.g., `/mcp`)
- [ ] `server_label` is unique and descriptive
- [ ] `allowed_tools` specified (if filtering)

### Documentation
- [ ] Has at least one Sticky Note
- [ ] Sticky Note contains setup instructions
- [ ] Complex logic is explained in notes

### Connections
- [ ] All connection IDs reference existing nodes
- [ ] Sequential flow is correct
- [ ] Conditional branches work as expected

---

## Common Issues & Solutions

### Issue: "Fragment code instead of complete workflow"

**Symptom:**
```json
{
  "id": "abc",
  "name": "HTTP Request"
}
```

**Solution:**
- Explicitly ask: "Generate the **complete** n8n workflow JSON"
- Mention: "I need the full structure with nodes, connections, and settings"
- Re-inject SKILL.md context if using Method A

### Issue: "Wrong OpenAI endpoint"

**Symptom:**
```json
{
  "url": "https://api.openai.com/v1/completions"
}
```

**Solution:**
- Skill should auto-correct this
- If persists, state: "Use the /v1/responses endpoint"
- Check you're using the latest SKILL.md version

### Issue: "Missing options parameter"

**Symptom:**
```json
{
  "parameters": {
    "url": "...",
    "method": "POST"
    // No "options": {}
  }
}
```

**Solution:**
- Run validation script to detect
- Manually add `"options": {}` before importing
- Report issue if skill consistently misses this

### Issue: "Validation script errors"

**Symptom:**
```
❌ Invalid JSON: Unexpected token...
```

**Solution:**
- Copy JSON again (may have been truncated)
- Check for missing brackets `}`, `]`
- Use online JSON validator (jsonlint.com)
- Check file encoding is UTF-8

---

## Performance Benchmarks

Expected performance when skill is working correctly:

### Generation Time
- Simple workflow (5 nodes): ~10-20 seconds
- Complex workflow (15+ nodes): ~30-60 seconds
- With examples reference: +5-10 seconds

### Quality Metrics
| Metric | Target | Actual |
|--------|--------|--------|
| Valid JSON first try | >95% | ___ |
| Correct OpenAI endpoint | 100% | ___ |
| Complete structure (not fragments) | 100% | ___ |
| Has sticky notes | >90% | ___ |
| "options" present | >95% | ___ |
| Import success to n8n | >98% | ___ |

### Token Usage
- SKILL.md: ~489 lines (est. 1.5k tokens)
- With NODE-REFERENCE: +687 lines (est. 2k tokens)
- With EXAMPLES: +1500 lines (est. 4.5k tokens)

---

## Test Scenarios

### Scenario 1: Basic Webhook Workflow

**Prompt:**
```
Create an n8n workflow that:
1. Receives data via webhook (POST)
2. Extracts the "message" field
3. Sends it to OpenAI (gpt-4o-mini)
4. Returns the response
```

**Expected Output:**
- 4-5 nodes (Sticky Note, Webhook, Set, HTTP Request, Set)
- Webhook path defined
- OpenAI /responses endpoint
- Complete structure

### Scenario 2: Scheduled API Integration

**Prompt:**
```
Build a workflow that runs every 6 hours and:
1. Fetches data from https://api.example.com/data
2. Checks if "status" field equals "active"
3. If active: stores in PostgreSQL
4. If inactive: logs to file
```

**Expected Output:**
- Schedule Trigger (6 hours)
- HTTP Request node
- IF node with condition
- Database node + File node
- Proper connections for both branches

### Scenario 3: MCP AI Agent

**Prompt:**
```
Create an AI agent workflow using:
- OpenAI GPT-4o
- DeepWiki MCP server for documentation lookup
- Manual trigger
- Extract and format the response
```

**Expected Output:**
- Manual Trigger
- HTTP Request with MCP tools in body
- `/v1/responses` endpoint
- MCP configuration with server_url, server_label
- Extract/format nodes

---

## Regression Testing

If you modify the skill, test these scenarios to ensure nothing broke:

1. **Basic Generation**: Simple 3-node workflow still works
2. **OpenAI Endpoint**: Still uses `/responses`, not `/completions`
3. **Complete Structure**: Never generates fragments
4. **MCP Integration**: MCP examples still have correct format
5. **Validation Pass**: Generated workflows pass validation script

Run all test scenarios and record results:

| Test | Status | Notes |
|------|--------|-------|
| Basic Webhook | ☐ Pass / ☐ Fail | |
| Scheduled API | ☐ Pass / ☐ Fail | |
| MCP AI Agent | ☐ Pass / ☐ Fail | |
| Circle Example | ☐ Pass / ☐ Fail | |
| Pantero Example | ☐ Pass / ☐ Fail | |
| RAG Example | ☐ Pass / ☐ Fail | |

---

## Next Steps After Testing

### If Tests Pass ✅

1. **Install skill permanently:**
   - Claude Desktop: Settings → Skills → Upload ZIP
   - Or copy folder to `.claude/skills/`

2. **Update settings.local.json** (if manual install):
   ```json
   {
     "skills": {
       "n8n-workflow-development": {
         "path": "n8n-development-skill",
         "enabled": true
       }
     }
   }
   ```

3. **Test in production:**
   - Create workflow for actual project
   - Import to production n8n
   - Monitor for issues

### If Tests Fail ❌

1. **Document the failure:**
   - What prompt was used?
   - What was generated?
   - What was expected?
   - Error messages?

2. **Check SKILL.md:**
   - Is instruction clear?
   - Is example correct?
   - Is rule stated explicitly?

3. **Iterate and re-test:**
   - Update SKILL.md
   - Re-run tests
   - Compare results

4. **Report persistent issues:**
   - Create issue with reproducible case
   - Include prompt, output, expected result

---

## Automated Testing Script

For continuous validation, create a test script:

```bash
#!/bin/bash
# test-skill.sh

echo "🧪 Testing n8n Workflow Development Skill"
echo "=========================================="

# Test 1: Validate test workflows
echo "\n📝 Test 1: Validating test workflows..."
node validation-script.js test-workflow-simple.json
SIMPLE_RESULT=$?

node validation-script.js test-workflow-mcp.json
MCP_RESULT=$?

# Test 2: Check for required files
echo "\n📁 Test 2: Checking required files..."
FILES=("SKILL.md" "NODE-REFERENCE.md" "EXAMPLES.md" "MCP-INTEGRATION.md" "README.md")
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file exists"
  else
    echo "❌ $file missing"
  fi
done

# Test 3: Check SKILL.md line count (should be < 500)
echo "\n📏 Test 3: Checking SKILL.md line count..."
SKILL_LINES=$(wc -l < SKILL.md)
if [ $SKILL_LINES -lt 500 ]; then
  echo "✅ SKILL.md has $SKILL_LINES lines (< 500)"
else
  echo "⚠️  SKILL.md has $SKILL_LINES lines (> 500)"
fi

# Summary
echo "\n=========================================="
echo "📊 Test Summary:"
echo "  Simple workflow validation: $([ $SIMPLE_RESULT -eq 0 ] && echo '✅' || echo '❌')"
echo "  MCP workflow validation: $([ $MCP_RESULT -eq 0 ] && echo '✅' || echo '❌')"
echo "=========================================="
```

Run with: `bash test-skill.sh`

---

## FAQ

**Q: Do I need to install the skill to test it?**
A: No, use Method A (temporary context injection) to test without installation.

**Q: Can I test with my own n8n instance?**
A: Yes, import the test workflows and run them. Make sure you have OpenAI credentials configured.

**Q: What if the generated workflow doesn't import?**
A: Run the validation script first. It will identify specific errors. Most common: missing brackets, invalid JSON.

**Q: How do I know if MCP is working correctly?**
A: The `test-workflow-mcp.json` includes a validation node that checks if MCP was called and returned valid data.

**Q: Can I modify the test workflows?**
A: Yes, they're templates. Modify as needed for your specific testing scenarios.

**Q: What n8n version is required?**
A: The skill targets n8n 1.0+. Test workflows use node typeVersions compatible with recent versions (2024+).

---

**Ready to test?** Start with Method A for quick validation, then Method B for production readiness!
