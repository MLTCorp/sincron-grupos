# uazapi WhatsApp Integration Skill

Expert WhatsApp API integration skill for Claude, enabling seamless integration of uazapi with any system.

## What This Skill Does

This skill teaches Claude to:
- **Integrate WhatsApp with any system** using uazapi REST API
- **Manage WhatsApp instances** with admin token authentication
- **Send all message types**: text, media, menus, polls, carousels, payments
- **Configure webhooks** for real-time event handling
- **Build chatbots** with AI agents and triggers
- **Manage CRM/leads** with custom fields and tags
- **Create mass messaging campaigns** with scheduling
- **Handle groups and communities**

## Installation

### For Claude Desktop / Claude Code

1. Download or clone this skill folder
2. Navigate to Settings → Capabilities → Skills
3. Click "Upload skill" and select the entire `uazapi-whatsapp-skill` folder (or ZIP it first)
4. The skill will be automatically available in your conversations

### For Claude API

Follow the [API skills documentation](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills) to integrate this skill.

## Usage

The skill activates automatically when you:
- Ask to integrate WhatsApp with a system
- Request to send WhatsApp messages
- Want to build a WhatsApp chatbot
- Need to manage WhatsApp instances
- Want to configure webhooks
- Need CRM/lead management for WhatsApp

### Example Prompts

**Basic Integration:**
> "Create a webhook handler that receives WhatsApp messages and stores them in my database"

**Send Messages:**
> "How do I send an interactive button menu via WhatsApp?"

**Chatbot Setup:**
> "Set up an AI chatbot that responds to customer inquiries on WhatsApp"

**CRM Integration:**
> "Build a system that updates lead status based on WhatsApp conversations"

**Mass Messaging:**
> "Create a campaign to send promotional messages to my customer list"

## File Structure

```
uazapi-whatsapp-skill/
├── SKILL.md              # Main skill instructions (loaded first)
├── API-REFERENCE.md      # Complete endpoint documentation
├── PATTERNS.md           # Integration patterns and best practices
├── EXAMPLES.md           # Code examples in multiple languages
└── README.md             # This file
```

## Key Features

### 1. Two-Level Authentication

**Admin Token** (`admintoken` header):
- Create/delete instances
- List all instances
- Configure global webhook
- Update admin fields

**Instance Token** (`token` header):
- All day-to-day operations
- Send messages
- Manage chats, contacts, groups
- Configure instance webhook

### 2. Complete Message Types

| Type | Endpoint | Description |
|------|----------|-------------|
| Text | `/send/text` | Plain text with link preview |
| Media | `/send/media` | Images, videos, audio, documents |
| Contact | `/send/contact` | vCard contact cards |
| Location | `/send/location` | Geographic coordinates |
| Buttons | `/send/menu` | Interactive buttons |
| List | `/send/menu` | Scrollable list menu |
| Poll | `/send/menu` | Voting polls |
| Carousel | `/send/carousel` | Swipeable product cards |
| Payment | `/send/request-payment` | PIX/Boleto payment request |

### 3. Webhook Configuration

**Critical**: Always use `excludeMessages: ["wasSentByApi"]` to prevent infinite loops!

```json
{
  "enabled": true,
  "url": "https://your-server.com/webhook",
  "events": ["messages", "messages_update", "connection"],
  "excludeMessages": ["wasSentByApi"]
}
```

### 4. AI Chatbot System

Complete chatbot setup with:
- Multiple AI providers (OpenAI, Anthropic, Gemini, DeepSeek)
- Customizable triggers with word matching
- Knowledge base for RAG
- Custom API functions
- Lead field conditions

### 5. CRM Integration

Built-in lead management:
- 20+ custom fields per contact
- Tag system
- Ticket management
- Attendant assignment
- Kanban ordering
- Placeholder support in messages

### 6. Mass Messaging

Campaign features:
- Scheduled sending
- Variable delays between messages
- Multiple message types per campaign
- Campaign control (pause/resume/delete)
- Progress tracking

## Quick Start Examples

### 1. Create Instance and Connect

```javascript
// Create instance (admin token)
const createResponse = await fetch('https://subdomain.uazapi.com/instance/init', {
  method: 'POST',
  headers: {
    'admintoken': 'your-admin-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'my-instance' })
});
const { token } = await createResponse.json();

// Connect instance
const connectResponse = await fetch('https://subdomain.uazapi.com/instance/connect', {
  method: 'POST',
  headers: {
    'token': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ phone: '5511999999999' })
});
// Returns QR code or pairing code
```

### 2. Send Message

```javascript
await fetch('https://subdomain.uazapi.com/send/text', {
  method: 'POST',
  headers: {
    'token': 'instance-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    number: '5511999999999',
    text: 'Hello! How can I help you?'
  })
});
```

### 3. Configure Webhook

```javascript
await fetch('https://subdomain.uazapi.com/webhook', {
  method: 'POST',
  headers: {
    'token': 'instance-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    enabled: true,
    url: 'https://your-server.com/webhook',
    events: ['messages', 'messages_update'],
    excludeMessages: ['wasSentByApi']
  })
});
```

## Best Practices

### DO ✅
- Always check instance status before sending messages
- Use `excludeMessages: ["wasSentByApi"]` in webhooks
- Implement delays for mass messaging
- Store instance tokens securely
- Use track_source/track_id for message tracking
- Handle rate limits with exponential backoff

### DON'T ❌
- Send messages without checking connection status
- Configure webhooks without exclusion filters (causes loops!)
- Send too many messages too fast
- Expose tokens in client-side code
- Ignore webhook event validation

## Common Integration Patterns

### Pattern 1: Simple Message Response
```
Webhook → Your Server → Process → Send Response
```

### Pattern 2: CRM Sync
```
Webhook → Extract Contact → Update CRM → Update Lead → Reply
```

### Pattern 3: AI Chatbot with Human Escalation
```
AI Agent → Auto-respond
When "human" detected → Disable bot → Assign attendant → Open ticket
```

### Pattern 4: Multi-Instance Hub
```
Global Webhook → Route by instance → Process → Respond
```

## Testing Resources

Webhook testing sites (ordered by quality):
1. **https://webhook.cool/** - Best option (no rate limit)
2. **https://rbaskets.in/** - Good alternative
3. **https://webhook.site/** - Avoid if possible (aggressive rate limit)

## Troubleshooting

**Messages not sending?**
- Check instance status is "connected"
- Verify phone number format (international, no symbols)
- Check rate limits

**Webhook not receiving events?**
- Verify URL is publicly accessible
- Check events array includes desired events
- Ensure HTTPS is working correctly

**Infinite message loops?**
- Add `excludeMessages: ["wasSentByApi"]` to webhook config
- Check your code isn't responding to its own messages

**QR code expired?**
- Call `/instance/connect` again to get a new one
- Pairing codes expire in 5 minutes

## Progressive Disclosure

For detailed information, refer to:
- `API-REFERENCE.md` - Complete endpoint documentation with all parameters
- `PATTERNS.md` - Advanced integration patterns with full examples
- `EXAMPLES.md` - Code examples in JavaScript, Python, PHP, and more

## Requirements

- uazapi account with valid subdomain
- Admin token for instance management
- HTTPS endpoint for webhooks
- WhatsApp Business account (recommended for stability)

## Version History

**v1.0.0** (2024)
- Initial release
- Complete API coverage
- Authentication documentation
- Integration patterns
- Multi-language examples

## Resources

- [uazapi Documentation](https://uazapi.com/docs)
- [WhatsApp Business API](https://business.whatsapp.com/)
- [Anthropic Skills Best Practices](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/best-practices)

## License

This skill is provided as-is for educational and development purposes.

---

**Built following [Anthropic's Agent Skills Best Practices](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/best-practices)**
