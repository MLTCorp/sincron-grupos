# Endpoint de Notificações de Conexão

Endpoint que recebe webhooks de eventos de conexão/desconexão reencaminhados pelo N8N.

## URL

```
POST /api/notifications/connection
```

## Fluxo

```
UAZAPI → N8N (webhook já configurado) → Este endpoint → Notificação admin
```

## Payload Esperado

### Desconexão
```json
{
  "event": "connection",
  "instance": "r183e2ef9597845",
  "owner": "5511999999999",
  "token": "FfROHHjkYkITrEgrvbkA1GFA5sneTDWxovwSBeQiAOvoGSZ1qL",
  "BaseUrl": "https://mltcorp.uazapi.com",
  "status": {
    "connected": false,
    "loggedIn": false,
    "jid": null
  }
}
```

### Reconexão
```json
{
  "event": "connection",
  "instance": "r183e2ef9597845",
  "owner": "5511999999999",
  "token": "FfROHHjkYkITrEgrvbkA1GFA5sneTDWxovwSBeQiAOvoGSZ1qL",
  "BaseUrl": "https://mltcorp.uazapi.com",
  "status": {
    "connected": true,
    "loggedIn": true,
    "jid": "5511999999999@s.whatsapp.net"
  }
}
```

## Testando Localmente

### Com cURL
```bash
# Desconexão
curl -X POST http://localhost:3000/api/notifications/connection \
  -H "Content-Type: application/json" \
  -d '{
    "event": "connection",
    "instance": "test123",
    "owner": "5511999999999",
    "token": "FfROHHjkYkITrEgrvbkA1GFA5sneTDWxovwSBeQiAOvoGSZ1qL",
    "BaseUrl": "https://mltcorp.uazapi.com",
    "status": {
      "connected": false,
      "loggedIn": false,
      "jid": null
    }
  }'

# Reconexão
curl -X POST http://localhost:3000/api/notifications/connection \
  -H "Content-Type: application/json" \
  -d '{
    "event": "connection",
    "instance": "test123",
    "owner": "5511999999999",
    "token": "FfROHHjkYkITrEgrvbkA1GFA5sneTDWxovwSBeQiAOvoGSZ1qL",
    "BaseUrl": "https://mltcorp.uazapi.com",
    "status": {
      "connected": true,
      "loggedIn": true,
      "jid": "5511999999999@s.whatsapp.net"
    }
  }'
```

### Com Python
```python
import requests
import json

url = "http://localhost:3000/api/notifications/connection"

# Payload de desconexão
payload = {
    "event": "connection",
    "instance": "test123",
    "owner": "5511999999999",
    "token": "FfROHHjkYkITrEgrvbkA1GFA5sneTDWxovwSBeQiAOvoGSZ1qL",
    "BaseUrl": "https://mltcorp.uazapi.com",
    "status": {
        "connected": False,
        "loggedIn": False,
        "jid": None
    }
}

response = requests.post(url, json=payload)
print(response.json())
```

## Respostas

### Sucesso (200)
```json
{
  "success": true,
  "instanceId": 1,
  "statusAnterior": "conectado",
  "novoStatus": "desconectado",
  "notificado": true
}
```

### Payload Inválido (400)
```json
{
  "error": "Payload inválido"
}
```

### Instância Não Encontrada (404)
```json
{
  "error": "Instância não encontrada"
}
```

### Erro Interno (500)
```json
{
  "error": "Erro interno do servidor"
}
```

## Configuração no N8N

No workflow do N8N, adicione um **HTTP Request Node** após o Webhook Trigger:

**Configuração:**
- Method: POST
- URL: `https://sincron-grupos.vercel.app/api/notifications/connection`
- Headers: `Content-Type: application/json`
- Body: `{{ $json }}` (reenvia payload inteiro)

**Filter (opcional):** Adicione um **IF Node** para enviar apenas desconexões:
```javascript
{{ $json.event === 'connection' && $json.status.connected === false }}
```

## Comportamento

1. **Validação:** Verifica se payload é válido (event='connection' e token presente)
2. **Busca:** Encontra instância no banco pelo token
3. **Atualização:** Atualiza status e número de telefone se necessário
4. **Notificação:** Se desconectou (connected=false), identifica admins da organização
5. **Log:** Em v1, apenas loga no console os admins a notificar
6. **Response:** Retorna JSON com sucesso e dados do evento

## TODO (v2)

- [ ] Implementar envio de email real
- [ ] Criar notificações in-app
- [ ] Adicionar signature validation do N8N
- [ ] Implementar rate limiting
