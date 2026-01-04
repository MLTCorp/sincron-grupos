# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sincron Grupos is a multi-tenant MicroSaaS for WhatsApp group management. Each organization connects their own WhatsApp instance via UAZAPI and manages groups independently. Language: Portuguese (codebase), English (documentation).

## Task Tracking

**IMPORTANTE:** Consulte e atualize o arquivo `TODO.md` na raiz do projeto:
- Lista completa de tarefas pendentes organizadas por prioridade (P0-P3)
- Contexto detalhado de cada tarefa (O que, Onde, Por que)
- Marque tarefas concluidas com `[x]` ao finalizar
- Adicione novas tarefas descobertas durante o desenvolvimento

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

**Supabase types generation** (via MCP):
```
mcp__supabase__generate_typescript_types with project_id: qhjlxnzxazcqrkgojnbx
```

## Git & GitHub

**Repositório:** https://github.com/MLTCorp/sincron-grupos

**Branch principal:** `main`

**Comandos para commit e push:**
```bash
git add .
git commit -m "descrição da mudança"
git push origin main
```

**Convenção de commits:** Use mensagens descritivas em português ou inglês. Exemplos:
- `feat: adiciona filtro de categorias`
- `fix: corrige erro no QR code`
- `chore: atualiza dependências`

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui
- **Backend**: N8N for automations and webhooks
- **Database**: Supabase (PostgreSQL) - Project ID: `qhjlxnzxazcqrkgojnbx`
- **WhatsApp API**: UAZAPI (https://mltcorp.uazapi.com)
- **Auth**: Supabase Auth (cookie-based sessions)
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner (toasts)

### App Router Structure
```
app/
  (auth)/           # Public auth pages (login, signup, onboarding)
  (dashboard)/      # Protected dashboard pages with sidebar layout
    instances/      # WhatsApp instance management
    groups/         # Group management
    categories/     # Group categories
    team/           # Team/user management
    commands/       # Command configuration
    triggers/       # Automation triggers
    messages/       # Mass messaging
    ai/             # AI agents
  api/uazapi/       # Proxy routes to UAZAPI (avoids CORS)
  api/notifications/# Webhook handlers
  invite/[token]/   # Team invitation acceptance
```

### Key Directories
- `lib/supabase/` - Supabase client (client.ts, server.ts, middleware.ts)
- `lib/uazapi/` - UAZAPI service layer (service.ts, types.ts)
- `hooks/` - Custom hooks (use-permissions.ts, use-organization-data.ts, use-mobile.ts)
- `components/ui/` - shadcn/ui components
- `components/magicui/` - Animated UI components (border-beam, ripple, shine-border)
- `types/supabase.ts` - Auto-generated database types

### Multi-Tenant Data Model

Core tables in Supabase:
- `organizacoes` - Organizations (tenants)
- `usuarios_sistema` - Users linked to organizations
- `permissoes_usuario` - Granular user permissions
- `instancias_whatsapp` - WhatsApp instances (UAZAPI tokens stored in `api_key`)
- `grupos` - Managed WhatsApp groups
- `categorias` - Group categories
- `grupos_categorias` - N:N relationship between groups and categories
- `gatilhos` - Event triggers with conditions
- `agentes_ia` - AI agents configuration
- `membros` / `membros_grupos` - Group members

Data is isolated by organization via RLS (Row Level Security).

### Key Patterns

**Organization Data Hook** (`hooks/use-organization-data.ts`):
```tsx
const {
  instancias, categorias, grupos, agentes, gatilhos,
  loading, organizacaoId,
  refresh, refreshInstancias, refreshCategorias,
  instanciaConectada, gruposPorCategoria
} = useOrganizationData()
```

**Supabase Client Usage**:
```tsx
// Client component
"use client"
const supabase = createClient()  // from lib/supabase/client

// Server component
const supabase = await createClient()  // from lib/supabase/server
```

### UAZAPI Integration

All UAZAPI calls are proxied through Next.js API routes:
- `POST /api/uazapi/instances` - Create instance (uses admin token)
- `POST /api/uazapi/instances/[token]/connect` - Generate QR Code
- `GET /api/uazapi/instances/[token]/status` - Connection status
- `POST /api/uazapi/instances/[token]` - Disconnect
- `DELETE /api/uazapi/instances/[token]` - Delete instance
- `POST /api/uazapi/instances/[token]/send/text|image|video|audio` - Send messages
- `POST /api/uazapi/instances/[token]/webhook` - Configure webhooks

The `UAZAPIService` class in `lib/uazapi/service.ts` handles all API communication. Timeout: 10 seconds.

### Permission System

```tsx
// Hook usage
import { usePermissions } from "@/hooks/use-permissions"
const { hasPermission, isOwner, isAdmin } = usePermissions()

// Component usage
import { PermissionGate } from "@/components/permission-gate"
<PermissionGate permission="gerenciar_usuarios">...</PermissionGate>
```

Available permissions: `gerenciar_instancias`, `gerenciar_grupos`, `gerenciar_categorias`, `enviar_mensagens`, `configurar_comandos`, `configurar_gatilhos`, `ver_analytics`, `gerenciar_usuarios`

Roles: `owner` (all), `admin` (all except gerenciar_usuarios), `member` (configured individually via `permissoes_usuario` table)

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://qhjlxnzxazcqrkgojnbx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
UAZAPI_BASE_URL=https://mltcorp.uazapi.com
UAZAPI_API_KEY=<admin-token>
```

## Claude Code Skills

This project includes specialized skills in `.claude/skills/`:
- **n8n-development-skill**: Generate production n8n workflows with PostgreSQL and uazapi patterns
- **uazapi-whatsapp-skill**: WhatsApp API integration with uazapi (messages, webhooks, chatbots)

## Progress Tracking

Completed:
- Multi-tenant auth with organizations
- Instance management (create, connect via QR, disconnect, delete)
- Groups and categories pages (with N:N relationship)
- Team management with invitations
- Permission system
- Landing page

Pending:
- Group synchronization from WhatsApp
- N8N workflow integration
- Commands system
- Mass messaging
- Triggers system
- Settings, RSS Feeds, AI pages
- Transcription features

## Correções Urgentes

### Concluídas (30/12/2024)
- [x] Ajustar favicon do projeto (icon.svg, apple-icon.svg)
- [x] Ajustar imagem de compartilhamento (opengraph-image.svg)
- [x] Instalar agente de gestão de feedback de testers (FeedbackFab + FeedbackSheet)
- [x] Corrigir inconsistência de planos (documentação alinhada com landing page)
- [x] Adicionar variável de ambiente WEBHOOK_N8N_URL
- [x] Alterar constraint de grupo único global para único por organização (grupos_chat_id_org_unique)
- [x] Implementar validação de limites de grupos por plano (max_groups: 5 para free)

### Pendente
- [ ] Permitir entrada mesmo sem confirmação de email (configurar no Supabase Dashboard → Authentication → Providers → Email)
