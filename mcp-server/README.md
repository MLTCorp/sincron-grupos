# Sincron Grupos MCP Server

MCP (Model Context Protocol) Server para integração com Claude Desktop/Code, permitindo gerenciar grupos WhatsApp via comandos de linguagem natural.

## Instalação

```bash
cd mcp-server
npm install
npm run build
```

## Configuração Claude Desktop

Edite o arquivo de configuração do Claude Desktop:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/.claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sincron-grupos": {
      "command": "node",
      "args": ["C:/caminho/para/sincron-grupos/mcp-server/dist/index.js"],
      "env": {
        "SINCRON_API_KEY": "sk_live_sua_api_key_aqui",
        "SINCRON_API_URL": "https://sincron-grupos.vercel.app"
      }
    }
  }
}
```

## Obtendo a API Key

1. Acesse o painel do Sincron Grupos
2. Vá em **Configurações** > **API Keys**
3. Clique em **Gerar Nova API Key**
4. Copie a chave exibida (só aparece uma vez!)
5. Use essa chave na variável `SINCRON_API_KEY`

## Tools Disponíveis

| Tool | Descrição |
|------|-----------|
| `get_instance_status` | Obtém status da instância WhatsApp |
| `list_groups` | Lista grupos da organização |
| `sync_groups` | Sincroniza grupos do WhatsApp |
| `send_message` | Envia mensagem para grupo/contato |
| `configure_webhook` | Configura webhook da instância |
| `create_trigger` | Cria gatilho de resposta automática |
| `create_command` | Cria comando de chatbot |
| `create_agent` | Cria agente de IA |

## Exemplos de Uso no Claude

Após configurar, você pode usar comandos como:

- "Liste meus grupos do WhatsApp"
- "Qual o status da minha instância?"
- "Envie uma mensagem para o grupo 120363xxx@g.us dizendo 'Olá!'"
- "Crie um gatilho que responda 'Obrigado!' quando alguém disser 'obrigado'"
- "Crie um comando /ajuda que responda com o menu de opções"

## Desenvolvimento

```bash
# Rodar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar versão compilada
npm start
```

## Variáveis de Ambiente

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `SINCRON_API_KEY` | Sim | API Key gerada no painel |
| `SINCRON_API_URL` | Não | URL da API (default: https://sincron-grupos.vercel.app) |
