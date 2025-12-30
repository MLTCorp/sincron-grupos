# Onde Paramos - Sincron Grupos

**Data:** 30/12/2024
**Ultimo commit:** 6012813 (screenshot feedback)

---

## SESSAO ATUAL - 30/12/2024

### O que foi feito

#### 1. Sistema de Feedback para Testers
- Componentes `FeedbackFab` e `FeedbackSheet`
- Captura de screenshot com html2canvas
- Gravacao de audio com transcricao (Whisper)
- Coleta automatica de erros JS, console logs e breadcrumbs
- API `/api/feedback` com upload para Supabase Storage
- Tabela `feedbacks` e bucket de storage configurados

#### 2. Branding (Favicon + Open Graph)
- Criado `icon.svg`, `apple-icon.svg`, `opengraph-image.svg`
- Logo "SG" em verde (#55B52C)
- Metadata completa no `layout.tsx`

#### 3. Correcao de Planos
- Documentacao alinhada com landing page (Starter/Pro/Enterprise)
- Default `max_groups: 5` para plano free (era 10)
- Validacao de limites no frontend (`grupos/page.tsx`)
- Indicador visual no modal de sincronizacao

#### 4. Variavel de Ambiente
- Adicionado `WEBHOOK_N8N_URL` no `.env.local`
- URL: `https://workflows.sincronia.digital/webhook/sincron-tracker/messages`

#### 5. Constraint de Grupos
- Alterado de `grupos_chat_id_unique` (global)
- Para `grupos_chat_id_org_unique` (por organizacao)
- Permite que diferentes organizacoes gerenciem o mesmo grupo WhatsApp

**Commits desta sessao:**
- `6012813` - screenshot feedback
- `7ce4e50` - agente feedback
- `51e6dfa` - inicio massari

---

### Proximos Passos

1. Permitir entrada sem confirmacao de email (Supabase Dashboard -> Authentication -> Providers -> Email)
2. Sincronizacao de grupos do WhatsApp
3. Integracao N8N completa
4. Sistema de comandos (/commands)
5. Paginas de configuracoes avancadas

---

## Contexto Tecnico

### Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase (PostgreSQL)
- UAZAPI (WhatsApp API)

### Projeto Supabase
- ID: qhjlxnzxazcqrkgojnbx
- Regiao: us-east-1
- Status: ACTIVE_HEALTHY

### Comandos

```bash
npm run dev      # http://localhost:3000
npm run build    # Build de producao
npm run lint     # ESLint
```

---

## Progresso Estimado

- **Design/UI:** 90%
- **Backend:** 95%
- **Integracao N8N:** 80%
- **Geral:** ~88%

---

## Arquivos Importantes Criados/Modificados

### Feedback System
- `lib/error-tracker.ts` - Captura de erros e logs
- `components/error-tracker-provider.tsx` - Provider React
- `hooks/use-screenshot.ts` - Captura de tela
- `hooks/use-voice-input.ts` - Gravacao de voz
- `hooks/use-feedback.ts` - Envio de feedback
- `components/feedback/feedback-fab.tsx` - Botao flutuante
- `components/feedback/feedback-sheet.tsx` - Modal de feedback
- `app/api/feedback/route.ts` - API endpoint

### Branding
- `public/icon.svg` - Favicon
- `public/apple-icon.svg` - Apple Touch Icon
- `public/opengraph-image.svg` - Imagem de compartilhamento

### Migrations Aplicadas
- `fix_plan_limits_defaults` - Correcao dos limites de planos
- `fix_grupos_unique_per_organization` - Constraint por organizacao

---

**Ultima Atualizacao:** 30/12/2024
**Sessao por:** Claude Opus 4.5
**Status:** Correcoes urgentes concluidas (exceto confirmacao de email)
