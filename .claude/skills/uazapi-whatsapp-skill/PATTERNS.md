# uazapi Integration Patterns

Advanced integration patterns and best practices for building robust WhatsApp integrations.

## Pattern 1: Basic Message Handler

The simplest pattern for receiving and responding to messages.

### Architecture
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   WhatsApp   │───▶│   Webhook    │───▶│ Your Server  │
│              │◀───│   Handler    │◀───│              │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Webhook Configuration
```json
{
  "enabled": true,
  "url": "https://your-server.com/webhook/whatsapp",
  "events": ["messages"],
  "excludeMessages": ["wasSentByApi", "fromMeYes"]
}
```

### Handler Implementation
```javascript
app.post('/webhook/whatsapp', async (req, res) => {
  const { event, message, token, BaseUrl } = req.body;

  // Acknowledge webhook immediately
  res.status(200).send('OK');

  // Skip if not a message event
  if (event !== 'messages') return;

  // Skip own messages and API messages
  if (message.fromMe) return;

  // Extract message data
  const chatId = message.chatid.split('@')[0];
  const text = message.text || message.content?.text || '';
  const senderName = message.senderName;

  // Process and respond
  const response = await processMessage(text, senderName);

  await fetch(`${BaseUrl}/send/text`, {
    method: 'POST',
    headers: {
      'token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      number: chatId,
      text: response,
      delay: 2000  // Show typing for 2 seconds
    })
  });
});
```

---

## Pattern 2: CRM Integration

Sync WhatsApp conversations with your CRM system.

### Architecture
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   WhatsApp   │───▶│   Webhook    │───▶│ CRM Sync     │───▶│   Database   │
│              │◀───│   Handler    │◀───│ Service      │◀───│              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### Implementation

#### 1. Webhook Handler
```javascript
app.post('/webhook/whatsapp', async (req, res) => {
  res.status(200).send('OK');

  const { event, message, token, BaseUrl, owner } = req.body;

  if (event !== 'messages' || message.fromMe) return;

  const chatId = message.chatid;
  const phone = message.sender_pn?.split('@')[0] || message.sender.split('@')[0];

  // Sync contact to CRM
  await syncContactToCRM({
    phone,
    name: message.senderName,
    instanceOwner: owner,
    lastMessage: message.text,
    lastMessageAt: new Date(message.messageTimestamp)
  });

  // Update lead in uazapi
  await fetch(`${BaseUrl}/chat/editLead`, {
    method: 'POST',
    headers: { 'token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: chatId,
      lead_name: message.senderName,
      lead_status: 'active',
      lead_field01: await getCRMId(phone)  // Store CRM ID
    })
  });
});
```

#### 2. Bidirectional Sync
```javascript
// When CRM is updated, update uazapi lead
async function onCRMContactUpdate(crmContact) {
  const { phone, status, tags, assignedTo } = crmContact;

  await fetch(`${UAZAPI_URL}/chat/editLead`, {
    method: 'POST',
    headers: { 'token': INSTANCE_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `${phone}@s.whatsapp.net`,
      lead_status: status,
      lead_tags: tags,
      lead_assignedAttendant_id: assignedTo
    })
  });
}
```

---

## Pattern 3: AI Chatbot with Human Escalation

Automated AI responses with seamless handoff to human agents.

### Architecture
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   WhatsApp   │───▶│  AI Agent    │───▶│   Response   │
│              │◀───│  (uazapi)    │◀───│              │
└──────────────┘    └──────────────┘    └──────────────┘
                           │
                           │ "human" detected
                           ▼
                    ┌──────────────┐    ┌──────────────┐
                    │   Escalate   │───▶│ Human Agent  │
                    │   Handler    │    │   Dashboard  │
                    └──────────────┘    └──────────────┘
```

### Implementation

#### 1. Configure AI Agent
```json
POST /agent/edit
{
  "agent": {
    "name": "Support Bot",
    "provider": "openai",
    "model": "gpt-4o-mini",
    "apikey": "sk-...",
    "basePrompt": "You are a helpful customer support assistant for TechStore. Answer questions about our products and services. If the customer explicitly asks to speak with a human agent or seems frustrated, respond with exactly: 'ESCALATE_TO_HUMAN' followed by a brief handoff message.",
    "maxTokens": 1000,
    "temperature": 70,
    "signMessages": true,
    "readMessages": true,
    "typingDelay_seconds": 3
  }
}
```

#### 2. Configure Trigger
```json
POST /trigger/edit
{
  "trigger": {
    "active": true,
    "type": "agent",
    "agent_id": "agent-id",
    "ignoreGroups": true,
    "priority": 1,
    "responseDelay_seconds": 5
  }
}
```

#### 3. Escalation Handler (via webhook)
```javascript
app.post('/webhook/whatsapp', async (req, res) => {
  res.status(200).send('OK');

  const { message, token, BaseUrl } = req.body;

  // Check for escalation trigger in AI response
  if (message.fromMe && message.text?.includes('ESCALATE_TO_HUMAN')) {
    const chatId = message.chatid;

    // Disable chatbot for this chat (1 hour)
    await fetch(`${BaseUrl}/chat/editLead`, {
      method: 'POST',
      headers: { 'token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: chatId,
        chatbot_disableUntil: Math.floor(Date.now() / 1000) + 3600,
        lead_isTicketOpen: true,
        lead_status: 'escalated'
      })
    });

    // Notify human agents
    await notifyAgents({
      chatId,
      reason: 'Customer requested human assistance',
      history: await getRecentMessages(chatId)
    });
  }
});
```

#### 4. Manual Escalation Keywords
```javascript
// Alternative: Check incoming messages for escalation keywords
const ESCALATION_KEYWORDS = ['human', 'agent', 'person', 'representative', 'manager'];

if (!message.fromMe && ESCALATION_KEYWORDS.some(kw => message.text?.toLowerCase().includes(kw))) {
  // Disable bot and escalate
  await disableChatbot(chatId);
  await notifyAgents(chatId);
}
```

---

## Pattern 4: Multi-Instance Hub

Central system managing multiple WhatsApp instances.

### Architecture
```
                    ┌──────────────┐
                    │ Global       │
                    │ Webhook      │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ Instance 1   │ │ Instance 2   │ │ Instance 3   │
    │ (Sales)      │ │ (Support)    │ │ (Marketing)  │
    └──────────────┘ └──────────────┘ └──────────────┘
```

### Implementation

#### 1. Configure Global Webhook
```json
POST /globalwebhook
Headers: admintoken: {admin-token}
{
  "url": "https://hub.example.com/webhook/global",
  "events": ["messages", "connection"],
  "excludeMessages": ["wasSentByApi"]
}
```

#### 2. Instance Registry
```javascript
const instances = {
  // owner phone number -> instance config
  '5511999999999': {
    name: 'Sales',
    token: 'token-1',
    handlers: ['sales-handler']
  },
  '5511888888888': {
    name: 'Support',
    token: 'token-2',
    handlers: ['support-handler']
  }
};
```

#### 3. Central Router
```javascript
app.post('/webhook/global', async (req, res) => {
  res.status(200).send('OK');

  const { event, owner, message, token, BaseUrl } = req.body;

  // Get instance config
  const instance = instances[owner];
  if (!instance) {
    console.log(`Unknown instance: ${owner}`);
    return;
  }

  // Route to appropriate handlers
  for (const handlerName of instance.handlers) {
    const handler = handlers[handlerName];
    if (handler) {
      await handler({ event, message, token, BaseUrl, instance });
    }
  }
});

const handlers = {
  'sales-handler': async ({ message, token, BaseUrl }) => {
    // Sales-specific logic
    if (message.text?.toLowerCase().includes('price')) {
      await sendPriceList(message.chatid, token, BaseUrl);
    }
  },

  'support-handler': async ({ message, token, BaseUrl }) => {
    // Support-specific logic
    await createSupportTicket(message);
  }
};
```

#### 4. Instance Management Dashboard
```javascript
// Create new instance
app.post('/api/instances', async (req, res) => {
  const { name, phone } = req.body;

  // Create instance
  const response = await fetch(`${UAZAPI_URL}/instance/init`, {
    method: 'POST',
    headers: {
      'admintoken': ADMIN_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name })
  });

  const { token, id } = await response.json();

  // Store in registry
  await db.instances.create({ id, name, phone, token });

  // Connect instance
  await fetch(`${UAZAPI_URL}/instance/connect`, {
    method: 'POST',
    headers: { 'token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });

  res.json({ id, token, status: 'connecting' });
});
```

---

## Pattern 5: Conversation Flow Builder

State machine for complex conversation flows.

### Architecture
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Message    │───▶│    State     │───▶│   Handler    │
│   Received   │    │   Machine    │    │   (by state) │
└──────────────┘    └──────────────┘    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    State     │
                    │    Store     │
                    └──────────────┘
```

### Implementation

#### 1. Define Flow States
```javascript
const FLOWS = {
  ORDER: {
    INIT: {
      message: 'What would you like to order?\n1. Pizza\n2. Burger\n3. Salad',
      nextState: 'CHOOSE_ITEM'
    },
    CHOOSE_ITEM: {
      handler: async (input, context) => {
        const items = { '1': 'Pizza', '2': 'Burger', '3': 'Salad' };
        context.item = items[input];
        return {
          message: `Great! You chose ${context.item}. What size?\n1. Small\n2. Medium\n3. Large`,
          nextState: 'CHOOSE_SIZE'
        };
      }
    },
    CHOOSE_SIZE: {
      handler: async (input, context) => {
        const sizes = { '1': 'Small', '2': 'Medium', '3': 'Large' };
        context.size = sizes[input];
        return {
          message: `${context.size} ${context.item}. Confirm? (yes/no)`,
          nextState: 'CONFIRM'
        };
      }
    },
    CONFIRM: {
      handler: async (input, context) => {
        if (input.toLowerCase() === 'yes') {
          await createOrder(context);
          return {
            message: `Order confirmed! Your ${context.size} ${context.item} will be ready in 20 minutes.`,
            nextState: null  // End flow
          };
        }
        return {
          message: 'Order cancelled. Type "order" to start again.',
          nextState: null
        };
      }
    }
  }
};
```

#### 2. State Manager
```javascript
class ConversationManager {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  async getState(chatId) {
    const data = await this.redis.get(`chat:${chatId}`);
    return data ? JSON.parse(data) : null;
  }

  async setState(chatId, flow, state, context = {}) {
    await this.redis.set(`chat:${chatId}`, JSON.stringify({
      flow, state, context,
      updatedAt: Date.now()
    }), 'EX', 3600);  // 1 hour expiry
  }

  async clearState(chatId) {
    await this.redis.del(`chat:${chatId}`);
  }
}
```

#### 3. Message Handler
```javascript
app.post('/webhook/whatsapp', async (req, res) => {
  res.status(200).send('OK');

  const { message, token, BaseUrl } = req.body;
  if (message.fromMe) return;

  const chatId = message.chatid;
  const text = message.text?.trim() || '';

  // Check for flow triggers
  if (text.toLowerCase() === 'order') {
    const flow = FLOWS.ORDER;
    const initState = flow.INIT;

    await conversationManager.setState(chatId, 'ORDER', 'CHOOSE_ITEM', {});
    await sendMessage(chatId, initState.message, token, BaseUrl);
    return;
  }

  // Check if in active flow
  const state = await conversationManager.getState(chatId);
  if (state) {
    const flow = FLOWS[state.flow];
    const currentState = flow[state.state];

    if (currentState.handler) {
      const result = await currentState.handler(text, state.context);

      if (result.nextState) {
        await conversationManager.setState(chatId, state.flow, result.nextState, state.context);
      } else {
        await conversationManager.clearState(chatId);
      }

      await sendMessage(chatId, result.message, token, BaseUrl);
    }
  }
});
```

---

## Pattern 6: Scheduled Message Campaigns

Time-based message delivery with follow-ups.

### Architecture
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Campaign   │───▶│   Scheduler  │───▶│   Message    │
│   Created    │    │   (Queue)    │    │   Sender     │
└──────────────┘    └──────────────┘    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Delivery   │
                    │   Tracking   │
                    └──────────────┘
```

### Implementation

#### 1. Create Campaign with Follow-ups
```javascript
async function createCampaign(contacts, template) {
  // Initial message
  const initialResponse = await fetch(`${UAZAPI_URL}/sender/advanced`, {
    method: 'POST',
    headers: { 'token': INSTANCE_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      delayMin: 10,
      delayMax: 30,
      info: 'Initial Campaign Message',
      scheduled_for: 1,  // Start in 1 minute
      messages: contacts.map(c => ({
        number: c.phone,
        type: 'text',
        text: template.initial.replace('{{name}}', c.name),
        track_source: 'campaign',
        track_id: `campaign_${Date.now()}_${c.phone}`
      }))
    })
  });

  const { folder_id } = await initialResponse.json();

  // Schedule follow-up (24 hours later)
  await scheduleFollowUp(folder_id, contacts, template, 24 * 60);

  return folder_id;
}
```

#### 2. Follow-up Scheduler
```javascript
async function scheduleFollowUp(campaignId, contacts, template, delayMinutes) {
  // Get contacts who haven't responded
  const nonResponders = await getNonResponders(campaignId, contacts);

  if (nonResponders.length === 0) return;

  await fetch(`${UAZAPI_URL}/sender/advanced`, {
    method: 'POST',
    headers: { 'token': INSTANCE_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      delayMin: 10,
      delayMax: 30,
      info: `Follow-up for ${campaignId}`,
      scheduled_for: delayMinutes,
      messages: nonResponders.map(c => ({
        number: c.phone,
        type: 'text',
        text: template.followUp.replace('{{name}}', c.name),
        track_source: 'campaign_followup',
        track_id: `${campaignId}_followup_${c.phone}`
      }))
    })
  });
}
```

#### 3. Response Tracking
```javascript
app.post('/webhook/whatsapp', async (req, res) => {
  res.status(200).send('OK');

  const { message } = req.body;
  if (message.fromMe) return;

  const phone = message.sender.split('@')[0];

  // Check if this contact is in an active campaign
  const campaign = await getActiveCampaignForContact(phone);
  if (campaign) {
    // Mark as responded
    await markCampaignResponse(campaign.id, phone);

    // Cancel scheduled follow-ups for this contact
    await cancelFollowUps(campaign.id, phone);
  }
});
```

---

## Pattern 7: Group Management Bot

Automated group administration and moderation.

### Implementation

#### 1. Welcome New Members
```javascript
app.post('/webhook/whatsapp', async (req, res) => {
  res.status(200).send('OK');

  const { event, message, token, BaseUrl } = req.body;

  // Check for group join event
  if (event === 'groups' && message.type === 'add') {
    const groupId = message.chatid;
    const newMembers = message.participants;

    // Get group info
    const groupInfo = await fetch(`${BaseUrl}/group/info`, {
      method: 'POST',
      headers: { 'token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupjid: groupId })
    }).then(r => r.json());

    // Send welcome message
    for (const member of newMembers) {
      await fetch(`${BaseUrl}/send/text`, {
        method: 'POST',
        headers: { 'token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: groupId,
          text: `Welcome to ${groupInfo.Name}! 👋\n\nPlease read our rules:\n1. Be respectful\n2. No spam\n3. Stay on topic`,
          mentions: member.split('@')[0]
        })
      });
    }
  }
});
```

#### 2. Auto-Moderation
```javascript
const BANNED_WORDS = ['spam', 'scam', 'clickbait'];
const WARNING_THRESHOLD = 3;

app.post('/webhook/whatsapp', async (req, res) => {
  res.status(200).send('OK');

  const { message, token, BaseUrl } = req.body;

  if (!message.isGroup || message.fromMe) return;

  const text = message.text?.toLowerCase() || '';
  const hasBannedWord = BANNED_WORDS.some(word => text.includes(word));

  if (hasBannedWord) {
    const userId = message.sender;
    const warnings = await incrementWarnings(userId, message.chatid);

    // Delete message
    await fetch(`${BaseUrl}/message/delete`, {
      method: 'POST',
      headers: { 'token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: message.messageid })
    });

    if (warnings >= WARNING_THRESHOLD) {
      // Remove user from group
      await fetch(`${BaseUrl}/group/updateParticipants`, {
        method: 'POST',
        headers: { 'token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupjid: message.chatid,
          action: 'remove',
          participants: [userId.split('@')[0]]
        })
      });

      await sendMessage(message.chatid, `User removed for repeated violations.`, token, BaseUrl);
    } else {
      await sendMessage(message.chatid, `⚠️ Warning ${warnings}/${WARNING_THRESHOLD}: Please follow group rules.`, token, BaseUrl);
    }
  }
});
```

---

## Pattern 8: Webhook Validation & Security

Secure your webhook endpoints.

### Implementation

#### 1. IP Whitelist
```javascript
const ALLOWED_IPS = [
  '34.123.456.789',  // uazapi server IPs
  '35.234.567.890'
];

app.use('/webhook', (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;

  if (!ALLOWED_IPS.includes(clientIP)) {
    console.log(`Blocked request from ${clientIP}`);
    return res.status(403).send('Forbidden');
  }

  next();
});
```

#### 2. Token Validation
```javascript
const VALID_TOKENS = new Set(['token-1', 'token-2']);

app.post('/webhook/whatsapp', (req, res, next) => {
  const { token } = req.body;

  if (!token || !VALID_TOKENS.has(token)) {
    return res.status(401).send('Invalid token');
  }

  next();
});
```

#### 3. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
  windowMs: 1000,  // 1 second
  max: 100,        // 100 requests per second
  message: 'Too many requests'
});

app.use('/webhook', webhookLimiter);
```

#### 4. Request Signing (Custom)
```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(signature)
  );
}

app.post('/webhook/whatsapp', (req, res, next) => {
  const signature = req.headers['x-webhook-signature'];

  if (!signature || !verifySignature(req.body, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  next();
});
```

---

## Best Practices Summary

### Performance
- ✅ Acknowledge webhooks immediately (respond 200 OK first)
- ✅ Process messages asynchronously
- ✅ Use message queues for high volume
- ✅ Cache frequently accessed data

### Reliability
- ✅ Implement retry logic with exponential backoff
- ✅ Log all webhook payloads for debugging
- ✅ Monitor instance connection status
- ✅ Handle disconnections gracefully

### Security
- ✅ Validate webhook source
- ✅ Store tokens securely (environment variables)
- ✅ Use HTTPS for all endpoints
- ✅ Implement rate limiting

### User Experience
- ✅ Show typing indicator before responding
- ✅ Keep messages concise
- ✅ Provide clear call-to-actions
- ✅ Offer human escalation path
