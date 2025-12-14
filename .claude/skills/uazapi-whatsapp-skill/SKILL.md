---
name: uazapi-whatsapp-integration
description: Expert WhatsApp API integration using uazapi. Creates complete integrations for sending messages, managing instances, webhooks, chatbots, CRM, and mass messaging. Use when building WhatsApp automations, chatbot flows, or integrating WhatsApp with any system.
---

# uazapi WhatsApp Integration Skill

## Core Principles

When integrating with uazapi:

1. **Two-level authentication** - Use `admintoken` for instance management, `token` for instance operations
2. **Always validate instance status** - Check connection before sending messages
3. **Use webhooks for real-time events** - Configure webhooks to receive messages and updates
4. **Prevent webhook loops** - Always use `excludeMessages: ["wasSentByApi"]` in webhook config
5. **Handle rate limits** - Implement delays between messages for mass sending
6. **Use WhatsApp Business** - Recommended for stability over regular WhatsApp

## When to Use This Skill

Activate this skill when the user asks to:
- Integrate WhatsApp with any system
- Send messages via WhatsApp API
- Create WhatsApp chatbots
- Manage WhatsApp instances
- Configure webhooks for WhatsApp events
- Build mass messaging campaigns
- Integrate CRM with WhatsApp
- Automate WhatsApp responses

## Authentication Architecture

### Admin Token (admintoken)
Used for **instance management** operations:
- Create new instances (`POST /instance/init`)
- List all instances (`GET /instance/all`)
- Update admin fields (`POST /instance/updateAdminFields`)
- Configure global webhook (`POST /globalwebhook`)

**Header**: `admintoken: your-admin-token`

### Instance Token (token)
Used for **instance operations**:
- Connect/disconnect instance
- Send messages
- Manage chats, contacts, groups
- Configure instance webhook
- All day-to-day operations

**Header**: `token: your-instance-token`

## Instance Lifecycle

### 1. Create Instance (Admin)
```http
POST /instance/init
Headers: admintoken: {admintoken}
Body: {
  "name": "instance-name",
  "systemName": "my-system",
  "adminField01": "custom-metadata"
}
```

**Response includes**: `id`, `token` (save this for operations!)

### 2. Connect Instance
```http
POST /instance/connect
Headers: token: {instance-token}
Body: {
  "phone": "5511999999999"
}
```

**Returns**: QR code or pairing code for WhatsApp authentication

### 3. Check Status
```http
GET /instance/status
Headers: token: {instance-token}
```

**States**:
- `disconnected`: Not connected to WhatsApp
- `connecting`: Waiting for QR/pairing code scan
- `connected`: Ready to use

### 4. Disconnect (when needed)
```http
POST /instance/disconnect
Headers: token: {instance-token}
```

## Message Sending Patterns

### Text Message (Basic)
```http
POST /send/text
Headers: token: {token}
Body: {
  "number": "5511999999999",
  "text": "Hello! How can I help?"
}
```

### Text with Placeholders
```http
POST /send/text
Body: {
  "number": "5511999999999",
  "text": "Hello {{name}}! Your order {{lead_field01}} is ready."
}
```

**Available placeholders**:
- `{{name}}` - Consolidated name (lead_name > lead_fullName > wa_contactName > wa_name)
- `{{first_name}}` - First word of consolidated name
- `{{wa_name}}` - WhatsApp profile name
- `{{lead_name}}`, `{{lead_email}}`, `{{lead_status}}`
- `{{lead_field01}}` to `{{lead_field20}}` - Custom fields

### Media Message
```http
POST /send/media
Body: {
  "number": "5511999999999",
  "type": "image",  // image, video, document, audio, ptt, sticker
  "file": "https://example.com/image.jpg",
  "text": "Check this out!"  // caption
}
```

### Interactive Menu (Buttons)
```http
POST /send/menu
Body: {
  "number": "5511999999999",
  "type": "button",
  "text": "How can we help?",
  "choices": [
    "Technical Support|support",
    "Make Order|order",
    "Our Website|https://example.com"
  ],
  "footerText": "Choose an option"
}
```

### Interactive Menu (List)
```http
POST /send/menu
Body: {
  "number": "5511999999999",
  "type": "list",
  "text": "Product Catalog",
  "listButton": "View Catalog",
  "choices": [
    "[Electronics]",
    "Smartphones|phones|Latest releases",
    "Notebooks|notes|2024 models",
    "[Accessories]",
    "Headphones|headphones|Bluetooth and wired"
  ],
  "footerText": "Prices subject to change"
}
```

### Poll
```http
POST /send/menu
Body: {
  "number": "5511999999999",
  "type": "poll",
  "text": "What time do you prefer?",
  "choices": [
    "Morning (8am-12pm)",
    "Afternoon (1pm-5pm)",
    "Evening (6pm-10pm)"
  ],
  "selectableCount": 1
}
```

### Send to Group
Use the group ID (ends with `@g.us`):
```http
POST /send/text
Body: {
  "number": "120363012345678901@g.us",
  "text": "Message to group",
  "mentions": "5511999999999,5511888888888"  // optional mentions
}
```

## Common Optional Fields (All Send Endpoints)

```json
{
  "delay": 5000,           // Typing indicator duration (ms)
  "readchat": true,        // Mark chat as read
  "readmessages": true,    // Mark last 10 received messages as read
  "replyid": "MSG_ID",     // Reply to specific message
  "mentions": "all",       // Mention in groups: "all" or comma-separated numbers
  "forward": true,         // Mark as forwarded
  "track_source": "crm",   // Tracking source
  "track_id": "order_123"  // Tracking ID
}
```

## Webhook Configuration (CRITICAL)

### Instance Webhook
```http
POST /webhook
Headers: token: {token}
Body: {
  "enabled": true,
  "url": "https://your-server.com/webhook",
  "events": ["messages", "messages_update", "connection"],
  "excludeMessages": ["wasSentByApi"],  // CRITICAL: Prevents loops!
  "addUrlEvents": true  // Adds event type to URL path
}
```

### Global Webhook (Admin)
```http
POST /globalwebhook
Headers: admintoken: {admintoken}
Body: {
  "url": "https://your-server.com/global-webhook",
  "events": ["messages", "connection"],
  "excludeMessages": ["wasSentByApi"]
}
```

### Available Events
- `connection` - Connection state changes
- `messages` - New messages received
- `messages_update` - Message status updates (sent, delivered, read)
- `call` - Voice/video calls
- `contacts` - Contact updates
- `presence` - Online/typing status
- `groups` - Group modifications
- `labels` - Label management
- `chats` - Chat events
- `leads` - Lead updates

### Exclude Filters
- `wasSentByApi` - Messages sent via API (USE THIS TO PREVENT LOOPS!)
- `wasNotSentByApi` - Messages not from API
- `fromMeYes` - Messages sent by you
- `fromMeNo` - Messages received
- `isGroupYes` - Group messages
- `isGroupNo` - Individual chats

## Webhook Payload Structure

### Message Event
```json
{
  "event": "messages",
  "instance": "instance-id",
  "owner": "5511999999999",
  "token": "instance-token",
  "BaseUrl": "https://subdomain.uazapi.com",
  "message": {
    "messageid": "3EB0538DA65A59F6D8A251",
    "chatid": "5511888888888@s.whatsapp.net",
    "sender": "5511888888888@s.whatsapp.net",
    "sender_pn": "5511888888888@s.whatsapp.net",
    "senderName": "John Doe",
    "fromMe": false,
    "isGroup": false,
    "groupName": "",
    "messageType": "conversation",
    "type": "text",
    "text": "Hello!",
    "messageTimestamp": 1704067200000,
    "content": {
      "text": "Hello!"
    }
  }
}
```

## Chatbot Configuration

### 1. Enable Chatbot
```http
POST /instance/updatechatbotsettings
Headers: token: {token}
Body: {
  "openai_apikey": "sk-...",
  "chatbot_enabled": true,
  "chatbot_ignoreGroups": true,
  "chatbot_stopConversation": "stop",
  "chatbot_stopMinutes": 30,
  "chatbot_stopWhenYouSendMsg": 5
}
```

### 2. Create AI Agent
```http
POST /agent/edit
Headers: token: {token}
Body: {
  "id": "",
  "delete": false,
  "agent": {
    "name": "Sales Assistant",
    "provider": "openai",  // openai, anthropic, gemini, deepseek
    "model": "gpt-4o-mini",
    "apikey": "sk-...",
    "basePrompt": "You are a sales assistant...",
    "maxTokens": 2000,
    "temperature": 70,
    "signMessages": true,
    "readMessages": true,
    "typingDelay_seconds": 3,
    "contextMaxMessages": 50
  }
}
```

### 3. Create Trigger
```http
POST /trigger/edit
Headers: token: {token}
Body: {
  "id": "",
  "delete": false,
  "trigger": {
    "active": true,
    "type": "agent",
    "agent_id": "agent-id-from-step-2",
    "ignoreGroups": true,
    "priority": 1,
    "wordsToStart": "hello|hi|help",
    "responseDelay_seconds": 6
  }
}
```

## CRM / Lead Management

### Update Lead Data
```http
POST /chat/editLead
Headers: token: {token}
Body: {
  "id": "5511999999999@s.whatsapp.net",
  "lead_name": "John",
  "lead_fullName": "John Doe",
  "lead_email": "john@example.com",
  "lead_status": "qualified",
  "lead_tags": ["vip", "priority"],
  "lead_isTicketOpen": true,
  "lead_assignedAttendant_id": "attendant-123",
  "lead_field01": "Custom Value 1"
}
```

### Search Chats with Filters
```http
POST /chat/find
Headers: token: {token}
Body: {
  "operator": "AND",
  "sort": "-wa_lastMsgTimestamp",
  "limit": 50,
  "wa_isGroup": false,
  "lead_status": "~qualified"  // ~ means LIKE/contains
}
```

**Filter operators**:
- `~` - LIKE (contains)
- `!~` - NOT LIKE
- `!=` - Not equal
- `>=`, `>`, `<=`, `<` - Comparisons

## Mass Messaging

### Simple Campaign
```http
POST /sender/simple
Headers: token: {token}
Body: {
  "numbers": ["5511999999999", "5511888888888"],
  "type": "text",
  "text": "Hello {{name}}! Special offer for you.",
  "delayMin": 10,
  "delayMax": 30,
  "scheduled_for": 1706198400000  // Unix timestamp or minutes from now
}
```

### Advanced Campaign (Multiple Message Types)
```http
POST /sender/advanced
Headers: token: {token}
Body: {
  "delayMin": 10,
  "delayMax": 30,
  "info": "Launch Campaign",
  "scheduled_for": 5,  // 5 minutes from now
  "messages": [
    {
      "number": "5511999999999",
      "type": "text",
      "text": "Hello! Check our new product:"
    },
    {
      "number": "5511999999999",
      "type": "image",
      "file": "https://example.com/product.jpg",
      "text": "New arrival!"
    }
  ]
}
```

### Control Campaign
```http
POST /sender/edit
Headers: token: {token}
Body: {
  "folder_id": "campaign-id",
  "action": "stop"  // stop, continue, delete
}
```

## Group Management

### Create Group
```http
POST /group/create
Headers: token: {token}
Body: {
  "name": "My Group",
  "participants": ["5511999999999", "5511888888888"]
}
```

### Get Group Info
```http
POST /group/info
Headers: token: {token}
Body: {
  "groupjid": "120363153742561022@g.us",
  "getInviteLink": true
}
```

### Manage Participants
```http
POST /group/updateParticipants
Headers: token: {token}
Body: {
  "groupjid": "120363153742561022@g.us",
  "action": "add",  // add, remove, promote, demote
  "participants": ["5511999999999"]
}
```

## Error Handling

### Common HTTP Status Codes
- `200` - Success
- `400` - Invalid request (check payload)
- `401` - Invalid token
- `404` - Resource not found
- `429` - Rate limit exceeded (wait and retry)
- `500` - Server error

### Best Practices
1. **Always check instance status** before sending messages
2. **Implement exponential backoff** for rate limits
3. **Log webhook payloads** for debugging
4. **Use track_source/track_id** for message tracking
5. **Handle disconnections gracefully** - reconnect when needed

## Integration Patterns

### Pattern 1: Simple Message Response System
```
1. Configure webhook with excludeMessages: ["wasSentByApi"]
2. Receive message via webhook
3. Process message in your system
4. Send response via /send/text
```

### Pattern 2: CRM Integration
```
1. Receive webhook message
2. Extract sender info (chatid, senderName)
3. Update/create lead via /chat/editLead
4. Store message in your CRM
5. Send confirmation if needed
```

### Pattern 3: AI Chatbot with Escalation
```
1. Configure AI agent with base prompt
2. Create trigger for automatic responses
3. When "human" keyword detected:
   - Disable chatbot: chatbot_disableUntil timestamp
   - Assign attendant: lead_assignedAttendant_id
   - Open ticket: lead_isTicketOpen = true
```

### Pattern 4: Multi-Instance Management
```
1. Create instances via admin token
2. Store tokens in your database
3. Use instance tokens for operations
4. Configure global webhook for centralized processing
5. Route messages by instance/owner
```

## Progressive Disclosure

For detailed information, refer to:
- `API-REFERENCE.md` - Complete endpoint documentation
- `PATTERNS.md` - Advanced integration patterns
- `EXAMPLES.md` - Code examples in multiple languages

## Quick Reference

### Base URL
```
https://{subdomain}.uazapi.com
```

### Headers
```
Admin operations: admintoken: {admin-token}
Instance operations: token: {instance-token}
Content-Type: application/json
```

### Essential Endpoints
| Action | Method | Endpoint |
|--------|--------|----------|
| Create instance | POST | /instance/init |
| Connect | POST | /instance/connect |
| Check status | GET | /instance/status |
| Send text | POST | /send/text |
| Send media | POST | /send/media |
| Send menu | POST | /send/menu |
| Configure webhook | POST | /webhook |
| Update lead | POST | /chat/editLead |
| Search chats | POST | /chat/find |

---

**Remember**: Always use `excludeMessages: ["wasSentByApi"]` in webhooks to prevent infinite loops. Test in development before production.
