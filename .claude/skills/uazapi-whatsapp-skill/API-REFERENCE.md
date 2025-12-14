# uazapi API Reference

Complete endpoint reference for the uazapi WhatsApp API.

## Base URL
```
https://{subdomain}.uazapi.com
```

## Authentication

| Type | Header | Usage |
|------|--------|-------|
| Admin Token | `admintoken` | Instance management, global settings |
| Instance Token | `token` | All instance operations |

---

## Administration Endpoints

### Create Instance
Creates a new WhatsApp instance.

```http
POST /instance/init
Headers: admintoken: {admintoken}
```

**Request Body:**
```json
{
  "name": "instance-name",
  "systemName": "my-system",
  "adminField01": "custom-data-1",
  "adminField02": "custom-data-2"
}
```

**Response:**
```json
{
  "response": "Instance created successfully",
  "instance": {
    "id": "r183e2ef9597845",
    "token": "abc123xyz",
    "status": "disconnected",
    "name": "instance-name"
  },
  "connected": false,
  "loggedIn": false,
  "token": "abc123xyz"
}
```

### List All Instances
```http
GET /instance/all
Headers: admintoken: {admintoken}
```

**Response:** Array of Instance objects

### Update Admin Fields
```http
POST /instance/updateAdminFields
Headers: admintoken: {admintoken}
```

**Request Body:**
```json
{
  "id": "instance-id",
  "adminField01": "new-value-1",
  "adminField02": "new-value-2"
}
```

### Global Webhook
```http
GET /globalwebhook
Headers: admintoken: {admintoken}

POST /globalwebhook
Headers: admintoken: {admintoken}
Body: {
  "url": "https://webhook.example.com",
  "events": ["messages", "connection"],
  "excludeMessages": ["wasSentByApi"],
  "addUrlEvents": true,
  "addUrlTypesMessages": false
}
```

---

## Instance Management

### Connect Instance
```http
POST /instance/connect
Headers: token: {token}
```

**Request Body:**
```json
{
  "phone": "5511999999999"
}
```

**Response:** QR code or pairing code for authentication

### Disconnect Instance
```http
POST /instance/disconnect
Headers: token: {token}
```

### Check Instance Status
```http
GET /instance/status
Headers: token: {token}
```

**Response:**
```json
{
  "instance": {
    "id": "r183e2ef9597845",
    "name": "instance-name",
    "status": "connected",
    "profileName": "My WhatsApp"
  },
  "status": {
    "connected": true,
    "loggedIn": true,
    "jid": {
      "user": "5511999999999",
      "server": "s.whatsapp.net"
    }
  }
}
```

### Delete Instance
```http
DELETE /instance
Headers: token: {token}
```

### Update Instance Name
```http
POST /instance/updateInstanceName
Headers: token: {token}
Body: { "name": "New Instance Name" }
```

### Update Presence
```http
POST /instance/presence
Headers: token: {token}
Body: { "presence": "available" }  // available or unavailable
```

### Privacy Settings
```http
GET /instance/privacy
Headers: token: {token}

POST /instance/privacy
Headers: token: {token}
Body: {
  "groupadd": "contacts",     // all, contacts, contact_blacklist, none
  "last": "contacts",         // who sees last seen
  "status": "contacts",       // who sees status text
  "profile": "contacts",      // who sees profile photo
  "readreceipts": "all",      // all, none
  "online": "all",            // all, match_last_seen
  "calladd": "all"            // all, known
}
```

---

## Profile Management

### Update Profile Name
```http
POST /profile/name
Headers: token: {token}
Body: { "name": "New Profile Name" }
```

### Update Profile Image
```http
POST /profile/image
Headers: token: {token}
Body: { "image": "https://example.com/image.jpg" }  // URL, base64, or "remove"
```

---

## Sending Messages

### Send Text
```http
POST /send/text
Headers: token: {token}
```

**Request Body:**
```json
{
  "number": "5511999999999",
  "text": "Hello {{name}}!",
  "linkPreview": true,
  "linkPreviewTitle": "Custom Title",
  "linkPreviewDescription": "Custom description",
  "linkPreviewImage": "https://example.com/preview.jpg",
  "linkPreviewLarge": true,
  "delay": 3000,
  "readchat": true,
  "readmessages": true,
  "replyid": "MESSAGE_ID",
  "mentions": "5511888888888,5511777777777",
  "forward": false,
  "track_source": "my-crm",
  "track_id": "order-123"
}
```

### Send Media
```http
POST /send/media
Headers: token: {token}
```

**Request Body:**
```json
{
  "number": "5511999999999",
  "type": "image",
  "file": "https://example.com/image.jpg",
  "text": "Check this out!",
  "docName": "document.pdf"
}
```

**Types:** `image`, `video`, `document`, `audio`, `myaudio`, `ptt`, `sticker`

### Send Contact
```http
POST /send/contact
Headers: token: {token}
```

**Request Body:**
```json
{
  "number": "5511999999999",
  "fullName": "John Doe",
  "phoneNumber": "5511999999999,5511888888888",
  "organization": "Company Inc",
  "email": "john@example.com",
  "url": "https://company.com/john"
}
```

### Send Location
```http
POST /send/location
Headers: token: {token}
```

**Request Body:**
```json
{
  "number": "5511999999999",
  "name": "Company HQ",
  "address": "123 Main Street",
  "latitude": -23.5616,
  "longitude": -46.6562
}
```

### Send Interactive Menu
```http
POST /send/menu
Headers: token: {token}
```

**Button Type:**
```json
{
  "number": "5511999999999",
  "type": "button",
  "text": "Choose an option:",
  "footerText": "Our services",
  "imageButton": "https://example.com/banner.jpg",
  "choices": [
    "Support|support_id",
    "Visit Site|https://example.com",
    "Copy Code|copy:PROMO2024",
    "Call Us|call:+5511999999999"
  ]
}
```

**List Type:**
```json
{
  "number": "5511999999999",
  "type": "list",
  "text": "Product Catalog",
  "listButton": "View Products",
  "footerText": "Updated daily",
  "choices": [
    "[Category 1]",
    "Product A|prod_a|Description A",
    "Product B|prod_b|Description B",
    "[Category 2]",
    "Product C|prod_c|Description C"
  ]
}
```

**Poll Type:**
```json
{
  "number": "5511999999999",
  "type": "poll",
  "text": "What time works best?",
  "selectableCount": 1,
  "choices": [
    "Morning",
    "Afternoon",
    "Evening"
  ]
}
```

**Carousel Type:**
```json
{
  "number": "5511999999999",
  "type": "carousel",
  "text": "Our Products",
  "choices": [
    "[Product 1\\nBest seller]",
    "{https://example.com/prod1.jpg}",
    "Buy Now|https://example.com/buy/1",
    "Details|reply:details_1",
    "[Product 2\\nNew arrival]",
    "{https://example.com/prod2.jpg}",
    "Buy Now|https://example.com/buy/2"
  ]
}
```

### Send Carousel (Alternative)
```http
POST /send/carousel
Headers: token: {token}
```

**Request Body:**
```json
{
  "number": "5511999999999",
  "text": "Featured Products",
  "carousel": [
    {
      "text": "Product Name\\nDescription",
      "image": "https://example.com/product.jpg",
      "buttons": [
        { "id": "buy_now", "text": "Buy Now", "type": "REPLY" },
        { "id": "https://example.com", "text": "View", "type": "URL" },
        { "id": "PROMO123", "text": "Copy Code", "type": "COPY" },
        { "id": "5511999999999", "text": "Call", "type": "CALL" }
      ]
    }
  ]
}
```

### Send Location Request Button
```http
POST /send/location-button
Headers: token: {token}
Body: {
  "number": "5511999999999",
  "text": "Please share your location"
}
```

### Send Payment Request
```http
POST /send/request-payment
Headers: token: {token}
```

**Request Body:**
```json
{
  "number": "5511999999999",
  "title": "Order Details",
  "text": "Order #123 ready for payment",
  "footer": "My Store",
  "itemName": "Premium Plan",
  "invoiceNumber": "INV-123",
  "amount": 199.90,
  "pixKey": "uuid-pix-key",
  "pixType": "EVP",
  "pixName": "My Store",
  "boletoCode": "34191.79001...",
  "paymentLink": "https://pay.example.com/123",
  "fileUrl": "https://example.com/boleto.pdf",
  "fileName": "boleto.pdf"
}
```

### Send PIX Button
```http
POST /send/pix-button
Headers: token: {token}
Body: {
  "number": "5511999999999",
  "pixType": "EVP",
  "pixKey": "uuid-pix-key",
  "pixName": "My Store"
}
```

### Send Presence (Typing/Recording)
```http
POST /message/presence
Headers: token: {token}
Body: {
  "number": "5511999999999",
  "presence": "composing",  // composing, recording, paused
  "delay": 30000  // duration in ms (max 5 minutes)
}
```

### Send Status/Story
```http
POST /send/status
Headers: token: {token}
```

**Text Status:**
```json
{
  "type": "text",
  "text": "Hello World!",
  "background_color": 7,
  "font": 1
}
```

**Media Status:**
```json
{
  "type": "image",
  "file": "https://example.com/image.jpg",
  "text": "Caption"
}
```

---

## Message Actions

### Download Media
```http
POST /message/download
Headers: token: {token}
```

**Request Body:**
```json
{
  "id": "MESSAGE_ID",
  "return_base64": false,
  "generate_mp3": true,
  "return_link": true,
  "transcribe": false,
  "openai_apikey": "sk-...",
  "download_quoted": false
}
```

### Find Messages
```http
POST /message/find
Headers: token: {token}
```

**Request Body:**
```json
{
  "id": "MESSAGE_ID",
  "chatid": "5511999999999@s.whatsapp.net",
  "track_source": "crm",
  "track_id": "order-123",
  "limit": 100,
  "offset": 0
}
```

### Mark Messages as Read
```http
POST /message/markread
Headers: token: {token}
Body: {
  "id": ["MSG_ID_1", "MSG_ID_2"]
}
```

### React to Message
```http
POST /message/react
Headers: token: {token}
Body: {
  "number": "5511999999999@s.whatsapp.net",
  "id": "MESSAGE_ID",
  "text": "👍"  // emoji or empty to remove
}
```

### Delete Message
```http
POST /message/delete
Headers: token: {token}
Body: { "id": "MESSAGE_ID" }
```

### Edit Message
```http
POST /message/edit
Headers: token: {token}
Body: {
  "id": "MESSAGE_ID",
  "text": "Edited text"
}
```

---

## Chat Management

### Find Chats
```http
POST /chat/find
Headers: token: {token}
```

**Request Body:**
```json
{
  "operator": "AND",
  "sort": "-wa_lastMsgTimestamp",
  "limit": 50,
  "offset": 0,
  "wa_isGroup": false,
  "lead_status": "~qualified",
  "lead_tags": "~vip"
}
```

**Operators:**
- No prefix or `~`: LIKE (contains)
- `!~`: NOT LIKE
- `!=`: Not equal
- `>=`, `>`, `<=`, `<`: Comparisons

### Get Chat Details
```http
POST /chat/details
Headers: token: {token}
Body: {
  "number": "5511999999999",
  "preview": false  // true for smaller profile image
}
```

### Edit Lead
```http
POST /chat/editLead
Headers: token: {token}
```

**Request Body:**
```json
{
  "id": "5511999999999@s.whatsapp.net",
  "chatbot_disableUntil": 1735686000,
  "lead_isTicketOpen": true,
  "lead_assignedAttendant_id": "attendant-123",
  "lead_kanbanOrder": 1000,
  "lead_tags": ["vip", "priority"],
  "lead_name": "John",
  "lead_fullName": "John Doe",
  "lead_email": "john@example.com",
  "lead_personalId": "123.456.789-00",
  "lead_status": "qualified",
  "lead_notes": "Important customer",
  "lead_field01": "Custom Value 1",
  "lead_field02": "Custom Value 2"
}
```

### Chat Actions
```http
// Archive/Unarchive
POST /chat/archive
Body: { "number": "5511999999999", "archive": true }

// Mark Read/Unread
POST /chat/read
Body: { "number": "5511999999999", "read": true }

// Mute Chat
POST /chat/mute
Body: { "number": "5511999999999", "muteEndTime": 8 }  // 0, 8, 168, -1

// Pin/Unpin
POST /chat/pin
Body: { "number": "5511999999999", "pin": true }

// Delete Chat
POST /chat/delete
Body: {
  "number": "5511999999999",
  "deleteChatDB": true,
  "deleteMessagesDB": true,
  "deleteChatWhatsApp": true
}
```

### Manage Chat Labels
```http
POST /chat/labels
Headers: token: {token}
```

**Set all labels:**
```json
{ "number": "5511999999999", "labelids": ["10", "20"] }
```

**Add single label:**
```json
{ "number": "5511999999999", "add_labelid": "10" }
```

**Remove single label:**
```json
{ "number": "5511999999999", "remove_labelid": "20" }
```

### Check Numbers on WhatsApp
```http
POST /chat/check
Headers: token: {token}
Body: {
  "numbers": ["5511999999999", "5511888888888"]
}
```

---

## Contacts

### List Contacts
```http
GET /contacts
Headers: token: {token}

POST /contacts/list
Headers: token: {token}
Body: { "page": 1, "pageSize": 100 }
```

### Add Contact
```http
POST /contact/add
Headers: token: {token}
Body: {
  "phone": "5511999999999",
  "name": "John Doe"
}
```

### Remove Contact
```http
POST /contact/remove
Headers: token: {token}
Body: { "phone": "5511999999999" }
```

---

## Blocking

### Block/Unblock Contact
```http
POST /chat/block
Headers: token: {token}
Body: {
  "number": "5511999999999",
  "block": true
}
```

### List Blocked Contacts
```http
GET /chat/blocklist
Headers: token: {token}
```

---

## Labels

### List Labels
```http
GET /labels
Headers: token: {token}
```

### Edit Label
```http
POST /label/edit
Headers: token: {token}
Body: {
  "labelid": "25",
  "name": "New Label Name",
  "color": 2,  // 0-19
  "delete": false
}
```

---

## Groups

### Create Group
```http
POST /group/create
Headers: token: {token}
Body: {
  "name": "Group Name",
  "participants": ["5511999999999", "5511888888888"]
}
```

### Get Group Info
```http
POST /group/info
Headers: token: {token}
Body: {
  "groupjid": "120363153742561022@g.us",
  "getInviteLink": true,
  "getRequestsParticipants": false,
  "force": false
}
```

### Get Info by Invite Code
```http
POST /group/inviteInfo
Body: { "inviteCode": "https://chat.whatsapp.com/ABC123" }
```

### Join Group
```http
POST /group/join
Body: { "inviteCode": "https://chat.whatsapp.com/ABC123" }
```

### Leave Group
```http
POST /group/leave
Body: { "groupjid": "120363153742561022@g.us" }
```

### List Groups
```http
GET /group/list?force=false&noparticipants=false

POST /group/list
Body: { "page": 1, "pageSize": 50, "search": "team" }
```

### Update Group
```http
// Update Name
POST /group/updateName
Body: { "groupjid": "...", "name": "New Name" }

// Update Description
POST /group/updateDescription
Body: { "groupjid": "...", "description": "New description" }

// Update Image
POST /group/updateImage
Body: { "groupjid": "...", "image": "https://example.com/image.jpg" }

// Update Announce (only admins can send)
POST /group/updateAnnounce
Body: { "groupjid": "...", "announce": true }

// Update Locked (only admins can edit info)
POST /group/updateLocked
Body: { "groupjid": "...", "locked": true }
```

### Manage Participants
```http
POST /group/updateParticipants
Body: {
  "groupjid": "120363153742561022@g.us",
  "action": "add",  // add, remove, promote, demote, approve, reject
  "participants": ["5511999999999"]
}
```

### Reset Invite Link
```http
POST /group/resetInviteCode
Body: { "groupjid": "120363153742561022@g.us" }
```

---

## Communities

### Create Community
```http
POST /community/create
Body: { "name": "Community Name" }
```

### Manage Community Groups
```http
POST /community/editgroups
Body: {
  "community": "120363153742561022@g.us",
  "action": "add",  // add, remove
  "groupjids": ["120363324255083289@g.us"]
}
```

---

## Webhooks

### Instance Webhook
```http
GET /webhook
Headers: token: {token}

POST /webhook
Headers: token: {token}
```

**Create/Update (Simple Mode):**
```json
{
  "enabled": true,
  "url": "https://webhook.example.com",
  "events": ["messages", "messages_update", "connection"],
  "excludeMessages": ["wasSentByApi"],
  "addUrlEvents": true,
  "addUrlTypesMessages": false
}
```

**Advanced Mode (Multiple Webhooks):**
```json
{
  "action": "add",  // add, update, delete
  "id": "webhook-id",  // required for update/delete
  "enabled": true,
  "url": "https://webhook.example.com",
  "events": ["messages"]
}
```

### Server-Sent Events (SSE)
```http
GET /sse?token={token}&events=messages,connection
```

---

## Calls

### Make Call
```http
POST /call/make
Headers: token: {token}
Body: { "number": "5511999999999" }
```

### Reject Call
```http
POST /call/reject
Headers: token: {token}
Body: {
  "number": "5511999999999",
  "id": "CALL_ID"
}
```

---

## Chatbot Configuration

### Update Settings
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

### AI Agents
```http
// List Agents
GET /agent/list
Headers: token: {token}

// Create/Edit Agent
POST /agent/edit
Headers: token: {token}
Body: {
  "id": "",  // empty for create
  "delete": false,
  "agent": {
    "name": "Assistant",
    "provider": "openai",
    "model": "gpt-4o-mini",
    "apikey": "sk-...",
    "basePrompt": "You are a helpful assistant...",
    "maxTokens": 2000,
    "temperature": 70,
    "diversityLevel": 50,
    "frequencyPenalty": 30,
    "presencePenalty": 30,
    "signMessages": true,
    "readMessages": true,
    "maxMessageLength": 500,
    "typingDelay_seconds": 3,
    "contextTimeWindow_hours": 24,
    "contextMaxMessages": 50,
    "contextMinMessages": 3
  }
}
```

### Triggers
```http
// List Triggers
GET /trigger/list
Headers: token: {token}

// Create/Edit Trigger
POST /trigger/edit
Headers: token: {token}
Body: {
  "id": "",
  "delete": false,
  "trigger": {
    "active": true,
    "type": "agent",  // agent, quickreply
    "agent_id": "agent-id",
    "ignoreGroups": true,
    "lead_field": "lead_status",
    "lead_operator": "equals",
    "lead_value": "new",
    "priority": 1,
    "wordsToStart": "hello|hi|help",
    "responseDelay_seconds": 6
  }
}
```

### Knowledge Base
```http
// List Knowledge
GET /knowledge/list
Headers: token: {token}

// Create/Edit Knowledge
POST /knowledge/edit
Headers: token: {token}
Body: {
  "id": "",
  "delete": false,
  "knowledge": {
    "isActive": true,
    "tittle": "Product Info",
    "content": "Your product documentation..."
  },
  "fileType": "pdf"  // pdf, txt, html, csv
}
```

### AI Functions
```http
// List Functions
GET /function/list
Headers: token: {token}

// Create/Edit Function
POST /function/edit
Headers: token: {token}
Body: {
  "id": "",
  "delete": false,
  "function": {
    "name": "getProductPrice",
    "description": "Gets product price from catalog",
    "isActive": true,
    "method": "GET",
    "endpoint": "https://api.example.com/products/{{productId}}/price",
    "headers": {
      "Authorization": "Bearer {{apiKey}}"
    },
    "parameters": [
      {
        "name": "productId",
        "type": "string",
        "description": "Product ID",
        "required": true
      }
    ]
  }
}
```

---

## Quick Replies

```http
// List Quick Replies
GET /quickreply/showall
Headers: token: {token}

// Create/Edit Quick Reply
POST /quickreply/edit
Headers: token: {token}
Body: {
  "id": "",
  "delete": false,
  "shortCut": "greeting1",
  "type": "text",  // text, audio, myaudio, ptt, document, video, image
  "text": "Hello! How can I help you today?",
  "file": "https://example.com/file.pdf",
  "docName": "document.pdf"
}
```

---

## Mass Messaging

### Simple Campaign
```http
POST /sender/simple
Headers: token: {token}
Body: {
  "numbers": ["5511999999999", "5511888888888"],
  "type": "text",
  "text": "Hello {{name}}!",
  "delayMin": 10,
  "delayMax": 30,
  "scheduled_for": 1706198400000,
  "info": "Campaign description"
}
```

### Advanced Campaign
```http
POST /sender/advanced
Headers: token: {token}
Body: {
  "delayMin": 10,
  "delayMax": 30,
  "info": "Campaign description",
  "scheduled_for": 5,
  "messages": [
    {
      "number": "5511999999999",
      "type": "text",
      "text": "Hello!"
    },
    {
      "number": "5511999999999",
      "type": "image",
      "file": "https://example.com/image.jpg",
      "text": "Check this out!"
    }
  ]
}
```

### Campaign Management
```http
// Control Campaign
POST /sender/edit
Body: {
  "folder_id": "campaign-id",
  "action": "stop"  // stop, continue, delete
}

// List Campaigns
GET /sender/listfolders?status=Active

// List Campaign Messages
POST /sender/listmessages
Body: {
  "folder_id": "campaign-id",
  "messageStatus": "Scheduled",  // Scheduled, Sent, Failed
  "page": 1,
  "pageSize": 100
}

// Clear Sent Messages (older than X hours)
POST /sender/cleardone
Body: { "hours": 168 }

// Clear All Messages
DELETE /sender/clearall
```

---

## CRM Field Mapping

### Update Custom Field Names
```http
POST /instance/updateFieldsMap
Headers: token: {token}
Body: {
  "lead_field01": "company",
  "lead_field02": "position",
  "lead_field03": "source"
}
```

---

## Proxy Configuration

```http
// Get Proxy Config
GET /instance/proxy
Headers: token: {token}

// Set Proxy
POST /instance/proxy
Headers: token: {token}
Body: {
  "enable": true,
  "proxy_url": "http://user:pass@ip:port"
}

// Remove Proxy
DELETE /instance/proxy
Headers: token: {token}
```

---

## Chatwoot Integration (Beta)

```http
// Get Config
GET /chatwoot/config
Headers: token: {token}

// Update Config
PUT /chatwoot/config
Headers: token: {token}
Body: {
  "enabled": true,
  "url": "https://app.chatwoot.com",
  "access_token": "token",
  "account_id": 1,
  "inbox_id": 5,
  "ignore_groups": false,
  "sign_messages": true,
  "create_new_conversation": false
}
```

---

## Data Models

### Instance
```json
{
  "id": "string",
  "token": "string",
  "status": "disconnected|connecting|connected",
  "name": "string",
  "profileName": "string",
  "profilePicUrl": "string",
  "isBusiness": "boolean",
  "owner": "string",
  "created": "datetime",
  "updated": "datetime"
}
```

### Message
```json
{
  "id": "string",
  "messageid": "string",
  "chatid": "string",
  "fromMe": "boolean",
  "isGroup": "boolean",
  "messageType": "string",
  "messageTimestamp": "integer",
  "sender": "string",
  "senderName": "string",
  "text": "string",
  "status": "pending|sent|delivered|read|failed|deleted",
  "fileURL": "string"
}
```

### Chat
```json
{
  "id": "string",
  "wa_chatid": "string",
  "wa_name": "string",
  "wa_contactName": "string",
  "wa_isGroup": "boolean",
  "wa_lastMsgTimestamp": "integer",
  "lead_name": "string",
  "lead_email": "string",
  "lead_status": "string",
  "lead_tags": "string",
  "lead_isTicketOpen": "boolean",
  "lead_field01": "string"
}
```

### Webhook Event
```json
{
  "event": "messages|messages_update|connection|...",
  "instance": "string",
  "owner": "string",
  "token": "string",
  "BaseUrl": "string",
  "message": {
    "messageid": "string",
    "chatid": "string",
    "sender": "string",
    "senderName": "string",
    "text": "string",
    "fromMe": "boolean",
    "isGroup": "boolean"
  }
}
```
