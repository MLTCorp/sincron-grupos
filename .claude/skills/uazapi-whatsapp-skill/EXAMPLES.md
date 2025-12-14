# uazapi Code Examples

Complete code examples in multiple languages for common uazapi operations.

## Table of Contents

1. [JavaScript/Node.js](#javascriptnodejs)
2. [Python](#python)
3. [PHP](#php)
4. [cURL](#curl)
5. [Webhook Handlers](#webhook-handlers)

---

## JavaScript/Node.js

### Setup - HTTP Client

```javascript
// uazapi-client.js
class UazapiClient {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.adminToken = options.adminToken || null;
    this.instanceToken = options.instanceToken || null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add appropriate token
    if (options.useAdmin && this.adminToken) {
      headers['admintoken'] = this.adminToken;
    } else if (this.instanceToken) {
      headers['token'] = this.instanceToken;
    }

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`API Error ${response.status}: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  // Instance Management (Admin)
  async createInstance(name, options = {}) {
    return this.request('/instance/init', {
      method: 'POST',
      useAdmin: true,
      body: { name, ...options }
    });
  }

  async listInstances() {
    return this.request('/instance/all', { useAdmin: true });
  }

  // Instance Operations
  async connect(phone) {
    return this.request('/instance/connect', {
      method: 'POST',
      body: { phone }
    });
  }

  async getStatus() {
    return this.request('/instance/status');
  }

  async disconnect() {
    return this.request('/instance/disconnect', { method: 'POST' });
  }

  // Messaging
  async sendText(number, text, options = {}) {
    return this.request('/send/text', {
      method: 'POST',
      body: { number, text, ...options }
    });
  }

  async sendMedia(number, type, file, options = {}) {
    return this.request('/send/media', {
      method: 'POST',
      body: { number, type, file, ...options }
    });
  }

  async sendMenu(number, type, text, choices, options = {}) {
    return this.request('/send/menu', {
      method: 'POST',
      body: { number, type, text, choices, ...options }
    });
  }

  // Webhook
  async configureWebhook(config) {
    return this.request('/webhook', {
      method: 'POST',
      body: config
    });
  }

  // Lead Management
  async updateLead(id, data) {
    return this.request('/chat/editLead', {
      method: 'POST',
      body: { id, ...data }
    });
  }

  async findChats(filters) {
    return this.request('/chat/find', {
      method: 'POST',
      body: filters
    });
  }
}

module.exports = { UazapiClient };
```

### Example: Complete Instance Setup

```javascript
const { UazapiClient } = require('./uazapi-client');

async function setupNewInstance() {
  // Initialize with admin token
  const client = new UazapiClient('https://subdomain.uazapi.com', {
    adminToken: 'your-admin-token'
  });

  try {
    // 1. Create instance
    console.log('Creating instance...');
    const instance = await client.createInstance('my-business', {
      systemName: 'MyApp',
      adminField01: 'Production'
    });
    console.log('Instance created:', instance.id);
    console.log('Token:', instance.token);

    // 2. Switch to instance token
    client.instanceToken = instance.token;

    // 3. Connect to WhatsApp
    console.log('Connecting to WhatsApp...');
    const connection = await client.connect('5511999999999');

    if (connection.qrcode) {
      console.log('Scan this QR code:', connection.qrcode);
    } else if (connection.pairingCode) {
      console.log('Enter pairing code:', connection.pairingCode);
    }

    // 4. Wait for connection (poll status)
    let status = await client.getStatus();
    while (status.instance?.status !== 'connected') {
      console.log('Waiting for connection...', status.instance?.status);
      await new Promise(r => setTimeout(r, 5000));
      status = await client.getStatus();
    }
    console.log('Connected!');

    // 5. Configure webhook
    console.log('Configuring webhook...');
    await client.configureWebhook({
      enabled: true,
      url: 'https://your-server.com/webhook',
      events: ['messages', 'messages_update', 'connection'],
      excludeMessages: ['wasSentByApi']  // CRITICAL: Prevents loops!
    });
    console.log('Webhook configured!');

    // 6. Send test message
    console.log('Sending test message...');
    await client.sendText('5511999999999', 'Hello! Instance is ready.');
    console.log('Message sent!');

    return { instanceId: instance.id, token: instance.token };

  } catch (error) {
    console.error('Setup failed:', error.message);
    throw error;
  }
}

setupNewInstance();
```

### Example: Send All Message Types

```javascript
const { UazapiClient } = require('./uazapi-client');

const client = new UazapiClient('https://subdomain.uazapi.com', {
  instanceToken: 'your-instance-token'
});

async function sendAllMessageTypes(number) {
  // 1. Text Message
  await client.sendText(number, 'Hello! Here are all message types:');

  // 2. Image
  await client.sendMedia(number, 'image', 'https://example.com/image.jpg', {
    text: 'Check out this image!',
    delay: 2000
  });

  // 3. Video
  await client.sendMedia(number, 'video', 'https://example.com/video.mp4', {
    text: 'Watch this video'
  });

  // 4. Document
  await client.sendMedia(number, 'document', 'https://example.com/doc.pdf', {
    text: 'Here is the document',
    fileName: 'report.pdf'
  });

  // 5. Audio (voice note)
  await client.sendMedia(number, 'ptt', 'https://example.com/audio.ogg');

  // 6. Location
  await client.request('/send/location', {
    method: 'POST',
    body: {
      number,
      name: 'Our Office',
      address: '123 Business St, City',
      latitude: '-23.550520',
      longitude: '-46.633308'
    }
  });

  // 7. Contact
  await client.request('/send/contact', {
    method: 'POST',
    body: {
      number,
      contacts: [
        {
          fullName: 'John Doe',
          displayName: 'John',
          phones: ['+5511999999999']
        }
      ]
    }
  });

  // 8. Button Menu
  await client.sendMenu(number, 'button', 'How can I help you?', [
    'Sales|sales',
    'Support|support',
    'Our Website|https://example.com'
  ], {
    footerText: 'Choose an option'
  });

  // 9. List Menu
  await client.sendMenu(number, 'list', 'Our Products', [
    '[Category: Electronics]',
    'Smartphones|phones|Latest models',
    'Laptops|laptops|2024 releases',
    '[Category: Accessories]',
    'Headphones|headphones|Wireless options'
  ], {
    listButton: 'View Catalog',
    footerText: 'Prices may vary'
  });

  // 10. Poll
  await client.sendMenu(number, 'poll', 'What time works best for you?', [
    'Morning (8am-12pm)',
    'Afternoon (1pm-5pm)',
    'Evening (6pm-10pm)'
  ], {
    selectableCount: 1
  });

  console.log('All message types sent!');
}

sendAllMessageTypes('5511888888888');
```

### Example: CRM Integration

```javascript
const { UazapiClient } = require('./uazapi-client');

const client = new UazapiClient('https://subdomain.uazapi.com', {
  instanceToken: 'your-instance-token'
});

async function handleNewLead(webhookData) {
  const { message } = webhookData;
  const chatId = message.chatid;
  const senderName = message.senderName || 'Unknown';
  const phone = message.sender.replace('@s.whatsapp.net', '');

  // 1. Check if lead exists
  const existingLeads = await client.findChats({
    wa_chatid: chatId,
    limit: 1
  });

  if (existingLeads.data?.length === 0) {
    // 2. New lead - create record
    await client.updateLead(chatId, {
      lead_name: senderName.split(' ')[0],
      lead_fullName: senderName,
      lead_status: 'new',
      lead_tags: ['incoming', 'unqualified'],
      lead_field01: new Date().toISOString(),  // First contact date
      lead_field02: 'whatsapp',  // Source
      lead_isTicketOpen: true
    });

    // 3. Send welcome message
    await client.sendText(phone,
      `Hello ${senderName.split(' ')[0]}! Welcome to our service. How can I help you today?`
    );

    // 4. Notify sales team
    await client.sendText('5511999999999',
      `🆕 New lead!\nName: ${senderName}\nPhone: ${phone}\nFirst message: ${message.text}`
    );

  } else {
    // 4. Existing lead - update last contact
    await client.updateLead(chatId, {
      lead_field03: new Date().toISOString()  // Last contact date
    });
  }
}

// Integration with Express webhook handler
const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
  try {
    if (req.body.event === 'messages' && !req.body.message.fromMe) {
      await handleNewLead(req.body);
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error');
  }
});

app.listen(3000);
```

---

## Python

### Setup - HTTP Client

```python
# uazapi_client.py
import requests
from typing import Optional, Dict, Any, List

class UazapiClient:
    def __init__(self, base_url: str, admin_token: Optional[str] = None,
                 instance_token: Optional[str] = None):
        self.base_url = base_url.rstrip('/')
        self.admin_token = admin_token
        self.instance_token = instance_token

    def _request(self, endpoint: str, method: str = 'GET',
                 body: Optional[Dict] = None, use_admin: bool = False) -> Dict:
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}

        if use_admin and self.admin_token:
            headers['admintoken'] = self.admin_token
        elif self.instance_token:
            headers['token'] = self.instance_token

        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            json=body
        )
        response.raise_for_status()
        return response.json()

    # Instance Management (Admin)
    def create_instance(self, name: str, **options) -> Dict:
        return self._request('/instance/init', 'POST',
                            {'name': name, **options}, use_admin=True)

    def list_instances(self) -> Dict:
        return self._request('/instance/all', use_admin=True)

    # Instance Operations
    def connect(self, phone: str) -> Dict:
        return self._request('/instance/connect', 'POST', {'phone': phone})

    def get_status(self) -> Dict:
        return self._request('/instance/status')

    def disconnect(self) -> Dict:
        return self._request('/instance/disconnect', 'POST')

    # Messaging
    def send_text(self, number: str, text: str, **options) -> Dict:
        return self._request('/send/text', 'POST',
                            {'number': number, 'text': text, **options})

    def send_media(self, number: str, media_type: str, file: str, **options) -> Dict:
        return self._request('/send/media', 'POST',
                            {'number': number, 'type': media_type, 'file': file, **options})

    def send_menu(self, number: str, menu_type: str, text: str,
                  choices: List[str], **options) -> Dict:
        return self._request('/send/menu', 'POST',
                            {'number': number, 'type': menu_type,
                             'text': text, 'choices': choices, **options})

    # Webhook
    def configure_webhook(self, config: Dict) -> Dict:
        return self._request('/webhook', 'POST', config)

    # Lead Management
    def update_lead(self, chat_id: str, **data) -> Dict:
        return self._request('/chat/editLead', 'POST', {'id': chat_id, **data})

    def find_chats(self, filters: Dict) -> Dict:
        return self._request('/chat/find', 'POST', filters)
```

### Example: Complete Instance Setup

```python
from uazapi_client import UazapiClient
import time

def setup_new_instance():
    # Initialize with admin token
    client = UazapiClient(
        'https://subdomain.uazapi.com',
        admin_token='your-admin-token'
    )

    try:
        # 1. Create instance
        print('Creating instance...')
        instance = client.create_instance(
            'my-business',
            systemName='MyApp',
            adminField01='Production'
        )
        print(f"Instance created: {instance['id']}")
        print(f"Token: {instance['token']}")

        # 2. Switch to instance token
        client.instance_token = instance['token']

        # 3. Connect to WhatsApp
        print('Connecting to WhatsApp...')
        connection = client.connect('5511999999999')

        if 'qrcode' in connection:
            print(f"Scan this QR code: {connection['qrcode']}")
        elif 'pairingCode' in connection:
            print(f"Enter pairing code: {connection['pairingCode']}")

        # 4. Wait for connection
        status = client.get_status()
        while status.get('instance', {}).get('status') != 'connected':
            print(f"Waiting for connection... {status.get('instance', {}).get('status')}")
            time.sleep(5)
            status = client.get_status()
        print('Connected!')

        # 5. Configure webhook
        print('Configuring webhook...')
        client.configure_webhook({
            'enabled': True,
            'url': 'https://your-server.com/webhook',
            'events': ['messages', 'messages_update', 'connection'],
            'excludeMessages': ['wasSentByApi']  # CRITICAL!
        })
        print('Webhook configured!')

        # 6. Send test message
        print('Sending test message...')
        client.send_text('5511999999999', 'Hello! Instance is ready.')
        print('Message sent!')

        return {
            'instance_id': instance['id'],
            'token': instance['token']
        }

    except Exception as e:
        print(f"Setup failed: {e}")
        raise

if __name__ == '__main__':
    setup_new_instance()
```

### Example: Flask Webhook Handler

```python
from flask import Flask, request, jsonify
from uazapi_client import UazapiClient

app = Flask(__name__)

client = UazapiClient(
    'https://subdomain.uazapi.com',
    instance_token='your-instance-token'
)

@app.route('/webhook', methods=['POST'])
def webhook():
    try:
        data = request.json
        event = data.get('event')

        if event == 'messages':
            handle_message(data)
        elif event == 'messages_update':
            handle_status_update(data)
        elif event == 'connection':
            handle_connection_change(data)

        return jsonify({'status': 'ok'}), 200

    except Exception as e:
        print(f"Webhook error: {e}")
        return jsonify({'error': str(e)}), 500

def handle_message(data):
    message = data.get('message', {})

    # Skip messages from self (extra safety)
    if message.get('fromMe'):
        return

    chat_id = message.get('chatid')
    text = message.get('text', '')
    sender_name = message.get('senderName', 'Friend')
    is_group = message.get('isGroup', False)

    # Skip group messages
    if is_group:
        return

    # Simple keyword response
    text_lower = text.lower()

    if 'hello' in text_lower or 'hi' in text_lower:
        client.send_text(
            chat_id.replace('@s.whatsapp.net', ''),
            f"Hello {sender_name.split()[0]}! How can I help you today?"
        )

    elif 'price' in text_lower or 'pricing' in text_lower:
        client.send_menu(
            chat_id.replace('@s.whatsapp.net', ''),
            'button',
            'Here are our pricing options:',
            [
                'Basic Plan - $9.99|basic',
                'Pro Plan - $29.99|pro',
                'Enterprise - Contact Us|enterprise'
            ],
            footerText='Choose a plan to learn more'
        )

    elif 'human' in text_lower or 'agent' in text_lower:
        # Update lead for human handoff
        client.update_lead(
            chat_id,
            lead_isTicketOpen=True,
            lead_tags=['needs-human', 'priority']
        )
        client.send_text(
            chat_id.replace('@s.whatsapp.net', ''),
            "I'll connect you with a human agent shortly. Please wait..."
        )

def handle_status_update(data):
    message = data.get('message', {})
    status = message.get('status')
    message_id = message.get('messageid')
    print(f"Message {message_id} status: {status}")

def handle_connection_change(data):
    status = data.get('status')
    print(f"Connection status changed: {status}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
```

### Example: Mass Messaging Campaign

```python
from uazapi_client import UazapiClient
from datetime import datetime, timedelta

client = UazapiClient(
    'https://subdomain.uazapi.com',
    instance_token='your-instance-token'
)

def create_promo_campaign():
    # Get contacts by tag
    contacts = client.find_chats({
        'operator': 'AND',
        'wa_isGroup': False,
        'lead_tags': '~customer',  # Contains 'customer'
        'limit': 500
    })

    if not contacts.get('data'):
        print('No contacts found')
        return

    # Extract phone numbers
    numbers = [
        chat['wa_chatid'].replace('@s.whatsapp.net', '')
        for chat in contacts['data']
    ]

    print(f"Found {len(numbers)} contacts")

    # Schedule campaign for tomorrow at 10am
    tomorrow_10am = datetime.now().replace(
        hour=10, minute=0, second=0, microsecond=0
    ) + timedelta(days=1)

    # Create simple campaign
    result = client._request('/sender/simple', 'POST', {
        'numbers': numbers,
        'type': 'text',
        'text': '''🎉 Special Offer for You, {{name}}!

Get 20% OFF on all products this weekend!
Use code: WEEKEND20

Valid until Sunday.
Reply "INFO" for details or "STOP" to unsubscribe.''',
        'delayMin': 15,  # Min 15 seconds between messages
        'delayMax': 45,  # Max 45 seconds between messages
        'scheduled_for': int(tomorrow_10am.timestamp() * 1000)
    })

    print(f"Campaign created: {result.get('folder_id')}")
    return result

def check_campaign_status(folder_id):
    result = client._request('/sender/list', 'POST', {
        'folder_id': folder_id
    })

    stats = result.get('stats', {})
    print(f"Total: {stats.get('total', 0)}")
    print(f"Sent: {stats.get('sent', 0)}")
    print(f"Pending: {stats.get('pending', 0)}")
    print(f"Failed: {stats.get('failed', 0)}")

    return result

def pause_campaign(folder_id):
    return client._request('/sender/edit', 'POST', {
        'folder_id': folder_id,
        'action': 'stop'
    })

def resume_campaign(folder_id):
    return client._request('/sender/edit', 'POST', {
        'folder_id': folder_id,
        'action': 'continue'
    })

if __name__ == '__main__':
    result = create_promo_campaign()
    if result:
        print(f"Campaign ID: {result.get('folder_id')}")
```

---

## PHP

### Setup - HTTP Client

```php
<?php
// UazapiClient.php

class UazapiClient {
    private string $baseUrl;
    private ?string $adminToken;
    private ?string $instanceToken;

    public function __construct(
        string $baseUrl,
        ?string $adminToken = null,
        ?string $instanceToken = null
    ) {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->adminToken = $adminToken;
        $this->instanceToken = $instanceToken;
    }

    public function setInstanceToken(string $token): void {
        $this->instanceToken = $token;
    }

    private function request(
        string $endpoint,
        string $method = 'GET',
        ?array $body = null,
        bool $useAdmin = false
    ): array {
        $url = $this->baseUrl . $endpoint;

        $headers = [
            'Content-Type: application/json'
        ];

        if ($useAdmin && $this->adminToken) {
            $headers[] = 'admintoken: ' . $this->adminToken;
        } elseif ($this->instanceToken) {
            $headers[] = 'token: ' . $this->instanceToken;
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

        if ($body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 400) {
            throw new Exception("API Error $httpCode: $response");
        }

        return json_decode($response, true) ?? [];
    }

    // Instance Management (Admin)
    public function createInstance(string $name, array $options = []): array {
        return $this->request('/instance/init', 'POST',
            array_merge(['name' => $name], $options), true);
    }

    public function listInstances(): array {
        return $this->request('/instance/all', 'GET', null, true);
    }

    // Instance Operations
    public function connect(string $phone): array {
        return $this->request('/instance/connect', 'POST', ['phone' => $phone]);
    }

    public function getStatus(): array {
        return $this->request('/instance/status');
    }

    public function disconnect(): array {
        return $this->request('/instance/disconnect', 'POST');
    }

    // Messaging
    public function sendText(string $number, string $text, array $options = []): array {
        return $this->request('/send/text', 'POST',
            array_merge(['number' => $number, 'text' => $text], $options));
    }

    public function sendMedia(
        string $number,
        string $type,
        string $file,
        array $options = []
    ): array {
        return $this->request('/send/media', 'POST',
            array_merge(['number' => $number, 'type' => $type, 'file' => $file], $options));
    }

    public function sendMenu(
        string $number,
        string $type,
        string $text,
        array $choices,
        array $options = []
    ): array {
        return $this->request('/send/menu', 'POST',
            array_merge([
                'number' => $number,
                'type' => $type,
                'text' => $text,
                'choices' => $choices
            ], $options));
    }

    // Webhook
    public function configureWebhook(array $config): array {
        return $this->request('/webhook', 'POST', $config);
    }

    // Lead Management
    public function updateLead(string $chatId, array $data): array {
        return $this->request('/chat/editLead', 'POST',
            array_merge(['id' => $chatId], $data));
    }

    public function findChats(array $filters): array {
        return $this->request('/chat/find', 'POST', $filters);
    }
}
```

### Example: Laravel Webhook Controller

```php
<?php
// app/Http/Controllers/WhatsAppWebhookController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\UazapiClient;
use App\Models\Lead;
use App\Jobs\ProcessWhatsAppMessage;

class WhatsAppWebhookController extends Controller
{
    private UazapiClient $uazapi;

    public function __construct()
    {
        $this->uazapi = new UazapiClient(
            config('services.uazapi.url'),
            null,
            config('services.uazapi.token')
        );
    }

    public function handle(Request $request)
    {
        $event = $request->input('event');

        switch ($event) {
            case 'messages':
                return $this->handleMessage($request->all());
            case 'messages_update':
                return $this->handleStatusUpdate($request->all());
            case 'connection':
                return $this->handleConnectionChange($request->all());
            default:
                return response()->json(['status' => 'ignored']);
        }
    }

    private function handleMessage(array $data)
    {
        $message = $data['message'] ?? [];

        // Skip own messages
        if ($message['fromMe'] ?? false) {
            return response()->json(['status' => 'skipped']);
        }

        // Skip groups
        if ($message['isGroup'] ?? false) {
            return response()->json(['status' => 'skipped']);
        }

        $chatId = $message['chatid'];
        $phone = str_replace('@s.whatsapp.net', '', $chatId);
        $senderName = $message['senderName'] ?? 'Customer';
        $text = $message['text'] ?? '';

        // Find or create lead
        $lead = Lead::firstOrCreate(
            ['whatsapp_id' => $chatId],
            [
                'phone' => $phone,
                'name' => $senderName,
                'status' => 'new',
                'first_contact' => now(),
            ]
        );

        // Update last message
        $lead->update([
            'last_message' => $text,
            'last_contact' => now(),
        ]);

        // Process message async
        ProcessWhatsAppMessage::dispatch($lead, $message);

        return response()->json(['status' => 'ok']);
    }

    private function handleStatusUpdate(array $data)
    {
        $message = $data['message'] ?? [];
        $status = $message['status'] ?? '';
        $messageId = $message['messageid'] ?? '';

        \Log::info("Message $messageId status: $status");

        // Update message status in database if needed
        // MessageLog::where('whatsapp_id', $messageId)->update(['status' => $status]);

        return response()->json(['status' => 'ok']);
    }

    private function handleConnectionChange(array $data)
    {
        $status = $data['status'] ?? '';

        \Log::warning("WhatsApp connection changed: $status");

        // Alert if disconnected
        if ($status === 'disconnected') {
            // Send alert to admin
            // Notification::send(Admin::all(), new WhatsAppDisconnected());
        }

        return response()->json(['status' => 'ok']);
    }
}
```

### Example: Simple Autoresponder

```php
<?php
// webhook.php

require_once 'UazapiClient.php';

$client = new UazapiClient(
    'https://subdomain.uazapi.com',
    null,
    'your-instance-token'
);

// Get webhook payload
$payload = json_decode(file_get_contents('php://input'), true);

if (!$payload || $payload['event'] !== 'messages') {
    http_response_code(200);
    exit;
}

$message = $payload['message'] ?? [];

// Skip own messages and groups
if (($message['fromMe'] ?? false) || ($message['isGroup'] ?? false)) {
    http_response_code(200);
    exit;
}

$phone = str_replace('@s.whatsapp.net', '', $message['chatid']);
$text = strtolower($message['text'] ?? '');
$name = explode(' ', $message['senderName'] ?? 'Friend')[0];

try {
    // Keyword responses
    if (strpos($text, 'hello') !== false || strpos($text, 'hi') !== false) {
        $client->sendText($phone, "Hello $name! Welcome to our service. How can I help you?");
    }
    elseif (strpos($text, 'price') !== false) {
        $client->sendMenu($phone, 'button', "Here are our plans:", [
            'Basic - $9/mo|basic',
            'Pro - $29/mo|pro',
            'Enterprise|enterprise'
        ], ['footerText' => 'Select a plan']);
    }
    elseif (strpos($text, 'hours') !== false || strpos($text, 'open') !== false) {
        $client->sendText($phone,
            "🕐 Our business hours:\n\nMonday - Friday: 9am - 6pm\nSaturday: 10am - 2pm\nSunday: Closed"
        );
    }
    elseif (strpos($text, 'location') !== false || strpos($text, 'address') !== false) {
        // Send location
        $client->request('/send/location', 'POST', [
            'number' => $phone,
            'name' => 'Our Store',
            'address' => '123 Main St, City',
            'latitude' => '-23.550520',
            'longitude' => '-46.633308'
        ]);
    }
    else {
        // Default response
        $client->sendText($phone,
            "Thanks for your message! I'll get back to you shortly.\n\nFor immediate help, type:\n• 'prices' for pricing\n• 'hours' for business hours\n• 'location' for our address"
        );
    }

    http_response_code(200);
    echo json_encode(['status' => 'ok']);

} catch (Exception $e) {
    error_log('WhatsApp webhook error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
```

---

## cURL

### Instance Management

```bash
# Create instance (Admin)
curl -X POST "https://subdomain.uazapi.com/instance/init" \
  -H "admintoken: your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-instance",
    "systemName": "MyApp"
  }'

# List all instances (Admin)
curl -X GET "https://subdomain.uazapi.com/instance/all" \
  -H "admintoken: your-admin-token"

# Connect instance
curl -X POST "https://subdomain.uazapi.com/instance/connect" \
  -H "token: your-instance-token" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5511999999999"
  }'

# Check status
curl -X GET "https://subdomain.uazapi.com/instance/status" \
  -H "token: your-instance-token"

# Disconnect
curl -X POST "https://subdomain.uazapi.com/instance/disconnect" \
  -H "token: your-instance-token"
```

### Sending Messages

```bash
# Send text
curl -X POST "https://subdomain.uazapi.com/send/text" \
  -H "token: your-instance-token" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Hello from cURL!"
  }'

# Send image
curl -X POST "https://subdomain.uazapi.com/send/media" \
  -H "token: your-instance-token" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "type": "image",
    "file": "https://example.com/image.jpg",
    "text": "Check this out!"
  }'

# Send button menu
curl -X POST "https://subdomain.uazapi.com/send/menu" \
  -H "token: your-instance-token" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "type": "button",
    "text": "How can I help?",
    "choices": [
      "Sales|sales",
      "Support|support",
      "Website|https://example.com"
    ],
    "footerText": "Choose an option"
  }'

# Send list menu
curl -X POST "https://subdomain.uazapi.com/send/menu" \
  -H "token: your-instance-token" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "type": "list",
    "text": "Our Products",
    "listButton": "View Catalog",
    "choices": [
      "[Electronics]",
      "Smartphones|phones|Latest models",
      "Laptops|laptops|2024 releases",
      "[Accessories]",
      "Headphones|audio|Wireless"
    ]
  }'

# Send poll
curl -X POST "https://subdomain.uazapi.com/send/menu" \
  -H "token: your-instance-token" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "type": "poll",
    "text": "What time works best?",
    "choices": [
      "Morning (8am-12pm)",
      "Afternoon (1pm-5pm)",
      "Evening (6pm-10pm)"
    ],
    "selectableCount": 1
  }'

# Send location
curl -X POST "https://subdomain.uazapi.com/send/location" \
  -H "token: your-instance-token" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "name": "Our Office",
    "address": "123 Business St, City",
    "latitude": "-23.550520",
    "longitude": "-46.633308"
  }'
```

### Webhook Configuration

```bash
# Configure instance webhook (IMPORTANT: excludeMessages prevents loops!)
curl -X POST "https://subdomain.uazapi.com/webhook" \
  -H "token: your-instance-token" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "url": "https://your-server.com/webhook",
    "events": ["messages", "messages_update", "connection"],
    "excludeMessages": ["wasSentByApi"]
  }'

# Configure global webhook (Admin)
curl -X POST "https://subdomain.uazapi.com/globalwebhook" \
  -H "admintoken: your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-server.com/global-webhook",
    "events": ["messages", "connection"],
    "excludeMessages": ["wasSentByApi"]
  }'
```

### Lead Management

```bash
# Update lead
curl -X POST "https://subdomain.uazapi.com/chat/editLead" \
  -H "token: your-instance-token" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "5511999999999@s.whatsapp.net",
    "lead_name": "John",
    "lead_fullName": "John Doe",
    "lead_email": "john@example.com",
    "lead_status": "qualified",
    "lead_tags": ["vip", "priority"],
    "lead_field01": "Custom data"
  }'

# Search chats
curl -X POST "https://subdomain.uazapi.com/chat/find" \
  -H "token: your-instance-token" \
  -H "Content-Type: application/json" \
  -d '{
    "operator": "AND",
    "wa_isGroup": false,
    "lead_status": "~qualified",
    "sort": "-wa_lastMsgTimestamp",
    "limit": 50
  }'
```

### Mass Messaging

```bash
# Simple campaign
curl -X POST "https://subdomain.uazapi.com/sender/simple" \
  -H "token: your-instance-token" \
  -H "Content-Type: application/json" \
  -d '{
    "numbers": ["5511999999999", "5511888888888"],
    "type": "text",
    "text": "Hello {{name}}! Special offer for you.",
    "delayMin": 15,
    "delayMax": 30
  }'

# Check campaign status
curl -X POST "https://subdomain.uazapi.com/sender/list" \
  -H "token: your-instance-token" \
  -H "Content-Type: application/json" \
  -d '{
    "folder_id": "campaign-id-here"
  }'

# Pause campaign
curl -X POST "https://subdomain.uazapi.com/sender/edit" \
  -H "token: your-instance-token" \
  -H "Content-Type: application/json" \
  -d '{
    "folder_id": "campaign-id-here",
    "action": "stop"
  }'
```

---

## Webhook Handlers

### Express.js (Production Ready)

```javascript
const express = require('express');
const crypto = require('crypto');
const { UazapiClient } = require('./uazapi-client');

const app = express();

// Middleware to capture raw body for signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

const client = new UazapiClient('https://subdomain.uazapi.com', {
  instanceToken: process.env.UAZAPI_TOKEN
});

// Optional: Verify webhook signature
function verifySignature(req) {
  const signature = req.headers['x-webhook-signature'];
  if (!signature || !process.env.WEBHOOK_SECRET) return true; // Skip if not configured

  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Main webhook handler
app.post('/webhook', async (req, res) => {
  // Verify signature
  if (!verifySignature(req)) {
    console.error('Invalid webhook signature');
    return res.status(401).send('Unauthorized');
  }

  // Respond immediately (best practice)
  res.status(200).send('OK');

  // Process async
  try {
    await processWebhook(req.body);
  } catch (error) {
    console.error('Webhook processing error:', error);
  }
});

async function processWebhook(data) {
  const { event, instance, message } = data;

  console.log(`Event: ${event} | Instance: ${instance}`);

  switch (event) {
    case 'messages':
      await handleMessage(message, data);
      break;
    case 'messages_update':
      await handleStatusUpdate(message);
      break;
    case 'connection':
      await handleConnection(data);
      break;
    default:
      console.log('Unhandled event:', event);
  }
}

async function handleMessage(message, fullData) {
  // Skip own messages
  if (message.fromMe) return;

  // Skip groups (optional)
  if (message.isGroup) return;

  const phone = message.chatid.replace('@s.whatsapp.net', '');
  const text = (message.text || '').toLowerCase();
  const name = (message.senderName || '').split(' ')[0] || 'Friend';

  console.log(`Message from ${phone}: ${message.text}`);

  // Example: Command handling
  if (text.startsWith('/')) {
    const [command, ...args] = text.slice(1).split(' ');
    await handleCommand(phone, command, args, name);
    return;
  }

  // Example: Keyword detection
  const keywords = {
    'hello|hi|hey': async () => {
      await client.sendText(phone, `Hello ${name}! How can I assist you today?`);
    },
    'price|pricing|cost': async () => {
      await client.sendMenu(phone, 'button', 'Our pricing options:', [
        'Basic - $9.99/mo|basic',
        'Pro - $29.99/mo|pro',
        'Enterprise - Custom|enterprise'
      ]);
    },
    'help|support': async () => {
      await client.sendMenu(phone, 'list', 'How can we help?', [
        '[Common Questions]',
        'Pricing Information|pricing|View our plans',
        'Business Hours|hours|When are we open',
        'Contact Info|contact|How to reach us',
        '[Support]',
        'Technical Issue|tech|Report a problem',
        'Speak to Human|human|Talk to an agent'
      ], { listButton: 'Get Help' });
    },
    'human|agent|person': async () => {
      await client.updateLead(message.chatid, {
        lead_isTicketOpen: true,
        lead_tags: ['needs-agent']
      });
      await client.sendText(phone,
        "I'm connecting you with a human agent. Please wait...");
    }
  };

  for (const [pattern, handler] of Object.entries(keywords)) {
    if (new RegExp(pattern, 'i').test(text)) {
      await handler();
      return;
    }
  }

  // Default response
  await client.sendText(phone,
    `Thanks for your message! Type "help" for options or wait for an agent.`);
}

async function handleCommand(phone, command, args, name) {
  const commands = {
    'status': async () => {
      const status = await client.getStatus();
      await client.sendText(phone, `Instance status: ${status.instance?.status}`);
    },
    'subscribe': async () => {
      await client.updateLead(`${phone}@s.whatsapp.net`, {
        lead_tags: ['subscribed', 'newsletter']
      });
      await client.sendText(phone, "You're now subscribed to our updates!");
    },
    'unsubscribe': async () => {
      await client.updateLead(`${phone}@s.whatsapp.net`, {
        lead_tags: ['unsubscribed']
      });
      await client.sendText(phone, "You've been unsubscribed. We'll miss you!");
    }
  };

  if (commands[command]) {
    await commands[command]();
  } else {
    await client.sendText(phone, `Unknown command: /${command}`);
  }
}

async function handleStatusUpdate(message) {
  const statusEmoji = {
    'sent': '📤',
    'delivered': '✅',
    'read': '👁️',
    'failed': '❌'
  };
  console.log(
    `${statusEmoji[message.status] || '?'} Message ${message.messageid}: ${message.status}`
  );
}

async function handleConnection(data) {
  console.log(`Connection: ${data.status}`);

  if (data.status === 'disconnected') {
    // Alert admin
    console.error('WhatsApp disconnected! Manual reconnection needed.');
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
```

### Cloudflare Worker

```javascript
// worker.js
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const data = await request.json();

    // Process webhook
    const response = await handleWebhook(data, env);

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function handleWebhook(data, env) {
  const { event, message } = data;

  if (event !== 'messages' || message.fromMe || message.isGroup) {
    return { status: 'skipped' };
  }

  const phone = message.chatid.replace('@s.whatsapp.net', '');
  const text = (message.text || '').toLowerCase();

  // Simple response
  let responseText = "Thanks for your message!";

  if (text.includes('hello') || text.includes('hi')) {
    responseText = `Hello ${message.senderName?.split(' ')[0] || 'there'}! How can I help?`;
  }

  // Send response
  await fetch(`${env.UAZAPI_URL}/send/text`, {
    method: 'POST',
    headers: {
      'token': env.UAZAPI_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      number: phone,
      text: responseText
    })
  });

  return { status: 'ok' };
}
```

### AWS Lambda

```python
# lambda_function.py
import json
import os
import urllib.request

def lambda_handler(event, context):
    # Parse body
    body = json.loads(event.get('body', '{}'))

    # Process webhook
    result = handle_webhook(body)

    return {
        'statusCode': 200,
        'body': json.dumps(result)
    }

def handle_webhook(data):
    event_type = data.get('event')
    message = data.get('message', {})

    if event_type != 'messages':
        return {'status': 'ignored'}

    if message.get('fromMe') or message.get('isGroup'):
        return {'status': 'skipped'}

    phone = message.get('chatid', '').replace('@s.whatsapp.net', '')
    text = (message.get('text') or '').lower()
    name = (message.get('senderName') or 'Friend').split()[0]

    # Simple response
    if 'hello' in text or 'hi' in text:
        response_text = f"Hello {name}! How can I help you today?"
    else:
        response_text = "Thanks for your message! We'll get back to you soon."

    # Send response
    send_message(phone, response_text)

    return {'status': 'ok'}

def send_message(phone, text):
    url = f"{os.environ['UAZAPI_URL']}/send/text"
    data = json.dumps({'number': phone, 'text': text}).encode('utf-8')

    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('token', os.environ['UAZAPI_TOKEN'])
    req.add_header('Content-Type', 'application/json')

    with urllib.request.urlopen(req) as response:
        return json.loads(response.read())
```

---

## Quick Reference

### HTTP Headers

| Header | Usage | Description |
|--------|-------|-------------|
| `admintoken` | Admin operations | Create/list instances, global webhook |
| `token` | Instance operations | All day-to-day operations |
| `Content-Type` | All requests | Always `application/json` |

### Phone Number Format

```
✅ Correct: 5511999999999 (country + area + number)
❌ Wrong: +55 11 99999-9999 (no symbols, no spaces)
❌ Wrong: 11999999999 (missing country code)
```

### Chat ID Formats

```
Individual: 5511999999999@s.whatsapp.net
Group: 120363012345678901@g.us
```

### Common Errors

| Status | Meaning | Solution |
|--------|---------|----------|
| 401 | Invalid token | Check token value and header name |
| 404 | Instance not found | Verify instance exists |
| 429 | Rate limited | Implement delays between requests |
| 500 | Server error | Retry with exponential backoff |

---

**Remember**: Always use `excludeMessages: ["wasSentByApi"]` in webhooks to prevent infinite loops!
