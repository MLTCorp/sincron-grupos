# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sincron Grupos is a multi-tenant MicroSaaS for WhatsApp group management. Each organization connects their own WhatsApp instance via UAZAPI and manages groups independently.

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

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: N8N for automations and webhooks
- **Database**: Supabase (PostgreSQL) - Project ID: `qhjlxnzxazcqrkgojnbx`
- **WhatsApp API**: UAZAPI (https://mltcorp.uazapi.com)
- **Auth**: Supabase Auth

### App Router Structure
```
app/
  (auth)/           # Public auth pages (login, signup, onboarding)
  (dashboard)/      # Protected dashboard pages with sidebar layout
    instances/      # WhatsApp instance management
    groups/         # Group management
    categories/     # Group categories
    team/           # Team/user management
  api/uazapi/       # Proxy routes to UAZAPI (avoids CORS)
  invite/[token]/   # Team invitation acceptance
```

### Key Directories
- `lib/supabase/` - Supabase client (client.ts, server.ts, middleware.ts)
- `lib/uazapi/` - UAZAPI service layer (service.ts, types.ts)
- `hooks/` - Custom hooks (use-permissions.ts, use-mobile.ts)
- `components/ui/` - shadcn/ui components
- `components/magicui/` - Animated UI components (border-beam, ripple, shine-border)

### Multi-Tenant Data Model

Core tables in Supabase:
- `organizacoes` - Organizations (tenants)
- `usuarios_sistema` - Users linked to organizations
- `instancias_whatsapp` - WhatsApp instances (UAZAPI tokens stored in `api_key`)
- `grupos` - Managed WhatsApp groups
- `membros` / `membros_grupos` - Group members

Data is isolated by organization via RLS.

### UAZAPI Integration

All UAZAPI calls are proxied through Next.js API routes:
- `POST /api/uazapi/instances` - Create instance (uses admin token)
- `POST /api/uazapi/instances/[token]/connect` - Generate QR Code
- `GET /api/uazapi/instances/[token]/status` - Connection status
- `POST /api/uazapi/instances/[token]` - Disconnect
- `DELETE /api/uazapi/instances/[token]` - Delete instance

The `UAZAPIService` class in `lib/uazapi/service.ts` handles all API communication.

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

Roles: `owner` (all), `admin` (all except gerenciar_usuarios), `member` (configured individually)

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://qhjlxnzxazcqrkgojnbx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
UAZAPI_BASE_URL=https://mltcorp.uazapi.com
UAZAPI_API_KEY=<admin-token>
```

## Progress Tracking

Completed:
- Multi-tenant auth with organizations
- Instance management (create, connect via QR, disconnect, delete)
- Groups and categories pages
- Team management with invitations
- Permission system

Pending:
- Group synchronization from WhatsApp
- N8N workflow integration
- Commands system (/commands)
- Mass messaging (/messages)
- Settings, RSS Feeds, AI pages
